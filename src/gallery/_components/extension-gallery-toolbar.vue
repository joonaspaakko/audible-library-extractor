<template>
  <div class="extension-toolbar">
    <div class="item" v-for="item in items" :key="item.label">
      <span class="icon">
        <!-- <component :is="item.icon"> -->
        {{ item.icon }}
      </span>
      <span class="label">
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "extensionGalleryToolbar",
  data: function() {
    return {
      items: [
        { 
          label: 'Save CSV',
          icon: 'fa6-solid-file-csv',
        },
        { 
          label: 'Save gallery locally',
          icon: 'fa-solid-save',
        },
        { 
          label: 'Wallpaper creator',
          icon: 'fa6-regular-images',
        },
        { 
          label: 'Documentation',
          icon: 'fa-solid-graduation-cap'
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
    }
  }
}

</style>
