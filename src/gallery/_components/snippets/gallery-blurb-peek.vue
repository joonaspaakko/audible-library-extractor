<template>
  <transition name="fade">
    <div
      v-if="peek.visible && peek.book"
      class="blurb-peek"
      :style="panelStyle"
    >

      <div class="peek-title" v-html="title"></div>

      <div class="peek-subtitle" v-if="subtitle" v-html="subtitle"></div>

      <div class="peek-categories" v-if="categories.length">
        <span class="peek-category" v-for="( category, index ) in categories" :key="category.name + '(' + index + ')'">
          <span class="peek-chevron" v-if="index !== 0">
            <fa-solid-chevron-right/>
          </span>
          {{ category.name }}
        </span>
      </div>

      <div class="peek-tags" v-if="tags.length">
        <span class="peek-tag" v-for="tag in tags" :key="tag.name">{{ tag.name }}</span>
      </div>

      <div class="peek-blurb">{{ peek.book.blurb }}</div>

    </div>
  </transition>
</template>

<script>
import blurbPeekController from "@output-snippets/gallery-blurb-peek-controller.js";

export default {
  name: "blurbPeek",
  mixins: [ blurbPeekController ],
  computed: {

    // Sit just above the pointer, clamped so the panel never runs off either edge.
    // On touch the finger covers the pointer, so lift the panel another 1.5 text rows
    // (line-height 1.4 at 13px ≈ 18px/row) clear of the fingertip.
    panelStyle: function() {
      const width = 280;
      const margin = 10;
      let left = this.peek.x - ( width / 2 );
      left = Math.max( margin, Math.min( left, window.innerWidth - width - margin ) );
      const top = this.peek.isTouch ? this.peek.y - 27 : this.peek.y;
      return {
        left: left + 'px',
        top: top + 'px',
        width: width + 'px',
      };
    },

    // Title and subtitle mirror the book details header: the short title preference
    // picks the main line, and the leftover long title doubles as the subtitle.
    title: function() {
      const book = this.peek.book;
      if ( !book ) return "";
      if ( this.$store.state.sticky.bookDetailSettings.titleShort ) return book.titleShort || book.title;
      return book.title || book.titleShort;
    },

    subtitle: function() {

      const book = this.peek.book;
      if ( !book || !this.$store.state.sticky.bookDetailSettings.titleShort ) return "";

      const hasSubtitle = !!book.subtitle;
      const noTitleDuplicate = !!book.title && !!book.titleShort && book.title !== book.titleShort;
      if ( !hasSubtitle && !noTitleDuplicate ) return "";

      return book.subtitle || book.title;

    },

    categories: function() {
      return _.get( this.peek.book, 'categories', [] ) || [];
    },

    tags: function() {
      return _.get( this.peek.book, 'tags', [] ) || [];
    },

  },
};
</script>

<style lang="scss" scoped>

.blurb-peek {
  position: fixed;
  z-index: 9999;
  transform: translateY( calc( -100% - 18px ) );
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
  pointer-events: none;
  max-height: 50vh;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(#000, 0.5);
  @include themify($themes) {
    background: rgba( themed(backColor), 0.97 );
    color: themed(frontColor);
    border: 1px solid rgba( themed(outerColor), 0.3 );
  }
}

.peek-title {
  font-size: 1.25em;
  line-height: 1.2;
  font-weight: 700;
}

.peek-subtitle {
  font-size: 1em;
  line-height: 1.25;
  font-weight: 400;
}

.peek-categories {
  font-size: 0.85em;
  line-height: 1.2;
  margin-top: 4px;
  @include themify($themes) { color: rgba(themed(frontColor), .85); }
}

.peek-category {
  display: inline-flex;
  align-items: center;
}

.peek-chevron {
  display: inline-flex;
  font-size: 0.7em;
  padding: 0 4px;
  @include themify($themes) { color: rgba(themed(frontColor), .7); }
}

.peek-tags {
  margin-bottom: 4px;
}

.peek-tag {
  display: inline-block;
  padding: 1px 4px;
  margin: 4px 4px 0 0;
  border-radius: 9999999px;
  font-size: 9px;
  line-height: 11px;
  white-space: nowrap;
  @include themify($themes) {
    color: rgba(themed(frontColor), 0.7);
    border: 1px solid rgba(themed(frontColor), 0.5);
  }
}

.peek-blurb {
  margin-top: 10px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .12s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

</style>
