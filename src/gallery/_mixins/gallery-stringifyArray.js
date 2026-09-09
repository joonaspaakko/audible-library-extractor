export default {
  methods: {
    stringifyArray: function(array, key, delim) {
      if ( !Array.isArray( array ) ) return array || '';
      else return _.map(array, key).join(delim || ", ");
    }
  }
};
