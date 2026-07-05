<template>
  <div class="github-api-tools">

    <!-- DEV: toggle debug buttons: false in data() to hide -->
    <github-debug-bar
      v-if="debug.views"
      @auth="debugSetAuth"
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

      <!-- Profile (top): Avatar and other basic profile info -->
      <github-profile-card :profile />
      
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
          <label class="repo-label">
            Project
            <span class="term-hint">git: repository</span>
          </label>

          <!-- Loading (middle) -->
          <div v-if="reposLoading" class="repo-loading">Loading...</div>
          <!-- Repository section (middle) -->
          <template v-else>
            
            <!-- Repo selection dropdown -->
            <github-repo-dropdown
              v-model="selectedRepo"
              :newRepoKey
              :repos
              :showAllRepos
              @update:show-all-repos="showAllRepos = $event"
            />

            <!-- New repo creation -->
            <div v-if="selectedRepoNew" class="new-repo-wrap">
              <!-- New form... -->
              <div class="new-repo-row">
                <input
                  class="repo-input"
                  :value="newRepoName"
                  placeholder="my-audible-library"
                  @input="newRepoName = sanitizeRepoName($event.target.value)"
                  @keydown.enter="createRepo"
                />
                <button class="btn-sm" @click="createRepo" :disabled="!newRepoName.trim()">Create</button>
              </div>
              
              <!-- Website url preview -->
              <div v-if="newRepoName.trim()" class="pages-preview">
                <span class="pages-preview-label">Website URL will be:</span>
                <span class="pages-preview-url">{{ profile.login }}.github.io/{{ newRepoName }}</span>
              </div>
              
            </div>

          </template>

          <!-- Selected repo info (bottom) -->
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
          
        </div> <!-- /.repo-section -->

        <!-- Upload progress (bottom) -->
        <github-upload-progress
          v-if="isSyncing"
          :statusMessage
          :progress
          :isSyncing
          :stages
        />
        
        <!-- Upload options (bottom) -->
        
        <!-- Link back to ALE readme -->
        <div v-if="!isSyncing && canUpload" class="opt-row">
          <label class="opt-label">
            <input type="checkbox" v-model="includeReadme" aria-label="Include a link back to ALE on the project page" />
            Include a link back to ALE on the project page
          </label>
        </div>

        <!-- Optional upload note (commit message) -->
        <div v-if="!isSyncing && canUpload" class="commit-msg-wrap">
          <button class="btn-ghost commit-toggle" @click="showCommitMessage = !showCommitMessage">
            <span class="icon">
              <mage-chevron-down-square-fill v-if="showCommitMessage" />
              <mage-chevron-right-square-fill v-else />
            </span>
            Add upload note
            <span class="term-hint">git: commit message</span>
          </button>
          <textarea
            v-if="showCommitMessage"
            class="commit-input"
            v-model="commitMessage"
            :placeholder="defaultCommitMessage"
            rows="2"
          />
        </div>

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
import githubApiMixin from './github-api.mixin.js';
import githubIdbMixin from './github-idb.mixin.js';
import githubUtilsMixin from './github-utils.mixin.js';
import githubAuthMixin from './github-auth.mixin.js';
import githubReposMixin from './github-repos.mixin.js';
import githubUploadMixin from './github-upload.mixin.js';

export default {
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
    debugSetAuth() {
      this.octokit = true;
      this.profile = { login: 'devuser', name: 'Dev User', avatar: 'https://github.com/identicons/devuser', publicRepos: 42 };
      this.repos = [{ name: 'my-audible-library', isAleRepo: true, pushedAt: new Date().toISOString(), createdAt: new Date().toISOString(), private: false, branch: 'main', topics: ['audible-library-extractor-gallery'], pagesUrl: 'https://devuser.github.io/my-audible-library/', pagesStatus: 'built', commitCount: 7 }];
      this.selectedRepo = 'my-audible-library';
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
      this.selectedRepo = '';
    },
  },
};
</script>

<style scoped lang="scss">
.github-api-tools {
  position: relative;
  font-size: 1em;
  border-radius: 13px;
  padding: 10px;

  @include themify($themes) {
    color: themed(frontColor);
    border: 1px solid rgba( themed(frontColor), .15 );
    box-shadow: themed(shadowSmall);
  }
  .theme-light & {
    box-shadow: 1px 1px 20px rgba(#000, .04), 1px 1px 3px rgba(#000, .03);
  }

  :deep(.btn-primary) {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    background: #4ade80;
    color: #000;
    border: none;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;

    &:disabled { opacity: 0.35; cursor: default; }
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
  }

  :deep(.btn-sm) {
    background: #4ade80;
    color: #000;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    white-space: nowrap;

    &:disabled { opacity: 0.35; cursor: default; }
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
    align-items: baseline;
    gap: 6px;
    font-size: 0.92em;
    opacity: 0.5;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .repo-loading {
    font-size: 1em;
    opacity: 0.5;
  }
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
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.92em;
    opacity: 0.8;
    cursor: pointer;

    &:hover { opacity: 1; }
    .theme-light &:hover { opacity: 0.85; }

    input {
      cursor: pointer;
      @include themify($themes) { accent-color: themed(greenColor); }
    }
  }
}

.commit-msg-wrap {
  margin-bottom: 10px;

  .commit-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 0;
    font-size: 0.92em;
    justify-content: flex-start;
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
</style>
