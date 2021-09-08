export default {
  methods: {
    pickCoversToAnimate: function( visibleCovers, cycleDelay ) {
      
      let animationCovers = this.getCoverAmount();
      console.log( animationCovers )
      
      let randomCoversAmount = this.animation.randomCovers ? this.random(1, animationCovers) : animationCovers;
      if ( this.editorCovers ) { this.$store.commit('update', { key: 'awpAnimatedCoversLength', value: randomCoversAmount }); }
      
      let picked;
      if ( this.animation.sequential ) {
        picked = [];
        for ( var i=0; i < randomCoversAmount; i++ ) {
          picked.push( visibleCovers[ this.sequentialCounter ] );
          if ( this.sequentialCounter >= this.covers.total-1 ) {
            this.sequentialCounter = 0;
          }
          else {
             ++this.sequentialCounter;
          };
        }
      }
      else {
        picked = this.getRandomCovers( visibleCovers, randomCoversAmount );
      }
      
      return picked;
      
    }, 
    
    getCoverAmount: function() {
      console.log( 'this.animation.covers', this.animation.covers )
      if ( _.isNumber(this.animation.covers) ) {
        return this.animation.covers;
      }
      else {
        
        switch ( this.animation.covers ) {
          case 'one-row':
            return this.covers.perRow;
            break;
          case 'all':
            return this.covers.total;
            break;
        }
        
      }
      
    },
    
  }
};
