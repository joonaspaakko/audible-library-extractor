<template>
  <span class="sorter-button-wrapper">
    
    <label 
    v-if="item" 
    v-tippy="{ placement: 'left' }" 
    :content="item.tippy ?  item.tippy : false"
    class="sorter-button"
    >
    
      <input type="checkbox" :value="index" v-model="inputVmodel" />
      <slot v-if="label === false" class="input-label" />
      <span v-if="item.type === 'sort'" class="sortbox" :class="{ active: isActiveSortItem }">
        <font-awesome fas icon="sort-down" />
        <font-awesome fas icon="sort-up" />
      </span>
      <span v-if="!item.type || item.type === 'sortExtras'" class="checkbox">
        <font-awesome fas icon="square" />
        <font-awesome fas icon="check" />
      </span>
      <span v-if="label !== false" class="input-label">{{ item.label || item.key.replace('.name', '') }}</span>
      
    </label>
    <slot v-else />
    
    
  </span>
</template>

<script>
export default {
  name: 'sorter',
  props: ['name', 'label', 'dataSource', 'currentList', 'listName', 'item', 'index'],
  data: function() {
    return {
    };
  },
  
  computed: {
    
    inputVmodel: {
      get: function() {
        return this.currentList[ this.index ].active;
      },
      set: function( value ) {
        
        this.$store.commit('updateListRenderingOpts', { 
          listName: this.listName, 
          index: this.index,
          active: value,
        });
        
        this.$nextTick(function() {
          if ( this.listName === 'sort' || this.listName === 'sortExtras' ) {
            this.$root.$emit('start-sort');
          }
          else if ( this.listName === 'filter' ) {
            this.$root.$emit('start-filter');
          }
          else if ( this.listName === 'scope' ) {
            this.$root.$emit('start-scope');
          }
        });
        
      },
    },
    
    isActiveSortItem: function() {
      const changedIndex = _.findIndex( this.currentList, 'current' );
      return changedIndex === this.index;
    },
    
    // index: function() {
    //   return _.findIndex( this.dataSource, { key: this.item.key });
    // },
    
    // item: function() {
    //   const name = this.name;
    //   const regex = new RegExp('^'+this.name);
    //   return _.find( this.dataSource, function(o) {
    //     return o.key.match(regex);
    //   });
    // },
    
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
