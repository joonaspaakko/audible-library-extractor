<template>
  <div class="auth-panel">
  
    <div class="auth-icon"><fa6-brands-github /></div>
    
    <p class="auth-hint">Connect your GitHub account to upload your library with ease.</p>
    
    <button class="btn-primary" @click="$emit('auth')">
      <eos-icons:loading v-if="authenticating" />
      <mdi-user v-else />
      Sign in with GitHub
    </button>
    
  </div> <!-- .auth-panel -->
</template>

<script>
export default {
  props: {
    authenticating: { type: Boolean, default: false },
  },
  emits: ['auth'],
};
</script>

<style scoped lang="scss">
.auth-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  text-align: center;

  .auth-icon {
    font-size: 2em;
  }

  .auth-hint {
    margin: 0;
    opacity: 0.8;
    font-size: 1em;
  }
  
  .btn-primary {
    font-weight: bold;}
}
</style>
