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
				
				// ZOOM TO CURSOR: normalizes mouse/trackpad delta and adjusts pan so the
				// canvas point under the cursor stays fixed after the scale change
				el.parentElement.addEventListener('wheel', (e) => {
				
					e.preventDefault();
					this.cancelMomentum();

					const currentScale = this.panzoom.getScale();
					const { x: panX, y: panY } = this.panzoom.getPan();

					// DeltaMode 1 = line mode (mouse wheel) — normalize to pixel magnitude
					const delta    = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
					const newScale = currentScale * Math.pow(0.999, delta);

					// Cursor must be relative to the container since pan values are container-relative
					const rect    = el.parentElement.getBoundingClientRect();
					const cursorX = e.clientX - rect.left;
					const cursorY = e.clientY - rect.top;

					this.panzoom.zoom(newScale);
					// Read back actual scale in case panzoom clamped it at min/max
					const actualScale = this.panzoom.getScale();

					// Keep the canvas point under the cursor fixed: newPan = cursor * (1/newScale - 1/oldScale) + oldPan
					this.panzoom.pan(
						cursorX * (1/actualScale - 1/currentScale) + panX,
						cursorY * (1/actualScale - 1/currentScale) + panY
					);

					this.clampPanToBounds();
					
				}, { passive: false });
				
				this.trackVelocityBound = (e) => this.trackVelocity(e);
				el.parentElement.addEventListener('pointermove', this.trackVelocityBound);
				el.addEventListener('panzoomstart', this.panzoomStarted);
				el.addEventListener('panzoomend',   this.panzoomEnded);
				el.addEventListener('panzoomzoom',  this.zooming);
				el.addEventListener('panzoompan',   this.panzoomMoved);
				el.addEventListener('panzoomzoom',  this.panzoomMoved);
				
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

		this.cancelMomentum();

		const el = document.getElementById('editor-canvas-content');
		if ( el ) el.parentElement.removeEventListener('pointermove', this.trackVelocityBound);
		if ( el ) {
			el.removeEventListener('panzoompan',  this.panzoomMoved);
			el.removeEventListener('panzoomzoom', this.panzoomMoved);
		}

	},
	
	methods: {
		/** @param {Event} e - panzoomstart or panzoomend event */
		panning( e ) {
			
			const start = (e.type === 'panzoomstart');
			this.grabbing = start;
			
		},

		/** @param {number} zoom - target scale */
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

		panzoomMoved() {
			this.$emitter.emit('update-moveable-handles');
		},

		/** @param {[number, number]} value - [x, y] relative amounts in pan-space units */
		pan( value ) {
			
			this.panzoom.pan(value[0], value[1], { relative: true });

		},

		/**
		 * Ensures at least `margin` px of the canvas stays visible on each side of the viewport.
		 * `clamping` flag prevents the corrective pan() call from re-triggering this via panzoomend.
		 * @param {number} [margin=100]
		 */
		clampPanToBounds( margin = 100 ) {

			if ( this.clamping ) return;

			const el = document.getElementById('editor-canvas-content');
			const parent = el.parentElement;
			const { x: panX, y: panY } = this.panzoom.getPan();
			const scale = this.panzoom.getScale();

			// Pan values are pre-scale, so clamp in screen px (panX * scale) then convert back
			const canvasScreenW = el.clientWidth * scale;
			const canvasScreenH = el.clientHeight * scale;
			const viewW = parent.clientWidth;
			const viewH = parent.clientHeight;

			const clampedScreenX = _.clamp( panX * scale, margin - canvasScreenW, viewW - margin );
			const clampedScreenY = _.clamp( panY * scale, margin - canvasScreenH, viewH - margin );
			const clampedPanX = clampedScreenX / scale;
			const clampedPanY = clampedScreenY / scale;

			if ( clampedPanX !== panX || clampedPanY !== panY ) {
				this.clamping = true;
				this.panzoom.pan( clampedPanX, clampedPanY );
				this.clamping = false;
			}

		},

		/** Resets momentum and velocity state at the start of a new drag. */
		panzoomStarted() {
			this.cancelMomentum();
			this.isPanning = true;
			this.velocityHistory = [];
			this.grabbing = true;
		},

		/**
		 * Handles the three paths at drag/pan end:
		 * user drag → startMomentum, momentum frame → ignore, programmatic pan → clampPanToBounds.
		 */
		panzoomEnded() {
			this.grabbing = false;
			if ( this.isPanning ) {
				this.isPanning = false;
				this.startMomentum();
			}
			else if ( !this.momentumActive ) {
				this.clampPanToBounds();
			}
		},

		/**
		 * Maintains a rolling 5-sample buffer of pointer positions during a drag.
		 * Used by startMomentum to average release velocity over the recent window.
		 * @param {PointerEvent} e
		 */
		trackVelocity( e ) {
			if ( !this.isPanning ) return;
			this.velocityHistory.push({ x: e.clientX, y: e.clientY, t: performance.now() });
			if ( this.velocityHistory.length > 5 ) this.velocityHistory.shift();
		},

		/** Calculates release velocity from the pointer history and animates the canvas to a gradual stop. */
		startMomentum() {
			const history = this.velocityHistory;
			if ( !history || history.length < 2 ) {
				this.clampPanToBounds();
				return;
			}

			const last = history[ history.length - 1 ];

			// User paused before releasing — no momentum
			if ( performance.now() - last.t > 100 ) {
				this.clampPanToBounds();
				return;
			}

			const first = history[0];
			const dt    = last.t - first.t;

			// Not enough data
			if ( dt < 8 ) {
				this.clampPanToBounds();
				return;
			}

			// Velocity in pan-space units per ms (screen px / dt / scale)
			const scale = this.panzoom.getScale();
			let vx = (last.x - first.x) / dt / scale;
			let vy = (last.y - first.y) / dt / scale;

			const minVelocity = 0.01;
			// Too slow to perceive — no point starting the loop
			if ( Math.abs(vx) < minVelocity && Math.abs(vy) < minVelocity ) {
				this.clampPanToBounds();
				return;
			}

			// ANIMATE
			// 0.95 per frame at 60fps — lower = quicker stop, higher = more glide
			this.momentumActive = true;
			let lastTime = performance.now();
			const friction = 0.95;

			const animate = ( now ) => {
				// Cap elapsed so a late first frame doesn't cause a position jump
				const elapsed = Math.min( now - lastTime, 32 );
				lastTime = now;

				// Normalize friction to frame rate so deceleration feels the same at any fps
				const f = Math.pow( friction, elapsed / (1000/60) );
				vx *= f;
				vy *= f;

				// Velocity negligible — end the loop
				if ( Math.abs(vx) < minVelocity && Math.abs(vy) < minVelocity ) {
					this.momentumActive = false;
					this.clampPanToBounds();
					return;
				}

				// Clamping flag prevents clampPanToBounds re-entering via panzoomend
				const { x: panX, y: panY } = this.panzoom.getPan();
				this.clamping = true;
				this.panzoom.pan( panX + vx * elapsed, panY + vy * elapsed );
				this.clamping = false;

				// Keep canvas in bounds after each step
				this.clampPanToBounds();

				this.momentumRAF = requestAnimationFrame( animate );
			};

			// Kick off the first frame
			this.momentumRAF = requestAnimationFrame( animate );
		},

		/** Stops the momentum animation loop so a new drag or zoom always starts from a clean state. */
		cancelMomentum() {
			if ( this.momentumRAF ) {
				cancelAnimationFrame( this.momentumRAF );
				this.momentumRAF = null;
			}
			this.momentumActive = false;
		},

		/** Defers canvasFit to the next DOM tick so reactive data changes settle before dimensions are re-read. */
		tickedCanvasFit() {
			this.$nextTick(() => {
				this.canvasFit();
			});
		},

		/**
		 * Zooms the canvas to fill as much of the viewport as possible (with 50px padding) and centers it.
		 * @param {'width'} [fit] - pass 'width' to fill the viewport width instead of fitting both dimensions
		 */
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
		
		/** Resets zoom to 100% and re-centers the canvas. */
		canvasZoomReset() {
			
			const zoom = 1;
			this.panzoom.zoom(zoom);
			this.canvasCenter(zoom);
			
		},

		/**
		 * Centers the canvas in the viewport at the given zoom level.
		 * @param {number} [zoom] - defaults to the current store zoom if omitted
		 */
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
		
		/**
		 * Calculates fit and fill scale ratios for sizing one rectangle into another.
		 * @param {{ from: [number, number], to: [number, number], padding?: number }} config
		 * @returns {{ pixels: { fit, fill }, percentage: { fit, fill } }}
		 */
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