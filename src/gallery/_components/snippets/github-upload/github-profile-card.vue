<template>
  <a :href="`https://github.com/${profile.login}`" target="_blank" class="profile-card">
  
    <!-- Avatar -->
    <div class="avatar-wrapper">
      <img class="avatar" :src="profile.avatar" :class="{ loaded: avatarLoaded }" @load="onAvatarLoad" />
    </div>
    
    <!-- Profile info -->
    <div class="profile-info">
      <div class="profile-name">{{ profile.name || profile.login }}</div>
      <div class="profile-meta">@{{ profile.login }} · {{ profile.publicRepos }} public repos</div>
    </div>
    
    <!-- Auth checkmark (just visual filler) -->
    <div class="auth-check">
      <f7:checkmark-seal-fill v-if="$store.state.sticky.lightSwitch" />
      <f7:checkmark-seal v-else />
    </div>
    
  </a> <!-- .profile-card -->
</template>

<script>
export default {
  props: {
    profile: { type: Object, required: true },
  },

  data() {
    return {
      avatarLoaded: false,
    };
  },

  watch: {
    // Reset fade-in when the profile changes (e.g. re-login with a different account)
    'profile.avatar'() { this.avatarLoaded = false; },
  },

  methods: {
    /** Triggers the avatar fade-in after the image has loaded. Uses rAF to avoid a flash on cached images. */
    onAvatarLoad() {
      requestAnimationFrame( () => { this.avatarLoaded = true; } );
    },
  },
};
</script>

<style scoped lang="scss">
.profile-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 8px;
  margin-bottom: 14px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s;

  border: 1px solid transparent;

  @include themify($themes) {
    background: themed(panelColor);
  }
  .theme-light & {
    background: #fcfcfc;
    border: 2px solid #d9d9d9;
  }

  &:hover {
    @include themify($themes) {
      border-color: rgba( themed(frontColor), .1 );
    }
  }

  .avatar-wrapper {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.25s ease, transform 0.25s ease;

    &.loaded {
      opacity: 1;
      transform: scale(1);
    }
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  // Set the text color on the children directly. They only render brown because they
  // inherit it from the parent <a> once the global a:visited rule kicks in; pinning their
  // own color stops that inheritance.
  .profile-name {
    font-weight: 600;
    font-size: 1.08em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include themify($themes) { color: themed(frontColor); }
  }

  .profile-meta {
    font-size: 0.92em;
    opacity: 0.5;
    margin-top: 1px;

    @include themify($themes) { color: themed(frontColor); }
  }

  .auth-check {
    font-size: 1.33em;
    flex-shrink: 0;

    @include themify($themes) { color: themed(greenColor); }
  }
}
</style>
