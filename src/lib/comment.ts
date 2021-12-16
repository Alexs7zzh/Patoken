import { writable, derived } from 'svelte/store'
import { wholeTextNodesInRange } from './anchor/highlighter'
import { RangeAnchor, TextPositionAnchor, TextQuoteAnchor } from './anchor/types'
import { getContext } from 'svelte'

import { browser } from '$app/env'
import { smoothScroll } from './utils'
import { swr } from './swr'
import { refreshInterval, refreshOnFocus, refreshOnReconnect } from './swr/plugin'

import type { RangeSelector, TextPositionSelector, TextQuoteSelector } from './types'
import type { Comment } from '$lib/types'
import type { Writable } from 'svelte/store'

export const currentComment = writable<Comment | null>(null)

export function rangeToCurrentComment(range: Range): Comment | null {
	const textNodes = wholeTextNodesInRange(range).map(node => {
		let parent = node.parentElement
		while (parent.tagName !== 'P') parent = parent.parentElement
		return { node, parent }
	})

	let quote = '',
		content = ''
	textNodes.forEach(({ node, parent }, index) => {
		if (index === 0) content += node.data
		else {
			if (parent === textNodes[index - 1].parent) content += node.data
			else {
				quote += `<p>${content}</p>`
				content = node.data
			}
		}
	})
	quote += `<p>${content}</p>`

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
			: localStorage.getItem('selected') === '考察'
			? 'BEFORE'
			: 'AFTER'
	}
}

export function commentStore(path: string) {
	let store, url
	if (browser) {
		if (path === '' || path.startsWith('page')) {
			const postsOnPage = getContext('postsOnPage') as Record<string, string[]>
			const posts = postsOnPage[`/${path}`]
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
			},
			plugins: [refreshInterval({ interval: 60000 }), refreshOnFocus(), refreshOnReconnect()]
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

export function editComment(comment) {
	currentComment.set(comment)
}

export function scrollToHighlight(id: number) {
	const highlight = document.querySelector(`.highlight[data-for-comment="${id}"]`) as HTMLElement
	if (!highlight) return

	let offset = window.innerHeight / (window.innerWidth >= 680 ? 2 : 4)
	smoothScroll(highlight, offset)
}

export const state = writable<number>(0)
export const index = writable<number>(0)
