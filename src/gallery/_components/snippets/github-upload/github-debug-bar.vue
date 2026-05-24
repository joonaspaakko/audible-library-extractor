<template>
  <div class="debug-bar">
    <span class="debug-label">dev</span>
    <button @click="$emit('auth')">auth</button>
    <button @click="$emit('complete')">complete</button>
    <button @click="$emit('failed')">failed</button>
    <button @click="$emit('syncing')">syncing</button>
    <button @click="$emit('reset')">reset</button>
  </div>
</template>

<script>
export default {
  emits: ['auth', 'complete', 'failed', 'syncing', 'reset'],
};
</script>

<style scoped lang="scss">
.debug-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  padding: 4px 6px;
  border-radius: 5px;
  background: rgba(239, 68, 68, .08);
  border: 1px solid rgba(239, 68, 68, .25);

  .debug-label {
    font-size: 0.75em;
    color: #ef4444;
    opacity: 0.7;
    margin-right: 2px;
    font-style: italic;
  }

  button {
    background: rgba(239, 68, 68, .15);
    border: 1px solid rgba(239, 68, 68, .3);
    color: #ef4444;
    border-radius: 4px;
    padding: 2px 7px;
    font-size: 0.75em;
    cursor: pointer;

    &:hover { background: rgba(239, 68, 68, .28); }
  }
}
</style>
