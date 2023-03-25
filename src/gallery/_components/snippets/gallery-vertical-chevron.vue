<template>
	<div class="chevron-icon">
		<fa-solid-chevron-up v-if="up" />
		<fa-solid-chevron-down v-else />
	</div>
</template>

<script>
export default {
	props: ['up'],
};
</script>

<style lang="scss" scoped>
.chevron-icon {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	padding-left: 7px !important;
}
</style>