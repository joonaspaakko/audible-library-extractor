
<template>

<div id="search-options" ref="options" :style="css.options">
  <div class="search-opts-arrow" :style="css.arrow"></div>
  
  <ul class="sort-extras" v-if="listOpen === 'sort'">
    <li class="search-option" v-for="( item, index ) in searchOptions.lists.sortExtras" :key="item.key">
      <listItem :general="general" :gallery="gallery" :label="item.label" :item="item" :index="index"></listItem>
      <!-- <label v-tippy="{ placement: 'left', theme: $store.state.tippyTheme }" :content="item.tippy ?  item.tippy : false">
        <input @change="sortExtrasCheck( item.key, index )" type="checkbox" :value="index" v-model="item.active" />
        <span class="checkbox">
          <font-awesome fas icon="square" />
          <font-awesome fas icon="check" />
        </span>
        <span class="input-label">{{ item.label || item.key.replace('.name', '') }}</span>
      </label> -->
    </li>
  </ul>
  
  <ul>
    <li class="search-option" :class="{ disabled: $store.state.searchActive }" v-for="( item, index ) in optionsList" :key="item.key">
      <!-- <label v-tippy="{ placement: 'left', theme: $store.state.tippyTheme }" :content="item.tippy ?  item.tippy : false">
        <input @change="sort( item.type, index )" type="checkbox" :value="index" v-model="item.active" />
        <span v-if="item.type === 'sort'" class="sortbox" :class="{ active: index === searchOptions.lists.sortIndex }">
          <font-awesome fas icon="sort-down" />
          <font-awesome fas icon="sort-up" />
        </span>
        <span v-if="!item.type" class="checkbox">
          <font-awesome fas icon="square" />
          <font-awesome fas icon="check" />
        </span>
        <span class="input-label">{{ item.label || item.key.replace('.name', '') }}</span>
      </label> -->
      <listItem :general="general" :gallery="gallery" :label="item.label" :item="item" :index="index"></listItem>
      
    </li>
  </ul>
</div>

</template>

<script>
import listItem from '../../../snippets/sorter';

export default {
  name: 'searchOptions',
  props: ['listOpen', 'searchOptions', 'general', 'gallery'],
  components: {
    listItem,
  },
	data : function() {
		return {
      tippyConfig: { placement: 'left', theme: this.$store.state.tippyTheme, maxWidth: 410 },
      css: {
        arrow: { left: '0px' },
        options: { right: '0px' },
      },
		}
  },
  
  mounted: function() {
    
    console.log('SEARCH OPTIONS MOUNTED')
    // Reposition options list
    this.repositionSearchOptions();
    
    // Start listening for an outside click...
    if ( this.listOpen ) $(document).on('mouseup', this.outsideClick);
    
  },
  
  beforeDestroy: function() {
    
    $(document).off('mouseup', this.outsideClick);
    
  },
  
  computed: {
    
    optionsList: function() {
      return this.searchOptions.lists[ this.listOpen ];
    }
    
  },
  
  watch: {
    
    optionsList: function() {
      // Reposition options list
      this.repositionSearchOptions();
    }
    
  },
  
  
  methods: {
    
    outsideClick: function( e ) {
      
      const vue = this;
      var options = $(e.target).closest("#search-options");
      var optionsBtn = $(e.target).closest(".search-opt-btn");
      if ( options.length < 1 && optionsBtn.length < 1 ) {
        $( this ).off( e );
        vue.$emit("update:listOpen", false);
      }
      
    },
    
		repositionSearchOptions: function() {
      this.$nextTick(function() {
        
        const clickedEl = $('.search-opt-btn.active');
        const searchOpts = {};
        searchOpts.el = $( this.$refs.options );
        searchOpts.width = searchOpts.el.innerWidth();
        
        const iconsWrapper = {};
        iconsWrapper.el = $('#ale-search > .icons');
        iconsWrapper.width = iconsWrapper.el.innerWidth();
        
        const option = {};
        option.el = clickedEl.parent();
        option.width = option.el.innerWidth();
        option.left = option.el.position().left + parseInt( option.el.css('margin-left'), 10);
        // searchOpts.position = option.middle - (searchOpts.width/2);
        option.middle = iconsWrapper.width - (option.left + (option.width/2));
        searchOpts.position = option.middle + parseInt( $('#ale-search').css('padding-right'), 10)  - (searchOpts.width/2);
        
        const difference = (option.el.offset().left + (option.width/2) + (searchOpts.width/2)) - $(window).width();
        const fitToWindow = difference > 0 ? difference + 20/* margin / */ : 0;
      
        this.css.options.right = searchOpts.position + fitToWindow + 'px';     
        this.css.arrow.left = (searchOpts.width/2) - 10 + fitToWindow + 'px';
        
      });
		},
    
  },
  
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

</style>
