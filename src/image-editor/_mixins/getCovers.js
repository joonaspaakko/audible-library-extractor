export default {
  created: function () {
    this.getCovers();
  },
  methods: {
    getCovers: function () {
      
      let coversArray = require('./getCovers.json');
      
      let changes = [
        { key: "covers", value: coversArray },
      ];
      
      if ( !this.$store.state.coverAmount || coversArray.length < this.$store.state.coverAmount ) {
        changes.push({ key: "coverAmount", value: coversArray.length });
      }
      
      this.$store.commit("update", changes);
      
    }
  }
};
