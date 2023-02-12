import { createStore } from 'vuex';
import canvasPresets from './wallpaper-creator-canvas-presets.js';

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
    borderRadius: 0,
    reverseCoverFlow: false,
    reread: {
      label: {
        show: true,
        offset: {
          right: 0,
          bottom: 0,
        }
      },
    },
    canvas: {
      color: null,
      width: 1920,
      height: 1080,
      heightActual: 0,
      autoHeight: 0,
      background: "#151515",
      zoom: 1,
      zoomOutputs: false,
      outputScale: 2,
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
    coverActions: null,
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
    // overlayTexture: 'none',
    overlayTexture: '',
    // Perhaps A little too ambitious/unnecessary for now... Would need its own element opacity and blending mode options
    overlayTextures: [
      { label: 'None'            , value: 'none' },
      { label: 'Grunge'          , value: 'grunge' },
      { label: 'Wreath'          , value: 'wreath' },
      { label: 'Floral'          , value: 'floral' },
      { label: 'Gravel'          , value: 'gravel' },
      { label: 'Waves'           , value: 'waves' },
      { label: 'Diagonal squares', value: 'diagonal-squares' },
      { label: 'Circuit'         , value: 'circuit' },
      { label: 'Prism'           , value: 'prism' },
      { label: 'Dark honeycomb'  , value: 'dark-honeycomb' },
      { label: 'Light wood'      , value: 'light-wood' },
      { label: 'Dark wood'       , value: 'dark-wood' },
      { label: 'Concrete'        , value: 'concrete' },
      { label: 'Canvas'          , value: 'canvas' },
    ],
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
    toolbarCollapsed: false,
    
    // PRESETS
    canvasPreset: 'wallpaper',
    canvasPresets: canvasPresets,
    panningAlert: false,
    tiers: [
      { visible: true, key: 'S', color: '#ff7f7e', list: [], text: '' }, 
      { visible: true, key: 'A', color: '#ffbf7e', list: [], text: '' }, 
      { visible: true, key: 'B', color: '#eff077', list: [], text: '' }, 
      { visible: true, key: 'C', color: '#7dff7f', list: [], text: '' }, 
      { visible: true, key: 'D', color: '#78f2f2', list: [], text: '' }, 
      { visible: true, key: 'E', color: '#9c9bff', list: [], text: '' }, 
      { visible: true, key: 'F', color: '#ff93fd', list: [], text: '' },
      { visible: true, key: 'container',  list: [] },
    ],
    presetModalOpen: false,
    colorPicker_swatches: [
      '#001f3f',
      '#0074D9',
      '#7FDBFF',
      '#39CCCC',
      '#B10DC9',
      '#F012BE',
      '#85144b',
      '#FF4136',
      '#FF851B',
      '#FFDC00',
      '#3D9970',
      '#2ECC40',
      '#01FF70',
      '#000000',
      '#333333',
      '#AAAAAA',
      '#DDDDDD',
      '#FFFFFF',
      '#FFFFFF00', // FFFFFF00
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
        delete lsState.canvasPresets;
        delete lsState.events;
        delete lsState.awpBlendModes;
        delete lsState.overlayTextures;
        delete lsState.colorPicker_swatches;
        delete lsState.textElFonts;
        delete lsState.coverActions;
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
      console.log( state.textElements )
      console.log( index )
      state.textElements.splice(index, 1);
    },
    
    changeText( state, config ) {
      
      let setValues = function (config) {
        config = config || {};
        let textObj = state.textElements[ config.index ];
        if ( config.key && textObj ) {
          
          console.log( textObj )
          console.log( config.key, config.value )
          
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
    
    updateTierlistLabel( state, config ) {
      
      let setValues = function (config) {
        config = config || {};
        let textObj = state.tiers[ config.index ];
        console.log( config.index )
        if ( config.key && textObj ) {
          
          console.log( textObj )
          console.log( config.key, config.value )
          
          _.set(textObj, 'text', config.value);
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
    
    changePreset: function( state, presetName ) {
      
      let preset = _.find( state.canvasPresets, { value: presetName });
      console.log( preset.options )
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
    
    updateBookCover( state, config ) {
      
      
      const applyToAll = ( rootArray ) => {
        _.each(rootArray, ( array, rootIndex ) => {
          _.each(array, ( item, index ) => {
            _.set( array, index+'.'+ config.key, config.value );
          });
        });
      };
      
      if ( state.tierListMode ) {
        
        if ( config.all ) {
          applyToAll([ state.tiers, state.covers ]);
        }
        else {
          let found = false;
          _.each(state.tiers, function( tier ) {
           
            const index = _.findIndex( tier.list, { asin: config.book.asin });
            if ( index > -1 ) {
              found = true;
              _.set( tier.list, index+'.'+ config.key, config.value );
              return false;
            }
            
          });
          if ( !found ) {
            const index = _.findIndex( state.covers, { asin: config.book.asin });
            if ( index > -1 ) _.set( state.covers, index+'.'+ config.key, config.value );
          }
        }
        
      }
      else {
        
        if ( config.all ) {
          applyToAll([ state.tiers, state.covers ]);
        }
        else {
          const index = _.findIndex( state.covers, { asin: config.book.asin });
          if ( index > -1 ) _.set( state.covers, index+'.'+ config.key, config.value );
        }
      }
      
      const timeout = config.value ? 350 : 100;
      setTimeout(() => {
        state.coverActions = null;
      }, timeout);
      
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
    
    scaledCanvasDimensions( state, getters ) {
      
      let scale = function( size ) {
        let scale = state.canvas.outputScale;
        return (scale > 0 && scale != 1) ? size * scale : size;
      };
      
      let content = document.querySelector("#editor-canvas-content");
      const height = content ? content.clientHeight : null;
      
      return {
        width:  Math.ceil(scale(state.canvas.width)),
        height: Math.ceil(scale(state.canvas.height || height)),
      };
      
    },
    
    rereadExist( state, getters ) {
      
      if ( state.tierListMode ) {
        
        let found = false;
        
        _.each(state.tiers, function( tier ) {
         
          if ( _.find(tier.list, 'reread') ) {
            found = true;
            return false;
          }
          
        });
        
        if ( !found ) !!_.find(state.covers, 'reread');
        
        return found;
        
      }
      else {
        
        return !!_.find(state.covers, 'reread');
        
      }
      
    },
    
  }
});


// Overwrite sticky defaults with local storage values
store.commit("fromLocalStorage");
// Listen for sticky commits and push them to local storage
store.subscribe( function(mutation, state) {
  
  if ( !state.resetting ) {
    localStorage.setItem("aleImageEditorSettings", JSON.stringify( state ));
  }
  
});

export default store;

