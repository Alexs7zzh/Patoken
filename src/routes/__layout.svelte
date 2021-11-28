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
	import { applyDarkModeSettings } from '$lib/darkmode'
	import Toasts from '$components/Toast/Toasts.svelte'
	import { onMount } from 'svelte'
	import { userStore } from '$lib/auth'

	let Tooltip

	onMount(async () => {
		applyDarkModeSettings()
		try {
			const data = await (await fetch('/api/user')).json()
			if (data && data.user) userStore.set(data.user)
		} catch {}
	})

	$: $userStore && import('$components/Tooltip/Tooltip.svelte')
		.then(({ default: module }) => {
			Tooltip = module
		})
</script>

<slot />
<Toasts />
<svelte:component this={Tooltip} />