import { writable, derived } from 'svelte/store'
import { annotate, annotationGroup } from '@alexs7/rough-notation'
import { wholeTextNodesInRange, removeHighlights } from './anchor/highlighter'
import { RangeAnchor, TextPositionAnchor, TextQuoteAnchor } from './anchor/types'
import { getContext } from 'svelte'

import { browser } from '$app/env'
import { swr } from '$lib/swr'

import type { RangeSelector, TextPositionSelector, TextQuoteSelector } from './types'
import type { Comment } from '$lib/types'
import type { Writable } from 'svelte/store'

export const currentComment = writable<Comment | null>(null)

interface HighlightRangeOptions {
	animate?: boolean
	id?: number | null
	isEdit?: boolean
}

function scrollToComment({ target }) {
	const id = target.dataset.forComment
	if (!id) return
	const el = document.getElementById(`comment-${id}`)
	if (el)
		el.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		})
}

export function highlightRange(range: Range, options: HighlightRangeOptions = {}) {
	const { animate = false, id = null, isEdit = false } = options

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

	let annotation
	if (highlights.length === 1 && highlights[0].textContent.length <= 8 && highlights[0].getClientRects().length === 1) {
		annotation = annotate(highlights[0], {
			type: 'box',
			animate,
			className: isEdit ? 'edit-annotation' : 'annotation',
			commentId: String(id)
		})
		annotation.show()
	} else {
		annotation = highlights.map(h =>
			annotate(h, {
				type: 'underline',
				multiline: true,
				animate,
				className: isEdit ? 'edit-annotation' : 'annotation',
				commentId: String(id)
			})
		)
		const ag = annotationGroup(annotation)
		ag.show()
	}
}

export function removeEditHighlights() {
	const highlights = Array.from(document.querySelectorAll('.edit-highlight'))
	highlights.forEach(h => h.removeEventListener('click', scrollToComment))
	removeHighlights(highlights)
	const annotations = Array.from(document.querySelectorAll('.edit-annotation'))
	annotations.forEach(a => a.remove())
}

export function removeAllHighlights() {
	const highlights = Array.from(document.querySelectorAll('.highlight'))
	highlights.forEach(h => h.removeEventListener('click', scrollToComment))
	removeHighlights(highlights)
	const annotations = Array.from(document.querySelectorAll('.annotation'))
	annotations.forEach(a => a.remove())
}

export function removeHighlightById(id: string) {
	const highlights = Array.from(document.querySelectorAll(`.highlight[data-for-comment="${id}"]`))
	highlights.forEach(h => h.removeEventListener('click', scrollToComment))
	removeHighlights(highlights)
	const annotations = Array.from(document.querySelectorAll(`.annotation[data-for-comment="${id}"]`))
	annotations.forEach(a => a.remove())
}

export function rangeToCurrentComment(range: Range): Comment | null {
	const textNodes = wholeTextNodesInRange(range)
	const quote = textNodes
		.map(node => {
			let parent = node.parentElement
			if (parent.tagName === 'SPAN') parent = parent.parentElement
			const wrapEl = document.createElement(parent.tagName)
			wrapEl.textContent = node.data
			return wrapEl.outerHTML
		})
		.join('')

	const root = range.startContainer.parentElement.closest('article')
	const types = [RangeAnchor, TextPositionAnchor, TextQuoteAnchor]
	const result = []
	for (let type of types) {
		try {
			const anchor = type.fromRange(root, range)
			result.push(anchor.toSelector())
		} catch (error) {
			continue
		}
	}

	return {
		text: '',
		quote,
		postId: root.id,
		postAuthor: root.dataset.author,
		selectors: result as [RangeSelector, TextPositionSelector, TextQuoteSelector],
		category: !localStorage.getItem('selected')
			? 'BEFORE'
			: localStorage.getItem('selected') === '0'
			? 'BEFORE'
			: 'AFTER'
	}
}

export function anchor(comment: Comment) {
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

		res = TextPositionAnchor.fromSelector(root, position).toRange()
		if (quote?.exact && res.toString() === quote.exact) return res

		res = TextQuoteAnchor.fromSelector(root, quote).toRange()
		return res
	} catch (err) {
		return null
	}
}

export function commentStore(path: string) {
	let store, url
	if (browser) {
		if (path === '' || path.startsWith('page')) {
			const posts = getContext('posts') as String[]
			url = `${import.meta.env.VITE_API_URL}/comment?${posts.map(i => `id=${i}`).join('&')}`
		} else url = `${import.meta.env.VITE_API_URL}/comment?author=${path}`

		store = swr<Comment[]>(url, {
			fetcher: async url => {
				const comments = await fetch(url).then(r => r.json())
				const ids = Array.from(document.querySelectorAll('article')).map(i => i.id)
				comments.sort((a, b) => {
					const ida = ids.indexOf(a.postId),
						idb = ids.indexOf(b.postId)
					if (ida !== idb) return ida - idb
					return a.selectors[1].start - b.selectors[1].start
				})
				return comments
			}
		})

		const data = store.data as Writable<undefined | Comment[]>

		const before = derived(data, $data =>
			$data === undefined ? undefined : $data.filter(c => c.category === 'BEFORE')
		)
		const after = derived(data, $data => ($data === undefined ? undefined : $data.filter(c => c.category === 'AFTER')))

		return {
			...store,
			before,
			after
		}
	} else {
		store = swr(undefined)
		return store
	}
}
