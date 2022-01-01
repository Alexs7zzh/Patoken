<script context="module" lang="ts">
	export const load = async ({ fetch, params, stuff: { authors, pageUrls } }) => {
		const { posts } = await (await fetch(`/ghost/page-${params.num}.json`)).json()
		return {
			props: {
				authors,
				pageUrls,
				posts
			}
		}
	}
</script>

<script lang="ts">
	export let authors, pageUrls, posts

	import Post from '$components/Main/Post.svelte'
	import Header from '$components/Header/index.svelte'
	import Pagination from '$components/Main/Pagination.svelte'
</script>

<svelte:head>
	<title>パト研</title>
</svelte:head>

<Header {authors} />
<main>
	{#each posts as post (post.slug)}
		<Post {post} />
	{/each}
	<Pagination {pageUrls} />
</main>
