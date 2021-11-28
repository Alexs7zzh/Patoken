function getNodeName(node) {
	const nodeName = node.nodeName.toLowerCase()
	let result = nodeName
	if (nodeName === '#text') {
		result = 'text()'
	}
	return result
}

function getNodePosition(node) {
	let pos = 0
	/** @type {Node|null} */
	let tmp = node
	while (tmp) {
		if (tmp.nodeName === node.nodeName) {
			pos += 1
		}
		tmp = tmp.previousSibling
	}
	return pos
}

function getPathSegment(node) {
	const name = getNodeName(node)
	const pos = getNodePosition(node)
	return `${name}[${pos}]`
}

export function xpathFromNode(node, root) {
	let xpath = ''

	/** @type {Node|null} */
	let elem = node
	while (elem !== root) {
		if (!elem) {
			throw new Error('Node is not a descendant of root')
		}
		xpath = getPathSegment(elem) + '/' + xpath
		elem = elem.parentNode
	}
	xpath = '/' + xpath
	xpath = xpath.replace(/\/$/, '') // Remove trailing slash

	return xpath
}

function nthChildOfType(element, nodeName, index) {
	nodeName = nodeName.toUpperCase()

	let matchIndex = -1
	for (let i = 0; i < element.children.length; i++) {
		const child = element.children[i]
		if (child.nodeName.toUpperCase() === nodeName) {
			++matchIndex
			if (matchIndex === index) {
				return child
			}
		}
	}

	return null
}

function evaluateSimpleXPath(xpath, root) {
	const isSimpleXPath = xpath.match(/^(\/[A-Za-z0-9-]+(\[[0-9]+\])?)+$/) !== null
	if (!isSimpleXPath) {
		throw new Error('Expression is not a simple XPath')
	}

	const segments = xpath.split('/')
	let element = root

	// Remove leading empty segment. The regex above validates that the XPath
	// has at least two segments, with the first being empty and the others non-empty.
	segments.shift()

	for (let segment of segments) {
		let elementName
		let elementIndex

		const separatorPos = segment.indexOf('[')
		if (separatorPos !== -1) {
			elementName = segment.slice(0, separatorPos)

			const indexStr = segment.slice(separatorPos + 1, segment.indexOf(']'))
			elementIndex = parseInt(indexStr) - 1
			if (elementIndex < 0) {
				return null
			}
		} else {
			elementName = segment
			elementIndex = 0
		}

		const child = nthChildOfType(element, elementName, elementIndex)
		if (!child) {
			return null
		}

		element = child
	}

	return element
}

export function nodeFromXPath(xpath, root = document.body) {
	try {
		return evaluateSimpleXPath(xpath, root)
	} catch (err) {
		return document.evaluate(
			'.' + xpath,
			root,

			// nb. The `namespaceResolver` and `result` arguments are optional in the spec
			// but required in Edge Legacy.
			null /* namespaceResolver */,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null /* result */
		).singleNodeValue
	}
}
