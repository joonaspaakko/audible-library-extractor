<template>
  <n-config-provider :theme="darkTheme" class="right toolbar" :class="{ 'toolbar-collapsed': store.toolbarCollapsed }">
    
    <div class="button-container">
      <button v-if="store.animatedWallpaperMode"
        class="save-btn"
        :disabled="store.saving"
        @click="makeWallpaper"
        v-tippy="{ allowHTML: true }" content="<strong>Save animated wallpaper as a .zip file.</strong> <br>You need to then unpack the zip and point the animated wallpaper application to the index.html file inside the folder."
      >
        <ph-monitor-play-bold/>
        <!-- <material-symbols-video-library/> -->
        <!-- <mdi-content-save-all/> -->
      </button>
      <button v-else 
        class="save-btn"
        :disabled="store.saving"
        @click="makeImage"
        v-tippy :content="'Save image as a' + (store.compressImage ? '.jpg' : '.png' + ' file.')"
      >
        <ic-baseline-camera-alt/>
        <!-- <mdi-content-save-all/> -->
      </button>
    </div>
    
    <div class="zoom-container" v-show="!store.saving">
      
      <input
        class="zoom-zoom"
        type="range"
        min="0.1"
        max="3"
        :value="store.canvas.zoom"
        @input="$emitter.emit('canvas-zoom', $event.target.value)"
        step=".01"
        @dblclick="$emitter.emit('canvas-reset-zoom')"
      />
      <div
        v-tippy content="Click to reset to 100% zoom"
        class="zoom-text"
        :class="{ highlight: store.canvas.zoom != 1 }"
        @click="$emitter.emit('canvas-reset-zoom')"
      >
        {{ zoomPercentage }}%
      </div>
      
      <div class="center-canvas" @click="$emitter.emit('canvas-center')" v-tippy content="Center canvas to the viewport">
        <mdi-target/>
      </div>
      
      <div class="zoom-to-fit" @click="$emitter.emit('canvas-fit')" v-tippy content="Fit canvas inside the viewport">
        <fluent-arrow-expand-24-filled/>
      </div>
      
      <div class="zoom-to-fit-width" @click="$emitter.emit('canvas-fit', 'width')" v-tippy content="Fit canvas width inside the viewport">
        <fluent-auto-fit-height-20-regular/>
      </div>
      
      <div class="collapse-toolbar" @click="$store.commit('update', { key: 'toolbarCollapsed', value: !store.toolbarCollapsed })">
        <bx-bxs-chevrons-up v-if="!store.toolbarCollapsed" />
        <bx-bxs-chevrons-down v-else />
      </div>
      
    </div>

    <div class="mode-switcher" v-if="!store.saving">
      
      <n-button type="success" style="border-radius: 999px;" @click="$store.commit('update', { key: 'presetModalOpen', value: true });">
        <ri-collage-fill/> &nbsp; Change canvas preset
      </n-button>
      
    </div>
    
    <div class="toolbar-inner" :class="{ saving: store.saving, 'hide-hints': !store.showHints }">
      <n-space vertical :size="spaceGapSize" v-if="!store.saving">
        
        <div v-if="store.animatedWallpaperMode" style="text-align: center;">
          
        <n-button 
          type="error" style="border-radius: 999px;" 
          @click="openLink('https://joonaspaakko.gitbook.io/audible-library-extractor/wallpaper-creator/general-info/animated-wallpapers')"
        >
          Wallpaper installation instructions
        </n-button>
        </div>
        
        <n-space vertical :size="spaceGapSize" v-if="store.animatedWallpaperMode && store.animationPresets" style="position: relative; z-index: 10;">
          <h6>Animation settings</h6>
          
          <n-tabs type="line" animated>
            <n-tab-pane name="presets" tab="Presets">
              
              <n-select v-model:value="store.animationPreset" :options="store.animationPresets" />
              
            </n-tab-pane>
            <n-tab-pane name="animations" tab="Individual animations">
              
              
              <div class="animation-names-container">
                <n-select 
                  v-model:value="store.awpAnimation" 
                  :options="listify(store.awpAnimations)" 
                  multiple :show-arrow="false" 
                  placeholder="Pick animations"
                />
              </div>
              
              <n-button 
                strong secondary round type="warning"
                v-if="store.awpAnimation && store.awpAnimation.length"
                style="margin-top: 10px;"
                @click="$store.commit('update', { key: 'awpAnimation', value: [] })"
              >
                <fa-trash-o/> &nbsp; Clear all animations 
              </n-button>
              
            </n-tab-pane>
          </n-tabs>
          
        </n-space>
        
        <n-space vertical :size="12" v-if="store.animatedWallpaperMode">
          
          <div style="height: 22px; cursor: help;">
            <div class="label-row time-until-next-cycle" v-if="store.awpAnimationStarted"
            v-tippy="{ placement: 'top', allowHTML: true }" 
            :content="`
              <strong>Number:</strong> ${ !store.awpShowAnimationZone ? 0 : (store.awpAnimatedCoversLength || 0) } covers animated in this cycle. <br /> 
              <strong style='color: #48c86d;'>GREEN (animation zone):</strong> animations happen in this section. <br />
              <strong style='color: #ff2956;'>RED:</strong> time until next cycle begins.
              <br /><br />
              The line as a whole represents one full &#34;animation cycle&#34;
            `"
            >
              <span class="covers-this-cycle">{{ !store.awpShowAnimationZone ? 0 : (store.awpAnimatedCoversLength || 0) }}</span> 
              <div class="progress-bar">
                <div class="fill" :class="{ animate: store.awpCycleDelay }"></div>
                <div class="fill-overlay"></div>
              </div>
              
              <radix-icons-info-circled style="padding-left: 10px;" />
              
              <component v-if="store.awpShowAnimationZone && store.awpAnimationZone > -1" is="style">
                .time-until-next-cycle .progress-bar:after {
                  display: inline-block !important;
                  left: {{ store.awpAnimationZone }}% !important;
                }
                .time-until-next-cycle .progress-bar:before {
                  display: inline-block !important;
                  width: {{ store.awpAnimationZone }}% !important;
                }
                .fill-overlay {
                  display: inline-block !important;
                  left: {{ store.awpAnimationZone }}% !important;
                }
              </component>
              <component v-if="!store.awpShowAnimationZone" is="style">
                .fill-overlay {
                  display: inline-block !important;
                  left: 0 !important;
                }
              </component>
              <component v-if="store.awpAnimationStarted && store.awpCycleDelay" is="style">
                .time-until-next-cycle .progress-bar .fill.animate {
                  -webkit-animation-duration: {{ store.awpCycleDelay }}s !important;
                          animation-duration: {{ store.awpCycleDelay }}s !important;
                }
              </component>
            </div>
          </div>
          
          <div class="label-row">
            <span>Animate immediately on load</span>
            <n-switch size="small" v-model:value="store.awpAnimateOnLoad" style="justify-content: flex-end;" />
          </div>
          
          <div class="label-row">
            <span>Animation Cycle (sec) </span>
            <n-input-number size="small" v-model:value="store.awpCycleDelay" :min="0" :step="1" />
          </div>
          
          <div class="label-row" v-tippy content="A percentage of the animation cycle where covers are animated. Settings this to 0 animates covers immediately at the beginning of the cycle.">
            <span>Animation Zone (%) </span>
            <n-slider v-model:value="store.awpAnimationZone" :min="0" :max="100" :step="1" :tooltip="true" />
          </div>
          
          <div class="label-row">
            <span>Covers per cycle</span>
            <n-input-number size="small" v-model:value="store.awpCoversPerCycle" :min="1" :step="1" />
          </div>
          
          <div 
            class="label-row" 
            v-tippy content='Cover amount is randomized for every cycle. The setting above "Covers per cycle" defines the maximum amount.'
          >
            <span>Randomize covers <span v-if="store.awpRandomCovers">(1-{{ store.awpCoversPerCycle }})</span></span>
            <n-switch size="small" v-model:value="store.awpRandomCovers" style="justify-content: flex-end;" />
          </div>
          
          <div 
            class="label-row" 
            v-tippy content='<strong>Enabled:</strong> covers animate randomly within the animation zone. <br><strong>Disabled:</strong> cover animations are spread evenly across the animation zone.'
          >
            <span>Randomize cover delay</span>
            <n-switch size="small" v-model:value="store.awpRandomDelay" style="justify-content: flex-end;" />
          </div>
          
          <div 
            class="label-row" 
            v-tippy content='<strong>Enabled:</strong> covers animate in order starting from top left. <br><strong>Disabled:</strong> animated covers are picked randomly.'
          >
            <span>Sequential animation</span>
            <n-switch size="small" v-model:value="store.awpSequential" style="justify-content: flex-end;" />
          </div>
          
        </n-space>
          
        
        <!-- <div v-if="store.animatedWallpaperMode">
          <spacer size="small" :line="false" />
          <p class="gb-field-message gb-field-message--small gb-field-message--info gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 16px;">info</i>
            <span class="gb-field-message__message">
              Animated wallpapers use all the available covers in order to get the most out of it. 
              You should have at least the amount of covers to cover the entire canvas and hopefully a few or few dozen more than that.
            </span>
          </p>
          <spacer size="default" :line="false" />
        </div>
        <spacer v-else size="large" :line="false" /> -->
        
        
        <!-- On ice for now... -->
        <!-- 
          The idea was that if you really wanted to, you could add empty "covers" to make room for text.
          It's just that the sorting is kinda terrible...
        -->
        <!-- <div v-if="false">
          
          <gb-heading tag="h6" :uppercase="true">
            Placeholders
          </gb-heading>
          <gb-input
            type="number"
            :full-width="true"
            :min="0"
            :max="100"
            :value="parseFloat(store.coverPlaceholders)"
            @input="coverPlaceholders"
            size="mini"
          ></gb-input>
          
          <spacer size="large" :line="true" />

        </div>  -->
        
        <n-space vertical :size="spaceGapSize">
          
          <h6>Covers per row (columns)</h6>
          
          <n-input-number v-model:value="store.coversPerRow" :min="1" :step="1" />
          
          <n-slider v-model:value="store.coversPerRow" :min="1" :max="25" :step="1" :tooltip="false"/>
          
          <n-alert v-if="store.coverSize > 500" :title="'Cover upsized by ' + Math.floor( (store.coverSize / 500) * 100 ) + '%'" type="warning">
            The more you upsize the more quality loss there will be. You can choose to ignore this, or you can try lowering canvas width or increasing covers per row.
          </n-alert>
          
          <n-alert v-if="store.animatedWallpaperMode && store.visibleAnimatedCovers > store.covers.length" type="warning">
            <strong>{{ store.visibleAnimatedCovers - store.covers.length }}/{{ store.visibleAnimatedCovers }}</strong> 
            visible covers have been duplicated in order for the animated wallpaper to function.
            <br><br>
            This basically means that you should already see duplicate covers on load and it's not
            going to get any better when the covers start to animate. If you don't like what you
            see, try lowering the "Covers per row" setting or consider using another source for the
            cover images if possible.
            <br><br>
            Ideally the total number of covers would be visible covers x3 or more.
          </n-alert>
          
          <n-space vertical :size="spaceGapSize" v-if="store.animatedWallpaperMode ">
            
            <n-checkbox v-model:checked="store.prioritizeCoversPerRow">
              Prioritize covers per row
            </n-checkbox>
            
            <n-alert type="default" v-if="store.prioritizeCoversPerRow">
              <template #icon>
                <fluent-checkmark-circle-24-regular style="color: #63e2b8; padding-top: 5px;"/>
              </template>
              No matter what screen resolution you have, the wallpaper will always have {{ store.coversPerRow }} columns.
            </n-alert>
            
            <n-alert type="warning" v-else title="This will only affect the output">
              The current cover size ~{{ Math.round(store.coverSize) }}px is prioritized over
              "covers per row".
            </n-alert>
            
          </n-space>
          
        </n-space>
        
        <n-space vertical :size="spaceGapSize" v-if="!store.animatedWallpaperMode">
          
          <h6>
            <span :style="{ color: store.covers.length > store.coverAmount ? '#ffc02b' : null }">
              Limit covers 
            </span>
            <span>{{ store.coverAmount }}/{{ store.covers.length }}</span>
          </h6>
          
          <n-input-number v-model:value="store.coverAmount" :min="1" :max="store.covers.length" :step="1" />
          <!-- <spacer size="medium" :line="false" /> -->
          <n-slider v-model:value="store.coverAmount" :min="1" :max="store.covers.length" :step="1" :tooltip="false"/>
          <n-alert type="info">
            Excess covers are removed from the tail end.
          </n-alert>
          
        </n-space>
        
        <n-space vertical :size="spaceGapSize" v-if="!store.animatedWallpaperMode">
          <h6>
            Randomize covers 
            
            <n-button 
              strong 
              secondary 
              type="info" 
              @click="randomizeCovers"
              v-tippy content="Randomizes all covers from the source data. You might want to use this before manual sorting."
            >
              <icomoon-free-shuffle/> &nbsp; shuffle
            </n-button>
          </h6>
          
        </n-space>
        
        <n-space vertical :size="spaceGapSize">
          
          <h6>Canvas size</h6>
          
          <div class="label-row" style="padding-left: 58px">
            
            <n-slider v-model:value="store.canvas.width" :min="1" :max="1920" :step="1" :tooltip="false"/>
            
          </div>
          <div class="label-row" v-tippy content="Width is always required">
            
            <span style="width: 50px">Width:</span>
            <n-input-number v-model:value="store.canvas.width" :min="1" :step="1" />
            
          </div>
          <div class="label-row" style="padding-left: 58px">
            
            <n-slider v-model:value="store.canvas.height" :min="0" :max="1080" :step="1" :tooltip="false"/>
            
          </div>
          <div class="label-row" v-tippy content="Set the height to 0 when you don't need to limit it to a certain height.">
            
            <span style="width: 50px">Height:</span>
            <n-input-number v-model:value="store.canvas.height" :min="0" :step="1" />
            
          </div>
          
          <n-alert type="info" v-if="store.canvas.height == 0">
            <!-- 0 = automatic height.
            <span v-if="store.canvas.autoHeight > 0">
              <br>
              Estimated height: {{ store.canvas.autoHeight }} px
            </span>
              -->
            0 height = content height ({{ store.canvas.autoHeight }}px)
          </n-alert>
          
          <n-space :size="spaceGapSize" style="text-align: center; flex-flow: row;" v-if="!store.animatedWallpaperMode && store.canvas.height > 0">
            
            <n-button strong type="info" style="box-sizing: border-box;"
              @click="fillCanvasWithCovers('fit')"
              v-tippy content="Sets visible cover amount based on how many covers <strong>fit</strong> inside the canvas."
              :disabled="store.showAuthorAndTitle"
            >
              <teenyicons-border-bottom-outline/> &nbsp; Covers Fit
            </n-button>
              
            <n-button strong type="info" style="box-sizing: border-box;"
              @click="fillCanvasWithCovers"
              v-tippy content="Sets visible cover amount based on how many covers <strong>fill</strong> inside the canvas."
              :disabled="store.showAuthorAndTitle"
            >
              <bi-border-outer/> &nbsp; Covers Fill
            </n-button>
            
          </n-space>
          
          <n-button strong type="info"
            v-if="!store.animatedWallpaperMode && store.canvas.height > 0"
            style="width: 100%;"
            @click="fitCanvasToContent"
            v-tippy content="Sets visible cover amount based on how many covers <strong>fit</strong> inside the canvas."
            :disabled="store.showAuthorAndTitle"
          >
            <mdi-crop/> &nbsp; Fit canvas size to covers
          </n-button>          
          
          <n-alert v-if="store.animatedWallpaperMode" type="info">
            In this "animated wallpaper" mode the canvas size is for preview purposes only, as the animated wallpaper will fit itself to any screen size. 
          </n-alert>
          
          <n-alert v-if="store.coverSize > 500" :title="'Cover upsized by ' + Math.floor( (store.coverSize / 500) * 100 ) + '%'" type="warning">
            The more you upsize the more quality loss there will be. You can choose to ignore this, or you can try lowering canvas width or increasing covers per row.
          </n-alert>
          
        </n-space>
        
        <h6 v-if="store.animatedWallpaperMode" v-tippy content="You might want to use this when adding padding around the canvas">
          <span>Remove overflowing row</span>
          <n-switch size="small" v-model:value="store.awpDropOverflowingRow" />
        </h6>
        
        <h6 v-if="store.animatedWallpaperMode">
          <span>Covers alignment</span>
          <div class="align-canvas label-row no-padding" style="padding-left: 0px; width: 85px; flex: unset;">
            <material-symbols-vertical-align-top style="font-size: 18px;" :class="{ active: store.canvas.alignmentVertical === 'flex-start' }" name="vertical_align_top" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'flex-start', });" />
            <material-symbols-vertical-align-center style="font-size: 18px;" :class="{ active: store.canvas.alignmentVertical === 'center' }" name="vertical_align_center" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'center', });" />
            <material-symbols-vertical-align-bottom style="font-size: 18px;" :class="{ active: store.canvas.alignmentVertical === 'flex-end' }" name="vertical_align_bottom" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'flex-end', });" />
          </div>
        </h6> 
        
        <n-space vertical :size="spaceGapSize" v-if="!store.animatedWallpaperMode">
          
          <h6 v-tippy content="Horizontal alignment aligns the last row if it's not full. If you want to offset horizontally, you can change left or right canvas padding. <br><br>Vertical alignment aligns the covers as a group, but only if the canvas height is set.">
            <span>Covers alignment</span>
          </h6>
          
          <div class="align-canvas label-row no-padding" style="padding-left: 0px; width: 145px; flex: unset; width: 100%;">
            <akar-icons-align-left :class="{ active: store.canvas.alignment === 'left' }" style="font-size: 18px;" name="format_align_left" @click="$store.commit('update', { key: 'canvas.alignment', value: 'left', });" />
            <akar-icons-align-horizontal-center :class="{ active: store.canvas.alignment === 'center' }" style="font-size: 18px;" name="format_align_center" @click="$store.commit('update', { key: 'canvas.alignment', value: 'center', });" />
            <akar-icons-align-right :class="{ active: store.canvas.alignment === 'right' }" style="font-size: 18px;" name="format_align_right" @click="$store.commit('update', { key: 'canvas.alignment', value: 'right', });" />
            <akar-icons-align-top :class="{ active: store.canvas.alignmentVertical === 'flex-start' }" style="font-size: 18px;" name="vertical_align_top" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'flex-start', });" />
            <akar-icons-align-vertical-center :class="{ active: store.canvas.alignmentVertical === 'center' }" style="font-size: 18px;" name="vertical_align_center" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'center', });" />
            <akar-icons-align-bottom :class="{ active: store.canvas.alignmentVertical === 'flex-end' }" style="font-size: 18px;" name="vertical_align_bottom" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'flex-end', });" />
          </div>
          
          <!-- 
            Dragging broke with this one... 
          -->
          <!-- <div class="label-row">
            <span style="flex: 1;">Reverse flow direction</span> <n-switch style="flex: 0;" size="small" v-model:value="store.reverseCoverFlow" /> 
          </div> -->
          
        </n-space>
        
        <h6>
          <span>Canvas background color</span>
          <color-picker storeKey="canvas.background"></color-picker>
        </h6>
        
        <h6 v-tippy content="Overlay is recommended if you're making a desktop wallpaper and plan to have icons on top of it.">
          <span :style="{ color: store.awpOverlayColorEnabled ? '#ffc02b' : null }">Color overlay</span>
          <n-switch size="small" v-model:value="store.awpOverlayColorEnabled" />
          <color-picker storeKey="awpOverlayColor"></color-picker>
        </h6>
        <div 
          class="label-row"
          v-tippy content="You can adjust the strength of the effect by lowering the overlay color opacity. Opacity is controlled by the second slider in the color picker."
        >
          <span>Blend mode</span>
          <n-select 
            v-if="store.awpOverlayColorEnabled && store.awpBlendModes" 
            v-model:value="store.awpBlendMode" 
            :options="store.awpBlendModes" 
            size="small" 
          />
        </div>
        
        <!-- <h6 v-if="true || store.overlayTextures" style="position: relative; z-index: 1;">
          <span>Textures</span>
          <n-select v-model:value="store.overlayTexture" :options="store.overlayTextures" size="small" />
        </h6> -->
        
        <h6>
          <span>Grayscale</span>
          <n-slider 
            v-if="store.awpGrayscale" 
            v-model:value="store.awpGrayscaleContrast" 
            :min=".15" :max="1" :step=".05" :tooltip="false" 
            style="padding: 0 15px;"
          />
          <n-switch size="small" v-model:value="store.awpGrayscale" />
        </h6>
        
        <!-- Abandoning for now... Just doesn't seem so necessary when there's the overlay? -->
        <!-- <div v-if="!store.animatedWallpaperMode && store.coverOpacityEnabled">
          <gb-heading tag="h6" :uppercase="true">
            <span>Cover opacity</span>
            <input
              v-if="store.coverOpacityEnabled"
              class="heading-range"
              style="padding: 0 10px;"
              type="range"
              min=".01"
              max="1"
              v-model="store.coverOpacity"
              step=".05"
            />
            <gb-toggle
            size="mini"
            v-model="store.coverOpacityEnabled"
            ></gb-toggle>
          </gb-heading>
          
          <spacer size="default" :line="false" />
        </div> -->

        <n-space vertical :size="spaceGapSize">
          
          <h6>Canvas padding</h6>
          
          <n-slider v-model:value="canvasPadding" :min="0" :max="200" :step="1" :tooltip="false" />
          
          <n-space vertical :size="spaceGapSize">
            
            <div class="label-row">
              <span class="gb-field-message__message" style="display: inline-block; width: 55px;">left</span>
              <n-input-number v-model:value="store.canvas.padding.left" :min="0" :step="1" size="tiny" />
              <n-slider style="flex: 1;" v-model:value="store.canvas.padding.left" :min="0" :max="200" :step="1" :tooltip="false" />
            </div>
            
            <div class="label-row">
              <span class="gb-field-message__message" style="display: inline-block; width: 55px;">top</span>
              <n-input-number v-model:value="store.canvas.padding.top" :min="0" :step="1" size="tiny" />
              <n-slider style="flex: 1;" v-model:value="store.canvas.padding.top" :min="0" :max="200" :step="1" :tooltip="false" />
            </div>
            
            <div class="label-row">
              <span class="gb-field-message__message" style="display: inline-block; width: 55px;">right</span>
              <n-input-number v-model:value="store.canvas.padding.right" :min="0" :step="1" size="tiny" />
              <n-slider style="flex: 1;" v-model:value="store.canvas.padding.right" :min="0" :max="200" :step="1" :tooltip="false" />
            </div>
            
            <div class="label-row">
              <span class="gb-field-message__message" style="display: inline-block; width: 55px;">bottom</span>
              <n-input-number v-model:value="store.canvas.padding.bottom" :min="0" :step="1" size="tiny" />
              <n-slider style="flex: 1;" v-model:value="store.canvas.padding.bottom" :min="0" :max="200" :step="1" :tooltip="false" />
            </div>
            
          </n-space>
          
        </n-space>
        
        <h6>Cover padding</h6>
        <div class="label-row no-padding">
          <n-input-number v-model:value="store.paddingSize" :min="0" :step="1" size="tiny" />
          <n-slider style="padding-left: 15px;" v-model:value="store.paddingSize" :min="0" :max="50" :step="1" :tooltip="false" />
        </div>
        
        <n-space vertical :size="spaceGapSize" v-if="!store.animatedWallpaperMode">
          <h6>Border radius</h6>
          <div class="label-row no-padding">
            <n-input-number v-model:value="store.borderRadius" :min="0" :step="0.01" :max=".5" size="tiny" />
            <n-slider style="padding-left: 15px;" v-model:value="store.borderRadius" :min="0" :max=".5" :step="0.01" :tooltip="false" />
          </div>
        </n-space>
        
        <n-space vertical :size="spaceGapSize" v-if="!store.animatedWallpaperMode" :class="{ 'disabled-settings-section': !$store.getters.rereadExist }">
          <h6>
            <span>Re-read label (relisten) </span>
            <n-switch size="small" v-model:value="store.reread.label.show" />
          </h6>
          <h4 style="margin: 0 !important;">Offset:</h4>
          <div class="label-row">
            <span style="width: 45px;">Right</span>
            <n-input-number v-model:value="store.reread.label.offset.right" :min="0" :step="1" size="tiny" :disabled="!$store.getters.rereadExist" />
            <n-slider style="padding-left: 15px;" v-model:value="store.reread.label.offset.right" :min="0" :max="200" :step="1" :tooltip="false" :reverse="true" :disabled="!$store.getters.rereadExist" />
          </div>
          <div class="label-row">
            <span style="width: 45px;">Bottom</span>
            <n-input-number v-model:value="store.reread.label.offset.bottom" :min="0" :step="1" size="tiny" :disabled="!$store.getters.rereadExist" />
            <n-slider style="padding-left: 15px;" v-model:value="store.reread.label.offset.bottom" :min="0" :max="200" :step="1" :tooltip="false" :reverse="true" :disabled="!$store.getters.rereadExist" />
          </div>
          
          <n-alert type="warning" v-if="!$store.getters.rereadExist">
            No books marked re-read! Click a cover and use the button that appears on the top right.
          </n-alert>
        </n-space>
        
        <toolbar-text-elements v-if="!store.animatedWallpaperMode" :spaceGapSize="spaceGapSize"></toolbar-text-elements>
        
<!--         
        <div>
          <gb-heading tag="h6" :uppercase="true">Cover size</gb-heading>
          <spacer size="mini" :line="false" />
          <spacer size="small" :line="false" />
          
          <input type="range" min="1" max="500" v-model="coverSize" step="1" 
          v-tippy content="The native cover size is 500px. You can make it larger using
            the input field below, but it's not recommended since upsizing 
            degrades the quality."
          />
          <gb-input
            v-tippy content="The native cover size is 500px. You can make it larger but it's not recommended since upsizing 
            degrades the quality."
            type="number"
            :min="1"
            :value="parseFloat(store.coverSize)"
            @input="inputChanged('coverSize', $event)"
            size="mini"
          ></gb-input>
          <spacer size="medium" :line="false" />
          
        </div>
-->
        
        <n-space vertical :size="spaceGapSize" v-if="!store.animatedWallpaperMode">
          
          <h6>
            <span>Show My Rating</span>
            <n-switch size="small" v-model:value="store.showMyRating" />
          </h6>
          
          <h6>
            <span>Show Favorites</span>
            <n-switch size="small" v-model:value="store.showFavorites" />
          </h6>
          
          <h6>
            <span>Show author & title</span>
            <n-switch size="small" v-model:value="store.showAuthorAndTitle" />
          </h6>
          
          <div v-if="store.showAuthorAndTitle" class="label-row">
            <span>Author & title color</span>
            <color-picker storeKey="authorAndTitleColor"></color-picker>
          </div>
          
          <div v-if="store.showAuthorAndTitle" class="label-row">
            <span>Author & title size</span>
            
            <n-input-number
              size="small"
              style="flex: 1; margin-left: 10px;" 
              :min="1" :step="1" 
              v-model:value="store.authorAndTitleSize"
            />
            <!-- <gb-input
              style="width: 90px;"
              type="number"
              :min="1"
              :value="store.authorAndTitleSize"
              @input="inputChanged('authorAndTitleSize', $event)"
              size="mini"
            ></gb-input> -->
          </div>
          
        </n-space>
        
        <h6 v-if="store.archived">
          <span>Exclude archived ({{ store.archived }})</span>
          <n-switch size="small" :value="store.excludeArchived" @update:value="excludeArchivedChanged"/>
        </h6>
        
        <n-space vertical :size="spaceGapSize" v-if="!store.animatedWallpaperMode">
          
          <h6>Reduce file size</h6>
          
          <n-alert type="default">
            <template #icon>
              <fluent-checkmark-circle-24-regular style="padding-top: 5px;" :style="{
                color: store.compressImage ? '#63e2b8' : '#ffc12c'
              }" />
            </template>
            Compressed image is saved as a <span :style="{ color: store.compressImage ? '#63e2b8' : null }">jpeg</span>, which doesn't support transparency. <br /><br />
            Disable compression in order to save the image as a <span :style="{ color: store.compressImage ? null : '#ffc12c' }">png</span> that does support a transparent background color.
          </n-alert>
          
          <div class="label-row">
            <span>Compress image</span>
            <div style=" display: flex; justify-content: flex-end;">
              <n-switch size="small" v-model:value="store.compressImage" />
            </div>
          </div>
          
          <div class="label-row" v-if="store.compressImage">
            <span class="compress-quality-text">Quality ({{ qualityPercentage }}%):</span>
            <n-slider v-model:value="store.compressQuality" :min="0.50" :max="0.99" :step=".01" :tooltip="false" />
          </div>
          
          <n-alert v-if="store.compressImage && qualityPercentage < 80" type="warning">
            Make sure to pay extra attention to the saved image quality when setting the quality below 80%.
          </n-alert>
          
          <h6>
            <span>Scaled output</span>
            <n-switch size="small" v-model:value="store.canvas.zoomOutputs" />
          </h6>
          
          <n-space vertical :size="spaceGapSize" v-if="store.canvas.zoomOutputs">
            <div class="label-row">
              <span class="compress-quality-text">Scale ({{ scalePercentage }}%):</span>
              <n-input-number size="small" v-model:value="store.canvas.outputScale" :min="0" :step="0.1" />
            </div>
            
            <!-- <n-slider v-model:value="store.canvas.outputScale" :min="0.10" :max="5" :step=".01" :tooltip="false" /> -->
            
            <div style="display: flex; justify-content: center; align-items: center;">
              <n-button-group size="small">
                <n-button round @click="$store.commit('update', { key: 'canvas.outputScale', value: .5 })">
                  .5x
                </n-button>
                <n-button @click="$store.commit('update', { key: 'canvas.outputScale', value: .75 })">
                  .75x
                </n-button>
                <n-button @click="$store.commit('update', { key: 'canvas.outputScale', value: 1 })">
                  1x
                </n-button>
                <n-button @click="$store.commit('update', { key: 'canvas.outputScale', value: 1.5 })">
                  1.5x
                </n-button>
                <n-button round @click="$store.commit('update', { key: 'canvas.outputScale', value: 2 })">
                  2x
                </n-button>
                <n-button round @click="$store.commit('update', { key: 'canvas.outputScale', value: 3 })">
                  3x
                </n-button>
              </n-button-group>
            </div>
            
            <n-alert type="info">
              Width: {{ $store.getters.scaledCanvasDimensions.width }}px <br>
              Height: {{ $store.getters.scaledCanvasDimensions.height }}px
            </n-alert>
          </n-space>
          
        </n-space>

      </n-space>
      <div v-else class="saving-container">
        
        <n-progress type="circle" :percentage="Math.round(saveProgressWidth)" v-if="saveProgressWidth > -1">
          <div class="saving-spnr" style="width: 60px; height: 60px; background-size: 60px;"></div>
        </n-progress>
        <div class="saving-spnr" v-else></div>
        
        <!-- <div class="saving-progress" v-if="saveProgressWidth > -1">
          <n-progress type="circle" :percentage="saveProgressWidth" />
        </div> -->
        
      </div>
    </div> 
  
  </n-config-provider>
</template>

<script>

import { 
  NConfigProvider, 
  darkTheme, 
  NButton,
  NButtonGroup,
  NSwitch, 
  NDivider,
  NSelect,
  NAlert,
  NInputNumber,
  NSlider,
  NSpace,
  NCheckbox,
  NCard,
  NTabs,
  NTabPane,
  NProgress,
} from 'naive-ui';

import calculateCoverSize from "@editor-mixins/calculateCoverSize.js";
import makeWallpaper from "@editor-mixins/makeWallpaper.js";
import makeImage from "@editor-mixins/makeImage.js";

import ToolbarTextElements from "@editor-comps/toolbar/toolbar-text-elements.vue";
import spacer from "@editor-comps/toolbar/spacer.vue";
// import _ from "lodash";

import Multiselect from '@vueform/multiselect/dist/multiselect.vue2.js';

export default {
  name: "toolbar",
  components: { 
    ToolbarTextElements,
    spacer, 
    Multiselect,
    NConfigProvider,
    NButton,
    NButtonGroup,
    NSwitch,
    NDivider, 
    NSelect,
    NAlert,
    NInputNumber,
    NSlider,
    NSpace,
    NCheckbox,
    NCard,
    NTabs,
    NTabPane,
    NProgress,
  },
  mixins: [calculateCoverSize, makeWallpaper, makeImage],
  data: function () {
    return {
      store: this.$store.state,
      slidingTimer: null,
      saveProgressWidth: -1,
      darkTheme: darkTheme,
      spaceGapSize: 20,
    };
  },
  
  computed: {
    
    outputWidthZoomSize: function() {
      if ( this.store.canvas.scaled.width && !this.store.canvas.scaled.height ) {
        return 'Estimated width: ' + this.store.canvas.scaled.width + 'px';
      }
      else if ( this.store.canvas.scaled.width && this.store.canvas.scaled.height ) {
        return 'Estimated size: ' + this.store.canvas.scaled.width +'x'+ this.store.canvas.scaled.height + 'px';
      }
    },
    
    canvasWidth: {
      get: function () {
        return this.store.canvas.width;
      },
      set: _.throttle( function (size) {
        this.$store.commit("update", {
          key: "canvas.width",
          value: size,
        });
      }, 200, { leading: false, trailing: true }),
    },
    canvasWidth: {
      get: function () {
        return this.store.canvas.height;
      },
      set: _.throttle( function (size) {
        this.$store.commit("update", {
          key: "canvas.height",
          value: size,
        });
      }, 200, { leading: false, trailing: true }),
    },
    coverSize: {
      get: function () {
        return this.store.coverSize;
      },
      set: _.throttle( function (size) {
        this.$store.commit("update", { key: "coverSize", value: size,});
      }, 200, { leading: false, trailing: true }),
    },
    coversPerRow: {
      get: function () {
        return this.store.coversPerRow;
      },
      set: _.throttle( function (size) {
        this.$store.commit("update", { key: "coversPerRow", value: size,});
      }, 200, { leading: false, trailing: true }),
    },
    canvasPadding: {
      get: function () {
        
        var values = [
          parseFloat(this.store.canvas.padding.left),
          parseFloat(this.store.canvas.padding.top),
          parseFloat(this.store.canvas.padding.right),
          parseFloat(this.store.canvas.padding.bottom),
        ];
        
        return _.maxBy( values );
      },
      set: _.throttle(
        function (padding) {
          this.$store.commit("update", [
            { key: 'canvas.padding.left', value: padding },
            { key: 'canvas.padding.top', value: padding },
            { key: 'canvas.padding.right', value: padding },
            { key: 'canvas.padding.bottom', value: padding },
          ]);
        }, 50, { leading: true, trailing: true }
      ),
    },
    
    prioritizeCoversPerRow: {
      get: function () {
        return this.store.prioritizeCoversPerRow;
      },
      set: function ( value ) {
        this.$store.commit("update", { key: "prioritizeCoversPerRow", value:  value  });
      },
    },
    
    zoomPercentage: function () {
      var zoom = this.store.canvas.zoom == 0 ? 1 : this.store.canvas.zoom;
      return Math.floor(zoom * 100);
    },
    qualityPercentage: function () {
      let quality = parseFloat(this.store.compressQuality);
      return Math.floor(quality * 100);
    },
    scalePercentage: function () {
      let scale = parseFloat(this.store.canvas.outputScale);
      return Math.floor(scale * 100);
    },
  },
  
  watch: {
    "store.coversPerRow": function( value ) {
      let coverSize = this.calculateCoverSize({ coversPerRow: value });
      this.$store.commit('update', { key: 'coverSize', value: coverSize });
    },
    "store.canvas.width": function( value ) {
      let coverSize = this.calculateCoverSize({ canvasWidth: value });
      this.$store.commit('update', { key: 'coverSize', value: coverSize });
    },
    "store.canvas.padding.left": function( value ) {
      let coverSize = this.calculateCoverSize({ paddingLeft: value });
      this.$store.commit('update', { key: 'coverSize', value: coverSize });
      if ( !this.store.slidingAround ) this.$store.commit("update", { key: "slidingAround", value: 'left' });
    },
    "store.canvas.padding.right": function( value ) {
      let coverSize = this.calculateCoverSize({ paddingRight: value });
      this.$store.commit('update', { key: 'coverSize', value: coverSize });
      if ( !this.store.slidingAround ) this.$store.commit("update", { key: "slidingAround", value: 'right' });
    },
    "store.canvas.padding.top": function( value ) {
      if ( !this.store.slidingAround ) this.$store.commit("update", { key: "slidingAround", value: 'top' });
    },
    "store.canvas.padding.bottom": function( value ) {
      if ( !this.store.slidingAround ) this.$store.commit("update", { key: "slidingAround", value: 'bottom' });
    },
    "store.paddingSize": function( value ) {
      if ( !this.store.slidingAround ) this.$store.commit("update", { key: "slidingAround", value: 'paddingSize' });
      let coverSize = this.calculateCoverSize({ paddingSize: value });
      this.$store.commit('update', { key: 'coverSize', value: coverSize });
    },
    "store.slidingAround": _.debounce( function( value ) {
      console.log('sliding', value)
      if ( value ) this.$store.commit("update", { key: "slidingAround", value: null });
    }, 1500, { leading: false, trailing: true }),
  },
  
  methods: {
    
    randomizeCovers: function() {
      
      let randomCovers = _.shuffle(this.store.covers);
      
      this.$store.commit("update", [
        { key: "covers", value: randomCovers },
        { key: "usedCovers", value: randomCovers.slice( 0, this.$store.state.coverAmount ) }
      ]);
      
    },
    
    toMS: function( seconds ) {
      return seconds * 1000;
    },
    
    toSec: function( milliseconds ) {
      return milliseconds / 1000;
    },
    
    excludeArchivedChanged: function( value ) {
      
      this.$store.commit('update', { key: 'excludeArchived',  value: value });
      
      let covers = value ? _.filter(this.store.covers, function(o) { return !o.inArchive; }) : this.store.covers;
      covers = covers.slice(0, this.store.coverAmount || 1);
      
      this.$store.commit('update', [
        { key: 'usedCovers', value: covers },
        // { key: 'coverAmount', value: covers.length },
      ]);
      
    },
    
    inputFocused: function() {
      this.$store.commit('update', [
        { key: 'events.textNudge', value: false },
        { key: 'events.textRemove', value: false },
        { key: 'events.canvasPanning', value: false },
      ]);
    },
    
    inputBlurred: function() {
      this.$store.commit('update', [
        { key: 'events.textNudge', value: true },
        { key: 'events.textRemove', value: true },
        { key: 'events.canvasPanning', value: true },
      ]);
    },
    
    fitCanvasToContent: function() {
      
      // let update = [];
      // let coverSize = parseFloat(this.store.coverSize)+(parseFloat(this.store.paddingSize)*2);
      // let canvasPaddingX = parseFloat(this.store.canvas.padding.left) + parseFloat(this.store.canvas.padding.right);
      // // let canvasPaddingY = parseFloat(this.store.canvas.padding.top) + parseFloat(this.store.canvas.padding.bottom);
      // let innerWrap = document.querySelector('#editor-canvas-left .grid-inner-wrap');
      // let canvas = {
      //   width:  innerWrap.offsetWidth,
      //   height: innerWrap.offsetHeight,
      // };
      // let coverAmount = parseFloat(this.store.coverAmount);
      // let maxRows = canvas.height > coverSize ? Math.floor( canvas.height / coverSize ) : 1;
      // let coversPerWidth = canvas.width > coverSize ? Math.floor( canvas.width / coverSize ) : 1;
      // if ( coverAmount < coversPerWidth ) coversPerWidth = coverAmount;
      
      // update.push({ key: 'canvas.width', value: (coverSize * coversPerWidth) + canvasPaddingX });
      // if ( this.store.canvas.height > 0 ) update.push({ key: 'canvas.height', value: 0 });
      
      // this.$store.commit('update', update);
      
      
      let changes = [
        { key: 'canvas.height', value: 0 },
      ];
      if ( this.store.usedCovers.length < this.store.coversPerRow ) {
        changes.push({ key: 'coversPerRow', value: this.store.usedCovers.length });
      }
      this.$store.commit('update', changes);
      
    },
    
    slidingAround: _.throttle( function (key, value) {
      this.$store.commit("update", { key: "slidingAround", value: key });
    }, 250, { leading: true, trailing: true }),

    inputChanged: function (key, value) {
      clearTimeout(this.slidingTimer);

      if ( key.match('canvas.padding.') || key === 'paddingSize' ) {
        this.slidingAround( key, value);
        let vue = this;
        vue.slidingTimer = setTimeout(function () {
          vue.$store.commit("update", { key: "slidingAround", value: null });
        }, 1000);
      }
      
      const setValue = (value === '') ? value : parseFloat(value);
      this.$store.commit("update", { key: key, value: setValue }); 
           
      if ( key === 'coverAmount' ) {
        this.$store.commit('update', { 
          key: 'usedCovers', 
          value: this.store.covers.slice(0, this.store.coverAmount)
        });
        this.$nextTick(function() {
          // this.zoomToFit('and-center');
        });
      }
    },
    
    coverPlaceholders: function( value ) {
      
      this.$store.commit("updateCoverPlaceholders", value ); 
      
    },

    canvasFitChanged: function () {
      var width = this.store.canvas.width;
      var height = this.store.canvas.height;
      this.$store.commit("update", [
        { key: "canvas.width", value: null },
        { key: "canvas.height", value: null },
      ]);
      this.$nextTick(function () {
        this.$store.commit("update", [
          { key: "canvas.width", value: width },
          { key: "canvas.height", value: height },
        ]);
      });
    },
    
    openLink( address ) {
      window.open( address, '_blank');
    },
    
    listify( array ) {
      return _.map( array, ( value ) => {
        return {
          value: value,
          label: value,
        };
      });
    },
  },
};
</script>

<style scoped lang="scss">

@import "@vueform/multiselect/themes/default.css";

$toolbar-bg: #171e29;
$toolbar-text: #8eabc5;
.toolbar {
  box-shadow: -4px 0 10px darken( rgba($toolbar-bg, .3), 20);
  position: relative;
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
  flex: 1;
  background: $toolbar-bg;
  box-sizing: border-box;
  color: $toolbar-text;
  min-width: 380px;
  max-width: 380px;
  z-index: 50 !important;
  ::-moz-selection { background: #0093ee !important; color: lighten( #0093ee, 30 ); }
  ::selection { background: #0093ee !important; color: lighten( #0093ee, 45 ); }
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  user-drag: none;
}

.toolbar-inner {
  overflow: auto;
  padding: 80px 65px 50px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
  width: 100%;
  padding-bottom: 300px;
  box-sizing: border-box;
}

.toolbar-inner.saving {
  padding-bottom: 0px;
}
.toolbar-inner .saving-container {
  display: flex; 
  flex-direction: column;
  justify-items: center;
  justify-content: center;
  align-items: center;
  align-content: center;
  width: 100%;
  height: 100%;
  .saving-spnr {
    width: 64px;
    height: 64px;
    display: inline-block;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url("data:image/gif;base64,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");
  }
  .saving-progress {
    height: 7px;
    width: 100%;
    background: #313d4f;
    border-radius: 9999999px;
    margin-top: 40px;
  }
}

.label-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  > span {
    display: inline-block;
  }
  > div {
    padding-left: 10px;
    flex: 1;
  }
  &.no-padding > div {
    padding-left: 0px;
  }
}

.offset-height-text {
  width: 50px; 
  position: relative; 
  top: -20px;
}

.hint-text {
  color: darken($toolbar-text, 25) !important;
  padding: 3px 6px;
  border: 1px solid #323d4f;
  border-radius: 4px;
  background: #1a2431;
  display: block;
  margin-bottom: 0px;
  font-size: 13px;
  line-height: 18px;
  .highlight {
    color: #ffc02b !important;
    opacity: 0.5;
  }
  &:hover {
    color: darken($toolbar-text, 18) !important;
    .highlight {
      opacity: 0.65;
    }
  }
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
}

.hide-hints .hint-text { display: none !important; }

.toolbar .zoom-container,
.toolbar .button-container {
  // box-shadow: 0 0 25px darken( rgba($toolbar-bg, .7), 20);
  // width: 100%;
  // background: #273142;
  // padding: 6px;
  position: absolute;
  z-index: 100;
  top: 20px;
  left: -35px;
  // right: 0;
  text-align: center;
  background: $toolbar-bg;
  padding: 10px;
  border-radius: 99999999px;
  box-shadow: -4px 0 7px darken( rgba($toolbar-bg, .4), 20);
  background: $toolbar-bg;
  border: 1px solid #222c3c;
}

.toolbar .button-container {
  box-shadow: -4px 0 7px darken( rgba($toolbar-bg, .4), 20), 2px 2px 9px darken( rgba($toolbar-bg, .4), 20);
  border-bottom: 1px solid #171e29;
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
  }
}

.toolbar .zoom-container {
  transform: rotate(90deg);
  transform-origin: top left;
  z-index: 80;
  top: 56px;
  left: 24px;
  padding: 9px 25px 9px 45px;
  display: flex;
  flex-direction: row;
  justify-items: center;
  justify-self: center;
  align-items: center;
  align-content: center;
  .zoom-text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;  
    transform: rotate(-90deg);
    transform-origin: center center;
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
    cursor: pointer;
    position: relative;
    font-size: 11px !important;
    &.highlight {
      color: #ffc02b !important;
      opacity: 1;
    }
  }
  .zoom-zoom {
    position: relative;
    width: 120px;
    transform: rotate(180deg);
    transform-origin: center center;
  }
  .zoom-to-fit, .center-canvas, .zoom-to-fit-width, .collapse-toolbar {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 1.3em;
    cursor: pointer;
    position: relative;
    svg { display: block !important; }
    margin-left: 15px;
  }
  
  .collapse-toolbar {
    position: relative;
    z-index: 0;
    padding: 5px;
    &:before {
      content: '';
      position: absolute; 
      border: 1px solid #303d4f;
      border-radius: 50%;
      width: 100%;
      padding-bottom: 100%;
    }
  }
  
  .reset-settings {
    margin-left: 35px;
    transform: rotate(-90deg);
    transform-origin: center center;
    color: #e03b2e;
    position: relative;
    z-index: 1;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 23px;
    height: 23px;
    transform-origin: center center;
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
    cursor: pointer;
    font-size: 1.1em;
    &:before {
      content: '';
      position: absolute;
      z-index: -1;
      width: 23px;
      height: 23px;
      border-radius: 999999px;
      background: #222c3c;
      border: 2px solid #e03b2e;
    }
  }
}

.hide-hints-container {
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  opacity: .7;
  &.showing-hints {
    opacity: .5;
  }
}

.compress-quality-text {
  display: inline-block;
  cursor: pointer; 
  white-space: nowrap; 
  margin-right: 4px;
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
}

.mode-switcher {
  border-radius: 4px;
  position: absolute;
  z-index: 50;
  top: 0;
  right: 0;
  left: 0;
  text-align: center;
  
  button {
    flex: 1;
    text-align: center !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100%;
    height: 100%;
    border-radius: 0 !important;
    padding: 10px 50px;
    .n-button__content {
      display: flex;
      flex: 1;
    }
  }
  
  > div {
    // padding-top: 15px;
    // &:first-child { padding-top: 0; }
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    border-bottom: 1px solid #323d4f;
    background: #212935;
    box-shadow: 0 5px 18px rgba( darken(#212935, 20), .1);
    z-index: -1;
  }
}

.warning-message {
  color: #ffc02a;
  font-size: 12px;
  line-height: 17px;
  border: 1px solid #ffc02a;
  padding: 5px 7px;
  border-radius: 4px;
  strong {
    color: adjust-hue( lighten( #ffc02a, 5 ), -40);
  }
}

.toolbar {
  .align-canvas {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    svg {
      cursor: pointer;
      -webkit-touch-callout: none; 
      -webkit-user-select: none; 
      -khtml-user-select: none; 
      -moz-user-select: none; 
      -ms-user-select: none; 
      user-select: none; 
    }
    .active {
      color: #fbc03d;
    }
  }
}

</style>


<style lang="scss">

.gb-field-input--mini .gb-field-input__container {
  height: 27px !important;
}

.toolbar-inner {
  h6 {
    white-space: nowrap;
    font-size: 14px;
    line-height: 19px;
    font-weight: 400;
    color: #fff !important;
    padding: 7px 0px;  
    position: relative;
    margin: 20px 0 0px -5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 33px;
  }
  h6:before {
    content: '';
    position: absolute;
    top: 0px;
    right: -63px;
    left: -23px;
    border-radius: 999px 0 0 999px;
    bottom: 0px;
    background: #212935;
    box-shadow: 0 5px 18px rgba( darken(#212935, 20), .2);
    z-index: -1;
    border: 1px solid #313d4f;
    border-right: none;
  }
  
  .disabled-settings-section {
    h6 {
      color: darken(#fff, 30) !important;
    }
    > * {
      opacity: .6;
    }
  }
  
  
}

.toolbar {
  input[type="range"] {
    -webkit-appearance: none;
    margin: 10px 0;
    width: 100%;
    background: #171e29;
  }
  input[type="range"]:focus {
    outline: none;
  }
  input[type="range"]:focus::-webkit-slider-thumb {
    border-color: #1c93ee !important;
  }
  input[type="range"]:focus::-moz-range-thumb {
    border-color: #1c93ee !important;
  }
  input[type="range"]:focus::-ms-thumb {
    border-color: #1c93ee !important;
  }
  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 9px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 0px 0px 0px #171e29;
    background: #313d4f;
    border-radius: 0px;
    border: 3px solid #171e29;
  }
  input[type="range"]::-webkit-slider-thumb {
    box-shadow: 0px 0px 1px #000000;
    border: 3px solid #313d4f;
    height: 15px;
    width: 15px;
    border-radius: 50px;
    background: #171e29;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -6px;
  }
  input[type="range"]:focus::-webkit-slider-runnable-track {
    background: #313d4f;
  }
  input[type="range"]::-moz-range-track {
    width: 100%;
    height: 3px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 0px 0px 0px #171e29;
    background: #313d4f;
    border-radius: 0px;
    border: 3px solid #171e29;
  }
  input[type="range"]::-moz-range-thumb {
    box-shadow: 0px 0px 1px #000000;
    border: 3px solid #313d4f;
    height: 9px;
    width: 9px;
    border-radius: 50px;
    background: #171e29;
    cursor: pointer;
  }
  input[type="range"]::-ms-track {
    width: 100%;
    height: 9px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  input[type="range"]::-ms-fill-lower {
    background: #313d4f;
    border: 3px solid #171e29;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #171e29;
  }
  input[type="range"]::-ms-fill-upper {
    background: #313d4f;
    border: 3px solid #171e29;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #171e29;
  }
  input[type="range"]::-ms-thumb {
    box-shadow: 0px 0px 1px #000000;
    border: 3px solid #313d4f;
    height: 15px;
    width: 15px;
    border-radius: 50px;
    background: #171e29;
    cursor: pointer;
  }
  input[type="range"]:focus::-ms-fill-lower {
    background: #313d4f;
  }
  input[type="range"]:focus::-ms-fill-upper {
    background: #313d4f;
  }
  
  
  & {
    transition: all 300ms ease-in-out;
  }
  .mode-switcher,
  .toolbar-inner {
    transition: all 200ms ease;
  }
  
  &.toolbar-collapsed {
    width: 50px !important;
    min-width: 50px !important;
    flex: 0 !important;
    .mode-switcher,
    .toolbar-inner {
      opacity: 0;
    }
  }
}

.heading-range {
  background: #212935 !important;
}
.heading-range::-moz-range-track {
  border-color: #212935 !important;
}
.heading-range::-webkit-slider-runnable-track {
  border-color: #212935 !important;
}

.time-until-next-cycle {
  padding-left: 0px !important;
}
// .time-until-next-cycle .gb-base-progress-bar__progress {
//   transition-duration: 0s !important;
//   animation-duration: 0s !important;
// }
// .time-until-next-cycle .gb-base-progress-bar__bar { position: relative; overflow: visible !important; }
// .time-until-next-cycle .gb-base-progress-bar__bar:before {
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background: #212935;
//   z-index: -2;
//   border-radius: 99999999px;
// }

.covers-this-cycle {
  border-radius: 999999px;
  width: 20px;
  height: 20px;
  display: inline-flex !important;
  justify-items: center;
  justify-content: center;
  align-items: center;
  align-content: center;
  background: #212935;
  border: 1px solid #323d4f;
  margin-right: 10px;
  font-size: 10px;
}

.time-until-next-cycle .progress-bar {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 6px;
  border-radius: 999999px;
  background: #212935;
  padding: 0 !important;
  .fill {
    width: 0%;
    height: 100%;
    background: #0093ee;
    border-radius: 999999px;
  }
  .fill.animate {
    
    -webkit-animation: progressAnimation 0s linear infinite both;
            animation: progressAnimation 0s linear infinite both;
            
    @-webkit-keyframes progressAnimation {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    @keyframes progressAnimation {
      0% { width: 0%; }
      100% { width: 100%; }
    }
  }
  &:after {
    display: none;
    margin-left: -4.5px;
    content: '';
    position: absolute;
    z-index: 1;
    top: -3px;
    width: 6px;
    height: 6px;
    background: #48c86d;
    border: 3px solid #171e29;
    border-radius: 999999px;
  }
  &:before {
    display: none;
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0px;
    width: 6px;
    height: 6px;
    background: #48c86d;
    border-radius: 999999px;
    mix-blend-mode: color;
  }
  .fill-overlay {
    display: none;
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0px;
    width: auto;
    height: 6px;
    background: #cd5b73;
    border-radius: 999999px;
    mix-blend-mode: color;
  }
}




/*.hide-hints */.spacer {
  // .line { display: none !important; }
  // padding-bottom: 0 !important;
}

// .gb-base-button__left-icon {
//   margin-right: 0px !important;
// }
// .gb-base-button__label {
//   display: none;
// }
// .gb-base-button--default {
//   border-radius: 999999px !important;
//   width: 50px;
//   height: 50px;
// }
// .gb-base-button--default .gb-base-button__focuser {
//   border-radius: 999999px !important;
//   border-width: 2px !important;
// }

a.gb-base-button {
  text-decoration: none;
}

.canvas-padding .gb-field-message {
  display: block;
  text-align: center;
}

[class^="gb-base-heading"] {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}


.multiselect {
  padding: 4px 0px;
  background: #171e29;
  border: 1px solid #313d4f;
  &.is-open {
    border: 1px solid #1c93ee;
  }
}
.multiselect-tags {
  max-height: 140px !important;
  overflow: auto;
  padding: 0 8px;
}
.multiselect-tag {
  color: #fff;
  background: #1c93ee;
  font-size: 11px;
  line-height: 11px;
  font-weight: normal;
  padding: 3px 6px;
  padding-right: 3px;
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
}
.multiselect.is-active {
  box-shadow: none;
}
.multiselect-caret {
  display: none !important;
}
.multiselect-clear {
  filter: invert(1);
  position: absolute;
  right: -30px;
  padding: 6px;
}
.multiselect-dropdown {
  background: #222c3c;
  border: 1px solid #1c93ee;
  color: #f6f7f7;
  font-size: 12px;
  line-height: 12px;
}
.multiselect-option {
  font-size: 12px;
  line-height: 12px;
  border-bottom: 1px solid #313d50;
  color: #a9c7df;
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
  &.is-pointed,
  &:hover {
    background: #273143 !important;
    color: #a9c7df !important;
  }
}

.multiselect-tag-remove {
  padding: 0 0 0 3px;
}

.multiselect-placeholder {
  font-size: 12px;
  line-height: 12px;
}

.multiselect-tags-search {
  background: #171e29;
  color: #9fbcd3;
  font-size: 12px; 
  line-height: 12px;
}


h1, h2, h3, h4, h5, h6 {
  text-transform: uppercase;
}

.animation-names-container .n-base-selection-tags {
  overflow-y: auto;
  max-height: 200px;
  padding-top: 12px !important;
  padding-bottom: 11px !important;
  background: transparent !important;
  border: 1px solid #5a6f81;
  border-radius: 10px;
}

</style>