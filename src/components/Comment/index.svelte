<script lang="ts">
	import { writable } from 'svelte/store'
	import Header from './Header.svelte'
	import CommentList from './CommentList.svelte'
	import Editor from './Editor.svelte'
	import { draggable } from 'svelte-drag'
	import { spring } from 'svelte/motion'
	import { onMount } from 'svelte'
	import type { DragOptions } from 'svelte-drag'

	const selected = writable(0)

	let width
	let height
	let heights
	let mobile
	let ref
	let options: DragOptions = {}
	let y = spring(undefined, {
		stiffness: 0.2,
		damping: 0.75
	})

	onMount(() => {
		let h = window.innerHeight
		heights = [0, -h * 0.4, -h * 0.85]
		y.set(heights[0])
	})

	$: {
		mobile = width < 680
		options = mobile
			? {
					axis: 'y',
					position: { x: 0, y: $y }
			  }
			: {
					disabled: true,
					position: { x: 0, y: 0 }
			  }
	}

	function dragEnd(e) {
		const oy = e.detail.offsetY
		if (oy >= (heights[0] + heights[1]) / 2) y.set(heights[0])
		if (oy < (heights[0] + heights[1]) / 2 && oy >= (heights[1] + heights[2]) / 2) y.set(heights[1])
		if (oy < (heights[1] + heights[2]) / 2) y.set(heights[2])
	}

	function drag(e) {
		y.set(e.detail.offsetY)
	}
	
	function handleScroll() {
		if (mobile && ref.style.top !== (window.innerHeight - 53) + 'px')
			ref.style.top = (window.innerHeight - 53) + 'px'
		if (!mobile && ref.style.top !== '0')
			ref.style.top = '0'
	}
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} on:scroll={handleScroll} />

<div id="comment" bind:this={ref} use:draggable={options} on:svelte-drag={drag} on:svelte-drag:end={dragEnd}>
	<Header {selected} />
	<div class="scroll">
		<Editor />
		<CommentList {selected} />
	</div>
</div>

<style lang="scss">
	#comment {
		contain: strict;
		background-color: var(--color-bg);
		transition: background-color 0.2s ease-out;

		@media screen and (max-width: 680px) {
			height: 100%;
			width: 100%;
			position: fixed;
			top: calc(100% - 53px);
			bottom: 0;
			z-index: 3;
			border-top-left-radius: 0.4em;
			border-top-right-radius: 0.4em;
			background-color: var(--color-secondary-bg);
		}

		@media screen and (min-width: 680px) {
			border-left: 1px solid var(--color-coral);
		}
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
