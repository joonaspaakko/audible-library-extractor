
// https://www.vuesnippets.com/posts/long-press/
const longpress_timeout = 700;

export default {
  created: function (el, { value }, vNode) {
    if (typeof value !== 'function') {
      console.warn(`Expect a function, got ${value}`)
      return
    }

    let pressTimer = null

    const start = e => {
      
      if ( e.type === 'touchstart' ) e.preventDefault();
      
      if (e.type === 'click' && e.button !== 0) return;
      if (pressTimer === null) pressTimer = setTimeout(() => value(e), longpress_timeout)
      
    }

    const cancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }

    ;['mousedown', 'touchstart'].forEach(e => el.addEventListener(e, start, { passive: true }))
    ;['click', 'mouseout', 'touchend', 'touchcancel'].forEach(e => el.addEventListener(e, cancel, { passive: true }))
  },
  unmounted: function( el, binding ) {
    
    ;['mousedown', 'touchstart'].forEach(e => el.removeEventListener(e, start, { passive: true }))
    ;['click', 'mouseout', 'touchend', 'touchcancel'].forEach(e => el.removeEventListener(e, cancel, { passive: true }))
    
  },
};