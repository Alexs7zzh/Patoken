<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'

	export const load: Load = async ({ fetch }) => {
		const authors = await fetch('/ghost/authors.json')
		return {
			stuff: {
				authors: await authors.json()
			}
		}
	}
</script>

<script lang="ts">
	import '../styles/style.scss'
	import Toasts from '$components/Toast/Toasts.svelte'
	import { onMount } from 'svelte'
	import { userStore } from '$lib/auth'

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
</script>

<slot />
<Toasts />
