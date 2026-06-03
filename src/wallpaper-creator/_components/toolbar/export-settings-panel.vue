<template>
  <div class="export-settings-panel">

    <button
      class="save-btn"
      :disabled="store.saving"
      @click="open = true"
    >
      <ic-baseline-camera-alt/>
    </button>

    <div v-if="open" class="modal-overlay" @click.self="open = false">

      <n-config-provider :theme="darkTheme" class="modal-content">

        <div class="close-btn" @click="open = false">
          <ion-close-round/>
        </div>

        <h2 class="heading">Export image</h2>

        <div class="columns">

          <!-- REDUCE FILE SIZE -->
          <div class="column" :class="{ 'column-disabled': !store.compressImage }">

            <h6>
              <div class="h6-stack">
                <span class="h6-title">Reduce file size</span>
                <span class="h6-sub">{{ store.compressImage ? 'jpg, no transparency' : 'png, with transparency' }}</span>
              </div>
              <n-switch size="small" v-model:value="store.compressImage" />
            </h6>

            <div class="field-rows">

              <div class="label-row">
                <span class="row-label">Quality ({{ qualityPercentage }}%):</span>
                <n-input-number size="small" v-model:value="store.compressQuality" :min="0.50" :max="0.99" :step="0.01" :disabled="!store.compressImage" />
              </div>

              <n-slider v-model:value="store.compressQuality" :min="0.50" :max="0.99" :step=".01" :tooltip="false" :disabled="!store.compressImage" />

              <div class="field-note" :class="{ 'field-note-inactive': !store.compressImage || qualityPercentage >= 80 }">
                Quality below 80%. Pay close attention to the saved image.
              </div>

            </div>

          </div>

          <!-- SCALED OUTPUT -->
          <div class="column" :class="{ 'column-disabled': !store.canvas.zoomOutputs }">

            <h6>
              <div class="h6-stack">
                <span class="h6-title">Scaled output</span>
                <span class="h6-sub">{{ outputDimensions.width }}×{{ outputDimensions.height }}px</span>
              </div>
              <n-switch size="small" v-model:value="store.canvas.zoomOutputs" />
            </h6>

            <div class="field-rows">

              <div class="label-row">
                <span class="row-label">Scale ({{ scalePercentage }}%):</span>
                <n-input-number size="small" v-model:value="store.canvas.outputScale" :min="0.1" :max="5" :step="0.1" :disabled="!store.canvas.zoomOutputs" />
              </div>

              <n-slider v-model:value="store.canvas.outputScale" :min="0.1" :max="5" :step=".01" :tooltip="false" :disabled="!store.canvas.zoomOutputs" />

              <div style="display: flex; justify-content: center;">
                <n-button-group size="small">
                  <n-button round :disabled="!store.canvas.zoomOutputs" @click="$store.commit('update', { key: 'canvas.outputScale', value: .5 })">
                    .5x
                  </n-button>
                  <n-button :disabled="!store.canvas.zoomOutputs" @click="$store.commit('update', { key: 'canvas.outputScale', value: .75 })">
                    .75x
                  </n-button>
                  <n-button :disabled="!store.canvas.zoomOutputs" @click="$store.commit('update', { key: 'canvas.outputScale', value: 1 })">
                    1x
                  </n-button>
                  <n-button :disabled="!store.canvas.zoomOutputs" @click="$store.commit('update', { key: 'canvas.outputScale', value: 1.5 })">
                    1.5x
                  </n-button>
                  <n-button round :disabled="!store.canvas.zoomOutputs" @click="$store.commit('update', { key: 'canvas.outputScale', value: 2 })">
                    2x
                  </n-button>
                  <n-button round :disabled="!store.canvas.zoomOutputs" @click="$store.commit('update', { key: 'canvas.outputScale', value: 3 })">
                    3x
                  </n-button>
                </n-button-group>
              </div>

            </div>

          </div>

        </div>

        <!-- TOO LARGE WARNING -->
        <n-alert type="error" v-if="tooLargeDetail" class="too-large-alert">
          Output too large:
          <strong :class="{ 'dim-over': tooLargeDetail.widthOver }">{{ $store.getters.exportTooLarge.width }}px</strong>
          ×
          <strong :class="{ 'dim-over': tooLargeDetail.heightOver }">{{ $store.getters.exportTooLarge.height }}px</strong>
          ({{ tooLargeDetail.pct }}% over the {{ tooLargeDetail.limit }} limit).
          Try adjusting: output scale, canvas size, covers per row, cover count.
        </n-alert>

        <!-- SAVE ROW -->
        <div class="save-row">
          <button class="save-image-btn" :disabled="store.saving || $store.getters.exportTooLarge.tooLarge" @click="saveImage">
            <ic-baseline-camera-alt/>
            Save image
          </button>
        </div>

      </n-config-provider>

    </div>

  </div>
</template>

<script>

import {
  NConfigProvider,
  darkTheme,
  NButton,
  NButtonGroup,
  NSwitch,
  NAlert,
  NInputNumber,
  NSlider,
  NSpace,
} from 'naive-ui';

export default {
  name: "export-settings-panel",
  components: {
    NConfigProvider,
    NButton,
    NButtonGroup,
    NSwitch,
    NAlert,
    NInputNumber,
    NSlider,
    NSpace,
  },
  props: {
    makeImage: {
      type: Function,
      required: true,
    },
  },
  data: function () {
    return {
      open: false,
      store: this.$store.state,
      darkTheme: darkTheme,
    };
  },
  computed: {
    qualityPercentage: function () {
      return Math.floor( parseFloat( this.store.compressQuality ) * 100 );
    },
    scalePercentage: function () {
      return Math.floor( parseFloat( this.store.canvas.outputScale ) * 100 );
    },
    outputDimensions: function () {
      return this.$store.getters.scaledCanvasDimensions;
    },
    tooLargeDetail: function () {
      const tl = this.$store.getters.exportTooLarge;
      if ( !tl.tooLarge ) return null;
      if ( tl.overSide ) {
        const worstPct = Math.round( (Math.max( tl.width, tl.height ) / tl.maxSide - 1) * 100 );
        return {
          dims: tl.width + '×' + tl.height + 'px',
          limit: tl.maxSide.toLocaleString() + 'px per side',
          pct: worstPct,
          widthOver: tl.width > tl.maxSide,
          heightOver: tl.height > tl.maxSide,
        };
      }
      else {
        const areaPct = Math.round( (tl.width * tl.height / tl.maxArea - 1) * 100 );
        return {
          dims: tl.width + '×' + tl.height + 'px',
          limit: Math.round( tl.maxArea / 1000000 ) + 'MP area',
          pct: areaPct,
          widthOver: false,
          heightOver: false,
        };
      }
    },
  },
  methods: {
    saveImage: function () {
      this.open = false;
      this.makeImage();
    },
  },
};

</script>

<style lang="scss" scoped>

.export-settings-panel {
  display: contents;
}

.save-btn {
  cursor: pointer;
  width: 48px;
  height: 48px;
  border-radius: 9999999px;
  border: none;
  background: #0798f1;
  color: #fff;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.modal-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 200;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(#000, .5);
  backdrop-filter: blur(3px);
  -webkit-user-select: none;
  user-select: none;
}

.modal-content {
  position: relative;
  width: 580px;
  max-width: calc(100vw - 40px);
  color: #fff;
  padding: 30px 35px 30px 35px;
  box-sizing: border-box;
  border-radius: 5px;
  background: #161e29;
  box-shadow: 0 2px 30px rgba(#000, .6);
  border: 2px solid rgba(#fff, .1);
}

.heading {
  margin: 0 0 35px 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  cursor: pointer;
  position: absolute;
  z-index: 1;
  top: 10px;
  right: 10px;
  font-size: 16px;
  line-height: 16px;
  padding: 10px;
  transition: all 250ms ease;
  color: rgba(#fff, .7);
  &:hover {
    transform: scale(1.4);
    color: rgba(#fff, 1);
  }
}

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &.column-disabled {
    .field-rows {
      opacity: 0.35;
      pointer-events: none;
    }
  }

  h6 {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(#fff, .08);
  }
}

.h6-stack {
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: flex-start;
  align-items: flex-start;
}

.h6-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: rgba(#fff, .5);
  line-height: 1;
}

.h6-sub {
  font-size: 11px;
  font-weight: 400;
  color: rgba(#fff, .3);
  line-height: 1;
}

.field-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 13px;

  .row-label {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.field-note {
  font-size: 12px;
  color: rgba(#ffc12c, .9);
  line-height: 1.4;
  transition: opacity 200ms ease;

  &.field-note-inactive {
    opacity: 0.25;
    color: rgba(#fff, .6);
  }
}

.too-large-alert {
  margin-top: 20px;

  .dim-over {
    color: #fff;
  }
}

.save-row {
  display: flex;
  justify-content: flex-end;
  justify-content: center;
  margin-top: 30px;
}

.save-image-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 9999px;
  border: none;
  background: #0798f1;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 150ms ease;
  &:hover {
    opacity: 0.85;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

</style>
