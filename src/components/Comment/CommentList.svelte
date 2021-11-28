<script lang="ts">
	import { page } from '$app/stores'
	import { browser } from '$app/env'
	import { removeAllHighlights, commentStore } from '$lib/comment'
	import { flip } from 'svelte/animate'
	import { quintOut } from 'svelte/easing'
	import { fade } from 'svelte/transition'
	import Comment from './Comment.svelte'

	export let selected
	let comments

	$: ({ data: comments, before, after, refresh } = commentStore($page.path.slice(1)))
	if (browser) page.subscribe(removeAllHighlights)
</script>

{#if comments && $comments}
	<ul>
		{#each $selected === 0 ? $before : $after as comment (comment.id)}
			<li id={'comment-' + String(comment.id)} animate:flip={{ easing: quintOut }} in:fade>
				<Comment {comment} {refresh} />
			</li>
		{/each}
	</ul>
{/if}

<style lang="scss">
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin: 0;
		padding: var(--spacing-half) var(--spacing);
		border-bottom: 1px solid var(--color-coral);
		contain: content;
		&:last-child {
			border-bottom: none;
		}
	}

	li:hover :global(.buttons) {
		opacity: 1;
		visibility: visible;
	}
</style>
