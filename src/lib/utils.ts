import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { browser } from '$app/env'
import { cubicInOut } from 'svelte/easing'

function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
	if (!browser) return defaultValue
	const value = localStorage.getItem(key)
	if (value) return JSON.parse(value)
	return defaultValue
}

export const createPersistentStore = <T>(key: string, initialValue: T): Writable<T> => {
	const store = writable(loadFromLocalStorage(key, initialValue))
	store.subscribe(value => {
		if (browser && value) localStorage.setItem(key, JSON.stringify(value))
	})
	return store
}

export const smoothScroll = (target, offset = 0, container = undefined) => {
	const getDocumentHeight = () => {
		return Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight,
			document.body.offsetHeight,
			document.documentElement.offsetHeight,
			document.body.clientHeight,
			document.documentElement.clientHeight
		)
	}

	const duration = 500
	const clock = Date.now()
	const start = container ? container.scrollTop : window.pageYOffset
	let end = 0,
		element

	if (typeof target === 'number') {
		end = target
	} else {
		element = target
		const { height } = element.getBoundingClientRect()

		let tmp = element
		if (tmp.offsetParent) {
			do {
				end += tmp.offsetTop
				tmp = tmp.offsetParent
			} while (tmp)
		}
		end = Math.max(end - offset + height / 2, 0)
		end = Math.min(end, (container ? container.scrollHeight : getDocumentHeight()) - window.innerHeight)
	}

	const currentPosition = elapsed => {
		if (elapsed > duration) return end
		return start + (end - start) * cubicInOut(elapsed / duration)
	}

	const step = () => {
		const elapsed = Date.now() - clock
		const position = currentPosition(elapsed)
		if (container) container.scrollTo(0, position)
		else window.scrollTo(0, position)
		if (elapsed > duration) return
		window.requestAnimationFrame(step)
	}
	window.requestAnimationFrame(step)
}
