export type Author = {
	slug: string
	name: string
}

export type Post = {
	slug: string
	title: string
	html: string
	author: string
	authorSlug: string
}

export type AsidePost = [
	string,
	Array<{
		slug: string
		title: string
	}>
]

export interface TextQuoteSelector {
	type: string
	exact: string
	prefix: string
	suffix: string
}

export interface TextPositionSelector {
	type: string
	start: number
	end: number
}

export interface RangeSelector {
	type: string
	startContainer: string
	startOffset: number
	endContainer: string
	endOffset: number
}

export interface Comment {
	id?: number
	text: string
	quote: string
	postId: string
	postAuthor?: string
	selectors: [RangeSelector, TextPositionSelector, TextQuoteSelector]
	author?: string
	updatedAt?: string
	category?: 'BEFORE' | 'AFTER'
}
