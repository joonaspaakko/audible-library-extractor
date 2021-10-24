
import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import _ from "lodash";

const store = new Vuex.Store({
  state: {
    timeCode: null,
    resetting: false,
    visibleAnimatedCovers: null,
    covers: null,
    coverAmount: 300,
    coverSize: 160,
    paddingSize: 0,
    coverPlaceholders: 0,
    coversPerRow: 14,
    canvas: {
      color: null,
      width: 1920,
      height: 1080,
      heightActual: 0,
      autoHeight: 0,
      background: "#fff",
      zoom: 1,
      zoomOutputs: false,
      fit: false,
      padding: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      },
      transformOrigin: "center center",
      scaled: {
        width: 0,
        height: 0,
      },
      alignment: 'center',
      alignmentVertical: 'flex-start',
    },
    saving: false,
    slidingAround: null,
    showHints: true,
    canvasPanning: false,
    usedCovers: null,
    draggable: true,
    showAuthorAndTitle: false,
    authorAndTitleColor: '#333',
    authorAndTitleSize: 13,
    textElementCounter: 0,
    textElements: [],
    compressImage: true,
    compressQuality: .95,
    events: {
      textNudge: true,
      textRemove: true,
      canvasPanning: true,
    },
    animatedWallpaperMode: false,
    excludeArchived: false,
    archived: 0,
    animationPreset: null,
    animationPresets: null,
    coverOpacityEnabled: false,
    coverOpacity: .65,
    awpAnimationStarted: false,
    awpShowAnimationZone: false,
    awpCycleDelay: null,
    awpAnimationZone: null,
    awpAnimateOnLoad: null,
    awpAnimatedCoversLength: null,
    awpOverlayColorEnabled: true,
    awpOverlayColor: 'rgba(28,28,28, .54)',
    awpGrayscale: false,
    awpCoversPerCycle: null,
    awpRandomCovers: null,
    awpRandomDelay: null,
    awpSequential: null,
    awpGrayscaleContrast: .8,
    awpAnimation: null,
    awpAnimations: null,
    awpBlendMode: 'normal',
    awpBlendModes: [
      { label: 'Normal'     , value: 'normal' },
      { label: 'Multiply'   , value: 'multiply' },
      { label: 'Screen'     , value: 'screen' },
      { label: 'Overlay'    , value: 'overlay' },
      { label: 'Darken'     , value: 'darken' },
      { label: 'Lighten'    , value: 'lighten' },
      { label: 'Color dodge', value: 'color-dodge' },
      { label: 'Color burn' , value: 'color-burn' },
      { label: 'Hard light' , value: 'hard-light' },
      { label: 'Soft light' , value: 'soft-light' },
      { label: 'Difference' , value: 'difference' },
      { label: 'Exclusion'  , value: 'exclusion' },
      { label: 'Hue'        , value: 'hue' },
      { label: 'Saturation' , value: 'saturation' },
      { label: 'Color'      , value: 'color' },
      { label: 'Luminosity' , value: 'luminosity' },
    ],
    awpDropOverflowingRow: false,
    overlayTexture: 'none',
    overlayTextures: false, // A little too ambitious/unnecessary for now... Would need its own element opacity and blending mode options
    // overlayTextures: [
    //   { label: 'None'            , value: 'none' },
    //   { label: 'Grunge'          , value: 'grunge' },
    //   { label: 'Wreath'          , value: 'wreath' },
    //   { label: 'Floral'          , value: 'floral' },
    //   { label: 'Gravel'          , value: 'gravel' },
    //   { label: 'Waves'           , value: 'waves' },
    //   { label: 'Diagonal squares', value: 'diagonal-squares' },
    //   { label: 'Circuit'         , value: 'circuit' },
    //   { label: 'Prism'           , value: 'prism' },
    //   { label: 'Dark honeycomb'  , value: 'dark-honeycomb' },
    //   { label: 'Light wood'      , value: 'light-wood' },
    //   { label: 'Dark wood'       , value: 'dark-wood' },
    //   { label: 'Concrete'        , value: 'concrete' },
    //   { label: 'Canvas'          , value: 'canvas' },
    // ],
    archivedLength: 0,
    gallery: {
      pageTitle: null,
      pageSubTitle: null,
    },
    prioritizeCoversPerRow: true,
    textElFonts: [
      { label: 'Work Sans'   , value: "'Work Sans', sans-serif" },
      { label: 'Merriweather', value: "'Merriweather', serif" },
      { label: 'Arvo'        , value: "'Arvo', serif" },
      { label: 'Concert One' , value: "'Concert One', cursive" },
      { label: 'Courgette'   , value: "'Courgette', cursive" },
      { label: 'Indie Flower', value: "'Indie Flower', cursive" },
      { label: 'Patrick Hand', value: "'Patrick Hand', cursive" },
    ],
    duplicateTemp: null,
    animation: null,
    showFavorites: false,
    showMyRating: false,
    
    // PRESETS
    canvasPreset: 'wallpaper',
    canvasPresets: [
      {
        label: 'Wallpaper',
        value: 'wallpaper',
        options: {
          coversPerRow: 14,
          coverAmount: 300,
          paddingSize: 0,
          awpOverlayColorEnabled: true,
          awpOverlayColor: 'rgba(28,28,28, .54)',
          awpBlendMode: 'normal',
          showAuthorAndTitle: false,
          awpGrayscale: false,
          canvas: {
            width: 1920,
            height: 1080,
            background: '#151515',
            alignmentVertical: 'flex-start',
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
        }
      },
      {
        label: 'Card',
        value: 'card',
        options: {
          coversPerRow: 5,
          coverAmount: 50,
          paddingSize: 5,
          awpOverlayColorEnabled: false,
          showAuthorAndTitle: false,
          awpGrayscale: false,
          canvas: {
            width: 1200,
            height: 0,
            background: '#fff',
            alignmentVertical: 'flex-start',
            padding: {
              top: 32,
              right: 32,
              bottom: 32,
              left: 32,
            },
          },
        }
      },
    ],
  },
  mutations: {
    
    update(state, config) {
      let setValues = function (config) {
        config = config || {};
        if (config.key) {
          _.set(state, config.key, config.value);
        }
      };

      if (_.isArray(config)) {
        _.each(config, function(conf) {
          setValues(conf);
        });
      } else {
        setValues(config);
      }
    },
    
    fromLocalStorage: function(state) {
      const lsState = JSON.parse(localStorage.getItem("aleImageEditorSettings"));
      if ( lsState ) {
        lsState.resetting = false;
        lsState.saving = false;
        state = _.assign( state, lsState );
      }
    },
    
    addText( state, textElement ) {
      
      ++state.textElementCounter;
      if ( !textElement.id ) textElement.id = state.textElementCounter;
      if ( !textElement.textElement ) textElement.textElement = true;
      
      let activeEl = _.find( state.textElements, { active: true });
      if ( activeEl ) activeEl.active = false;
      
      state.textElements.push( textElement );
      
    },
    
    removeText( state, index ) {
      state.textElements.splice(index, 1);
    },
    
    changeText( state, config ) {
      
      let setValues = function (config) {
        config = config || {};
        let textObj = state.textElements[ config.index ];
        if ( config.key && textObj ) {
          _.set(textObj, config.key, config.value);
        }
      };

      if (_.isArray(config)) {
        _.each(config, function(conf) {
          setValues(conf);
        });
      } else {
        setValues(config);
      }
      
    },
    
    activateText( state, activateIndex ) {
      
      _.each( state.textElements, function( el, index ) {
        el.active = (index === activateIndex);
      });
      
    },
    
    updateCoverPlaceholders: function( state, value) {
      
      let usedPlaceholders = _.filter( state.usedCovers, 'placeholderCover' );
      let difference = Math.abs(usedPlaceholders.length - value);
      let diffArray = _.range(0, difference);
      if ( usedPlaceholders.length < value ) {
        _.each(diffArray, function( index ) {
          state.usedCovers.unshift( newItem() );
        });
      }
      else {
        
        _.each(_.dropRight(usedPlaceholders, difference), function( cover ) {
          
          let removeIndex = _.findIndex(state.usedCovers, { asin: cover.asin });
          if ( removeIndex ) {
            state.usedCovers.splice(removeIndex, 1);
          }
          
        });
        
      }
      
      function newItem() {
        return {
          asin: new Date().getTime(),
          placeholderCover: true,
        };
      };
        
      
    },
    
    changePreset: function( state, presetName ) {
      
      let preset = _.find( state.canvasPresets, { value: presetName });
      console.dir( preset.options )
      if ( preset ) state = _.merge( state, preset.options );
      
    },
    
  },
  getters: {
    
    widthOrHeight_Unset: function (state) {
      return state.canvas.width < 1 || state.canvas.height < 1;
    },
    
    textElementActive: function( state ) {
      return !!_.find( state.textElements, 'active');
    },
    
  }
});


// Overwrite sticky defaults with local storage values
store.commit("fromLocalStorage");
// Listen for sticky commits and push them to local storage
store.subscribe( _.debounce(function(mutation, state) {
  
  if ( !state.resetting ) {
    let stateDolly = JSON.parse(JSON.stringify( state ));
    
    delete stateDolly.covers;
    delete stateDolly.usedCovers;
    
    localStorage.setItem("aleImageEditorSettings", JSON.stringify( stateDolly ));
  }
  
}, 550, { leading: false, trailing: true }) );



export default store;

