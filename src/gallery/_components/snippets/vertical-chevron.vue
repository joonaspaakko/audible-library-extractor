<template>
	<fa-solid-chevron-up v-if="up" />
	<fa-solid-chevron-down v-else />
</template>

<script>
export default {
	props: ['up'],
};
</script>