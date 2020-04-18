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
    <div class="scope" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'scope' }" @click="openSearchOptions('scope')" content="Change the search scope for more accurate results" v-tippy="{ placement: 'top',  arrow: true }">
      <font-awesome-icon fas icon="microscope" />
    </div>
    <div class="filter" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'filter' }" @click="openSearchOptions('filter')" content="Filter out content" v-tippy="{ placement: 'top',  arrow: true }">
      <font-awesome-icon fas icon="filter" />
    </div>
		<div class="sort" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'sort' }" @click="openSearchOptions('sort')" content="Sort titles" v-tippy="{ placement: 'top',  arrow: true }">
			<font-awesome-icon fas icon="sort" />
		</div>
    
    <div class="search-options" v-if="gallery.searchOptions.open">
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
  created () {
    var vue = this;
    this.$on('fuseResultsUpdated', results => {
      this.gallery.fuseResults = results;
    });
    this.$on('fuseInputChanged', value => {
      this.gallery.searchValue = value; // Retains the seach query when re-rendered.
    });
  },
  methods: {
    
    forceRerender: function() {
      this.renderComponent = false;
      this.$nextTick(() => {
        this.renderComponent = true;
      });
    },
    
    optionsCheck: function( type, index ) {
      if ( type === 'sort' ) {
        this.gallery.searchOptions.lists.sortIndex = index;
      }
      this.forceRerender();
    },
    
    openSearchOptions: function( option ) {
      
      if ( !this.gallery.searchOptions.open ) {
        this.gallery.searchOptions.open = true;
      }
      else if ( this.gallery.searchOptions.open && this.gallery.searchOptions.lists.current == option ) {
        this.gallery.searchOptions.open = false;
      }
      
      this.gallery.searchOptions.lists.current = option;
      
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
      // console.log( this.aliciaKeys );
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
  margin-top: 100px;
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
  
  .search-options {
    cursor: default !important;
    position: absolute;
    z-index: 1;
    top: 35px;
    right: 0;
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
      
    }
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
