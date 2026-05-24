<template>
  <div class="custom-dropdown" v-click-outside="closeDropdown">

    <!-- Dropdown (button) -->
    <div class="dropdown-trigger" @click="toggleDropdown">
    
      <span v-if="modelValue === newRepoKey" class="dropdown-value new-indicator">
        <akar-icons:circle-plus /> Create new project…
      </span>
      <span v-else-if="modelValue" class="dropdown-value">{{ modelValue }}</span>
      <span v-else class="dropdown-value placeholder">Select a project…</span>
      <span class="dropdown-arrow" :class="{ open: dropdownOpen }">▾</span>
      
    </div>

    <!-- Dropdown (panel) -->
    <div v-if="dropdownOpen" class="dropdown-panel">
    
      <!-- Search field -->
      <div class="dropdown-search-wrap">
        <input
          ref="searchInput"
          class="dropdown-search"
          v-model="dropdownSearch"
          placeholder="Search projects…"
          @keydown.escape="closeDropdown"
          @keydown.enter="selectFirstResult"
        />
      </div>
      
      <!-- Filter row (All/Only ALE) -->
      <div class="dropdown-filter-row">
      
        <!-- Label -->
        <span class="dropdown-filter-label">
          {{ showAllRepos ? 'All projects' : 'ALE projects only' }}
        </span>
        <!-- Button (button spans the entire row via CSS trickery) -->
        <button class="dropdown-filter-btn" @click="$emit('update:showAllRepos', !showAllRepos)">
          {{ showAllRepos ? 'Show ALE only' : 'Show all' }}
        </button>
        
      </div>

      <!-- Repository list -->
      <div class="dropdown-list">
        
        <!-- New project item (custom) -->
        <div class="dropdown-item new-item" :class="{ selected: modelValue === newRepoKey }" @click="select(newRepoKey)">
          <akar-icons:circle-plus />
          <div class="text">Create new project…</div>
        </div>

        <!-- Github repos -->
        <div
          v-for="r in filteredRepos"
          :key="r.name"
          class="dropdown-item"
          :class="{ selected: modelValue === r.name }"
          @click="select(r.name)"
        >
          <span class="dropdown-item-name">{{ r.name }}</span>
          <span v-if="r.isAleRepo" class="ale-tag">ALE</span>
        </div>

        <!-- Empty state -->
        <div v-if="filteredRepos.length === 0" class="dropdown-empty">No projects found</div>
        
      </div> <!-- .dropdown-list -->
      
    </div> <!-- .dropdown-panel -->

  </div> <!-- .custom-dropdown -->
</template>

<script>
import Fuse from 'fuse.js';

export default {

  directives: {
    clickOutside: {
      mounted( el, binding ) {
        el.clickOutsideHandler = ( event ) => {
          if ( !el.contains( event.target ) ) {
            binding.value( event );
          }
        };
        document.addEventListener( 'mousedown', el.clickOutsideHandler );
      },
      unmounted( el ) {
        document.removeEventListener( 'mousedown', el.clickOutsideHandler );
      },
    },
  },

  props: {
    modelValue: { type: String, default: '' },
    newRepoKey: { type: String, required: true },
    repos: { type: Array, default: () => [] },
    showAllRepos: { type: Boolean, default: false },
  },

  emits: ['update:modelValue', 'update:showAllRepos'],

  data() {
    return {
      dropdownOpen: false,
      dropdownSearch: '',
      fuseInstance: null,
      fuseSource: null,
    };
  },

  computed: {
    filteredRepos() {

      // When no search, apply the ALE filter directly
      if ( !this.dropdownSearch.trim() ) {
        return this.showAllRepos ? this.repos : this.repos.filter( r => r.isAleRepo );
      }

      // Always search across all repos (build Fuse if needed)
      if ( !this.fuseInstance || this.fuseSource !== this.repos ) {
        this.fuseInstance = new Fuse( this.repos, { keys: ['name'], threshold: 0.4 } );
        this.fuseSource = this.repos;
      }

      // Search all repos and return all matches, prioritizing ALE-tagged repos at the top
      const searchResults = this.fuseInstance.search( this.dropdownSearch ).map( r => r.item );
      return searchResults;
      
      // I thought about hoisting up ALE repos in search results, but I felt it could
      // potentially get in the way of finding whatever it is you want to find.
      // return _.orderBy( searchResults, ['isAleRepo'], ['desc'] );

    },
  },

  watch: {
    dropdownOpen( isOpen ) {

      if ( isOpen ) this.$nextTick( () => this.$refs.searchInput?.focus() );
      else this.dropdownSearch = '';

    },
  },

  methods: {
    /** Toggles the dropdown open/closed. */
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },

    /** Closes the dropdown. */
    closeDropdown() {
      this.dropdownOpen = false;
    },

    /**
     * Selects a repo by name, emits the update, and closes the dropdown.
     * @param {string} name
     */
    select( name ) {
      this.$emit( 'update:modelValue', name );
      this.closeDropdown();
    },

    /** Selects the first visible result when the user presses Enter in the search field. */
    selectFirstResult() {
      if ( this.filteredRepos.length > 0 ) {
        this.select( this.filteredRepos[0].name );
      }
    },
  },
};
</script>

<style scoped lang="scss">
.custom-dropdown {
  position: relative;

  .dropdown-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 1em;
    cursor: pointer;
    user-select: none;

    @include themify($themes) {
      background: themed(panelColor);
      border: 1px solid rgba( themed(frontColor), .1 );
    }
    .theme-light & {
      background: #f8f8f8;
      border: 1px solid #d1d1d1;
    }

    &:hover {
      @include themify($themes) {
        border-color: rgba( themed(frontColor), .15 );
      }
    }
  }

  .dropdown-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.placeholder { opacity: 0.4; }

    &.new-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      .theme-dark & { color: #00ed00; }
      .theme-light & { color: #000; font-weight: bold; }
    }
  }

  .dropdown-arrow {
    margin-left: 6px;
    font-size: 0.84em;
    opacity: 0.5;
    transition: transform 0.15s;
    flex-shrink: 0;

    &.open { transform: rotate(180deg); }
  }

  .dropdown-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    border-radius: 6px;
    z-index: 100;
    overflow: hidden;

    @include themify($themes) {
      background: themed(elementColor);
      border: 1px solid rgba( themed(frontColor), .15 );
      box-shadow: themed(shadowMedium);
    }
  }

  .dropdown-search-wrap {
    padding: 6px 6px 4px;

    @include themify($themes) {
      border-bottom: 1px solid rgba( themed(frontColor), .1 );
    }
  }

  .dropdown-search {
    width: 100%;
    border-radius: 4px;
    padding: 4px 7px;
    font-size: 0.92em;
    box-sizing: border-box;

    @include themify($themes) {
      background: themed(backColor);
      border: 1px solid rgba( themed(frontColor), .15 );
      color: themed(frontColor);
    }

    &:focus { 
      outline: none; 
      border-color: #4ade80; 
      .theme-light &:focus { 
        border-color: #888; 
        border-width: 2px;
      }
    }
  }

  .dropdown-filter-row {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;

    @include themify($themes) {
      border-bottom: 1px solid rgba( themed(frontColor), .1 );
    }
    
    button::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0; 
    }
  }

  .dropdown-filter-label {
    font-size: 0.84em;
    opacity: 0.55;
  }

  .dropdown-filter-btn {
    font-size: 0.84em;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    .theme-dark & { color: #00ed00; }
    .theme-light & { color: #151515; }
    &:hover { text-decoration: underline; }
  }

  .dropdown-list {
    max-height: 180px;
    overflow-y: auto;
    padding: 4px 0;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    font-size: 1em;
    cursor: pointer;
    gap: 6px;

    &.selected {
      .theme-dark &  { background: rgba(#f9f8f8, 0.10); }
      .theme-light & { background: rgba(#212325, 0.05); }
    }
    &:hover {
      .theme-dark &  { background: rgba(#f9f8f8, 0.15); }
      .theme-light & { background: rgba(#212325, 0.10); }
    }
    &.new-item {
      justify-content: flex-start;
      opacity: 0.8;
      .theme-dark & { color: #00ed00; }
      .theme-light & { color: #000; font-weight: bold; }
    }
  }

  .dropdown-item-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-empty {
    padding: 10px;
    font-size: 0.92em;
    opacity: 0.4;
    text-align: center;
  }
}

.ale-tag {
  font-size: 0.75em;
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;

  .theme-dark & { background: rgba(#00ed00, 0.1); color: #00ed00; }
  .theme-light & { background: rgba(#1faa1f, 0.18); color: #167816; }
}
</style>
