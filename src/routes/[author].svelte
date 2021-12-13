<script context="module" lang="ts">
	export const load = async ({ fetch, page: { params }, stuff: { authors } }) => {
		const { posts, toc } = await (await fetch(`/ghost/${params.author}.json`)).json()
		return {
			props: {
				authors,
				posts,
				toc,
				author: params.author
			}
		}
	}
</script>

<script lang="ts">
	export let author, authors, posts, toc

	import Post from '$components/Main/Post.svelte'
	import Header from '$components/Header/index.svelte'

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
