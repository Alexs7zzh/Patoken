<script lang="ts">
	import { writable } from 'svelte/store'
	import Header from './Header.svelte'
	import CommentList from './CommentList.svelte'
	import Editor from './Editor.svelte'
	import { draggable } from 'svelte-drag'
	import { spring } from 'svelte/motion'
	import { onMount } from 'svelte'

	const selected = writable(0)

	let ref, option
	let height
	let mobile
	let heights
	let y = spring(undefined, {
		stiffness: 0.2,
		damping: 0.75
	})

	onMount(() => {
		height = window.innerHeight
		mobile = window.innerWidth < 680
		heights = [height - 59, height * 0.5, height * 0.1]
		ref.style.top = '0'
		y.set(heights[0])
	})

	$: option = mobile
		? {
				axis: 'y',
				position: { x: 0, y: $y },
				defaultPosition: { x: 0, y: $y },
				handle: '.handle'
		  }
		: {
				position: { x: 0, y: 0 },
				defaultPosition: { x: 0, y: 0 },
				disabled: true
		  }

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
		if (oy < (heights[0] + heights[1]) / 2 && oy >= (heights[1] + heights[2]) / 2) {
			y.set(heights[1])
			const scrollEl = document.querySelector('.scroll') as HTMLElement
			scrollEl.style.paddingBottom = '45vh'
		}
		if (oy < (heights[1] + heights[2]) / 2) {
			y.set(heights[2])
			const scrollEl = document.querySelector('.scroll') as HTMLElement
			scrollEl.style.paddingBottom = null
		}
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
			else {
				y.set(0)
				const scrollEl = document.querySelector('.scroll') as HTMLElement
				scrollEl.style.paddingBottom = null
			}
		}
	}
</script>

<svelte:window on:resize={handleResize} on:scroll={handleScroll} />

<div
	id="comment"
	class="bottom"
	bind:this={ref}
	use:draggable={option}
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
		z-index: 1;

		@media screen and (max-width: 680px) {
			height: calc(85vh + 64px);
			width: 100%;
			position: fixed;
			top: calc(100% - 59px);
			border-top-left-radius: 0.6em;
			border-top-right-radius: 0.6em;
			background-color: var(--color-secondary-bg);
			--shadow-color: 0deg 0% 76%;
			box-shadow: 0px -0.4px 0.5px hsl(var(--shadow-color) / 0.13),
				0px -1.2px 1.5px -0.5px hsl(var(--shadow-color) / 0.17), 0px -2.7px 3.4px -1px hsl(var(--shadow-color) / 0.21),
				0.1px -5.9px 7.5px -1.5px hsl(var(--shadow-color) / 0.25);

			&::before {
				content: '';
				position: absolute;
				top: 5px;
				left: 50%;
				width: 3em;
				height: 4px;
				border-radius: 2px;
				transform: translateX(-50%);
				background-color: var(--color-coral);
				opacity: 0.7;
			}
		}

		@media screen and (min-width: 680px) {
			border-left: 1px solid var(--color-coral);
		}
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not([data-user-color-scheme])) #comment {
			box-shadow: none;
		}
	}

	:global(html[data-user-color-scheme='dark']) #comment {
		box-shadow: none;
	}

	.scroll {
		contain: content;
		overflow: scroll;
		height: calc(100vh - 2.4em);
		padding-bottom: var(--spacing);
		scroll-behavior: smooth;

		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}

		@media screen and (max-width: 680px) {
			height: calc(100% - 60px);
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
