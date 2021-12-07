<script lang="ts">
	export let selected

	import { userStore } from '$lib/auth'
	import { page } from '$app/stores'
	import { commentStore, state } from '$lib/comment'
	import { fade } from 'svelte/transition'

	$: ({ before, after } = commentStore($page.path.slice(1)))
</script>

<header class="handle" transition:fade style={$state !== 0 && window.innerWidth <= 680 ? 'display:none;' : ''}>
	<button
		class:selected={selected === 0}
		on:click={() => {
			selected = 0
		}}>
		考察<span>{$before ? $before.length : 0}</span>
	</button>
	<button
		class:selected={selected === 1}
		on:click={() => {
			selected = 1
		}}>
		パトアンサー<span>{$after ? $after.length : 0}</span>
	</button>
	{#if $userStore && $userStore.name}
		<p>{$userStore.name}</p>
	{:else}
		<a href="/signin">登録</a>
	{/if}
</header>

<style lang="scss">
	header {
		width: 100%;
		height: 2.8em;
		border-bottom: 1px solid var(--color-coral);
		padding-right: var(--spacing-half);
		user-select: none;
		align-items: center;
		contain: content;
		display: flex;
		z-index: 1;
		@media screen and (min-width: 680px) {
			height: 2.4em;
		}
		@media screen and (max-width: 680px) {
			border: none;
			position: fixed;
			bottom: 0;
			left: 0;
			background-color: var(--color-secondary-bg);
			transition: background-color 0.2s ease-out;
			--shadow-color: 0deg 0% 76%;
			box-shadow: 0px -0.4px 0.5px hsl(var(--shadow-color) / 0.13),
				0px -1.2px 1.5px -0.5px hsl(var(--shadow-color) / 0.17), 0px -2.7px 3.4px -1px hsl(var(--shadow-color) / 0.21),
				0.1px -5.9px 7.5px -1.5px hsl(var(--shadow-color) / 0.25);
		}
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not([data-user-color-scheme])) header {
			box-shadow: none;
		}
	}

	:global(html[data-user-color-scheme='dark']) header {
		box-shadow: none;
	}

	button {
		border: none;
		background: none;
		cursor: pointer;
		font-size: 16px;
		border-bottom: 4px solid transparent;
		transition: border-color 0.5s ease-out;
		height: 100%;
		font-weight: bold;
		padding: 0 var(--spacing-half);
		display: inline-flex;
		align-items: center;
		color: var(--color-text);

		&.selected {
			border-bottom-color: var(--color-melon-dark);
		}

		@media (hover: hover) and (pointer: fine) {
			&:hover {
				border-bottom-color: var(--color-eggshell);
			}
		}
	}

	span {
		font-size: var(--font-s);
		position: relative;
		top: -0.2em;
		left: 0.5em;
	}

	p {
		font-weight: bold;
		margin-left: auto;
		cursor: default;
	}

	a {
		text-decoration: none;
		font-weight: bold;
		position: relative;
		margin-left: auto;

		&::after {
			content: '';
			position: absolute;
			bottom: -0.2em;
			left: 0;
			width: 100%;
			height: 0.1em;
			background-color: currentColor;
			transition: transform 300ms;

			transform: scale(0);
			-webkit-transform: scale(0);
			transform-origin: center;
		}

		&:hover::after,
		&:focus::after {
			transform: scale(1);
			-webkit-transform: scale(1);
		}
	}
</style>
