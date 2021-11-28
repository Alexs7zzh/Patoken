import { TextRange, TextPosition } from './text-range'
import { nodeFromXPath, xpathFromNode } from './xpath'
import { matchQuote } from './match-quote'
import type { RangeSelector, TextPositionSelector, TextQuoteSelector } from '$lib/types'

export class RangeAnchor {
	root: Node
	range: Range

	constructor(root, range) {
		this.root = root
		this.range = range
	}

	static fromRange(root, range) {
		return new RangeAnchor(root, range)
	}

	static fromSelector(root, selector) {
		const startContainer = nodeFromXPath(selector.startContainer, root)
		if (!startContainer) {
			throw new Error('Failed to resolve startContainer XPath')
		}

		const endContainer = nodeFromXPath(selector.endContainer, root)
		if (!endContainer) {
			throw new Error('Failed to resolve endContainer XPath')
		}

		const startPos = TextPosition.fromCharOffset(startContainer, selector.startOffset)
		const endPos = TextPosition.fromCharOffset(endContainer, selector.endOffset)

		const range = new TextRange(startPos, endPos).toRange()
		return new RangeAnchor(root, range)
	}

	toRange() {
		return this.range
	}

	toSelector(): RangeSelector {
		const normalizedRange = TextRange.fromRange(this.range).toRange()

		const textRange = TextRange.fromRange(normalizedRange)
		const startContainer = xpathFromNode(textRange.start.element, this.root)
		const endContainer = xpathFromNode(textRange.end.element, this.root)

		return {
			type: 'RangeSelector',
			startContainer,
			startOffset: textRange.start.offset,
			endContainer,
			endOffset: textRange.end.offset
		}
	}
}

export class TextPositionAnchor {
	root: Element
	start: number
	end: number

	constructor(root, start, end) {
		this.root = root
		this.start = start
		this.end = end
	}

	static fromRange(root, range) {
		const textRange = TextRange.fromRange(range).relativeTo(root)
		return new TextPositionAnchor(root, textRange.start.offset, textRange.end.offset)
	}

	static fromSelector(root, selector) {
		return new TextPositionAnchor(root, selector.start, selector.end)
	}

	toSelector(): TextPositionSelector {
		return {
			type: 'TextPositionSelector',
			start: this.start,
			end: this.end
		}
	}

	toRange() {
		return TextRange.fromOffsets(this.root, this.start, this.end).toRange()
	}
}

interface Context {
	prefix?: string
	suffix?: string
}

export class TextQuoteAnchor {
	root: Element
	exact: string
	context: Context

	constructor(root, exact, context = {}) {
		this.root = root
		this.exact = exact
		this.context = context
	}

	static fromRange(root, range) {
		const text = /** @type {string} */ root.textContent
		const textRange = TextRange.fromRange(range).relativeTo(root)

		const start = textRange.start.offset
		const end = textRange.end.offset

		const contextLen = 32

		return new TextQuoteAnchor(root, text.slice(start, end), {
			prefix: text.slice(Math.max(0, start - contextLen), start),
			suffix: text.slice(end, Math.min(text.length, end + contextLen))
		})
	}

	static fromSelector(root, selector) {
		const { prefix, suffix } = selector
		return new TextQuoteAnchor(root, selector.exact, { prefix, suffix })
	}

	toSelector(): TextQuoteSelector {
		return {
			type: 'TextQuoteSelector',
			exact: this.exact,
			prefix: this.context.prefix,
			suffix: this.context.suffix
		}
	}

	toRange() {
		return this.toPositionAnchor().toRange()
	}

	toPositionAnchor() {
		const text = /** @type {string} */ this.root.textContent
		const match = matchQuote(text, this.exact, {
			...this.context
		})
		if (!match) {
			throw new Error('Quote not found')
		}
		return new TextPositionAnchor(this.root, match.start, match.end)
	}
}
