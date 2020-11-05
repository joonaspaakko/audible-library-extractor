<template>
  <div class="list-view-header ale-row">
    <tr class="ale-row-inner">
      <th v-for="( item, index) in headers" :key="item.label" class="header-item ale-col" :class="item.class">
        <col-resizer :identifier="item.class"></col-resizer>
        <div class="ale-col-inner">
          
          <sorter :general="general" :gallery="gallery" :name="item.key">
            <span class="text-container">{{ item.label }}</span>
          </sorter>
          
        </div>
      </th>
    </tr>
  </div>
</template>

<script>

import colResizer from './colResizer';
import sorter from '../../../snippets/sorter';

export default {
  name: 'aleHeader',
  props: ['keys', 'general', 'gallery'],
  components: {
    colResizer,
    sorter,
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
    
    prepareHeaders: function( keys ) {
      const vue = this;
      return _.map(keys, function( key ) {
        
        const header = {
          key: key,
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
