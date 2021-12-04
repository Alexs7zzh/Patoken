<script lang="ts">
	import { computePosition, shift, offset } from '@floating-ui/dom'
	import { onMount } from 'svelte'
	import { currentComment, rangeToCurrentComment } from '$lib/comment'

	let tooltip
	let range = null
	let mobile = false

	const virtualElement = {
		getBoundingClientRect: () => range.getBoundingClientRect(),
		contextElement: document.getElementsByTagName('main')[0]
	}

	const update = () => {
		computePosition(virtualElement, tooltip, {
			placement: mobile ? 'bottom' : 'top',
			middleware: [shift({ padding: 12 }), offset(12)]
		}).then(({ x, y }) => {
			tooltip.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
		})
	}

	const resizeObserver = new ResizeObserver(() => {
		mobile = window.innerWidth < 680
		update()
	})

	function showTooltip() {
		tooltip.style.display = 'block'
		update()
		resizeObserver.observe(document.body)
	}

	function hideTooltip() {
		tooltip.style.display = ''
		resizeObserver.unobserve(document.body)
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
			setTimeout(hideTooltip, 200)
		} else {
			range = tmpRange
			showTooltip()
		}
	}

	onMount(() => {
		mobile = window.innerWidth < 680
		document.addEventListener('selectionchange', handler)
		return () => {
			document.removeEventListener('selectionchange', handler)
			resizeObserver.disconnect()
		}
	})

	const addComment = () => {
		const comment = rangeToCurrentComment(range)
		if (comment !== null) {
			currentComment.set(comment)
			document.getSelection().removeAllRanges()
		}
		hideTooltip()
	}
</script>

<div id="tooltip" role="tooltip" bind:this={tooltip} on:click={addComment}>Comment</div>

<style lang="scss">
	#tooltip {
		display: none;
		position: absolute;
		top: 0;
		left: 0;
		background-color: var(--color-blue);
		color: var(--color-black);
		padding: 0.1em 0.4em;
		border-radius: 0.5em;
		border: none;
		font-size: 0.9em;
		cursor: pointer;
		transition: background-color 0.4s ease-out;
		user-select: none;

		&:hover {
			background-color: var(--color-melon);
		}
	}
</style>
