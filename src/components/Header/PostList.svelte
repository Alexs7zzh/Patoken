<script lang="ts">
	import type { AsidePost } from '$lib/types'
	import { tick } from 'svelte'
	import { page } from '$app/stores'
	import { browser } from '$app/env'
	export let toc: AsidePost[]

	let current, nodes, observer

	page.subscribe(async () => {
		if (!browser) return
		if (nodes && observer && nodes.length !== 0) nodes.forEach(node => observer.unobserve(node))

		observer = observer
			? observer
			: new IntersectionObserver(entries => {
					const { isIntersecting } = entries[0]
					if (isIntersecting) {
						const target = entries[0].target as HTMLElement
						current = target.getAttribute('id')
					}
			  })

		await tick()
		nodes = Array.from(document.querySelectorAll('article'))
		nodes.forEach(article => observer.observe(article))
	})
</script>

{#each toc as [year, items] (year)}
	<h2>{year}</h2>
	<ul class="post-list">
		{#each items as item (item.slug)}
			<li>
				<a href={`#${item.slug}`} class:active={item.slug === current}>
					{item.title}
				</a>
			</li>
		{/each}
	</ul>
{/each}

<style lang="scss">
	h2 {
		font-size: var(--font);
		margin-bottom: 0;
		@media screen and (min-width: 1024px) {
			margin-bottom: 0.2em;
		}
	}

	ul {
		padding: 0;
		list-style: none;

		padding-bottom: var(--spacing-half);
	}

	li {
		line-height: 1;
		user-select: none;
		display: inline-block;
		margin-bottom: calc(var(--spacing-half) / 2);
		margin-right: var(--spacing-half);
	}

	a {
		text-decoration: none;
		color: var(--color-coral);
		transition: all 0.4s ease-out;

		&:hover {
			color: var(--color-melon);
		}

		&.active {
			color: var(--color-melon);
		}
	}
</style>
