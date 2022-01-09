<script>
	import Toggle from './Toggle.svelte'
</script>

<div>
	<h1>
		<a href="/">パト研</a>
	</h1>

	<Toggle />
</div>

<style lang="scss">
	div {
		contain: content;
	}

	h1 {
		font-size: 1.5em;
		line-height: 1;
		display: inline-block;

		a {
			font-weight: bold;
		}
	}
</style>
