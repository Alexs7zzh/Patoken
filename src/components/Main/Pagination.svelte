<script lang="ts">
	import { page } from '$app/stores'
	export let pageUrls: string[]
</script>

<nav>
	<ol>
		{#each pageUrls as pageUrl, index (index)}
			<li>
				<a href={pageUrl} class:current={$page.url.pathname === pageUrl}>{index + 1}</a>
			</li>
		{/each}
	</ol>
</nav>

<style lang="scss">
	nav {
		display: grid;
		justify-items: center;
		margin-top: var(--spacing-half);

		ol {
			list-style: none;
			padding: 0;
			margin: 0;
			width: 100%;
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(1.8em, 1fr));
			column-gap: var(--spacing-half);
		}

		li {
			display: inline-block;
			margin-top: var(--spacing);
			margin-right: var(--spacing-half);
		}

		a {
			line-height: 1;
			background-color: var(--color-eggshell);
			text-decoration: none;
			border-radius: 0.4em;
			user-select: none;
			color: #1c1c1e;
			-webkit-tap-highlight-color: transparent;
			display: inline-block;
			width: 1.9em;
			padding: 0.4em 0;
			text-align: center;
			transition: background-color 0.4s ease-out;
		}

		a.current {
			background-color: var(--color-melon);
		}

		a:hover {
			background-color: var(--color-melon);
		}
	}
</style>
