import { createStore } from 'vuex';

// import _ from "lodash";

const store = createStore({
  state: {
    timeCode: null,
    resetting: false,
    visibleAnimatedCovers: null,
    covers: [],
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
      background: "#151515",
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
    tierListMode: false,
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
    awpOverlayColor: 'rgba(43,43,43, .64)',
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
          awpOverlayColor: 'rgba(43,43,43, .64)',
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
          coverAmount: 300,
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
          showFavorites: true,
          showMyRating: true,
        }
      },
    ],
    panningAlert: false,
    tiers: [
      { visible: true, key: 'S', color: '#ff7f7e', list: [] }, 
      { visible: true, key: 'A', color: '#ffbf7e', list: [] }, 
      { visible: true, key: 'B', color: '#eff077', list: [] }, 
      { visible: true, key: 'C', color: '#7dff7f', list: [] }, 
      { visible: true, key: 'D', color: '#78f2f2', list: [] }, 
      { visible: true, key: 'E', color: '#9c9bff', list: [] }, 
      { visible: true, key: 'F', color: '#ff93fd', list: [] },
      { visible: true, key: 'container',  list: [] },
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
        _.merge( state, lsState );
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
    
    // updateBook: function( state, config ) {
      
    //   console.log( 'jupdateBook', config.book );
      
    //   const index = _.findIndex( state.covers, { asin: config.book.asin });
    //   if ( index < 0 ) return;
      
    //   let newValue = (config.book.scale || 1);
    //   if ( newValue === config.changes.max ) {
    //     newValue = 1;
    //   }
    //   else {
    //     newValue += config.changes.add;
    //   }
      
    //   _.set( state, 'covers['+ index +'].' + config.changes.key, newValue );
      
    // },
    
    tierConcat: function( state, config ) {
      
      const tier = _.find(state.tiers, { key: config.key });
      if ( 
        !tier.list.length && config.ifEmpty ||
        tier.list.length && !config.ifEmpty
      ) {
        tier.list = tier.list.concat( config.list );
      }
      
    },
    
    clearTiers: function( state, config ) {
      
      _.each( state.tiers, function( tier ) {
        tier.visible = true;
        tier.list = [];
      });
      
    },
    
    resetTiers: function( state, config ) {
      
      let covers = [];
      
      _.each( state.tiers, function( tier ) {
        covers = covers.concat( tier.list );
      });
      
      state.covers = covers.concat( state.covers );
      
    },
    
    toggleTier: function( state, tier ) {
      
      const stateTier = _.find(state.tiers, { key: tier.key });
      stateTier.visible = !stateTier.visible;
      
    },
    
  },
  getters: {
    
    widthOrHeight_Unset: function (state) {
      return state.canvas.width < 1 || state.canvas.height < 1;
    },
    
    textElementActive: function( state ) {
      return !!_.find( state.textElements, 'active');
    },
    
    containerTierVisible: function( state ) {
      return _.find(state.tiers, { key: 'container' }).visible;
    },
    
  }
});


// Overwrite sticky defaults with local storage values
store.commit("fromLocalStorage");
// Listen for sticky commits and push them to local storage
store.subscribe( _.debounce(function(mutation, state) {
  
  if ( !state.resetting ) {
    localStorage.setItem("aleImageEditorSettings", JSON.stringify( state ));
  }
  
}, 250, { leading: false, trailing: true }) );



export default store;

