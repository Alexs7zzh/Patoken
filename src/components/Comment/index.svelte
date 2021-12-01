<script lang="ts">
	import { writable } from 'svelte/store'
	import Header from './Header.svelte'
	import CommentList from './CommentList.svelte'
	import Editor from './Editor.svelte'
	import { draggable } from 'svelte-drag'
	import { spring } from 'svelte/motion'
	import { browser } from '$app/env'

	const selected = writable(0)

	let ref
	let height = browser ? window.innerHeight : 500
	let mobile = browser ? window.innerWidth < 680 : false
	let heights = [height - 59, height * 0.6, height * 0.15]
	let y = spring(heights[0], {
		stiffness: 0.2,
		damping: 0.75
	})

	function dragStart() {
		document.body.classList.add('noscroll')
	}

	function drag(e) {
		y.set(e.detail.offsetY)
	}

	function dragEnd(e) {
		document.body.classList.remove('noscroll')
		const oy = e.detail.offsetY
		if (oy >= (heights[0] + heights[1]) / 2) {
			y.set(heights[0])
			ref.classList.add('bottom')
		} else ref.classList.remove('bottom')
		if (oy < (heights[0] + heights[1]) / 2 && oy >= (heights[1] + heights[2]) / 2) y.set(heights[1])
		if (oy < (heights[1] + heights[2]) / 2) y.set(heights[2])
	}

	function handleScroll() {
		if (mobile && ref.classList.contains('bottom') && height !== window.innerHeight) {
			height = window.innerHeight
			y.set(height - 59, { hard: true })
		}
	}

	function handleResize() {
		let width = window.innerWidth
		if (mobile !== width < 680) {
			mobile = width < 680
			if (mobile) y.set(heights[0])
			else y.set(0)
		}
	}
</script>

<svelte:window on:resize={handleResize} on:scroll={handleScroll} />

<div
	id="comment"
	bind:this={ref}
	class="bottom"
	use:draggable={{
		axis: 'y',
		position: { x: 0, y: mobile ? $y : 0 },
		defaultPosition: { x: 0, y: mobile ? $y : 0 },
		handle: '.handle',
		...(!mobile && { disabled: true })
	}}
	on:svelte-drag:start={dragStart}
	on:svelte-drag={drag}
	on:svelte-drag:end={dragEnd}>
	<Header {selected} />
	<div class="scroll">
		<Editor />
		<CommentList {selected} />
	</div>
</div>

<style lang="scss">
	:global(body.noscroll) {
		touch-action: none;
		overflow: hidden;
		-webkit-overflow-scrolling: contain;
		overscroll-behavior: contain;
	}

	#comment {
		contain: strict;
		background-color: var(--color-bg);
		transition: background-color 0.2s ease-out;

		@media screen and (max-width: 680px) {
			height: calc(85vh + 64px);
			width: 100%;
			position: fixed;
			top: 0;
			border-top-left-radius: 0.6em;
			border-top-right-radius: 0.6em;
			background-color: var(--color-secondary-bg);

			&::before {
				content: '';
				position: absolute;
				top: 5px;
				left: 50%;
				width: 3em;
				height: 4px;
				border-radius: 2px;
				transform: translateX(-50%);
				background-color: var(--color-text);
				opacity: 0.7;
			}
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

		@media screen and (max-width: 680px) {
			height: calc(100% - 60px);
			padding-bottom: 45vh;
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
