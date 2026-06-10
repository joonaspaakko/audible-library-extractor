<template>
  <div class="extension-toolbar">
    <div class="item" v-for="item in items" :key="item.label">
      <span class="icon" v-html="item.icon"></span>
      <span class="label">
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script>
// ICON IMPORTS
import IconFa6SolidFileCsv      from '~icons/fa6-solid/file-csv?raw';
import IconFaSolidSave          from '~icons/fa6-solid/floppy-disk?raw';
import IconFa6RegularImages     from '~icons/fa6-regular/images?raw';
import IconFaSolidGraduationCap from '~icons/fa6-solid/graduation-cap?raw';

export default {
  name: "extensionGalleryToolbar",
  data: function() {
    return {
      items: [
        { 
          label: 'Save CSV',
          icon: IconFa6SolidFileCsv,
        },
        { 
          label: 'Save gallery locally',
          icon: IconFaSolidSave,
        },
        { 
          label: 'Wallpaper creator',
          icon: IconFa6RegularImages,
        },
        { 
          label: 'Documentation',
          icon: IconFaSolidGraduationCap,
        },
      ],
    }
  },
};
</script>

<style lang="scss" scoped>


.extension-toolbar {
  margin-top: -40px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-items: center;
}
.item {
  @include themify($themes) {
    cursor: pointer;
    @extend .no-selection;
    color: themed(frontColor);
    // background: #1C79F7;
    // background: themed(backColor);
    $bdrs: 4px;
    font-size: 0.9em;
    border-radius: $bdrs;
    border: 1px solid rgba(themed(frontColor),.4);
    margin-left: 7px; &:first-child { margin-left: 0; }
    overflow: hidden;
    padding: 4px 10px;
    background: themed(backColor);
    span {
      padding: 0px 2px;
    }
    .icon {
      color: themed(audibleOrange);
      color: #1C79F7;
    }
    .label {
      /* label styles */
    }
  }
}

</style>
