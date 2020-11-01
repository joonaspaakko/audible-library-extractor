<template>
  <div v-if="inputDataExists" :class="identifierClass">
    <strong class="strong-label">{{ label }}:</strong>
    <span v-for="(item, index) in array" :key="item.name+'('+index+')'">
      <span>
        
        <span v-if="index !== 0">{{ delim || ', ' }}</span>
        <a v-if="item.url" :href="urlComp(item.url)" target="_blank">{{ item.name }}</a>
        <span v-else>item.name</span>
        
        <!-- Series numbers: -->
        <span v-if="item.bookNumbers" class="book-number"> (book 
          <span v-for="(number, index) in item.bookNumbers">
            <span v-if="index !== 0">{{ ',' }}</span>
            <span>{{ number }}</span>
          </span>)</span>
          
      </span>
      
    </span>
  </div>
</template>

<script>
export default {
  name: 'arrayToHTML',
  data: function() {
    return {
      inputDataExists: null,
    }
  },
  props: ['label', 'array', 'delim', 'general'],
  
  created: function() {
    
    this.inputDataExists = this.checkIfArrayHasData();
    
  },
  
  computed: {
    
    identifierClass: function() {
      return 'details-' + _.kebabCase( this.label );  
    },
     
  },
  
  methods: {
    
    urlComp: function( input ) {
      const url = new Url( this.general.urlOrigin + input );
      url.query.ipRedirectOverride = true;
      url.query.overrideBaseCountry = true;
      return url.toString();
    },
    
    checkIfArrayHasData: function() {
      console.log( this.array )
      return this.array && !_.isEmpty( this.array );
    },
    
  },
  
}
</script>
