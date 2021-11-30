import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { browser } from '$app/env'

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