export default {
  methods: {
    stringifyArray: function(array, key, delim) {
      // if (key) return _.map(array, key).join(delim || ", ");
      // else return array.join(", ");
      if ( !Array.isArray( array ) ) {
        return array || '';
      }
      else {
        if (key) return array.map(function( o ) { return o[ key ]; }).join(delim || ", ");
        else return array.join(", ");
      }
    }
  }
};
