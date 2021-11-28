<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'
	import type { Post as PostType } from '$lib/types'
	export const prerender = true

	export const load: Load = async ({ fetch, stuff, page: { path } }) => {
		path = path.match(/\/page\/(\d+)/)[1]
		const res = await fetch(`/ghost/page-${path}.json`)
		const data = await res.json()
		return {
			props: {
				posts: data.posts,
				pageUrls: data.urls,
				authors: stuff.authors
			}
		}
	}
</script>

<script lang="ts">
	import Post from '$components/Main/Post.svelte'
	import Pagination from '$components/Main/Pagination.svelte'
	import Header from '$components/Header/index.svelte'
	import Comment from '$components/Comment/index.svelte'
	import type { Author } from '$lib/types'
	export let posts: PostType[], pageUrls: string[], authors: Author[]
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
<Comment />
