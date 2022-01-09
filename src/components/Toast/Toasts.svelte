<script lang="ts">
	import { flip } from 'svelte/animate'
	import { quintOut } from 'svelte/easing'

	import Toast from './Toast.svelte'
	import { toastStore } from '$lib/toast'
</script>

{#if $toastStore.length}
	<ul>
		{#each $toastStore as toast (toast.id)}
			<li animate:flip={{ duration: 400, easing: quintOut }}>
				<Toast {toast} />
			</li>
		{/each}
	</ul>
{/if}

<style lang="scss">
	ul {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: fixed;
		z-index: 9999;

		top: var(--spacing);
		right: var(--spacing);

		@media screen and (max-width: 680px) {
			top: 0;
			right: 50%;
			transform: translateX(50%);
		}
	}
</style>
