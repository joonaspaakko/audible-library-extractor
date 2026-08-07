<template>
  <div class="github-api-tools" :class="{ 'github-api-tools-card': !isAuthenticated }">

    <!-- DEV: toggle debug buttons: false in data() to hide -->
    <github-debug-bar
      v-if="debug.views"
      @auth="debugSetAuth"
      @loading="debugSetLoading"
      @no-repos="debugSetNoRepos"
      @complete="debugSetComplete"
      @failed="debugSetFailed"
      @syncing="debugSetSyncing"
      @reset="debugReset"
    />

    <!-- SIGN IN (AUTH) -->
    <github-auth-panel
      v-if="!isAuthenticated"
      :authenticating
      @auth="auth"
    />

    <!-- Signed in... -->
    <div v-else>

      <!-- Upload complete (middle) -->
      <github-complete-screen
        v-if="uploadComplete"
        :pages-url="completedPagesUrl"
        :pages-status="selectedRepoInfo?.pagesStatus"
        :timed-out="pollTimedOut"
        :timestamp="uploadTimestamp"
        :hash-route="completedHashRoute"
        @back="onCompleteBack"
      />

      <!-- Upload failed (middle) -->
      <github-failed-screen
        v-else-if="uploadFailed"
        :message="failedMessage"
        @retry="retryUpload"
        @back="onFailedBack"
      />
      
      <!-- Repo selection and upload options (middle) -->
      <template v-else>

        <!-- Selector repository -->
        <div class="repo-section" v-if="!isSyncing">
        
          <!-- Heading (top) -->
          <div class="repo-heading-row">

            <div class="repo-heading-col">

              <label class="repo-label">
                Project
                <span class="term-hint">git: repository</span>
                <span class="header-rule"></span>
              </label>

              <!-- Loading (middle): real dropdown chrome, only the repo name itself is unknown yet -->
              <n-config-provider v-if="headingLoading" :theme="naiveTheme">
                <div class="dropdown-trigger dropdown-trigger-loading">
                  <n-skeleton text width="55%" :sharp="false" round />
                  <span class="dropdown-arrow">▾</span>
                </div>
              </n-config-provider>
              <!-- Repo selection dropdown -->
              <github-repo-dropdown
                v-else
                v-model="selectedRepo"
                :newRepoKey
                :repos
                :showAllRepos
                @update:show-all-repos="showAllRepos = $event"
              />

            </div>

            <!-- Avatar, hover to preview profile (panel links to GitHub) -->
            <div class="avatar-hover-wrap">
              <n-config-provider v-if="!profile.avatar" :theme="naiveTheme">
                <n-skeleton circle width="54px" height="54px" />
              </n-config-provider>
              <template v-else>
                <a class="avatar-hover-panel" :href="`https://github.com/${profile.login}`" target="_blank" rel="noopener noreferrer">
                  <div class="avatar-hover-panel-info">
                    <div class="avatar-hover-panel-name">{{ profile.name || profile.login }}</div>
                    <div class="avatar-hover-panel-meta">@{{ profile.login }} &middot; {{ profile.publicRepos }} public repos</div>
                  </div>
                </a>
                <!-- Debug stub has no real avatar URL, so it gets a generic person icon
                     instead of an <img> pointed at a fake GitHub URL. -->
                <mdi:account-circle v-if="profile.avatar === debugAvatar" class="avatar-img avatar-img-placeholder" />
                <img v-else class="avatar-img" :src="profile.avatar" />
              </template>
            </div>

          </div>

          <!-- Loading: only the headline (pages URL/status/last-upload) is real fetched data,
               so only that part is skeletonized. "Project details" is a static label, not
               data, so it renders for real immediately instead of pretending to load. -->
          <div v-if="headingLoading" class="repo-info-card-skeleton">
            <n-config-provider :theme="naiveTheme">
              <div class="skeleton-headline-row">
                <n-skeleton circle width="20px" height="20px" />
                <div class="skeleton-headline-text">
                  <n-skeleton text width="70%" :sharp="false" round />
                  <n-skeleton text width="45%" :sharp="false" round />
                </div>
              </div>
            </n-config-provider>
            <div class="details-toggle-bar details-toggle-bar-disabled">
              <fa6-solid-circle-info class="settings-icon" />
              Project details
              <!-- Spinner instead of the static chevron: signals this bar itself will
                   become interactive once the repo data it depends on has loaded. -->
              <svg-spinners:180-ring-with-bg class="section-chevron section-chevron-right details-spinner" />
            </div>
          </div>

          <!-- Advanced settings: same static label as Project details, just dimmed/disabled
               until repo data is loaded, rather than not existing yet. -->
          <div v-if="headingLoading" class="settings-accordion settings-accordion-disabled">
            <div class="settings-accordion-header">
              <fa6-solid-sliders class="settings-icon" />
              Advanced settings
              <svg-spinners:180-ring-with-bg class="section-chevron section-chevron-right details-spinner" />
            </div>
          </div>

          <template v-if="!headingLoading">

            <!-- New repo creation -->
            <div v-if="selectedRepoNew" class="new-repo-wrap">
              <!-- New form... -->
              <div class="new-repo-row">
                <input
                  class="repo-input"
                  :value="newRepoName"
                  placeholder="my-audible-library"
                  @input="newRepoName = sanitizeRepoName($event.target.value)"
                  @keydown.enter="createConfirmOpen ? confirmCreateRepo() : $refs.createRepoBtn.click()"
                />
                <!-- First Enter opens the confirm tippy (via the button's own click handling).
                     A second Enter, while it's open, confirms and creates instead of re-clicking
                     the trigger, so the keyboard-only flow doesn't get stuck needing a mouse. -->
                <tippy
                  ref="createConfirmTippy"
                  trigger="click"
                  content-tag="div"
                  interactive
                  :hide-on-click="false"
                  content-class="content-wrapper"
                  placement="top-end"
                  :maxWidth="300"
                  :duration="0"
                  :on-click-outside="(instance) => instance.hide()"
                  @state="createConfirmOpen = $event.isVisible"
                >
                  <!-- Green "commit" color lives on whichever button will actually create the
                       repo if clicked next: this button while the confirm is closed, Confirm
                       once it's open. Only one green button on screen at a time. -->
                  <button ref="createRepoBtn" class="btn-sm" :class="{ 'btn-sm-gray': createConfirmOpen }" :disabled="!newRepoName.trim() || duplicateRepoName">
                    <akar-icons:circle-plus />
                    Create
                  </button>
                  <template #content>
                    Create the "{{ newRepoName.trim() }}" project on GitHub?
                    <div class="confirm-tippy-actions">
                      <button class="btn-ghost small" @click="$refs.createConfirmTippy.hide()">Cancel</button>
                      <button class="btn-sm" @click="confirmCreateRepo">Confirm</button>
                    </div>
                  </template>
                </tippy>
              </div>

              <!-- Duplicate name warning -->
              <div v-if="duplicateRepoName" class="new-repo-warning">
                <mdi:alert-circle />
                You already have a project named "{{ newRepoName.trim() }}"
              </div>

              <!-- Website url preview -->
              <div v-if="newRepoName.trim()" class="pages-preview">
                <span class="pages-preview-label">Website URL will be:</span>
                <span class="pages-preview-url">{{ profile.login }}.github.io/{{ newRepoName }}</span>
              </div>

            </div>

            <!-- Project details (own header + toggle bar built in, not wrapped in another accordion) -->
            <github-repo-info-card
              v-if="selectedRepoInfo"
              :repo-info="selectedRepoInfo"
              :login="profile.login"
              :aleTopics
              :hash-route="completedHashRoute"
              @tag-add="tagRepoWithAle($event, { action: 'add' })"
              @tag-remove="tagRepoWithAle($event, { action: 'remove' })"
              @recheck="recheckRepoPages"
            />

            <!-- Advanced settings (accordion, default collapsed) -->
            <div v-if="canUpload" class="settings-accordion">
              <div class="settings-accordion-header" @click="advancedSettingsExpanded = !advancedSettingsExpanded">
                <fa6-solid-sliders class="settings-icon" />
                Advanced settings
                <fa6-solid-chevron-right class="section-chevron section-chevron-right" :class="{ expanded: advancedSettingsExpanded }" />
              </div>
              <div class="settings-accordion-body" v-show="advancedSettingsExpanded">

                <!-- What to export (passed in from save-gallery.vue, same dataSources used by the ZIP export,
                     matches the "Gallery output" group the ZIP button's own panel uses). A shaded background
                     instead of a bordered box, so it reads as a container for Pages/Sub-pages/Library extras
                     without adding another ring of nested borders. Already inside "Advanced settings", so
                     these nested group labels drop the redundant word "settings". -->
                <div class="output-settings-group">
                  <div class="output-settings-group-label">Gallery output</div>
                  <slot name="export-scope" />
                </div>

                <!-- GitHub-specific options, in a matching shaded group -->
                <div class="output-settings-group">
                  <div class="output-settings-group-label">GitHub</div>

                  <!-- Link back to ALE readme -->
                  <div class="opt-row">
                    <label class="opt-label">
                      <input type="checkbox" v-model="includeReadme" aria-label="Include a link back to ALE on the project page" />
                      <div class="visual-checkbox"><span class="icon"><fa-solid-check/></span></div>
                      <span>Include a link back to ALE on the project page</span>
                    </label>
                  </div>

                  <!-- Optional upload note (commit message) -->
                  <div class="commit-msg-wrap">
                    <label class="commit-label">
                      Upload note
                      <span class="term-hint">git: commit message</span>
                    </label>
                    <textarea
                      class="commit-input"
                      v-model="commitMessage"
                      :placeholder="defaultCommitMessage"
                      rows="2"
                    />
                  </div>
                </div>

              </div>
            </div>

          </template>

        </div> <!-- /.repo-section -->

        <!-- Upload progress (bottom) -->
        <github-upload-progress
          v-if="isSyncing"
          :statusMessage
          :progress
          :isSyncing
          :stages
        />

        <!-- ACTION BUTTONS (bottom) -->
        <div class="actions">
        
          <!-- Uploading... -->
          <template v-if="isSyncing">
            <button class="btn-cancel" @click="cancel">
              <mdi:close />
              Cancel upload
            </button>
          </template>
          
          <!-- Ready to upload... -->
          <template v-else>
            <!-- Sign-out (button) -->
            <button class="btn-ghost sign-out-btn" @click="signOut">
              <mdi:logout />
              Sign out
            </button>
            <!-- Right: clean upload (post-cancel) + upload -->
            <div class="right-actions">
            <tippy v-if="false" placement="top-start" :maxWidth="300">
              <button class="btn-ghost clean-btn" :disabled="!canUpload" @click="cleanUpload">
                <mdi:broom />
                Clean upload
              </button>
              <template #content>
                Clears the file cache for this project and re-uploads everything from scratch.
                Use this if the previous upload seems incomplete or something looks off.
              </template>
            </tippy>

            <!-- Upload (button) -->
            <div class="btn-wrapper">
            
              <!-- Upload hint tooltip -->
              <tippy v-if="canUpload" to="parent" placement="top-end" :maxWidth="300">
                Uploads your library to the selected project.
                Files that haven't changed since the last upload are skipped automatically.
              </tippy>

              <!-- ALE warning tooltip -->
              <tippy
                v-if="selectedRepoInfo && !selectedRepoInfo.isAleRepo"
                to="parent"
                content-tag="div"
                interactive
                :hide-on-click="false"
                content-class="content-wrapper"
                placement="top-end"
                flip-behavior="['left', 'right', 'bottom']"
                :maxWidth="300"
              >
                You can't upload unless the selected project is tagged as ALE project:
                <button class="btn-gray small tooltip-mark-as-ale-project" @click="tagRepoWithAle(selectedRepoInfo.name, { action: 'add' })">
                  <mdi:plus-box class="topic-action add" /> Mark as ALE Project
                </button>
              </tippy>
              
              <!-- Button -->
              <button class="btn-primary" :disabled="!canUpload" @click="uploadLibrary">
                <span>Upload to Github</span>
                <material-symbols-upload-rounded />
              </button>
              
            </div>
            </div> <!-- /.right-actions -->
          </template> <!-- /ready to upload -->
          
        </div>

      </template>

    </div>
  </div>
</template>

<script>
import { NConfigProvider, NSkeleton, darkTheme, lightTheme } from 'naive-ui';
import githubApiMixin from './github-api.mixin.js';
import githubIdbMixin from './github-idb.mixin.js';
import githubUtilsMixin from './github-utils.mixin.js';
import githubAuthMixin from './github-auth.mixin.js';
import githubReposMixin from './github-repos.mixin.js';
import githubUploadMixin from './github-upload.mixin.js';

export default {
  components: { NConfigProvider, NSkeleton },

  mixins: [
    githubApiMixin,
    githubIdbMixin,
    githubUtilsMixin,
    githubAuthMixin,
    githubReposMixin,
    githubUploadMixin,
  ],

  props: {
    getFiles: { type: Function },
    active  : { type: Boolean, default: false },
  },

  data() {
    return {
      newRepoKey: '__new__',
      advancedSettingsExpanded: false,
      createConfirmOpen: false,
      // Sentinel for the debug stub's fake avatar: not a real image URL, so the template
      // renders a generic person icon in its place instead of an <img> pointed at a fake
      // GitHub URL.
      debugAvatar: 'debug-avatar',
      debug: {
        views: false, // Set to true to show debug buttons
      },
    };
  },

  emits: ['update:active', 'syncing-changed'],

  computed: {
    /** @returns {boolean} */
    isAuthenticated() {
      return this.octokit !== null;
    },

    /** @returns {boolean} */
    githubProcessActive() {
      return !!( this.authenticating || this.isAuthenticated );
    },

    /** @returns {Object} */
    naiveTheme() {
      return this.$store.state.sticky.lightSwitch ? lightTheme : darkTheme;
    },

    // True for the brief window after sign-in resolves but before loadProfile/loadRepos
    // have returned anything. Covers the gap reposLoading alone misses, since it starts
    // false and only flips true once loadRepos actually begins.
    /** @returns {boolean} */
    headingLoading() {
      return !this.profile.avatar || this.reposLoading;
    },

    selectedRepoNew() { 
      return this.selectedRepo === this.newRepoKey; 
    },
    selectedRepoOld() { 
      return this.selectedRepo && !this.selectedRepoNew; 
    },
    
    /** @returns {Object|null} The full repo object for the currently selected repo name. */
    selectedRepoInfo() {
      if ( !this.selectedRepo || this.selectedRepoNew ) return null;
      return _.find( this.repos, { name: this.selectedRepo } ) || null;
    },

    /** @returns {boolean} True when a valid ALE-tagged repo is selected and ready to upload. */
    canUpload() {
      return !!( this.selectedRepo && !this.selectedRepoNew && this.selectedRepoInfo?.isAleRepo );
    },

    // GitHub repo names are unique per account case-insensitively, so "Foo" collides with
    // an existing "foo". Checked against the already-loaded repo list so this is instant,
    // no API call needed.
    /** @returns {boolean} */
    duplicateRepoName() {
      const name = this.newRepoName.trim().toLowerCase();
      if ( !name ) return false;
      return this.repos.some( r => r.name.toLowerCase() === name );
    },
  },

  watch: {
    githubProcessActive( active ) {
      this.$emit( 'update:active', active );
    },
    isSyncing( syncing ) {
      this.$emit( 'syncing-changed', syncing );
    },
  },

  beforeUnmount() {
  
    this.cancel();
    this.$emit( 'update:active', false );
    
  },

  methods: {
    /** Confirms and closes the new-repo confirm tippy, then actually creates it. */
    confirmCreateRepo() {
      this.$refs.createConfirmTippy.hide();
      this.createRepo();
    },
    debugSetAuth() {
      this.octokit = true;
      this.profile = { login: 'devuser', name: 'Dev User', avatar: this.debugAvatar, publicRepos: 42 };
      this.repos = [{ name: 'my-audible-library', isAleRepo: true, pushedAt: new Date().toISOString(), createdAt: new Date().toISOString(), private: false, branch: 'main', topics: ['audible-library-extractor-gallery'], pagesUrl: 'https://devuser.github.io/my-audible-library/', pagesStatus: 'built', commitCount: 7 }];
      this.selectedRepo = 'my-audible-library';
    },
    // Freezes the app in the gap between sign-in resolving and loadProfile/loadRepos
    // returning, so the heading + info-card skeletons can be checked without racing
    // the real network calls.
    debugSetLoading() {
      this.octokit = true;
      this.profile = {};
      this.reposLoading = true;
    },
    debugSetNoRepos() {
      this.octokit = true;
      this.profile = { login: 'devuser', name: 'Dev User', avatar: this.debugAvatar, publicRepos: 0 };
      this.repos = [];
      this.selectedRepo = this.newRepoKey;
    },
    debugSetComplete() {
      if ( !this.isAuthenticated ) this.debugSetAuth();
      this.uploadComplete = true;
      this.completedPagesUrl = 'https://devuser.github.io/my-audible-library/';
      this.uploadTimestamp = Date.now();
    },
    debugSetFailed() {
      if ( !this.isAuthenticated ) this.debugSetAuth();
      this.uploadFailed = true;
      this.failedMessage = 'Simulated failure: could not reach GitHub API.';
    },
    debugSetSyncing() {
      if ( !this.isAuthenticated ) this.debugSetAuth();
      this.isSyncing = true;
      this.statusMessage = 'Uploading files...';
      this.progress = { stage: 'Uploading files', total: 200, done: 94, percent: 47 };
    },
    debugReset() {
      this.resetProgress();
      this.octokit = null;
      this.profile = null;
      this.repos = [];
      this.reposLoading = false;
      this.selectedRepo = '';
    },
  },
};
</script>

<style scoped lang="scss">
.github-api-tools {
  position: relative;
  font-size: 1em;
  // gallery-modal.vue's .buttons-footer sets text-align: center on everything
  // rendered inside it; reset it here so inline-flex rows (checkboxes, buttons)
  // don't get centered instead of left-aligned.
  text-align: left;

  @include themify($themes) {
    color: themed(frontColor);
  }

  // Before sign-in, this sits next to the ZIP export card as one of two "OR" choices,
  // so it needs the same card treatment (matches .zip-export-wrapper in save-gallery.vue)
  // for visual parity. Once signed in, it drops the border/shadow and reads as plain
  // content in the modal instead of a card nested inside a card.
  &.github-api-tools-card {
    border-radius: 13px;
    padding: 10px;
    @include themify($themes) {
      border: 1px solid rgba(themed(frontColor), .15);
      box-shadow: themed(shadowSmall);
    }
    .theme-light & {
      box-shadow: 1px 1px 20px rgba(#000, .04), 1px 1px 3px rgba(#000, .03);
    }
  }

  :deep(.btn-primary) {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    background: #4ade80;
    color: #fff;
    border: none;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;

    // Swaps the vivid green for a neutral gray instead of just fading it, so a disabled
    // upload button reads as "not ready" rather than "green button, slightly dimmed".
    &:disabled {
      cursor: default;
      @include themify($themes) {
        background: rgba( themed(frontColor), .12 );
        color: rgba( themed(frontColor), .35 );
      }
    }
  }

  :deep(.btn-gray) {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    border: none;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;

    @include themify($themes) {
      background: rgba( themed(frontColor), .2 );
      color: themed(frontColor);
    }

    &.small { padding: 5px 7px; }
    &:disabled { opacity: 0.35; cursor: default; }
  }

  :deep(.btn-ghost) {
    background: transparent;
    border: none;
    padding: 7px 10px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;

    @include themify($themes) { color: rgba( themed(frontColor), .55 ); }
    .theme-light & { color: rgba( $lightFrontColor, .7 ); }
    &:hover { @include themify($themes) { color: themed(frontColor); } }
    &.small { padding: 5px 7px; }
  }

  :deep(.btn-sm) {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    background: #4ade80;
    color: #fff;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    white-space: nowrap;

    &:disabled {
      cursor: default;
      @include themify($themes) {
        background: rgba( themed(frontColor), .12 );
        color: rgba( themed(frontColor), .35 );
      }
    }

    // Swaps just the color to the neutral .btn-gray look, keeping .btn-sm's own padding
    // so the button doesn't resize when the create-confirm tippy toggles this on/off.
    &.btn-sm-gray {
      @include themify($themes) {
        background: rgba( themed(frontColor), .2 );
        color: themed(frontColor);
      }
    }
  }

  :deep(.btn-cancel) {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    margin: 0 auto;

    @include themify($themes) {
      border: 1px solid rgba( themed(frontColor), .15 );
      color: rgba( themed(frontColor), .4 );
    }
    .theme-light & {
      border-color: rgba( $lightFrontColor, .25 );
      color: rgba( $lightFrontColor, .6 );
    }

    &:hover {
      @include themify($themes) {
        border-color: rgba( themed(frontColor), .3 );
        color: themed(frontColor);
      }
    }
  }
}

.repo-section {
  margin-bottom: 14px;

  .repo-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.92em;
    opacity: 0.5;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

}

// Real dropdown chrome (mirrors github-repo-dropdown.vue's own .dropdown-trigger,
// since scoped styles don't cross components) so only the repo name itself, the one
// thing that's actually unknown before loadRepos resolves, is skeletonized.
.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 1em;

  @include themify($themes) {
    background: themed(panelColor);
    border: 1px solid rgba( themed(frontColor), .1 );
  }
  .theme-light & {
    background: #f8f8f8;
    border: 1px solid #d1d1d1;
  }
}

.dropdown-trigger-loading {
  cursor: default;

  // n-skeleton needs an explicit basis in a flex row. Without it, its own width prop
  // resolves against its shrink-to-fit flex box instead of the row, and it can collapse
  // to nothing.
  :deep(.n-skeleton) {
    flex: 0 1 55%;
    width: auto !important;
  }

  .dropdown-arrow {
    opacity: 0.25;
  }
}

.dropdown-arrow {
  margin-left: 6px;
  font-size: 0.84em;
  opacity: 0.5;
  flex-shrink: 0;
}

// Mirrors github-repo-info-card.vue's own .repo-info-card / .headline-row so the loading
// state holds the same footprint as the real card, rather than the modal growing once
// selectedRepoInfo actually exists.
.repo-info-card-skeleton {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  @include themify($themes) {
    border: 1px solid rgba(themed(frontColor), .08);
  }
  .theme-light & { border-color: #d9d9d9; }
}

.skeleton-headline-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
}

.skeleton-headline-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

// Real "Project details" toggle bar (mirrors github-repo-info-card.vue's own
// .details-toggle-bar) - it's a static label, not fetched data, so it renders for real
// even while the headline above it is still loading. Disabled here since there's
// nothing to expand into yet.
.details-toggle-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  font-size: 0.85em;
  cursor: pointer;
  user-select: none;
  @include themify($themes) {
    color: rgba(themed(frontColor), .6);
    background: rgba(themed(frontColor), .04);
    border-top: 1px solid rgba(themed(frontColor), .08);
  }
  .theme-light & { border-top-color: rgba(#000, .08); }
}

.details-toggle-bar-disabled {
  cursor: default;
  pointer-events: none;
  opacity: 0.6;
}

.repo-heading-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.repo-heading-col {
  flex: 1;
  min-width: 0;
}

.header-rule {
  flex: 1;
  height: 1px;
  margin-left: 4px;
  @include themify($themes) {
    background: rgba(themed(frontColor), .1);
  }
}

.avatar-hover-wrap {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover .avatar-hover-panel {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  }
}

.avatar-img {
  display: block;
  width: auto;
  height: 54px;
  border-radius: 50%;
  position: relative;
  // Stays on top of .avatar-hover-panel at all times, so only the panel behind
  // it animates instead of the avatar itself.
  z-index: 2;
  @include themify($themes) {
    border: 1px solid rgba(themed(frontColor), .15);
  }
}

.avatar-img-placeholder {
  @include themify($themes) {
    background: rgba(themed(frontColor), .12);
    color: rgba(themed(frontColor), .35);
  }
}

.avatar-hover-panel {
  position: absolute;
  right: -15px;
  z-index: 1;
  display: flex;
  align-items: center;
  width: max-content;
  max-width: 480px;
  min-height: 54px;
  $padding: 10px;
  padding: $padding $padding*1.2;
  // Reserves space for .avatar-img (54px) sitting on top of the panel's right
  // edge, so the info column never renders underneath it.
  padding-right: ($padding*1.2)*2 + 54px;
  border-radius: 20px;
  opacity: 0;
  pointer-events: none;
  transform: scale(0.85);
  // Anchors scaling to the center of .avatar-img sitting on top, instead of the
  // panel's own corner, so the panel grows out from behind the avatar in place.
  transform-origin: calc(100% - 27px) center;
  transition: opacity 150ms ease, transform 150ms ease, border-color 150ms ease;
  text-decoration: none;
  cursor: pointer;

  // Overrides the global #audible-library-extractor a:visited rule, which otherwise
  // wins on specificity and tints this like a visited link.
  &, &:visited {
    @include themify($themes) { color: themed(frontColor) !important; }
  }

  @include themify($themes) {
    background: themed(elementColor);
    border: 1px solid rgba(themed(frontColor), .15);
    box-shadow: themed(shadowSmall);
    &:hover { border-color: rgba(themed(frontColor), .35); }
  }
}

.avatar-hover-panel-info {
  min-width: 0;
}

.avatar-hover-panel-name {
  font-weight: 600;
  font-size: 0.92em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.avatar-hover-panel-meta {
  font-size: 0.85em;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-accordion {
  margin-top: 8px;
  border-radius: 8px;
  padding: 8px 10px;
  @include themify($themes) {
    border: 1px solid rgba(themed(frontColor), .10);
  }
  .theme-light & { border-color: rgba($lightFrontColor, .22); }
}

.settings-accordion-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85em;
  cursor: pointer;
  user-select: none;
  @include themify($themes) {
    color: rgba(themed(frontColor), .6);
  }
}

.settings-accordion-disabled {
  opacity: 0.6;
  pointer-events: none;

  .settings-accordion-header { cursor: default; }
}

.settings-icon {
  flex-shrink: 0;
  font-size: 0.85em;
}

.section-chevron {
  flex-shrink: 0;
  transition: transform 150ms ease;
  font-size: 0.85em;
  &.expanded { transform: rotate(90deg); }
}

// Advanced settings' chevron sits on the right edge of the header, after the label,
// instead of leading it like the gear/sliders icon does.
.section-chevron-right {
  margin-left: auto;
}

.settings-accordion-body {
  margin-top: 8px;
}

// Shaded background instead of a border, so this reads as a labeled container around
// Pages/Sub-pages/Library extras without adding yet another ring of nested borders
// inside the settings-accordion. Matches the same treatment used in save-gallery.vue's
// own "what to export" panel.
.output-settings-group {
  margin: 0 0 12px;
  border-radius: 8px;
  padding: 10px;
  @include themify($themes) {
    background: rgba(themed(frontColor), .04);
  }
}

// Border-bottom (not a plain underline) so there's padding between the text and the
// line, and enough margin below to clearly separate this outer "Gallery output" /
// "GitHub" level from the Pages/Sub-pages/Library-extras subsections underneath it -
// otherwise both levels were just stacked gray labels with no visual hierarchy.
.output-settings-group-label {
  padding-bottom: 6px;
  margin-bottom: 12px;
  font-size: 0.72em;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  @include themify($themes) {
    color: rgba(themed(frontColor), .45);
    border-bottom: 1px solid rgba(themed(frontColor), .1);
  }
}

.settings-accordion-divider {
  margin: 12px 0;
  @include themify($themes) {
    border-top: 1px solid rgba(themed(frontColor), .07);
  }
  .theme-light & { border-top-color: rgba($lightFrontColor, .14); }
}

.term-hint {
  font-size: 0.85em;
  opacity: 0.8;
  text-transform: none;
  letter-spacing: 0;
  font-style: italic;

  .theme-light & { opacity: 0.85; }
}

.new-repo-wrap {
  margin-top: 8px;

  .new-repo-row {
    display: flex;
    gap: 6px;
  }

  .new-repo-warning {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.92em;
    color: #ef4444;
  }

  .pages-preview {
    margin-top: 6px;
    font-size: 0.92em;
    opacity: 0.8;
    .theme-light & { opacity: 1; }
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;

    .pages-preview-label { 
      opacity: 0.5; 
      .theme-light & { opacity: 1; }
    }

    .pages-preview-url {
      color: #4ade80;
      font-family: monospace;
      font-size: 0.91em;
      .theme-light & { 
        color: #167816; 
        font-weight: bold; 
      }
    }
  }
}

.repo-input {
  flex: 1;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 1em;

  @include themify($themes) {
    background: themed(elementColor);
    border: 1px solid rgba( themed(frontColor), .15 );
    color: themed(frontColor);
  }

  &:focus { outline: none; border-color: #4ade80; }
}

.opt-row {
  margin-bottom: 8px;

  .opt-label {
    display: inline-flex;
    align-items: center;
    position: relative;
    z-index: 0;
    cursor: pointer;

    input {
      opacity: 0;
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
    }

    .visual-checkbox {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 17px;
      height: 17px;
      border-radius: 4px;
      margin-right: 5px;
      @include themify($themes) {
        background: themed(elementColor);
        border: 1px solid rgba(themed(frontColor), .25);
      }

      .icon {
        display: none;
        @include themify($themes) { color: themed(greenColor); }
        svg { width: 80%; }
      }
    }

    input:checked ~ .visual-checkbox .icon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }

    span {
      @include themify($themes) { color: rgba(themed(frontColor), .6); }
    }

    input:checked ~ span {
      @include themify($themes) { color: themed(frontColor); }
    }
  }
}

.commit-msg-wrap {
  margin-bottom: 0;

  .commit-label {
    display: flex;
    align-items: baseline;
    gap: 6px;
    @include themify($themes) {
      color: rgba(themed(frontColor), .6);
    }
  }

  .commit-input {
    width: 100%;
    margin-top: 6px;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 1em;
    resize: vertical;
    box-sizing: border-box;
    font-family: inherit;

    @include themify($themes) {
      background: themed(elementColor);
      border: 1px solid rgba( themed(frontColor), .15 );
      color: themed(frontColor);
    }

    &:focus { outline: none; border-color: #4ade80; }
  }
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
  padding-top: 12px;

  @include themify($themes) {
    border-top: 1px solid rgba( themed(frontColor), .08 );
  }
}

.sign-out-btn,
.clean-btn {
  display: flex;
  align-items: center;
  gap: 5px;

  @include themify($themes) {
    border: 1px solid rgba( themed(frontColor), .15 ) !important;
  }

  &:hover {
    @include themify($themes) {
      border-color: rgba( themed(frontColor), .3 ) !important;
    }
  }
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topic-action {
  &.add { color: #4ade80; }
}

.tooltip-mark-as-ale-project {
  display: inline-flex !important;
  vertical-align: text-bottom;
  line-height: 1;
  padding: 0 !important;
  background: transparent !important;
  text-decoration: underline !important;
}

.confirm-tippy-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
}
</style>
