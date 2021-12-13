<script lang="ts">
	import '../../styles/shared.scss'
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
