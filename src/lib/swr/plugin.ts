import type { Readable } from 'svelte/store'

export type SWRPlugin = (arg: {
	key: string
	data: Readable<unknown>
	error: Readable<Error | undefined>
	refresh: () => void
}) => () => void

type RefreshIntervalOptions = {
	interval: number
}

export function refreshInterval({ interval }: RefreshIntervalOptions): SWRPlugin {
	return ({ refresh }) => {
		let timer = setInterval(refresh, interval)
		const addTimer = () => {
			clearInterval(timer)
			timer = setInterval(refresh, interval)
		}
		const removeTimer = () => {
			clearInterval(timer)
		}
		window.addEventListener('focus', addTimer)
		window.addEventListener('blur', removeTimer)
		return () => {
			removeTimer()
			window.removeEventListener('focus', addTimer)
			window.removeEventListener('blur', removeTimer)
		}
	}
}

export function refreshOnFocus(): SWRPlugin {
	return ({ refresh }) => {
		const handler = () => refresh()
		window.addEventListener('focus', handler)
		return () => window.removeEventListener('focus', handler)
	}
}

export function refreshOnReconnect(): SWRPlugin {
	return ({ refresh }) => {
		const handler = () => refresh()
		window.addEventListener('online', handler)
		return () => window.removeEventListener('online', handler)
	}
}
