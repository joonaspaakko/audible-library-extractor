<template>
  <div class="upload-progress">
    
    <!-- Progress STATUS -->
    <div v-if="statusMessage || progress.total > 0" class="status-msg">
      <!-- Progress status message (left). This contains steps too (if available): step / max -->
      <span>{{ statusMessage }}</span>
      <!-- Progress percent (right) -->
      <span v-if="progress.total > 0" class="progress-percent">{{ progress.percent }}%</span>
    </div>
    
    <!-- Progress BAR -->
    <div v-if="progress.total > 0" class="progress-wrap">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress.percent + '%' }"></div>
      </div>
    </div>

    <!-- Stage indicator -->
    <div v-if="isSyncing || progress.stage" class="stage-indicator">
      <!-- Each stage is highlighted as the upload progress advances... -->
      <div v-for="stage in stages" :key="stage" class="stage" :class="{ active: progress.stage === stage, done: stageIsDone(stage) }">
        {{ stage }}
      </div>
    </div>
    
  </div> <!-- .upload-progress -->
</template>

<script>
export default {
  props: {
    statusMessage: { type: String, default: '' },
    progress     : { type: Object, required: true },
    isSyncing    : { type: Boolean, default: false },
    stages       : { type: Array, required: true },
  },

  methods: {
    /**
     * Returns whether the given stage has already been passed.
     * @param {string} s Stage label
     * @returns {boolean}
     */
    stageIsDone( s ) {
      return this.stages.indexOf( this.progress.stage ) > this.stages.indexOf( s );
    },
  },
};
</script>

<style scoped lang="scss">
.status-msg {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 1em;
  opacity: 0.7;
  margin-bottom: 10px;
  min-height: 16px;

  .progress-percent {
    font-size: 0.92em;
    flex-shrink: 0;
  }
}

.progress-wrap {
  margin: 8px 0 14px;

  .progress-bar {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;

    @include themify($themes) { background: rgba( themed(frontColor), .12 ); }
  }

  .progress-fill {
    height: 100%;
    background: #4ade80;
    border-radius: 3px;
    transition: width 0.3s ease;
  }
}

.stage-indicator {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  font-size: 0.84em;
  margin-bottom: 16px;

  .stage {
    flex: 1;
    padding: 2px 7px;
    border-radius: 4px;
    opacity: 0.4;
    transition: opacity 0.2s, background 0.2s;

    @include themify($themes) { background: rgba( themed(frontColor), .08 ); }

    .theme-light & { opacity: .7; }

    &.active { opacity: 1; background: #4ade80; color: #000; }
    &.done {
      opacity: 0.7;
      @include themify($themes) {
        background: rgba(themed(greenColor), 0.1);
        color: themed(greenColor);
      }
    }
  }
}
</style>
