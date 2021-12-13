<script context="module" lang="ts">
	export const load = async ({ fetch }) => {
		const authors = await fetch('/ghost/authors.json')

		const { urls, postsOnPage } = await (await fetch('/ghost/urls.json')).json()
		return {
			stuff: {
				authors: await authors.json(),
				pageUrls: urls
			},
			props: {
				postsOnPage
			}
		}
	}
</script>

<script lang="ts">
	export let postsOnPage

	import '../styles/shared.scss'
	import '../styles/style.scss'
	import Toasts from '$components/Toast/Toasts.svelte'
	import Comment from '$components/Comment/index.svelte'
	import { onMount, setContext } from 'svelte'
	import { userStore } from '$lib/auth'

	setContext('postsOnPage', postsOnPage)
	let Tooltip

	onMount(async () => {
		try {
			const data = await (
				await fetch(`${import.meta.env.VITE_API_URL}/user`, {
					credentials: 'include'
				})
			).json()
			if (data) userStore.set(data)
		} catch {
			userStore.set(null)
		}
	})

	userStore.subscribe(value => {
		if (value)
			import('$components/Elements/Tooltip.svelte').then(({ default: module }) => {
				Tooltip = module
			})
	})
</script>

<slot />
<Comment />
<svelte:component this={Tooltip} />
<Toasts />
