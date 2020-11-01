<template>
  <div class="list-view-header ale-row">
    <tr class="ale-row-inner">
      <th v-for="( item, index) in headers" :key="item.label" class="header-item ale-col" :class="item.class">
        <col-resizer :identifier="item.class"></col-resizer>
        <div class="ale-col-inner">
          <span class="text-container">{{ item.label }}</span>
        </div>
      </th>
    </tr>
  </div>
</template>

<script>

import colResizer from './colResizer';

export default {
  name: 'aleHeader',
  props: ['keys'],
  components: {
    colResizer
  },
	data: function() {
		return {
      headers: null,
		}
  },
  
  created: function() {
    
    this.headers = this.prepareHeaders( this.keys );
    
  },
  
  methods: {
    
    handleMoved: function( e ) {
      console.lof( e );
    },
    
    prepareHeaders: function( keys ) {
      const vue = this;
      return _.map(keys, function( key ) {
        
        const header = {
          label: _.startCase( key ),
          align: 'left',
          class: 'col-' + _.kebabCase( key ),
        };
        
        switch (key) {
          case 'titleShort':
          case 'title':
            header.class = header.class + ' sticky-col';
            break;
        }
        
        return header;
        
      });
    },
    
  },
  
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

</style>
