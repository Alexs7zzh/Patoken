import { state, index, scrollToHighlight } from './comment'
import AnnotationGroup from '@alexs7/rough-notation'
import { wholeTextNodesInRange, removeHighlights } from './anchor/highlighter'
import { RangeAnchor, TextPositionAnchor, TextQuoteAnchor } from './anchor/types'
import { smoothScroll } from './utils'

import type { Comment } from '$lib/types'
import type { RoughAnnotationGroup } from '@alexs7/rough-notation/lib/model'

let Annotation

interface HighlightRangeOptions {
	animate?: boolean
	id?: number | null
	isEdit?: boolean
	postId?: string
}

function createAnnotation(): RoughAnnotationGroup {
	if (!Annotation) Annotation = AnnotationGroup()
	return Annotation
}

function scrollToComment({ target }) {
	const id = target.dataset.forComment
	if (!id) return
	if (window.innerWidth > 680) {
		const el = document.getElementById(`comment-${id}`)

		if (!el) return
		smoothScroll(el, window.innerHeight / 2, document.querySelector('.scroll'))
	} else {
		const comments = [...document.querySelectorAll('.scroll li')]
		let i = 0
		for (; i < comments.length; i++) if (comments[i].id === `comment-${id}`) break
		index.set(i)
		state.set(1)
		scrollToHighlight(id)
	}
}

function anchor(comment: Comment) {
	let position = null
	let quote = null
	let range = null

	const root = document.getElementById(comment.postId)

	for (let selector of comment.selectors) {
		switch (selector.type) {
			case 'TextPositionSelector':
				position = selector
				break
			case 'TextQuoteSelector':
				quote = selector
				break
			case 'RangeSelector':
				range = selector
				break
		}
	}

	try {
		let res = RangeAnchor.fromSelector(root, range).toRange()
		if (quote?.exact && res.toString() === quote.exact) return res
		else throw Error('RangeSelector does not match')
	} catch {
		try {
			let res = TextPositionAnchor.fromSelector(root, position).toRange()
			if (quote?.exact && res.toString() === quote.exact) return res
			else throw Error('TextPositionSelector does not match')
		} catch {
			try {
				let res = TextQuoteAnchor.fromSelector(root, quote).toRange()
				return res
			} catch {
				return null
			}
		}
	}
}

export function highlightComment(comment: Comment, options: HighlightRangeOptions = {}): string[] {
	const { animate = false, id = null, isEdit = false } = options

	const range = anchor(comment)
	const textNodes = wholeTextNodesInRange(range)
	// Group text nodes into spans of adjacent nodes. If a group of text nodes are
	// adjacent, we only need to create one highlight element for the group.
	let textNodeSpans = []
	let prevNode = null
	let currentSpan = null

	textNodes.forEach(node => {
		if (prevNode && prevNode.nextSibling === node) {
			currentSpan.push(node)
		} else {
			currentSpan = [node]
			textNodeSpans.push(currentSpan)
		}
		prevNode = node
	})

	// Filter out text node spans that consist only of white space. This avoids
	// inserting highlight elements in places that can only contain a restricted
	// subset of nodes such as table rows and lists.
	const whitespace = /^\s*$/
	textNodeSpans = textNodeSpans.filter(span =>
		// Check for at least one text node with non-space content.
		span.some(node => !whitespace.test(node.nodeValue))
	)

	const highlights = []
	textNodeSpans.forEach(nodes => {
		// A custom element name is used here rather than `<span>` to reduce the
		// likelihood of highlights being hidden by page styling.

		const highlightEl = document.createElement('span')
		highlightEl.className = isEdit ? 'edit-highlight' : 'highlight'
		if (id) highlightEl.dataset.forComment = String(id)

		nodes[0].parentNode.replaceChild(highlightEl, nodes[0])
		nodes.forEach(node => highlightEl.appendChild(node))

		highlights.push(highlightEl)
	})

	highlights.forEach(highlight => highlight.addEventListener('click', scrollToComment))

	const annotationInstance = createAnnotation()

	const annotation = highlights.map(h =>
		annotationInstance.add(h, {
			animate,
			className: isEdit ? 'edit-annotation' : 'annotation',
			commentId: String(id),
			rootId: options.postId
		})
	)

	return annotation
}

export function removeEditHighlights(annotationIds: string[]) {
	const highlights = Array.from(document.querySelectorAll('.edit-highlight'))
	highlights.forEach(h => h.removeEventListener('click', scrollToComment))
	removeHighlights(highlights)
	const annotationInstance = createAnnotation()
	annotationIds.forEach(id => annotationInstance.remove(id))
}

export function removeHighlightById(id: string, annotationIds: string[]) {
	const highlights = Array.from(document.querySelectorAll(`.highlight[data-for-comment="${id}"]`))
	highlights.forEach(h => h.removeEventListener('click', scrollToComment))
	removeHighlights(highlights)
	const annotationInstance = createAnnotation()
	annotationIds.forEach(id => annotationInstance.remove(id))
}
