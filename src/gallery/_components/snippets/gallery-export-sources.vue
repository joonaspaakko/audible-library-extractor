<template>
<div class="source-section" :class="{ bare }">

  <!-- Pages -->
  <div class="source-group">
    <div class="source-group-head" :class="{ 'source-group-head-toggle': !bare }" @click="!bare && (pagesExpanded = !pagesExpanded)">
      <fa6-solid-chevron-right v-if="!bare" class="section-chevron" :class="{ expanded: pagesExpanded }" />
      <span class="source-group-label">Pages</span>
      <span class="group-toggle-all" @click.stop="$emit('toggle-group', 'allPages')">{{ groupState('allPages').allChecked ? 'clear all' : 'select all' }}</span>
    </div>
    <div class="source-group-body" v-show="bare || pagesExpanded">
      <div class="source-row" :class="{ 'source-row-pill': pill }">
        <label
          v-for="item in groupedSources.allPages"
          :key="item.key"
          :class="[ pill ? 'pill sub' : 'opt-group', item.disabled ? 'disabled' : null, { checked: item.checked } ]"
          v-tippy :content="item.tippy"
        >
          <input type="checkbox" :disabled="item.disabled" v-model="item.checked" @change="$emit('source-checked', $event, item)">
          <template v-if="pill">
            <span class="pill-dot"></span>
            {{ item.key }}
          </template>
          <template v-else>
            <div class="visual-checkbox"><span class="icon"><fa-solid-check/></span></div>
            <span>{{ item.key }}</span>
          </template>
        </label>
      </div>
    </div>
  </div>

  <!-- Sub-pages -->
  <div class="source-group" :class="{ 'source-group-faded': !libraryActive && !wishlistActive }">
    <div class="source-group-head" :class="{ 'source-group-head-toggle': !bare }" @click="!bare && (subPagesExpanded = !subPagesExpanded)">
      <fa6-solid-chevron-right v-if="!bare" class="section-chevron" :class="{ expanded: subPagesExpanded }" />
      <span class="source-group-label">Sub-pages</span>
      <span class="group-toggle-all" @click.stop="$emit('toggle-group', 'subPages')">{{ groupState('subPages').allChecked ? 'clear all' : 'select all' }}</span>
    </div>
    <div class="source-group-body" v-show="bare || subPagesExpanded">
      <div class="source-row" :class="{ 'source-row-pill': pill }">
        <label
          v-for="item in groupedSources.subPages"
          :key="item.key"
          :class="[ pill ? 'pill sub' : 'opt-group', item.disabled ? 'disabled' : null, { checked: item.checked } ]"
          v-tippy :content="item.tippy"
        >
          <input type="checkbox" :disabled="item.disabled" v-model="item.checked" @change="$emit('source-checked', $event, item)">
          <template v-if="pill">
            <span class="pill-dot"></span>
            {{ item.key }}
          </template>
          <template v-else>
            <div class="visual-checkbox"><span class="icon"><fa-solid-check/></span></div>
            <span>{{ item.key }}</span>
          </template>
        </label>
      </div>
    </div>
  </div>

  <!-- Library extras -->
  <div class="source-group" :class="{ 'source-group-faded': !libraryActive }">
    <div class="source-group-head" :class="{ 'source-group-head-toggle': !bare }" @click="!bare && (extrasExpanded = !extrasExpanded)">
      <fa6-solid-chevron-right v-if="!bare" class="section-chevron" :class="{ expanded: extrasExpanded }" />
      <span class="source-group-label">Library extras</span>
      <span class="group-toggle-all" @click.stop="$emit('toggle-group', 'extras')">{{ groupState('extras').allChecked ? 'clear all' : 'select all' }}</span>
    </div>
    <div class="source-group-body" v-show="bare || extrasExpanded">
      <div class="source-row" :class="{ 'source-row-pill': pill }">
        <label
          v-for="item in groupedSources.extras"
          :key="item.key"
          :class="[ pill ? 'pill sub' : 'opt-group', item.disabled ? 'disabled' : null, { checked: item.checked } ]"
          v-tippy :content="item.tippy"
        >
          <input type="checkbox" :disabled="item.disabled" v-model="item.checked" @change="$emit('source-checked', $event, item)">
          <template v-if="pill">
            <span class="pill-dot"></span>
            {{ item.key }}
          </template>
          <template v-else>
            <div class="visual-checkbox"><span class="icon"><fa-solid-check/></span></div>
            <span>{{ item.key }}</span>
          </template>
        </label>
      </div>
    </div>
  </div>

</div>
</template>

<script>
export default {
  name: "galleryExportSources",

  props: {
    groupedSources: { type: Object, required: true },
    groupState: { type: Function, required: true },
    libraryActive: { type: Boolean, default: false },
    wishlistActive: { type: Boolean, default: false },
    // Strips the outer border/padding/background so this can sit directly inside
    // another bordered container, such as github.vue's settings-accordion-body,
    // without reading as a box nested inside a box.
    bare: { type: Boolean, default: false },
    // Swaps the checkbox items from the original square .visual-checkbox style to
    // rounded pills. The ZIP popover keeps the original look; github.vue's Advanced
    // settings opts into pills. Group layout (labels, chevrons, toggle-all link) is
    // shared either way. Only the individual item style forks.
    pill: { type: Boolean, default: false },
  },

  emits: ['toggle-group', 'source-checked'],

  data() {
    return {
      pagesExpanded: true,
      subPagesExpanded: true,
      extrasExpanded: true,
    };
  },
};
</script>

<style scoped lang="scss">
.source-section {
  border-radius: 8px;
  padding: 10px 12px 8px;
  @include themify($themes) {
    border: 1px solid rgba(themed(frontColor), .10);
  }
  .theme-light & { border-color: rgba($lightFrontColor, .22); }

  &.bare {
    border: none;
    padding: 0;
    background: none;
  }
}

.source-group {
  margin-bottom: 10px;
  &:last-child { margin-bottom: 0; }
}

.source-group-faded {
  opacity: 0.32;
  pointer-events: none;
  transition: opacity 200ms;
}

.source-group-head {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}

.source-group-head-toggle {
  cursor: pointer;
  user-select: none;
}

.section-chevron {
  flex-shrink: 0;
  align-self: center;
  transition: transform 150ms ease;
  font-size: 0.85em;
  &.expanded {
    transform: rotate(90deg);
  }
}

.source-group-label {
  font-size: 0.72em;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  @include themify($themes) {
    color: rgba(themed(frontColor), .45);
  }
}

.source-group-note {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-style: italic;
  margin-left: 4px;
  @include themify($themes) {
    color: rgba(themed(frontColor), .3);
  }
  .theme-light & { color: rgba($lightFrontColor, .55); }
}

.group-toggle-all {
  margin-left: auto;
  font-size: 0.78em;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  @include themify($themes) {
    color: rgba(themed(frontColor), .35);
  }

  &:hover {
    @include themify($themes) { color: themed(greenColor); }
  }
}

.source-group-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.source-row {
  max-width: 360px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0 4px;
}

.source-row-pill {
  gap: 5px;
}

// SQUARE-CHECKBOX STYLE (ZIP popover, pill=false)

.opt-group {
  display: inline-flex !important;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 6px !important;
  position: relative;
  z-index: 0;
  cursor: pointer;
}

.opt-group input {
  opacity: 0;
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
}

.opt-group .visual-checkbox {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width:  17px;
  height: 17px;
  @include themify($themes) {
    background: themed(elementColor);
    border: 1px solid rgba(themed(frontColor), .25);
  }
  border-radius: 4px;
  margin-right: 5px;
}

.opt-group .visual-checkbox .icon {
  display: none;
  @include themify($themes) { color: themed(greenColor); }
  svg {
    width: 80%;
  }
}

.opt-group input:checked ~ .visual-checkbox .icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.opt-group.disabled {
  opacity: .6;
  cursor: default !important;
  .visual-checkbox .icon {
    color: inherit;
  }

  .source-group-faded & {
    opacity: 1;
  }
}

// PILL STYLE (Advanced settings, pill=true)

// No pill container at all: no border, no background, checked or not. The dot alone
// (filled + checkmark when on, empty ring when off) carries the whole signal, so
// wrapping it in yet another bordered/filled shape was redundant on top of that.
.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 6px;
  font-size: 0.92em;
  cursor: pointer;
  position: relative;
  z-index: 0;
  @include themify($themes) {
    color: rgba(themed(frontColor), .65);
  }

  input {
    opacity: 0;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
  }

  &.sub {
    font-size: 0.85em;
    padding: 3px 5px;
    white-space: nowrap;
  }

  &.checked {
    @include themify($themes) {
      color: themed(frontColor);
    }
  }

  &.disabled {
    opacity: 0.5;
    cursor: default !important;
    pointer-events: none;

    .source-group-faded & {
      opacity: 1;
    }
  }
}

.pill-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  @include themify($themes) {
    border: 1px solid rgba(themed(frontColor), .3);
    background: themed(elementColor);
  }

  .pill.sub & {
    width: 11px;
    height: 11px;
  }

  .pill.checked & {
    @include themify($themes) {
      background: themed(greenColor);
      border-color: themed(greenColor);
    }

    &::after {
      content: "";
      width: 3px;
      height: 6px;
      border-right: 2px solid;
      border-bottom: 2px solid;
      transform: rotate(45deg) translate(-1px, -1px);
      @include themify($themes) { border-color: themed(panelColor); }
      .theme-light & { border-color: #fff; }
    }
  }
}
</style>
