<script lang="ts">
	import Header from './Header.svelte'
	import Editor from './Editor.svelte'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { commentStore } from '$lib/comment'

	let CommentList
	let selected = 0

	$: ({ before, after } = commentStore($page.url.pathname.slice(1)))

	onMount(() => {
		import('./CommentList.svelte').then(({ default: module }) => {
			CommentList = module
		})
	})
</script>

<div id="comment">
	<Header bind:selected />
	<div class="scroll">
		<Editor />
		{#if selected === 0 ? $before : $after}
			<svelte:component this={CommentList} comments={selected === 0 ? before : after} />
		{/if}
	</div>
</div>

<style lang="scss">
	#comment {
		@media screen and (min-width: 680px) {
			contain: strict;
			border-left: 1px solid var(--color-coral);
		}
	}

	.scroll {
		overflow: scroll;
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
		@media screen and (min-width: 680px) {
			contain: content;
			height: calc(100vh - 2.4em);
			padding-bottom: var(--spacing);
		}
	}

	#comment :global(blockquote) {
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	#comment :global(blockquote p) {
		font-size: 0.9em;
		line-height: 1.4;
	}
</style>
