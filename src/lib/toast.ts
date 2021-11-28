import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

export interface Toast {
	id: string
	message: string
	type: 'info' | 'warn'
	duration: number
}

export const toastStore: Writable<Toast[]> = writable([])

/**
 *
 * @param msg Toast message, can be any HTML.
 * @param type Toast type ('info' or 'warn')
 * @param removeAfter Time in milliseconds the toast will be displayed
 * @returns id of Toast
 */
export function addToast(message: string, type: Toast['type'] = 'info', duration = 3000): string {
	const id = new Date().valueOf() + message
	toastStore.update(all => [
		{
			id,
			message,
			type,
			duration
		},
		...all
	])

	if (duration > 0) setTimeout(() => removeToast(id), duration)

	return id
}

export function removeToast(id: string): void {
	toastStore.update(all => all.filter(toast => toast.id !== id))
}
