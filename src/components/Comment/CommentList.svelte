<script lang="ts">
	import { flip } from 'svelte/animate'
	import { quintOut } from 'svelte/easing'
	import { fade } from 'svelte/transition'
	import Comment from './Comment.svelte'
	import { spring } from 'svelte/motion'
	import { state, index, scrollToHighlight } from '$lib/comment'
	import { onMount } from 'svelte'
	import { DragGesture } from '@use-gesture/vanilla'

	export let comments

	let ref
	let windowWidth = window.innerWidth
	let mobile = windowWidth <= 680
	let width = windowWidth * 0.9 - 10

	let position = spring(0)
	let scale = spring(1)
	let height = spring(0.5 * window.innerHeight)

	state.subscribe(s => {
		if (!mobile) return
		if (s === 1) {
			height.set(0)
			document.getElementsByTagName('main')[0].style.paddingBottom = '50vh'
		} else {
			height.set(0.5 * window.innerHeight)
			document.getElementsByTagName('main')[0].style.paddingBottom = null
		}
		if (s === 3) document.body.classList.add('noscroll')
		else document.body.classList.remove('noscroll')
	})
	index.subscribe(i => {
		position.set(-i * width)
	})

	onMount(() => {
		const gesture = new DragGesture(
			ref,
			({ last, active, movement: [mx, my], direction: [xDir, yDir], velocity: [, vy], cancel }) => {
				if (my < -60) cancel()
				if (last)
					if (my > window.innerHeight * 0.2 || (vy > 0.5 && yDir > 0)) state.set(0)
					else height.set(0)
				else height.set(my)

				if (active && Math.abs(mx) > width / 2) {
					let tmp = $index,
						len = $comments.length
					tmp = tmp + (xDir > 0 ? -1 : 1)
					tmp = tmp < 0 ? 0 : tmp > len - 1 ? len - 1 : tmp
					index.set(tmp)
					scrollToHighlight($comments[$index].id)
					cancel()
				}
				position.set((active ? mx : 0) - $index * width)
				scale.set(active ? 1 - Math.abs(mx) / width / 4 : 1)
			},
			{
				axis: 'lock',
				bounds: { top: 0 },
				rubberband: true
			}
		)

		const ro = new ResizeObserver(() => {
			if (window.innerWidth !== windowWidth) {
				windowWidth = window.innerWidth
				width = windowWidth * 0.9 - 10
				position.set(-$index * width)
				if (mobile !== windowWidth <= 680) {
					mobile = windowWidth <= 680
					state.set(0)
				}
			}
		})
		ro.observe(document.body)

		return () => {
			gesture.destroy()
			ro.disconnect()
		}
	})
</script>

<ul bind:this={ref} style={mobile ? `transform:translate3d(${$position}px,${$height}px,0)` : ''}>
	{#each $comments as comment, i (comment.id)}
		<li
			id={'comment-' + String(comment.id)}
			animate:flip={{ easing: quintOut }}
			in:fade
			style={mobile ? `transform:scale(${$scale});` : ''}>
			<Comment {comment} />
		</li>
	{/each}
</ul>

<style lang="scss">
	:global(body.noscroll) {
		touch-action: none;
		overflow: hidden;
		overscroll-behavior: contain;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		@media screen and (max-width: 680px) {
			position: fixed;
			left: 10vw;
			bottom: 20px;
			display: flex;
			flex-direction: row;
			gap: calc(10vw - 10px);
			touch-action: none;
		}
	}

	li {
		margin: 0;
		padding: var(--spacing-half) var(--spacing-half) var(--spacing);
		&:last-child {
			border-bottom: none;
		}
		@media screen and (min-width: 680px) {
			border-bottom: 1px solid var(--color-coral);
			padding: var(--spacing-half) var(--spacing) var(--spacing);
		}
		@media screen and (max-width: 680px) {
			flex-shrink: 0;
			width: 80vw;
			height: 40vh;
			overscroll-behavior: none;
			background-color: var(--color-eggshell);
			border-radius: 0.6em;
			user-select: none;
			--shadow-color: 0deg 0% 66%;
			box-shadow: 0.2px 0.3px 0.5px hsl(var(--shadow-color) / 0.06),
				1.1px 1.3px 2.4px -0.1px hsl(var(--shadow-color) / 0.19), 2.2px 2.7px 5px -0.3px hsl(var(--shadow-color) / 0.32),
				4.6px 5.6px 10.4px -0.4px hsl(var(--shadow-color) / 0.46);
		}
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not([data-user-color-scheme])) li {
			box-shadow: none;
			@media screen and (max-width: 680px) {
				background-color: var(--color-secondary-bg);
			}
		}
	}

	:global(html[data-user-color-scheme='dark']) li {
		box-shadow: none;
		@media screen and (max-width: 680px) {
			background-color: var(--color-secondary-bg);
		}
	}

	li:hover :global(.buttons) {
		opacity: 1;
		visibility: visible;
	}
</style>
