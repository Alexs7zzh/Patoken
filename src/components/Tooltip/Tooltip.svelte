<script lang="ts">
	import { createPopper } from '@popperjs/core/lib/popper-lite'
	import flip from '@popperjs/core/lib/modifiers/flip';
	import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
	import offset from '@popperjs/core/lib/modifiers/offset';
	import { onMount } from 'svelte'
	import { currentComment, rangeToCurrentComment } from '$lib/comment'

	let tooltip,
		popper = null // reference to element
	let range = null,
		show = false

	const virtualElement = {
		getBoundingClientRect: () => range.getBoundingClientRect()
	}

	const destroyPopper = () => {
		show = false
		if (popper !== null) popper.destroy()
		popper = null
	}

	const handler = () => {
		const selection = document.getSelection()
		const tmpRange = selection && selection.rangeCount && selection.getRangeAt(0)
		if (
			!tmpRange ||
			tmpRange.collapsed ||
			!document.querySelector('main').contains(tmpRange.commonAncestorContainer) ||
			(tmpRange.commonAncestorContainer.nodeName !== '#text' &&
				tmpRange.commonAncestorContainer.nodeName !== 'ARTICLE' &&
				tmpRange.commonAncestorContainer.nodeName !== 'P')
		) {
			setTimeout(destroyPopper, 200)
		} else {
			range = tmpRange
			show = true
			if (popper === null) {
				popper = createPopper(virtualElement, tooltip, {
					placement: window.matchMedia('(max-width: 680px)').matches ? 'bottom' : 'top',
					modifiers: [
						preventOverflow,
						{
							...flip,
							options: {
								padding: 60
							}
						},
						{
							...offset,
							options: { offset: [0, 12] }
						}
					]
				})
			}
			console.log(range.getBoundingClientRect())
			popper.update()
		}
	}

	onMount(() => {
		document.addEventListener('selectionchange', handler)
		return () => document.removeEventListener('selectionchange', handler)
	})

	const addComment = () => {
		const comment = rangeToCurrentComment(range)
		if (comment !== null) {
			currentComment.set(comment)
			document.getSelection().removeAllRanges()
		}
		destroyPopper()
	}
</script>

<div id="tooltip" role="tooltip" bind:this={tooltip} class:hidden={!show} on:click={addComment}>Comment</div>

<style lang="scss">
	#tooltip {
		background-color: var(--color-eggshell);
		color: var(--color-black);
		padding: 0.2em 0.4em;
		border-radius: 0.2em;
		border: none;
		font-size: 1em;
		cursor: pointer;
		transition: background-color 0.4s ease-out;
		user-select: none;

		&.hidden {
			visibility: hidden;
			pointer-events: none;
		}

		&:hover {
			background-color: var(--color-melon);
		}
	}
</style>
