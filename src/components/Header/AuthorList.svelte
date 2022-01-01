<script lang="ts">
	import type { Author } from '$lib/types'
	import { page } from '$app/stores'
	export let authors: Author[]
</script>

<ul>
	{#each authors as item}
		<li>
			<a class="button" href={`/${item.slug}`} sveltekit:prefetch class:active={$page.url.pathname === `/${item.slug}`}
				>{item.name}</a>
		</li>
	{/each}
</ul>

<style lang="scss">
	ul {
		margin-top: var(--spacing);
		margin-bottom: 0;
		list-style: none;
		padding: 0;

		@media screen and (min-width: 1024px) {
			margin-top: var(--spacing-2);
			margin-bottom: var(--spacing-2);
		}

		li {
			line-height: 1;
			margin-bottom: var(--spacing);
			@media screen and (max-width: 1024px) {
				display: inline-block;
				margin-bottom: 1.4em;
				margin-right: var(--spacing-half);
			}
		}

		a {
			text-decoration: none;
			color: #1c1c1e;
			background-color: var(--color-eggshell);
			transition: background-color 0.4s ease-out;
		}

		a:hover {
			background-color: var(--color-melon);
		}

		a.active {
			background-color: var(--color-melon);
		}
	}
</style>
