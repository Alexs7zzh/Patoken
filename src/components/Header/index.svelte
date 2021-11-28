<script lang="ts">
	export let authors,
		toc = undefined
	import SiteTitle from './SiteTitle.svelte'
	import AuthorList from './AuthorList.svelte'
	import PostList from './PostList.svelte'
</script>

<header id="header">
	<div>
		<SiteTitle />

		<nav>
			<AuthorList {authors} />

			{#if toc !== undefined}
				<PostList {toc} />
			{/if}
		</nav>
	</div>
</header>

<style lang="scss">
	header {
		margin: var(--spacing) var(--spacing-half);
		padding: 0;
		border-bottom: 1px solid var(--color-hr);
		@media screen and (min-width: 680px) {
			margin: 0;
			padding: var(--spacing);
			padding-right: 0;
			border-bottom: none;
		}
	}

	div {
		position: relative;
	}

	nav {
		contain: content;
	}
</style>
