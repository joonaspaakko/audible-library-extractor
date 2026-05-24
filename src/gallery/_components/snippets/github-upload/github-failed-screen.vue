<template>
  <div class="failed-screen">
    <div class="failed-box">

      <!-- Circled X icon -->
      <div class="failed-icon">
        <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
          <circle cx="12" cy="12" r="11" stroke="#ef4444" stroke-width="1.5"/>
          <path d="M8 8l8 8M16 8l-8 8" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Heading (title) -->
      <div class="failed-title">Upload failed</div>
      <!-- Description -->
      <div class="failed-msg">{{ message }}</div>

      <!-- ACTIONS -->
      <div class="failed-actions">
        <button class="btn-ghost" @click="$emit('back')">← Back</button>
        <!-- <button class="btn-ghost" @click="$emit('retry')">Retry ↺</button> -->
      </div>

    </div> <!-- .failed-box -->
  </div> <!-- .failed-screen -->
</template>

<script>
export default {
  props: {
    message: { type: String, default: '' },
  },
  emits: ['retry', 'back'],
};
</script>

<style scoped lang="scss">
.failed-screen {
  display: flex;
  justify-content: center;
  padding: 8px 0;

  .failed-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    border-radius: 10px;
    padding: 24px 20px;
    width: 100%;
    text-align: center;

    @include themify($themes) {
      background: themed(panelColor);
    }
    .theme-light & {
      background: #fcfcfc;
      border: 1px solid #d9d9d9;
    }
    
  }

  .failed-icon { line-height: 1; }

  .failed-title {
    font-size: 1.25em;
    font-weight: 600;
    color: #ef4444;
  }

  .failed-msg {
    font-size: 0.92em;
    opacity: 0.6;
    max-width: 260px;
    line-height: 1.5;
  }

  .failed-actions {
    display: flex;
    gap: 18px;
    align-items: center;
  }
}
</style>
