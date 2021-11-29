<script lang="ts">
	export let selected

	import { userStore } from '$lib/auth'
	import { page } from '$app/stores'
	import DoubleBounce from '$components/Loading/DoubleBounce.svelte'
	import { commentStore } from '$lib/comment'

	$: ({ loading } = commentStore($page.path.slice(1)))
</script>

<header>
	<button class:selected={$selected === 0} on:click={() => selected.set(0)}>
		<span>考察</span>
	</button>
	<button class:selected={$selected === 1} on:click={() => selected.set(1)}>
		<span>パトアンサー</span>
	</button>
	{#if loading && $loading}
		<DoubleBounce size="1" unit="em" style="margin-left:var(--spacing-half);" />
	{/if}
	{#if $userStore && $userStore.name}
		<p>{$userStore.name}</p>
	{:else}
		<a href="/signin">登録</a>
	{/if}
</header>

<style lang="scss">
	header {
		width: 100%;
		height: 2.4em;
		border-bottom: 1px solid var(--color-coral);
		padding-right: var(--spacing-half);
		user-select: none;
		align-items: center;
		contain: content;
		display: flex;
	}

	button {
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
		font-size: 16px;
	}

	span {
		height: 2.7em;
		font-weight: bold;
		padding: 0 var(--spacing-half);
		display: inline-flex;
		align-items: center;
		border-bottom: 3px solid transparent;
		transition: border-color 0.5s ease-out;

		&:hover {
			border-color: var(--color-blue);
		}
	}

	.selected span {
		border-color: var(--color-melon-dark);
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
		cursor: default;

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
