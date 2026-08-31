<template>
<changelog-modal :show="true" @update:show="$emit('closeComp')" />
</template>

<script>
import changelogModal from "@output-snippets/changelog-modal.vue";

export default {
  name: 'galleryChangelog',
  emits: [ 'closeComp' ],
  components: { changelogModal },
}
</script>
