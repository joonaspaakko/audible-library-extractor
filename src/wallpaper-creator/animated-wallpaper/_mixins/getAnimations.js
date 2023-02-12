import _ from "lodash";

export default {
  methods: {
    getAnimations: function() {
      
      let vue = this;
      // let animations = _.shuffle( this.animations );
      let animations = !this.animation.use ? this.animations : this.animations.filter(function( filterAnimation ) {
        let ping = false;
        vue.animation.use.forEach(function( usedAnimation ) {
          if ( usedAnimation === filterAnimation.class ) {
            ping = true;
            return false;
          }
        });
        return ping;
      });
      
      let availableAnimations = animations.filter(function( animation ) {
        return animation.in;
      });
      
      let inIndex = this.random(0, availableAnimations.length-1);
      return availableAnimations[ inIndex ];
      
    },  
  }
};
