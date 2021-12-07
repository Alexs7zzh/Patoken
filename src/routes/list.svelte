<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
	import Toggle from '../components/Header/Toggle.svelte'
</script>

<svelte:head>
	<title>List</title>
</svelte:head>

<div class="container" />
<Toggle style="top: var(--spacing); right: var(--spacing)" />

<style lang="scss">
	.container {
		width: 100vw;
		min-height: calc(90vh - var(--spacing-3));
		display: grid;
		justify-content: center;
		align-content: center;
		grid-template: none !important;
	}
</style>
