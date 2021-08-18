import _ from "lodash";

export default {
  methods: {
    getAnimations: function() {
      
      let vue = this;
      this.animations = _.shuffle( this.animations );
      
      if ( this.animation.use ) this.animations = this.animations.filter(function( filterAnimation ) {
        let ping = false;
        vue.animation.use.forEach(function( usedAnimation ) {
          if ( usedAnimation === filterAnimation.class ) {
            ping = true;
            return false;
          }
        });
        return ping;
      })
      
      let animations = {
        in: this.animations.filter(function( animation ) {
          return animation.in;
        }),
        out: this.animations.filter(function( animation ) {
          return animation.out;
        }),
      };
      
      let animation = {};
      
      let inIndex = this.random(0, animations.in.length-1);
      animation.in = animations.in[ inIndex ];
      
      let outIndex = this.random(0, animations.out.length-1);
      animation.out = animations.out[ outIndex ];

      if ( animation.out && animation.out.swap ) {
        animation.in = animation.out;
      }
      else if ( animation.in && animation.in.swap ) {
        animation.out = animation.in;
      }
      else { 
        let inIndex = this.random(0, animations.in.length-1);
        animation.in = animations.in[ inIndex ];
      }
      if ( !animation.out ) animation.out = animation.in;
      
      return animation;
      
    },  
  }
};
