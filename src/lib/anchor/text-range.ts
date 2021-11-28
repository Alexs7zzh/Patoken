function nodeTextLength(node) {
	switch (node.nodeType) {
		case Node.ELEMENT_NODE:
		case Node.TEXT_NODE:
			return /** @type {string} */ node.textContent.length
		default:
			return 0
	}
}

function previousSiblingsTextLength(node) {
	let sibling = node.previousSibling
	let length = 0
	while (sibling) {
		length += nodeTextLength(sibling)
		sibling = sibling.previousSibling
	}
	return length
}

function resolveOffsets(element, ...offsets) {
	let nextOffset = offsets.shift()
	const nodeIter = /** @type {Document} */ element.ownerDocument.createNodeIterator(element, NodeFilter.SHOW_TEXT)
	const results = []

	let currentNode = nodeIter.nextNode()
	let textNode
	let length = 0

	while (nextOffset !== undefined && currentNode) {
		textNode = /** @type {Text} */ currentNode
		if (length + textNode.data.length > nextOffset) {
			results.push({ node: textNode, offset: nextOffset - length })
			nextOffset = offsets.shift()
		} else {
			currentNode = nodeIter.nextNode()
			length += textNode.data.length
		}
	}

	while (nextOffset !== undefined && textNode && length === nextOffset) {
		results.push({ node: textNode, offset: textNode.data.length })
		nextOffset = offsets.shift()
	}

	if (nextOffset !== undefined) {
		throw new RangeError('Offset exceeds text length')
	}

	return results
}

export let RESOLVE_FORWARDS = 1
export let RESOLVE_BACKWARDS = 2

export class TextPosition {
	element: Element
	offset: number

	constructor(element, offset) {
		if (offset < 0) {
			throw new Error('Offset is invalid')
		}

		this.element = element
		this.offset = offset
	}

	relativeTo(parent) {
		if (!parent.contains(this.element)) {
			throw new Error('Parent is not an ancestor of current element')
		}

		let el = this.element
		let offset = this.offset
		while (el !== parent) {
			offset += previousSiblingsTextLength(el)
			el = /** @type {Element} */ el.parentElement
		}

		return new TextPosition(el, offset)
	}

	resolve({ direction }) {
		try {
			return resolveOffsets(this.element, this.offset)[0]
		} catch (err) {
			if (this.offset === 0 && direction !== undefined) {
				const tw = document.createTreeWalker(this.element.getRootNode(), NodeFilter.SHOW_TEXT)
				tw.currentNode = this.element
				const forwards = direction === RESOLVE_FORWARDS
				const text = /** @type {Text|null} */ forwards ? tw.nextNode() : tw.previousNode()
				if (!text) {
					throw err
				}
				//@ts-ignore
				return { node: text, offset: forwards ? 0 : text.data.length }
			} else {
				throw err
			}
		}
	}

	static fromCharOffset(node, offset) {
		switch (node.nodeType) {
			case Node.TEXT_NODE:
				return TextPosition.fromPoint(node, offset)
			case Node.ELEMENT_NODE:
				return new TextPosition(/** @type {Element} */ node, offset)
			default:
				throw new Error('Node is not an element or text node')
		}
	}

	static fromPoint(node, offset) {
		switch (node.nodeType) {
			case Node.TEXT_NODE: {
				if (offset < 0 || offset > /** @type {Text} */ node.data.length) {
					throw new Error('Text node offset is out of range')
				}

				if (!node.parentElement) {
					throw new Error('Text node has no parent')
				}

				// Get the offset from the start of the parent element.
				const textOffset = previousSiblingsTextLength(node) + offset

				return new TextPosition(node.parentElement, textOffset)
			}
			case Node.ELEMENT_NODE: {
				if (offset < 0 || offset > node.childNodes.length) {
					throw new Error('Child node offset is out of range')
				}

				// Get the text length before the `offset`th child of element.
				let textOffset = 0
				for (let i = 0; i < offset; i++) {
					textOffset += nodeTextLength(node.childNodes[i])
				}

				return new TextPosition(/** @type {Element} */ node, textOffset)
			}
			default:
				throw new Error('Point is not in an element or text node')
		}
	}
}

export class TextRange {
	start: TextPosition
	end: TextPosition

	constructor(start, end) {
		this.start = start
		this.end = end
	}

	relativeTo(element) {
		return new TextRange(this.start.relativeTo(element), this.end.relativeTo(element))
	}

	toRange() {
		let start
		let end

		if (this.start.element === this.end.element && this.start.offset <= this.end.offset) {
			// Fast path for start and end points in same element.
			;[start, end] = resolveOffsets(this.start.element, this.start.offset, this.end.offset)
		} else {
			start = this.start.resolve({ direction: RESOLVE_FORWARDS })
			end = this.end.resolve({ direction: RESOLVE_BACKWARDS })
		}

		const range = new Range()
		range.setStart(start.node, start.offset)
		range.setEnd(end.node, end.offset)
		return range
	}

	static fromRange(range) {
		const start = TextPosition.fromPoint(range.startContainer, range.startOffset)
		const end = TextPosition.fromPoint(range.endContainer, range.endOffset)
		return new TextRange(start, end)
	}

	static fromOffsets(root, start, end) {
		return new TextRange(new TextPosition(root, start), new TextPosition(root, end))
	}
}
