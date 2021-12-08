<svelte:options immutable={true} />

<script lang="ts">
	import type { Post } from '$lib/types'
	export let post: Post
	function getName(name: string) {
		return name.split(' ')[0]
	}
</script>

<article id={post.slug} data-author={post.authorSlug}>
	<div>
		<p class="button">{getName(post.author)}{post.title === '(Untitled)' ? '' : `・${post.title}`}</p>
	</div>
	{@html post.html}
</article>

<style lang="scss">
	article {
		position: relative;
		contain: layout;
	}

	:global(article) + article {
		margin-top: var(--spacing-4);

		&::before {
			content: '';
			height: 0px;
			width: 50%;
			border-top: 1px solid var(--color-blue);
			position: absolute;
			left: 25%;
			top: calc(0em - var(--spacing-2));
		}
	}

	div {
		text-align: right;
		display: grid;
		justify-content: end;
		margin-bottom: var(--spacing-half);
		user-select: none;
		p {
			background-color: var(--color-blue);
			cursor: default;
		}
	}
</style>
