<template>
  <div class="right toolbar">

    <div class="button-container">
      <gb-button style="width: 48px;" v-if="store.animatedWallpaperMode"
        class="save-btn"
        :circular="true"
        :disabled="store.saving"
        @click="makeWallpaper"
        color="blue"
        size="large"
        left-icon="ondemand_video"
        v-tippy="{ allowHTML: true }" content="<strong>Save animated wallpaper as a .zip file.</strong> <br>You need to then unpack the zip and point the animated wallpaper application to the index.html file inside the folder."
      ></gb-button>
      <gb-button style="width: 48px;" v-else 
        class="save-btn"
        :circular="true"
        :disabled="store.saving"
        @click="makeImage"
        color="blue"
        size="large"
        left-icon="camera_alt"
        v-tippy :content="'Save image as a' + (store.compressImage ? '.jpg' : '.png' + ' file.')"
      ></gb-button>
    </div>
    
    <div class="zoom-container" v-show="!store.saving">
      <input
        class="zoom-zoom"
        type="range"
        min="0.01"
        max="6"
        v-model="store.canvas.zoom"
        step=".01"
        @dblclick="$store.commit('update', { key: 'canvas.zoom', value: 1 })"
      />
      <gb-heading
        v-tippy content="Click to reset to 100% zoom"
        class="zoom-text"
        :class="{ highlight: store.canvas.zoom != 1 }"
        tag="h6"
        :uppercase="true"
        @click="$store.commit('update', { key: 'canvas.zoom', value: 1 })"
      >
        {{ zoomPercentage }}%
      </gb-heading>
      
      <div class="zoom-to-fit" @click="zoomToFit('and-center')" v-tippy content="Fit canvas inside the viewport">
        <gb-icon size="16px" name="zoom_out_map"></gb-icon>
      </div>
      
      <div class="reset-settings" v-tippy content="<strong>Reset settings to defaults.</strong> Keeps imported covers but resets everything else." @mousedown="resetSettings">
        <gb-icon size="16px" name="delete_forever"></gb-icon>
      </div>
      
    </div>

    <div class="mode-switcher" v-if="!store.saving">
      
      <gb-toggle
      size="default"
      :value="store.animatedWallpaperMode"
      @change="editorModeChanged"
      label="Animated wallpaper mode"
      status="error"
      ></gb-toggle>
      
    </div>
    
    <div class="toolbar-inner" :class="{ saving: store.saving, 'hide-hints': !store.showHints }">
      <div v-if="!store.saving">
        
        <div v-if="store.animatedWallpaperMode" style="text-align: center;">
          <spacer size="largest" :line="false" />
          <gb-button size="mini" :full-width="true" :rounded="true" left-icon="library_books" color="red" target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/wallpaper-creator/general-info/animated-wallpapers">Installation instructions</gb-button>
          <spacer size="largest" :line="false" />          
        </div>
        <spacer v-else size="large" :line="false" />
        
        <div v-if="store.animatedWallpaperMode && store.animationPresets" style="position: relative; z-index: 10;">
          <gb-heading tag="h6" :uppercase="true">
            Animation settings
          </gb-heading>
          <spacer size="small" :line="false" />
          <spacer size="mini" :line="false" />
          
          <div style="height: 22px;">
            <div class="label-row time-until-next-cycle" v-if="store.awpAnimationStarted">
              <span class="covers-this-cycle" v-tippy content="Number of covers animated in one cycle.">{{ store.awpAnimatedCoversLength || 0 }}</span> 
              <div class="progress-bar">
                <div class="fill" :class="{ animate: store.awpCycleDelay }"></div>
              </div>
              <gb-icon style="padding-left: 10px;" name="info" size="16px" v-tippy="{ placement: 'top', allowHTML: true }" content="
                <strong>Animation cycle indicator.</strong> Covers can animate from the beginning of the cycle up to the white dot. Depending one the animation settings, animations may trigger immediately, sequentially, or even randomly within this area.
              "></gb-icon>
              <component v-if="store.awpShowAnimationZone && store.awpAnimationZone > -1" is="style">
                .time-until-next-cycle .progress-bar:after {
                  display: inline-block !important;
                  left: {{ store.awpAnimationZone }}% !important;
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
          
          <spacer size="small" :line="false" />
          <spacer size="mini" :line="false" />
          
          <div class="label-row">
            <span>Presets</span>
            <gb-select size="mini" style="position: relative; z-index: 2;" v-model="animationPreset" :options="store.animationPresets" />
          </div>
          
          <spacer size="small" :line="false" />
        
          <Multiselect
          v-model="awpAnimations" 
          placeholder="Animations"
          :options="store.awpAnimations" 
          mode="tags" 
          :searchable="true"
          :hideSelected="true"
          :clearOnSelect="false"
          :canClear="true"
          :closeOnSelect="false"
          :multiple="true"
          :taggable="true"
          />
        
          <spacer size="small" :line="false" />
          
        </div>
        
        <div v-if="store.animatedWallpaperMode">
          <div class="label-row">
            <span>Animate immediately on load</span>
            <gb-toggle
            style="display: flex; justify-content: flex-end;"
            size="mini"
            v-model="store.awpAnimateOnLoad"
            ></gb-toggle>
          </div>
          <spacer size="small" :line="false" />
          
          <div class="label-row">
            <span>Animation Cycle (seconds) </span>
            <gb-input
              type="number"
              :min="0"
              :value="store.awpCycleDelay"
              @input="inputChanged('awpCycleDelay', $event)"
              size="mini"
            ></gb-input>
          </div>
          
          <spacer size="small" :line="false" />
          
          <div class="label-row" v-tippy content="A percentage of the animation cycle where covers are animated. Settings this to 0 animates covers immediately at the beginning of the cycle.">
            <span>Animation Zone (%) </span>
            <gb-input
              type="number"
              :min="0"
              :max="100"
              :value="store.awpAnimationZone"
              @input="inputChanged('awpAnimationZone', $event)"
              size="mini"
            ></gb-input>
          </div>
          <spacer size="small" :line="false" />
          
          <div class="label-row">
            <span>Covers per cycle</span>
            <gb-input
              type="text"
              :min="1"
              :value="store.awpCoversPerCycle"
              @input="inputChanged('awpCoversPerCycle', $event)"
              size="mini"
            ></gb-input>
          </div>
          <spacer size="small" :line="false" />
          
          <div class="label-row" 
          v-tippy content='Cover amount is randomized for every cycle. The setting above "Covers per cycle" defines the maximum amount.'
          >
            <span>Randomize covers <span v-if="store.awpRandomCovers">(1-{{ store.awpCoversPerCycle }})</span></span>
            <gb-toggle
            style="display: flex; justify-content: flex-end;"
            size="mini"
            v-model="store.awpRandomCovers"
            ></gb-toggle>
          </div>
          <spacer size="small" :line="false" />
          
          <div class="label-row" 
          v-tippy content='<strong>Enabled:</strong> covers animate randomly within the animation zone. <br><strong>Disabled:</strong> cover animations are spread evenly across the animation zone.'
          >
            <span>Randomize cover delay</span>
            <gb-toggle
            style="display: flex; justify-content: flex-end;"
            size="mini"
            v-model="store.awpRandomDelay"
            ></gb-toggle>
          </div>
          <spacer size="small" :line="false" />
          
          <div class="label-row" 
          v-tippy content='<strong>Enabled:</strong> covers animate in order starting from top left. <br><strong>Disabled:</strong> animated covers are picked randomly.'
          >
            <span>Sequential animation</span>
            <gb-toggle
            style="display: flex; justify-content: flex-end;"
            size="mini"
            v-model="store.awpSequential"
            ></gb-toggle>
          </div>
          <spacer size="small" :line="false" />
          

          <spacer size="medium" :line="false" />
        </div>
        
        
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
        <div v-if="false">
          
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

        </div>
        
        <div v-if="!store.animatedWallpaperMode && store.canvasPresets" style="position: relative; z-index: 10;">
          <gb-heading tag="h6" :uppercase="true">
            <span>Canvas preset</span>
            <gb-select size="mini" style="padding-left: 20px; flex: 1; position: relative; z-index: 1;" v-model="canvasPreset" :options="store.canvasPresets" />
          </gb-heading>
          <spacer size="default" :line="false" />
        </div>
        
        <div>
          <gb-heading tag="h6" :uppercase="true">Covers per row (columns)</gb-heading>
          <spacer size="mini" :line="false" />
          <spacer size="small" :line="false" />
          
          <div class="label-row no-padding">
            <gb-input
            style="max-width: 48px;"
            type="number"
            :min="1"
            :value="parseFloat(store.coversPerRow)"
            @input="inputChanged('coversPerRow', $event)"
            size="mini"
            ></gb-input>
            <div style="padding-left: 10px;">
              <input type="range" min="1" max="20" v-model="coversPerRow" step="1" />
            </div>
          </div>
          <p v-if="store.coverSize > 500" class="gb-field-message gb-field-message--mini gb-field-message--warning gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 15px;">warning</i><span class="gb-field-message__message">
            Cover size is upsized by <span style="color: #fff;"><strong>{{ Math.floor( (store.coverSize / 500) * 100 ) }}</strong>%</span>. The more you upsize the more quality loss there will be. You can choose to ignore this, but otherwise you can try lowering canvas width or increasing covers per row.
            <gb-input style="display: none;" warning="1"></gb-input>
          </span></p>
          
          <div v-if="store.animatedWallpaperMode && store.visibleAnimatedCovers > store.covers.length">
            <spacer size="default" :line="false" />
            <div class="warning-message">
              <strong>{{ store.visibleAnimatedCovers - store.covers.length }}/{{ store.visibleAnimatedCovers }}</strong> visible covers have been duplicated in order for the animated wallpaper to function.
              <br><br>
              <span style="color: #fff;">This basically means that you should already see duplicate covers on load and it's not going to get any better when the covers start to animate. If you don't like what you see, try lowering the "Covers per row" setting or consider using another source for the cover images if possible.</span>
              <br><br>
              <span style="color: #fff;">Ideally the total number of covers would be visible covers x2 or more.</span>
            </div>
          </div>
          
          <div v-if="store.animatedWallpaperMode">
            <spacer size="default" :line="false" />
            
            <gb-checkbox
            size="mini"
            v-model="prioritizeCoversPerRow"
            label="Prioritize covers per row"
            :info="!prioritizeCoversPerRow ? null : 'No matter what screen resolution you have, the wallpaper will always have ' + store.coversPerRow + ' columns.'"
            :warning="prioritizeCoversPerRow ? null : 'Affects the output: current cover size is prioritized and columns will likely change.'"
            ></gb-checkbox>
          </div>
          
          <spacer size="medium" :line="false" />
          
        </div>
        
        <div  v-if="!store.animatedWallpaperMode">
          <gb-heading tag="h6" :uppercase="true" name="coverNumberTippy">
            <span :style="{ color: store.covers.length > store.coverAmount ? '#ffc02b' : null }">
              Limit covers 
            </span>
            
            <gb-input
              style="width: 100px;"
              type="number"
              :min="1"
              :max="store.covers.length"
              :value="parseFloat(store.coverAmount)"
              @input="inputChanged('coverAmount', $event)"
              size="mini"
              >
            ></gb-input>
          <span style="color: #8eabc3; text-transform: lowercase;"> of {{ store.covers.length }}</span>
          </gb-heading>
          
          
          <tippy to="coverNumberTippy" placement="top" trigger="focus mouseenter">
            Maximum amount of covers set to <strong>{{ store.coverAmount }}</strong>. Amount of covers available <strong>{{ store.covers.length }}</strong>. <br>Excess covers are removed from the tail end.
          </tippy>
          
          <spacer size="default" :line="false" />
        </div>
        
        <div  v-if="!store.animatedWallpaperMode">
          <gb-heading tag="h6" :uppercase="true">
            Randomize covers 
            <gb-button :rounded="true" size="mini" left-icon="shuffle" @click="randomizeCovers" 
            v-tippy content="Randomizes all covers from the source data. You might want to use this before manual sorting."
            >shuffle</gb-button>
          </gb-heading>
          
          <spacer size="default" :line="false" />
        </div>
        
        <div>
          <gb-heading tag="h6" :uppercase="true">Canvas size</gb-heading>
          <spacer size="mini" :line="false" />
          <spacer size="small" :line="false" />
          
          <div class="label-row" style="padding-left: 58px">
            <input
              v-tippy content="The sliders have a maximum value, but the text inputs do not."
              type="range"
              min="1"
              max="1920"
              v-model="store.canvas.width"
              step="1"
            />
          </div>
          <div class="label-row" v-tippy content="Width is always required">
            <span style="width: 50px">Width:</span>
            <gb-input
              type="number"
              :min="1"
              :value="parseFloat(store.canvas.width)"
              @input="inputChanged('canvas.width', $event)"
              size="mini"
            ></gb-input>
          </div>
          <spacer size="mini" :line="false" />
          <div class="label-row" style="padding-left: 58px">
            <input
              v-tippy content="The sliders have a maximum value, but the text inputs do not."
              type="range"
              min="0"
              max="1080"
              v-model="store.canvas.height"
              step="1"
            />
          </div>
          <div class="label-row" v-tippy content="Set the height to 0 when you don't need to limit it to a certain height.">
            <span :class="{ 'offset-height-text': store.canvas.height == 0 }">Height:</span>
            <gb-input
              type="number"
              :min="0"
              :value="parseFloat(store.canvas.height)"
              @input="inputChanged('canvas.height', $event)"
              size="mini"
              :info="(store.canvas.height > 0) ? null : '0 = automatic height.' + (store.canvas.autoHeight > 0 ? '<br>Estimated height: ' + store.canvas.autoHeight + 'px' : ' ')"
            ></gb-input>
          </div>
          
          <div style="text-align: center;" v-if="!store.animatedWallpaperMode && store.canvas.height > 0">
            <spacer size="default" :line="false" />
          
            <div class="label-row">
              <gb-button
                :disabled="store.showAuthorAndTitle"
                :full-width="true"
                color="blue"
                size="mini"
                @click="fillCanvasWithCovers('fit')"
                :rounded="true"
                v-tippy content="Sets visible cover amount based on how many covers <strong>fit</strong> inside the canvas."
                left-icon="border_all"
              >Covers Fit</gb-button>
              
              <div style="width: 10px; height: 100%;"></div>
              
              <gb-button
                :disabled="store.showAuthorAndTitle"
                :full-width="true"
                color="blue"
                size="mini"
                @click="fillCanvasWithCovers"
                :rounded="true"
                v-tippy content="Sets visible cover amount based on how many covers <strong>fill</strong> inside the canvas."
                left-icon="border_all"
              >Covers Fill</gb-button>
            </div>
            
            
          </div>
          
          <div v-if="!store.animatedWallpaperMode">
            
            <spacer size="small" :line="false" />
            
            <gb-button
            :full-width="true"
            color="blue"
            size="mini"
            @click="fitCanvasToContent"
            :rounded="true"
            left-icon="crop"
            v-if="store.canvas.height > 0"
            >Fit canvas size to covers</gb-button>
          </div>
          
          <p v-if="store.animatedWallpaperMode" class="gb-field-message gb-field-message--small gb-field-message--info gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 16px;">info</i>
            <span class="gb-field-message__message">
              The animated wallaper fits itself to any screen size, canvas size is for preview purposes only.
            </span>
          </p>
          <p v-if="store.coverSize > 500" class="gb-field-message gb-field-message--mini gb-field-message--warning gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 15px;">warning</i><span class="gb-field-message__message">
            Cover size is upsized by <span style="color: #fff;"><strong>{{ Math.floor( (store.coverSize / 500) * 100 ) }}</strong>%</span>. The more you upsize the more quality loss there will be. You can choose to ignore this, but otherwise you can try lowering canvas width or increasing covers per row.
            <gb-input style="display: none;" warning="1"></gb-input>
          </span></p>
          
          <spacer size="medium" :line="false" />
        </div>
        
        <div v-if="store.animatedWallpaperMode">
          <gb-heading tag="h6" :uppercase="true">
            <span>Remove overflowing row</span>
            <gb-toggle
            size="mini"
            v-model="store.awpDropOverflowingRow"
            ></gb-toggle>
          </gb-heading>
          
          <spacer size="default" :line="false" />
        </div>
        
        <div v-if="store.animatedWallpaperMode">
          
          <gb-heading tag="h6" :uppercase="true">
            <span>Covers alignment</span>
            <div class="align-canvas label-row no-padding" style="padding-left: 0px; width: 85px; flex: unset;">
              <gb-icon :class="{ active: store.canvas.alignmentVertical === 'flex-start' }" size="18px" name="vertical_align_top" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'flex-start', });"></gb-icon>
              <gb-icon :class="{ active: store.canvas.alignmentVertical === 'center' }" size="18px" name="vertical_align_center" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'center', });"></gb-icon>
              <gb-icon :class="{ active: store.canvas.alignmentVertical === 'flex-end' }" size="18px" name="vertical_align_bottom" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'flex-end', });"></gb-icon>
            </div>
          </gb-heading>            
          <spacer size="default" :line="false" />
        
        </div>
        
        <div v-if="!store.animatedWallpaperMode">
          
          <gb-heading tag="h6" :uppercase="true" v-tippy content="Horizontal alignment aligns the last row if it's not full. If you want to offset horizontally, you can change left or right canvas padding. <br><br>Vertical alignment aligns the covers as a group, but only if the canvas height is set.">
            <span>Covers alignment</span>
          </gb-heading>
          
            <spacer size="default" :line="false" />
            
            <div class="align-canvas label-row no-padding" style="padding-left: 0px; width: 145px; flex: unset; width: 100%;">
              <gb-icon :class="{ active: store.canvas.alignment === 'left' }" size="18px" name="format_align_left" @click="$store.commit('update', { key: 'canvas.alignment', value: 'left', });"></gb-icon>
              <gb-icon :class="{ active: store.canvas.alignment === 'center' }" size="18px" name="format_align_center" @click="$store.commit('update', { key: 'canvas.alignment', value: 'center', });"></gb-icon>
              <gb-icon :class="{ active: store.canvas.alignment === 'right' }" size="18px" name="format_align_right" @click="$store.commit('update', { key: 'canvas.alignment', value: 'right', });"></gb-icon>
              <gb-icon :class="{ active: store.canvas.alignmentVertical === 'flex-start' }" size="18px" name="vertical_align_top" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'flex-start', });"></gb-icon>
              <gb-icon :class="{ active: store.canvas.alignmentVertical === 'center' }" size="18px" name="vertical_align_center" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'center', });"></gb-icon>
              <gb-icon :class="{ active: store.canvas.alignmentVertical === 'flex-end' }" size="18px" name="vertical_align_bottom" @click="$store.commit('update', { key: 'canvas.alignmentVertical', value: 'flex-end', });"></gb-icon>
            </div>
            
          <spacer size="default" :line="false" />
        
        </div>
        
        <div>
          <gb-heading tag="h6" :uppercase="true">
            <span>Background color</span>
            <color-picker
              style="z-index: 10;"
              class="color-picker-placeholder"
              v-model="store.canvas.background"
              :position="{ left: '-180px', top: '40px' }"
            >
            </color-picker>
          </gb-heading>
          
          <spacer size="default" :line="false" />
        </div>
        
        <div>
          <gb-heading tag="h6" :uppercase="true" v-tippy content="Overlay is recommended if you're making a desktop wallpaper and plan to have icons on top of it.">
            <span :style="{ color: store.awpOverlayColorEnabled ? '#ffc02b' : null }">Color overlay</span>
            <gb-toggle
            size="mini"
            v-model="store.awpOverlayColorEnabled"
            ></gb-toggle>
            <color-picker
              style="z-index: 9;"
              class="color-picker-placeholder"
              v-model="store.awpOverlayColor"
              :position="{ left: '-180px', top: '40px' }"
            >
            </color-picker>
          </gb-heading>
          
          <spacer size="default" :line="false" />
        </div>
        
        <div v-if="store.awpOverlayColorEnabled && store.awpBlendModes" style="position: relative; z-index: 2;">
          <gb-heading tag="h6" :uppercase="true" v-tippy content="<strong>Blends the color overlay.</strong> You can adjust the blend mode strength by changing opacity in the color overlay setting. Opacity control is right below the horizontal color strip in the color picker. Lowering the opacity can make all the difference with certain blend modes.">
            <span>Blend mode</span>
            <gb-select size="mini" style="position: relative; z-index: 2; width: 133px; text-transform: none;" v-model="blendMode" :options="store.awpBlendModes"  />
          </gb-heading>
          <spacer size="default" :line="false" />
        </div>
        
        <div v-if="store.overlayTextures" style="position: relative; z-index: 1;">
          <gb-heading tag="h6" :uppercase="true">
            <span>Textures</span>
            <gb-select size="mini" style="position: relative; z-index: 2; width: 160px;" v-model="overlayTexture" :options="store.overlayTextures" />
          </gb-heading>
          <spacer size="default" :line="false" />
        </div>
        
        <div>
          <gb-heading tag="h6" :uppercase="true">
            <span>Grayscale</span>
            <input
              v-if="store.awpGrayscale"
              class="heading-range"
              style="padding: 0 10px;"
              type="range"
              min=".15"
              max="1"
              v-model="store.awpGrayscaleContrast"
              step=".05"
            />
            <gb-toggle
            size="mini"
            v-model="store.awpGrayscale"
            ></gb-toggle>
          </gb-heading>
          
          <spacer size="default" :line="false" />
        </div>
        
        <!-- Abbandoning for now... Just doesn't seem so necessary when there's the overlay? -->
        <div v-if="!store.animatedWallpaperMode && store.coverOpacityEnabled">
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
        </div>

        <div class="canvas-padding">
          
          <gb-heading tag="h6" :uppercase="true">Canvas padding</gb-heading>
          <spacer size="mini" :line="false" />
          <spacer size="small" :line="false" />
          
          <input
            type="range"
            min="0"
            max="500"
            v-model="canvasPadding"
            step="1"
            @input="slidingAround('canvas.padding.', $event)"
          />
          <div>
            
            <div class="label-row">
              <span class="gb-field-message__message" style="display: inline-block; width: 55px;">left</span>
              <gb-input
                style="padding-left: 0px; width: 48px; flex: none; padding-right: 5px;"
                type="number"
                :min="0"
                :value="parseFloat(store.canvas.padding.left)"
                @input="inputChanged('canvas.padding.left', $event)"
                size="mini"
              ></gb-input>
              <input
                style="flex: 1;"
                type="range"
                min="0"
                max="500"
                v-model="store.canvas.padding.left"
                step="1"
                @input="slidingAround('canvas.padding.left', $event)"
              />
            </div>
            
            <div class="label-row">
              <span class="gb-field-message__message" style="display: inline-block; width: 55px;">top</span>
              <gb-input
                style="padding-left: 0px; width: 48px; flex: none; padding-right: 5px;"
                type="number"
                :min="0"
                :value="parseFloat(store.canvas.padding.top)"
                @input="inputChanged('canvas.padding.top', $event)"
                size="mini"
              ></gb-input>
              <input
                style="flex: 1;"
                type="range"
                min="0"
                max="500"
                v-model="store.canvas.padding.top"
                step="1"
                @input="slidingAround('canvas.padding.top', $event)"
              />
            </div>
            
            <div class="label-row">
              <span class="gb-field-message__message" style="display: inline-block; width: 55px;">right</span>
              <gb-input
                style="padding-left: 0px; width: 48px; flex: none; padding-right: 5px;"
                type="number"
                :min="0"
                :value="parseFloat(store.canvas.padding.right)"
                @input="inputChanged('canvas.padding.right', $event)"
                size="mini"
              ></gb-input>
              <input
                style="flex: 1;"
                type="range"
                min="0"
                max="500"
                v-model="store.canvas.padding.right"
                step="1"
                @input="slidingAround('canvas.padding.right', $event)"
              />
            </div>
            
            <div class="label-row">
              <span class="gb-field-message__message" style="display: inline-block; width: 55px;">bottom</span>
              <gb-input
                style="padding-left: 0px; width: 48px; flex: none; padding-right: 5px;"
                type="number"
                :min="0"
                :value="parseFloat(store.canvas.padding.bottom)"
                @input="inputChanged('canvas.padding.bottom', $event)"
                size="mini"
              ></gb-input>
              <input
                style="flex: 1;"
                type="range"
                min="0"
                max="500"
                v-model="store.canvas.padding.bottom"
                step="1"
                @input="slidingAround('canvas.padding.bottom', $event)"
              />
            </div>
            
          </div>
          
          <spacer size="medium" :line="false" />
          
        </div>
        
        <div>
          <gb-heading tag="h6" :uppercase="true">Cover padding</gb-heading>
          <spacer size="mini" :line="false" />
          <spacer size="small" :line="false" />
          
          <div class="label-row no-padding">
            <gb-input
              style="max-width: 48px;"
              type="number"
              :min="0"
              :value="parseFloat(store.paddingSize)"
              @input="inputChanged('paddingSize', $event)"
              size="mini"
            ></gb-input>
            <div style="padding-left: 10px;">
              <input
                type="range"
                min="0"
                max="200"
                v-model="coverPadding"
                step="1"
                @input="slidingAround('paddingSize', $event)"
              />
            </div>
          </div>
          
          <spacer size="medium" :line="false" />
        
        </div>
        
        <text-elements v-if="!store.animatedWallpaperMode"></text-elements>
        
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
        
        <div v-if="!store.animatedWallpaperMode">
          
          <gb-heading tag="h6" :uppercase="true">
            <span>Show My Rating</span>
            <gb-toggle
            size="small"
            v-model="store.showMyRating"
            ></gb-toggle>
          </gb-heading>
          
          <spacer size="default" :line="false" />
          <gb-heading tag="h6" :uppercase="true">
            <span>Show Favorites</span>
            <gb-toggle
            size="small"
            v-model="store.showFavorites"
            ></gb-toggle>
          </gb-heading>
          
          <spacer size="default" :line="false" />
          
          <gb-heading tag="h6" :uppercase="true">
            <span>Show author & title</span>
            <gb-toggle
            size="small"
            v-model="store.showAuthorAndTitle"
            ></gb-toggle>
          </gb-heading>
          
          <spacer size="default" :line="false" />
          
          <div v-if="store.showAuthorAndTitle">
            <gb-heading tag="h6" :uppercase="true">
              <span>Author & title color</span>
              <color-picker
                class="color-picker-placeholder"
                v-model="store.authorAndTitleColor"
                :position="{ left: '-180px', top: '40px' }"
              >
              </color-picker>
            </gb-heading>
            
            <spacer size="default" :line="false" />
          </div>
          
          <div v-if="store.showAuthorAndTitle">
            <gb-heading tag="h6" :uppercase="true">
              <span>Author & title size</span>
              <gb-input
                style="width: 90px;"
                type="number"
                :min="1"
                :value="store.authorAndTitleSize"
                @input="inputChanged('authorAndTitleSize', $event)"
                size="mini"
              ></gb-input>
            </gb-heading>
            
            <spacer size="default" :line="false" />
          </div>
          
        </div>
        
        <div v-if="store.archived">
          <gb-heading tag="h6" :uppercase="true">
            <span>Exclude archived ({{ store.archived }})</span>
            <gb-toggle
            size="small"
            :value="store.excludeArchived"
            @change="excludeArchivedChanged"
            ></gb-toggle>
          </gb-heading>
          
          <spacer size="default" :line="false" />
        </div>
        
        <div v-if="!store.animatedWallpaperMode">
          
          <gb-heading tag="h6" :uppercase="true">
            Reduce file size
          </gb-heading>
          <spacer size="default" :line="false" />
          
          <gb-toggle
          size="small"
          v-model="store.compressImage"
          label="Compress image"
          ></gb-toggle>
          <spacer size="mini" :line="false" />
          
          <div class="label-row" v-if="store.compressImage">
            <span class="compress-quality-text">Quality ({{ qualityPercentage }}%):</span>
            <input
              class="zoom-zoom"
              type="range"
              step=".01"
              min="0.50"
              max="0.99"
              v-model="store.compressQuality"
            />
          </div>
          <p v-if="store.compressImage && qualityPercentage < 80" class="gb-field-message gb-field-message--mini gb-field-message--warning gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 15px;">warning</i><span class="gb-field-message__message">Make sure to pay extra attention to the saved image quality when setting the quality below 80%.</span></p>
          <p v-if="store.compressImage" class="gb-field-message gb-field-message--small gb-field-message--info gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 16px;">info</i><span class="gb-field-message__message">Compressed image is saved as a jpeg, which doesn't support transparency. Disable compression in order to save the image with a transparent background color.</span></p>
          
          <spacer size="medium" :line="false" />
          
        </div>

        <div v-if="!store.animatedWallpaperMode">
          
          <gb-heading tag="h6" :uppercase="true">Scaled output</gb-heading>
          <spacer size="default" :line="false" />
          
          <gb-toggle
          size="small"
          v-model="store.canvas.zoomOutputs"
          label="Output with zoomed scale"
          :warning="(store.canvas.zoom > 0 && store.canvas.zoom != 1) ? outputWidthZoomSize : null"
          :info="(store.canvas.zoom === 1) ? outputWidthZoomSize : null"
          ></gb-toggle>
          
          <spacer size="medium" :line="false" />
          
        </div>

      </div>
      <div v-else class="saving-container">
        
        <div class="saving-spnr"></div>
        <div class="saving-progress" v-if="saveProgressWidth > -1">
          <gb-progress-bar :progress="saveProgressWidth" />
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import zoomToFit from "@editor-mixins/zoomToFit.js";
import centerCanvas from "@editor-mixins/centerCanvas.js";
import calculateCoverSize from "@editor-mixins/calculateCoverSize.js";
import makeWallpaper from "@editor-mixins/makeWallpaper.js";
import makeImage from "@editor-mixins/makeImage.js";

import spacer from "@editor-comps/toolbar/spacer.vue";
import textElements from "@editor-comps/toolbar/textElements.vue";
import _ from "lodash";

import Multiselect from '@vueform/multiselect/dist/multiselect.vue2.js';

export default {
  name: "toolbar",
  components: { spacer, textElements, Multiselect },
  mixins: [zoomToFit, centerCanvas, calculateCoverSize, makeWallpaper, makeImage],
  data: function () {
    return {
      store: this.$store.state,
      slidingTimer: null,
      saveProgressWidth: -1,
    };
  },
  
  computed: {
    
    outputWidthZoomSize: function() {
      if ( this.store.canvas.scaled.width || this.store.canvas.scaled.height ) {
        if ( this.store.canvas.scaled.width && !this.store.canvas.scaled.height ) {
          return 'Estimated width: ' + this.store.canvas.scaled.width + 'px';
        }
        else if ( this.store.canvas.scaled.width && this.store.canvas.scaled.height ) {
          return 'Estimated size: ' + this.store.canvas.scaled.width +'x'+ this.store.canvas.scaled.height + 'px';
        }
      }
      else {
        return null;
      }
    },
    
    awpAnimations: {
      get: function () {
        return this.store.awpAnimation;
      },
      set: _.debounce( function(animations) {
        this.$store.commit("update", { key: "awpAnimation", value: animations });
      }, 500, { leading: false, trailing: true }),
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
        }, 200, { leading: false, trailing: true }
      ),
    },

    coverPadding: {
      get: function () {
        return this.store.paddingSize;
      },
      set: _.throttle(
        function (padding) {
          this.$store.commit("update", { key: "paddingSize", value: padding });
        },
        200,
        { leading: false, trailing: true }
      ),
    },
    
    
    canvasPreset: {
      get: function () {
        return this.store.canvasPreset;
      },
      set: function ( preset ) {
        
        this.changeCanvasPreset( preset );
        
      },
    },

    animationPreset: {
      get: function () {
        return this.store.animationPreset;
      },
      set: function ( preset ) {
        this.$store.commit("update", { key: "animationPreset", value:  preset  });
      },
    },
    
    blendMode: {
      get: function () {
        return this.store.awpBlendMode;
      },
      set: function ( blendmode ) {
        this.$store.commit("update", { key: "awpBlendMode", value:  blendmode  });
      },
    },
    
    overlayTexture: {
      get: function () {
        return this.store.overlayTexture;
      },
      set: function ( texture ) {
        this.$store.commit("update", { key: "overlayTexture", value:  texture  });
      },
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
    },
    "store.canvas.padding.right": function( value ) {
      let coverSize = this.calculateCoverSize({ paddingRight: value });
      this.$store.commit('update', { key: 'coverSize', value: coverSize });
    },
    "store.paddingSize": function( value ) {
      let coverSize = this.calculateCoverSize({ paddingSize: value });
      this.$store.commit('update', { key: 'coverSize', value: coverSize });
    },
  },
  
  methods: {
    
    randomizeCovers: function() {
      
      let randomCovers = _.shuffle(this.$store.state.covers);
      
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
    
    changeCanvasPreset: function( preset ) {
    
      this.$store.commit("update", { key: "canvasPreset", value:  preset  });
      this.$store.commit('changePreset', preset);
      this.$store.commit('update', { 
        key: 'usedCovers', 
        value: this.store.covers.slice(0, this.store.coverAmount)
      });
      
      this.$nextTick(function() {
        this.zoomToFit('and-center');
      });
      
    },
    
    resetSettings: function() {
      let confirmation = confirm("Are you sure you want to reset all editor settings?");
      if ( confirmation ) {
        this.$store.commit('update', { key: 'resetting', value: true });
        localStorage.removeItem("aleImageEditorSettings");
        window.location.reload();
      }
      else {
        this.$store.commit('update', { key: 'resetting', value: false });
      }
    },
    
    excludeArchivedChanged: function( value ) {
      
      this.$store.commit('update', { key: 'excludeArchived',  value: value });
      
      let covers = value ? _.filter(this.store.covers, function(o) { return !o.inArchive; }) : this.store.covers;
      covers = covers.slice(0, this.store.coverAmount);
      
      this.$store.commit('update', [
        { key: 'usedCovers', value: covers },
        { key: 'coverAmount', value: covers.length },
      ]);
      
    },
    
    editorModeChanged: function( value ) {
      
      if ( this.store.canvasPreset !== 'wallpaper' ) this.changeCanvasPreset('wallpaper');
      
      this.$nextTick(function() {
        this.zoomToFit();
        this.$store.commit('update', { key: 'animatedWallpaperMode', value: value });
      });
      
      
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
          this.zoomToFit('and-center');
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
  z-index: 3001 !important;
  ::-moz-selection { background: #0093ee !important; color: lighten( #0093ee, 30 ); }
  ::selection { background: #0093ee !important; color: lighten( #0093ee, 45 ); }
}

.toolbar-inner {
  overflow: auto;
  padding: 50px 65px;
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
}

.toolbar .zoom-container {
  transform: rotate(90deg);
  transform-origin: top left;
  z-index: 4;
  top: 56px;
  left: 24px;
  padding: 9px 15px 9px 45px;
  display: flex;
  flex-direction: row;
  justify-items: center;
  justify-self: center;
  align-items: center;
  align-content: center;
  .zoom-text {
    display: inline;
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
  .zoom-to-fit {
    display: inline;
    cursor: pointer;
    position: relative;
    i { display: block !important; }
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
  padding: 10px 15px;
  position: absolute;
  z-index: 50;
  top: 0;
  right: 0;
  left: 0;
  text-align: center;
  
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
    i {
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
  h6.gb-base-heading {
    white-space: nowrap;
    font-size: 14px;
    line-height: 19px;
    font-weight: 400;
    color: #fff !important;
    padding: 7px 0px;  
    position: relative;
    margin-left: -5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 33px;
  }
  h6.gb-base-heading:before {
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
    background: #fff;
    border: 3px solid #171e29;
    border-radius: 999999px;
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

.color-picker-placeholder .color-block {
  position: relative;
  top: 0;
  margin-left: 15px;
}
.color-picker-placeholder .color-block > div {
  border-radius: 999999999999px;
  overflow: hidden;
  border: 2px solid #323d4f;
  box-sizing: border-box;
}
.color-picker-placeholder .color-block,
.color-picker-placeholder .color-block > div {
  width: 27px;
  height: 27px;
}

.text-color-picker-placeholder  {
  flex: 0 !important;
  padding-left: 0 !important;
}
.text-color-picker-placeholder .color-block {
  position: relative;
  top: 0;
  margin: 0px;
  width: 13px;
  height: 13px;
}
.text-color-picker-placeholder .color-block > div {
  border-radius: 999999999999px;
  overflow: hidden;
  border: 1px solid #323d4f;
  width: 13px;
  height: 13px;
  box-sizing: border-box;
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

</style>