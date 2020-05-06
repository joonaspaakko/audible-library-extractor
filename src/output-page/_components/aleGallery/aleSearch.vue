<template>
<div id="ale-search">
	<VueFuse
    v-if="renderComponent"
    :placeholder="placeholder"
    :list="library.books"
    :keys="aliciaKeys"
    :location="0"
    :distance="400"
    :threshold="0.25"
    :search="gallery.searchValue"
  />
	<div class="icons">
    <div class="book-in-selection">
      <div class="inner-wrap" content="Visible books" v-tippy="{ placement: 'top',  arrow: true }">
        {{ booksArray.length }}
      </div>
    </div>
    <div class="scope" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'scope' }" @click="openSearchOptions('scope', $event)" content="Change the search scope for more accurate results" v-tippy="{ placement: 'top',  arrow: true, maxWidth: 410 }">
      <font-awesome-icon fas icon="microscope" />
    </div>
    <div class="filter" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'filter' }" @click="openSearchOptions('filter', $event)" content="Filter out content" v-tippy="{ placement: 'top',  arrow: true }">
      <font-awesome-icon fas icon="filter" />
    </div>
		<div class="sort" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'sort' }" @click="openSearchOptions('sort', $event)" content="Sort titles" v-tippy="{ placement: 'top',  arrow: true }">
			<font-awesome-icon fas icon="sort" />
		</div>
    
    <div id="search-options" v-if="gallery.searchOptions.open">
      <div class="search-opts-arrow"></div>
			<div class="search-option sort-values" v-if="currentOptionsList[0].type === 'sort'">
        <label>
          <input type="checkbox" v-model="gallery.searchOptions.lists.showSortValues" />
          <span class="label checkbox">
            <font-awesome-icon fas icon="square" />
            <font-awesome-icon fas icon="check" />
          </span>
          Show sort values
        </label>
			</div>
      <ul>
        <li class="search-option" v-for="( item, index ) in currentOptionsList" :key="item.key">
          <label>
            <!-- <div style="color: red;">
              {{ item.key }} <span style="color: purple;">{{ item.active }}</span>
            </div> -->
            <input @change="optionsCheck( item.type, index )" type="checkbox" :value="index" v-model="item.active" />
            <span v-if="item.type === 'sort'" class="label sortbox" :class="{ active: index === gallery.searchOptions.lists.sortIndex }">
              <font-awesome-icon fas icon="sort-down" />
              <font-awesome-icon fas icon="sort-up" />
            </span>
            <span v-if="!item.type" class="label checkbox">
              <font-awesome-icon fas icon="square" />
              <font-awesome-icon fas icon="check" />
            </span>
             {{ item.label || item.key.replace('.name', '') }}
          </label>
        </li>
      </ul>
    </div>
    
	</div>
	
</div> <!-- #ale-search -->
</template>

<script>
export default {
  name: 'aleBookdetails',
  props: ['booksArray', 'library', 'gallery'],
	data : function() {
		return {
      renderComponent: true
		}
	},
  created: function() {
    var vue = this;
    
    Event.$on('detailsToggle', this.onDetailsToggle );
    
    this.$on('fuseResultsUpdated', results => {
      this.gallery.fuseResults = results;
    });
    this.$on('fuseInputChanged', value => {
      this.gallery.searchValue = value; // Helps retain the seach query when re-rendered.
      this.gallery.searchOptions.open = false;
    });
  },
	
	beforeDestroy: function() {
	 	Event.$off('detailsToggle', this.onDetailsToggle );
	},
	
  methods: {
    
    onDetailsToggle: function( msg ) {
      this.gallery.searchOptions.open = false;
    },
    
    forceRerender: function() {
      this.renderComponent = false;
      this.$nextTick(() => {
        this.renderComponent = true;
      });
    },
    
    optionsCheck: function( type, index ) {
      
			this.gallery.details.open = false;
			this.gallery.details.index = -1;
      
      if ( type === 'sort' ) {
        this.gallery.searchOptions.lists.sortIndex = index;
      }
      this.forceRerender();
    },
    
    openSearchOptions: function( option, e ) {
      
      if ( !this.gallery.searchOptions.open ) {
        this.gallery.searchOptions.open = true;
        
      }
      else if ( this.gallery.searchOptions.open && this.gallery.searchOptions.lists.current == option ) {
        this.gallery.searchOptions.open = false;
      }
      
      var currentOption = this.gallery.searchOptions.lists.current;
      this.gallery.searchOptions.lists.current = option;
      
      if ( this.gallery.searchOptions.open || currentOption !== option ) {
        var clickedEl = $( e.currentTarget );
        this.$nextTick(() => {
          this.repositionSearchOptions( clickedEl );
        });
      }
      
    },
		
		repositionSearchOptions: function( clickedEl ) {
      
      const searchOpts = {};
      searchOpts.el = $('#search-options');
      searchOpts.width = searchOpts.el.innerWidth();
      
      const option = {};
      option.el = clickedEl;
      option.width = option.el.innerWidth();
      option.middle = option.el.position().left + (option.width/2) + parseInt( option.el.css('margin-left'), 10);
      searchOpts.position = option.middle - (searchOpts.width/2);
      
      var difference = (option.el.offset().left + (option.width/2) + (searchOpts.width/2)) - $(window).width();
      var fitToWindow = difference > 0 ? difference : 0;
      searchOpts.el.css({
        left: searchOpts.position - fitToWindow
      });
      
      const arrow = {};
      arrow.el = searchOpts.el.find('.search-opts-arrow');
      
      arrow.el.css({
        left: (searchOpts.width/2) - 10 + fitToWindow
      });
      
      
			
		},
    
  },
  computed: {
    
    
    currentOptionsListName: function() {
      return this.gallery.searchOptions.lists.current;
    },
    
    currentOptionsList: function() {
      const key = this.gallery.searchOptions.lists.current;
      return this.gallery.searchOptions.lists[ key ];
    },
    
		placeholder: function() {
      var placeholderKeys = (function( keys ) {
        var truncKeys = [];
        $.each( keys, function( i, key ) {
          truncKeys.push( key.replace('.name','') );
        });
        return truncKeys.join(', ');
      }( this.aliciaKeys ));
      
      return 'Search: ' + placeholderKeys;
    },
    
    aliciaKeys: function() {
      const filteredKeys = _.filter(this.gallery.searchOptions.lists.scope, ['active', true]);
      return _.map( filteredKeys, function( item ) {
        if ( item.active ) return item.key;
      });
    }
    
  }
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

#ale-search {
  display: flex;
  flex-direction: row;
  position: relative;
  z-index: 10;
  margin: 0 auto;
  margin-top: 50px;
  margin-bottom: 100px;
  max-width: 600px;
  text-align: center;
  background: #fff;
  padding: 8px 20px;
  border-radius: 999999px;
  @include themify($themes) {
    box-shadow: 0 5px 20px rgba(themed(outerColor), 0.9);
  }
  [type="search"] {
    outline: none;
    display: inline-block;
    width: 100%;
    border: none;
    font-family: inherit;
    font-weight: 400;
  }
  
  .icons {
    position: relative;
    z-index: 0;
    padding-left: 9px;
    color: rgba( #222, .65) ;
    display: flex;
    flex-direction: row;
    
    > div {
      cursor: pointer;
      outline: none;
      margin-left: 5px;
      padding: 6px 10px;
    }
    
    .filter {
      font-size: .92em;
    }
    
    .active {
      @include themify($themes) {
        color: themed(audibleOrange);
      }
    }
    
  }
  
  #search-options {
    cursor: default !important;
    position: absolute;
    z-index: 1;
    top: 35px;
    left: 0;
    font-size: 1em;
    line-height: 1.9em;
    padding: 12px 15px 12px 14px !important;
    margin: 0px !important;
    border-radius: 3px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    ul, li { list-style: none; margin: 0; padding: 0; text-align: left; }
    
    @include themify($themes) {
      color: themed(frontColor);
      background: themed(backColor);
      box-shadow: 0 3px 15px rgba( #000, .6 );
    }
    .search-opts-arrow {
      position: absolute;
      top: -9px;
      left: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 10px 10px 10px;
      @include themify($themes) {
        border-color: transparent transparent themed(backColor) transparent;
      }
    }
    
    .search-option {
      white-space: nowrap;
      input { display: none; }
      .label {
        display: inline-block;
        position: relative;
        z-index: 0;
        top: 2.5px;
        width: 14px;
        height: 14px;
        svg {
          position: absolute;
          z-index: 1;
          top: 0;
          left: 0;
          width: 14px;
          height: 14px;
          @include themify($themes) {
            color: themed(frontColor);
          }
          transition: all 120ms ease-in-out;
        }
        &.sortbox [data-icon] {
          opacity: .35;
        }
        &.sortbox.active {
          [data-icon="sort-up"] {
            opacity: 1;
          }
          [data-icon="sort-down"] {
            opacity: .35;
          }
        }
        &.checkbox {
          [data-icon="square"] {
            opacity: .2;
          }
          [data-icon="check"] {
            opacity: 0;
            padding: 3px 0px 0px 3px;
            width: 8px;
            height: 8px;
            color: #fff;
          }
        }
      }
      input:checked + .label {
        &.sortbox.active {
          [data-icon="sort-up"] {
            opacity: .35;
          }
          [data-icon="sort-down"] {
            opacity: 1;
          }
        }
        &.checkbox {
          [data-icon="square"] {
            opacity: 1;
            color: #65aa3a;
          }
          [data-icon="check"] {
            opacity: 1;
          }
        }
      }
      
      &.sort-values {
        padding-bottom: 9px;
        @include themify($themes) {
          border-bottom: 1px solid rgba( themed(frontColor), .1 );
        }
        margin-bottom: 9px;
      }
      
    } // .search-option
  }
  
  .book-in-selection {
    cursor: default !important;
    font-size: .85em;
    > div {
      outline: none;
    }
  }
  
}

</style>
