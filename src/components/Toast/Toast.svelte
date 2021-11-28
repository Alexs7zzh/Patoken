<script lang="ts">
	import { fade, fly } from 'svelte/transition'
	import type { Toast } from '$lib/toast'
	import { removeToast } from '$lib/toast'
	export let toast: Toast
	let flyOptions = window.matchMedia('(max-width: 680px)').matches
		? { y: -300, duration: 300 }
		: { x: 300, duration: 300 }
</script>

<div class={toast.type} in:fly={flyOptions} out:fade>
	<span role="status">
		{@html toast.message}
	</span>
	<button on:click={() => removeToast(toast.id)} aria-label="Cancel Button">
		<svg width="14" height="14" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M0.571429 0.571436C0.255838 0.887027 0.255838 1.3987 0.571429 1.71429L6.28571 7.42858C6.6013 7.74417 7.11298 7.74417 7.42857 7.42858C7.74416 7.11299 7.74416 6.60131 7.42857 6.28572L1.71429 0.571437C1.3987 0.255845 0.887021 0.255845 0.571429 0.571436Z" />
			<path
				d="M7.42857 0.57141C7.11298 0.255819 6.60131 0.255819 6.28571 0.57141L0.571431 6.28569C0.25584 6.60128 0.255839 7.11296 0.57143 7.42855C0.887021 7.74414 1.3987 7.74414 1.71429 7.42855L7.42857 1.71427C7.74416 1.39868 7.74416 0.887002 7.42857 0.57141Z" />
		</svg>
	</button>
</div>

<style lang="scss">
	div {
		--as-toast-backdrop-filter: blur(8px);
		--as-toast-shadow: 0px 1.4px 2.2px rgba(0, 0, 0, 0.028), 0px 4.7px 7.4px rgba(0, 0, 0, 0.042),
			0px 21px 33px rgba(0, 0, 0, 0.07);
		--as-toast-btn-border: none;
		--as-toast-info-background: rgba(171, 210, 239, 0.7);
		--as-toast-warn-background: hsla(0, 69%, 80%, 0.7);

		display: flex;
		width: max-content;
		justify-content: space-between;
		align-items: center;
		text-decoration: none;
		font-family: inherit;
		font-weight: 400;
		font-size: 1em;
		padding: var(--as-toast-padding, 1em);
		margin-top: 1em;
		min-width: 300px;
		max-width: calc(100vw - 2em);
		border: none;
		border-radius: var(--as-toast-border-radius, 0.5em);
		color: var(--as-toast-color, black);
		backdrop-filter: var(--as-toast-backdrop-filter, none);
		-webkit-backdrop-filter: var(--as-toast-backdrop-filter, none);
		box-shadow: var(
			--as-toast-shadow,
			0 0.3px 1.4px rgba(0, 0, 0, 0.068),
			0 0.7px 3.5px rgba(0, 0, 0, 0.098),
			0 1.4px 7.1px rgba(0, 0, 0, 0.122),
			0 2.9px 14.6px rgba(0, 0, 0, 0.152),
			0 8px 40px rgba(0, 0, 0, 0.22)
		);

		&.info {
			color: var(--as-toast-info-color, var(--as-toast-color, black));
			background: var(--as-toast-info-background, #abd2ef);
		}

		&.warn {
			color: var(--as-toast-warn-color, var(--as-toast-color, black));
			background: var(--as-toast-warn-background, #efa9a9);
		}
	}

	span {
		user-select: none;
	}

	button {
		display: flex;
		margin-left: 2em;
		border-radius: 50%;
		padding: 0.45em;
		border: none;
		background: transparent;
		cursor: pointer;
	}
</style>
