<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'
	import type { Post as PostType } from '$lib/types'

	export const load: Load = async ({ fetch, stuff }) => {
		const res = await fetch('/ghost/page-1.json')
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
	import { setContext } from 'svelte'
	import { userStore } from '$lib/auth'
	import type { Author } from '$lib/types'
	export let posts: PostType[], pageUrls: string[], authors: Author[]

	let Tooltip

	userStore.subscribe(value => {
		if (value)
			import('$components/Elements/Tooltip.svelte').then(({ default: module }) => {
				Tooltip = module
			})
	})

	setContext(
		'posts',
		posts.map(post => post.slug)
	)
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
<svelte:component this={Tooltip} />
