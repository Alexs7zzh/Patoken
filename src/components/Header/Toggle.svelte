<script>
	import { toggleDarkMode } from '$lib/darkmode'
	export let style = null
</script>

<button aria-label="Dark mode toggle" on:click={toggleDarkMode} {style}>
	<span class="sun">
		<svg viewBox="0 0 24 24">
			<path
				d="M6.995 12a5.013 5.013 0 0 0 5.007 5.007A5.013 5.013 0 0 0 17.009 12a5.013 5.013 0 0 0-5.007-5.007A5.013 5.013 0 0 0 6.995 12ZM11 19h2v3h-2v-3Zm0-17h2v3h-2V2Zm-9 9h3v2H2v-2Zm17 0h3v2h-3v-2ZM5.637 19.778l-1.414-1.414 2.121-2.121 1.414 1.414-2.121 2.121ZM16.242 6.344l2.122-2.122 1.414 1.414-2.122 2.122-1.414-1.414ZM6.344 7.759 4.223 5.637l1.415-1.414 2.12 2.122-1.414 1.414ZM19.778 18.364l-1.414 1.414-2.122-2.122 1.414-1.414 2.122 2.122Z" />
		</svg>
	</span>
	<span class="moon">
		<svg viewBox="0 0 24 24">
			<path
				d="M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142 3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.004 9.004 0 0 1 12 11.807Z" />
		</svg>
	</span>
</button>

<style lang="scss">
	button {
		background: none;
		border: none;
		cursor: pointer;
		position: absolute;
		top: -0.15em;
		right: 0;
		padding: 0;
		font-size: 1em;
		-webkit-tap-highlight-color: transparent;
		@media screen and (min-width: 1024px) {
			right: var(--spacing-half);
		}
	}

	.sun {
		position: absolute;
		opacity: 0;
	}

	.sun,
	.moon {
		transform-origin: center;
		transition: all 0.5s cubic-bezier(0.09, 0.42, 0.65, 1.5);
		display: inline-block;
		svg {
			fill: var(--color-text);
			width: 1.6em;
			height: 1.6em;
		}
	}
</style>
