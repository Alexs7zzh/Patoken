<script lang="ts">
	export let selected, options
</script>

<label for="editor-select">
	<select id="editor-select" bind:value={selected}>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
	<svg viewBox="0 0 320 512">
		<path
			d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z" /></svg>
</label>

<style lang="scss">
	label {
		border-bottom: 1px solid var(--color-melon);
		position: relative;
	}

	select {
		background-color: transparent;
		border: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		border-radius: 0;
		outline: none;
		padding: 0.2em 1.2em 0.2em 0.1em;
		cursor: pointer;
		color: inherit;
	}

	svg {
		fill: var(--color-text);
		width: 1em;
		height: 1em;
		position: absolute;
		right: 0;
		top: calc(50% - 0.5em);
	}
</style>
