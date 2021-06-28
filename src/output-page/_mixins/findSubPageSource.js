export default {
  methods: {
    findSubPageSource: function() {
      const source = this.$route.query.subPageSource || this.$store.state.sticky.subPageSource;
      return this.$store.state.library[ source ];
    },
  },
  watch: {
    '$route.query.subPageSource': function( source ) {
      this.listReady = false;
      this.$nextTick(function() {
        this.makeCollection();
      });
    }
  },
};
