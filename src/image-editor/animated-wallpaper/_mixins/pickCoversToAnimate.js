export default {
  methods: {
    pickCoversToAnimate: function( visibleCovers, cycleDelay ) {
      
      let animationCovers = (typeof this.animation.covers === 'function') ? this.animation.covers({ 
        perRow: this.covers.perRow, 
        rows: this.covers.rows, 
        total: this.covers.total, 
        animationZone: this.animation.animationZone, 
        cycleDelay: this.toSec( cycleDelay ),
        percentage: function( total, percentage ) { return (percentage / 100) * total; },
      }) : this.animation.covers;
      
      
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
  }
};
