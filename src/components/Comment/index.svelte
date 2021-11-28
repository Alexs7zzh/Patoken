<script lang="ts">
	import { writable } from 'svelte/store'
	import Header from './Header.svelte'
	import CommentList from './CommentList.svelte'
	import Editor from './Editor.svelte'

	const selected = writable(0)
</script>

<div id="comment">
	<Header {selected} />
	<div class="scroll">
		<Editor />
		<CommentList {selected} />
	</div>
</div>

<style lang="scss">
	#comment {
		border-left: 1px solid var(--color-coral);
	}

	.scroll {
		contain: content;
		overflow-y: scroll;
		height: calc(100vh - 2.4em);
		-ms-overflow-style: none;
		scrollbar-width: none;
		padding-bottom: var(--spacing);
		scroll-behavior: smooth;
		&::-webkit-scrollbar {
			display: none;
		}
	}

	#comment :global(blockquote) {
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	#comment :global(blockquote p) {
		font-size: 0.9em;
		line-height: 1.4;
	}
</style>
