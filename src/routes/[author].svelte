<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'
	import type { Post as PostType } from '$lib/types'
	export const prerender = true
	export const load: Load = async ({ fetch, page: { params }, stuff }) => {
		const res = await fetch(`/ghost/${params.author}.json`)
		const data = await res.json()
		return {
			props: {
				author: params.author,
				posts: data.posts,
				toc: data.toc,
				authors: stuff.authors
			}
		}
	}
</script>

<script lang="ts">
	import Post from '$components/Main/Post.svelte'
	import Header from '$components/Header/index.svelte'
	import Comment from '$components/Comment/index.svelte'
	import { userStore } from '$lib/auth'
	export let author, posts: PostType[], toc, authors

	let Tooltip

	userStore.subscribe(value => {
		if (value)
			import('$components/Tooltip/Tooltip.svelte').then(({ default: module }) => {
				Tooltip = module
			})
	})

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1)
	}
</script>

<svelte:head>
	<title>{capitalizeFirstLetter(author)}｜パト研</title>
</svelte:head>

<Header {authors} {toc} />
<main>
	{#each posts as post (post.slug)}
		<Post {post} />
	{/each}
</main>
<Comment />
<svelte:component this={Tooltip} />
