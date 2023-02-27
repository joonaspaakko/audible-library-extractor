
let openTippy = null;
let tippyScrollContainer = null;
let tippyScrollHide = function() {
  
  const tippy = openTippy;
  if ( tippy && tippy.state.isVisible ) {
    tippy.hide();
    tippy.reference.blur();
  }
  
};

export default {
  directive: 'tippy', // => v-tippy
	component: 'tippy', // => <tippy/>
	componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
  defaultProps: {
    
    placement: "top",
    flipBehavior: ['top', 'bottom', 'left', 'right'],
    allowHTML: true,
    arrow: true,
    theme: "dark",
    maxWidth: 650,
    delay: [500,0],
    a11y: false,
    onShow: tippy => {
      openTippy = tippy;
      
      tippyScrollContainer = document.querySelector('.list-view-inner-wrap') || window;
      tippyScrollContainer.addEventListener('scroll', tippyScrollHide, { passive: true });
      let content = tippy.props.content;
      if ( !content || content === 'false' ) content = false;
      return content;
    },
    onHide: tippy => {
      
      if ( !tippyScrollContainer ) tippyScrollContainer = document.querySelector('.list-view-inner-wrap') || window;
      tippyScrollContainer.addEventListener('scroll', tippyScrollHide, { passive: true });
      
    },
    boundary: "viewport",
    flipDuration: 0
  }
};