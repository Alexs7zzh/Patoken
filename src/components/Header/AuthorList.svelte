<script lang="ts">
	import type { Author } from '$lib/types'
	import { page } from '$app/stores'
	export let authors: Author[]

	function getName(name: string) {
		return name.split(' ')[0]
	}
</script>

<ul>
	{#each authors as item}
		<li>
			<a href={`/${item.slug}`} sveltekit:prefetch class:active={$page.url.pathname === `/${item.slug}`}
				>{getName(item.name)}</a>
		</li>
	{/each}
</ul>

<style lang="scss">
	ul {
		margin-top: var(--spacing);
		margin-bottom: 0.4em;
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;

		@media screen and (min-width: 1024px) {
			margin-top: var(--spacing-2);
			margin-bottom: var(--spacing-2);
		}

		li {
			line-height: 1;
			margin-bottom: var(--spacing-half);
			margin-right: var(--spacing-half);
			position: relative;
			display: inline-block;
			opacity: 0.8;

			@media screen and (max-width: 1024px) {
				margin-bottom: 0.4em;
			}

			&::after {
				content: '\a';
				position: absolute;
				--size: 0.2em;
				top: calc(50% - var(--size) / 2);
				right: calc(0em - (var(--spacing-half) + var(--size)) / 2);
				width: var(--size);
				height: var(--size);
				border-radius: 50%;
				background: var(--color-blue);
				// opacity: .8;
				display: inline-block;
			}

			&:last-child::after {
				display: none;
			}
		}

		a {
			text-decoration: none;
			color: var(--color-text);
			font-weight: bold;
			transition: color 0.4s ease-out;
		}

		a:hover,
		a.active {
			color: var(--color-melon-dark);
		}
	}
</style>
