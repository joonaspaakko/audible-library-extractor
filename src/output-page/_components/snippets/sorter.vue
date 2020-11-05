<template>
  <span class="sorter-button-wrapper">
    
    <label 
    v-if="item" 
    v-tippy="{ placement: 'left',  arrow: true, theme: general.tippyTheme }" 
    :content="item.tippy ?  item.tippy : false"
    class="sorter-button"
    >
    
      <input @change="sort(item.type, index)" type="checkbox" :value="index" v-model="item.active" />
      <slot v-if="!label" class="input-label" />
      <span v-if="item.type === 'sort'" class="sortbox" :class="{ active: index === gallery.searchOptions.lists.sortIndex }">
        <font-awesome fas icon="sort-down" />
        <font-awesome fas icon="sort-up" />
      </span>
      <span v-if="label" class="input-label">{{ item.label || item.key.replace('.name', '') }}</span>
      
    </label>
    
    <slot v-else />
    
  </span>
</template>

<script>
export default {
  name: 'sorter',
  props: ['general', 'gallery', 'name', 'label'],
  data: function() {
    return {
    };
  },
  
  created() {
    
    // console.log( this.item );
    
  },
  
  computed: {
    
    index: function() {
      return _.findIndex( this.gallery.searchOptions.lists.sort, { key: this.item.key });
    },
    
    item: function() {
      const name = this.name;
      const regex = new RegExp('^'+this.name);
      return _.find( this.gallery.searchOptions.lists.sort, function(o) {
        // console.log('%c' + 'sorter ITEM' + '', 'border: 1px dashed #ff8d00; color: #ff8d00; padding: 2px 5px; border-radius: 8px;', o.key, o.key.match(regex), name);
        return o.key.match(regex);
      });
    },
    
  },
  
  methods: {
    
    sort: function( type, index ) {
      Eventbus.$emit('sort', index );
    }
    
  },
}
</script>

<style lang="scss" scoped>

  @import '~@/_variables.scss';

  .sorter-button-wrapper {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .sorter-button {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    justify-items: stretch;
    justify-content: space-between;
    white-space: nowrap;
    label {
      outline: none;
      display: block;
      &:hover {
        @include themify($themes) {
          color: themed(audibleOrange);
        }
      }
    }
    input { display: none; }
    .checkbox, .sortbox {
      display: inline-block;
      position: relative;
      z-index: 0;
      // top: 2.5px;
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
          width: 9px;
          height: 9px;
          color: #fff;
        }
      }
    }
    input:checked + .checkbox,
    input:checked + .sortbox {
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
  
    input[disabled="disabled"] + .checkbox [data-icon="check"] { display: none; }
    input[disabled="disabled"] ~ .input-label  {
      text-decoration: line-through;
      opacity: .35;
    }
    
  } // #search-options
</style>
