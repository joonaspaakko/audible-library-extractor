import Panzoom from '@panzoom/panzoom';

export default {
	data() {
		return {
			store: this.$store.state,
			panzoom: null,
			grabbing: false,
			panzoomOpts: {
				minScale: 0.00000000000000000000000000001,
				maxScale: 6,
				canvas: true,
				disablePan: false,
				startScale: this.$store.state.canvas.zoom,
				origin: '0 0',
				// contain: 'inside'
				// overflow: 'scroll',
			},
		};
	},
	
	
  watch: {
    "store.coversPerRow"() {
			this.tickedCanvasFit();
    },
    "store.canvas.width"() {
			this.tickedCanvasFit();
    },
    "store.canvas.height"() {
			this.tickedCanvasFit();
    },
    "store.coverAmount"() {
			this.tickedCanvasFit();
    },
    // "store.showAuthorAndTitle"() {
		// 	this.tickedCanvasFit();
    // },
    // "store.authorAndTitleSize"() {
		// 	this.tickedCanvasFit();
    // },
    // "store.coverSize"() {
		// 	this.tickedCanvasFit();
    // },
    // "store.paddingSize"() {
		// 	this.tickedCanvasFit();
    // },
    // "store.canvas.padding.left"() {
		// 	this.tickedCanvasFit();
    // },
    // "store.canvas.padding.top"() {
		// 	this.tickedCanvasFit();
    // },
    // "store.canvas.padding.right"() {
		// 	this.tickedCanvasFit();
    // },
    // "store.canvas.padding.bottom"() {
		// 	this.tickedCanvasFit();
    // },
	},
	
	mounted () {
		
		// const viewport = document.querySelector('#editor-canvas-left');
		// viewport.addEventListener('mousemove', (e) => console.log(e.clientX, e.clientY))
		
		const el = document.getElementById('editor-canvas-content')
		this.panzoom = Panzoom(el, this.panzoomOpts);
		
		window.panzoom = this.panzoom;
		
		this.$nextTick(function() {
			setTimeout(() => {
				
				this.canvasFit();
				
				// el.parentElement.addEventListener('wheel', _.throttle(this.panzoom.zoomWithWheel, 70, { 'leading': true, 'trailing': true }));
				// el.parentElement.addEventListener('wheel', this.panzoom.zoomWithWheel);
				
				el.parentElement.addEventListener('wheel', (e) => {
					
					// // ZOOM  (Shift + Scroll)
					// if ( e.shiftKey ) {
					// 	console.log( e )
					// 	this.panzoom.zoomWithWheel(e);
						
					// }
					// // PAN (Scroll)
					// else {
					// 	this.panzoom.pan(e.wheelDeltaX, e.wheelDeltaY, { relative: true });
					// }
					this.panzoom.pan(e.wheelDeltaX, e.wheelDeltaY, { relative: true });
				});
				
				el.addEventListener('panzoomstart', this.panning);
				el.addEventListener('panzoomend',   this.panning);
				el.addEventListener('panzoomzoom',  this.zooming);
				
			}, 1);
		});
		
		this.$emitter.on('canvas-zoom', this.canvasZoom);
		this.$emitter.on('canvas-fit', this.canvasFit);
		this.$emitter.on('canvas-zoom-reset', this.canvasZoomReset);
		this.$emitter.on('canvas-reset-zoom', this.canvasZoomReset);
		this.$emitter.on('canvas-center', this.canvasCenter);
		this.$emitter.on('canvas-pan', this.pan);
		
	},
	
	beforeUnmount() {
		
		this.$emitter.off('canvas-zoom', this.canvasZoom);
		this.$emitter.off('canvas-fit', this.canvasFit);
		this.$emitter.off('canvas-zoom-reset', this.canvasZoomReset);
		this.$emitter.off('canvas-reset-zoom', this.canvasZoomReset);
		this.$emitter.off('canvas-center', this.canvasCenter);
		this.$emitter.off('canvas-pan', this.pan);
		
	},
	
	methods: {
		panning( e ) {
			
			const start = (e.type === 'panzoomstart');
			this.grabbing = start;
			
		},
		
		canvasZoom( zoom ) {
			
			this.panzoom.zoom( zoom );
			// const viewport = document.querySelector('#editor-canvas-left');
			// console.log( viewport.offsetWidth/2 )
			// this.panzoom.zoomToPoint(zoom, { clientX: viewport.offsetWidth/2, clientY: viewport.offsetHeight/2}, { animate: true });
			this.canvasCenter( zoom );
			
		},
		
		zooming( e ) {
			
			this.$store.commit('update', { key: 'canvas.zoom', value: e.detail.scale });
			
		},
		
		pan( value ) {
			
			this.panzoom.pan(value[0], value[1], { relative: true });
			
		},
		
		tickedCanvasFit() {
			this.$nextTick(() => {
				this.canvasFit();
			});
		},
		
		canvasFit( fit ) {
			
			const el = document.getElementById('editor-canvas-content');
			const canvas = el.querySelector('.canvas-bounds');
			
			const parent = el.parentElement;
			const parentW = parent.clientWidth;
			const parentH = parent.clientHeight;
			const elW = canvas.clientWidth;
			const elH = canvas.clientHeight;
			
			const padding = 50;
			const size = this.calculateNewSize({
				from: [ elW, elH ],
				to: 	[ parentW, parentH ],
				padding: padding,
			});
			
			let fittedPercentage = size.percentage.fit;
			const fittedParentWidth = parentW-(padding*2);
			if ( fit === 'width' ) fittedPercentage = Math.round(size.pixels.fill.width) === Math.round(fittedParentWidth) ? 
																									size.percentage.fill : 
																									size.percentage.fit;
			const zoom = fittedPercentage / 100;
			
			this.panzoom.zoom(zoom);
			this.panzoom.pan(
				(parentW/2/zoom)-(elW/2),
				(parentH/2/zoom)-(elH/2)
			);
			
		},
		
		canvasZoomReset() {
			
			const zoom = 1;
			this.panzoom.zoom(zoom);
			this.canvasCenter(zoom);
			
		},
		
		canvasCenter( zoom ) {
			
			const el = document.getElementById('editor-canvas-content');
			
			const parent = el.parentElement;
			const parentW = parent.clientWidth;
			const parentH = parent.clientHeight;
			const elW = el.clientWidth;
			const elH = el.clientHeight;
			
			if ( !zoom ) zoom = this.store.canvas.zoom;
		
			this.panzoom.pan( 
				(parentW/2/zoom)-(elW/2),
				(parentH/2/zoom)-(elH/2)
			);
			
		},
		
    calculateNewSize: function( config ) {
			
			const inputSize = config.from;
			if ( config.padding ) {
				config.to[0] = config.to[0] - (config.padding*2);
				config.to[1] = config.to[1] - (config.padding*2);
			}
			const targetSize = config.to;
			
      function mathMax( array ) { return array[0] > array[1] ? array[0] : array[1]; }
      function mathMin( array ) { return array[0] < array[1] ? array[0] : array[1]; }
      var sizeArray = [ targetSize[0] / inputSize[0], targetSize[1] / inputSize[1] ];
      var ratioFit  = mathMin( sizeArray );
      var ratioFill = mathMax( sizeArray );
      return {
        pixels: {
          fit:  { width: inputSize[0]*ratioFit,  height: inputSize[1]*ratioFit  },
          fill: { width: inputSize[0]*ratioFill, height: inputSize[1]*ratioFill }
        },
        percentage: {
          fit:  (100 / inputSize[0]) * (inputSize[0]*ratioFit),
          fill: (100 / inputSize[0]) * (inputSize[0]*ratioFill)
        }
      };
    },
		
	},
}