declare const self: ServiceWorkerGlobalScope

import { build, timestamp } from '$service-worker'

const FILES = `cache${timestamp}`
const staticAssets = new Set(build)

self.addEventListener('install', function (event) {
	event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function (event) {
	event.waitUntil(
		(async function () {
			//@ts-ignore
			if (self.registration.navigationPreload) await self.registration.navigationPreload.enable()
			const keys = await caches.keys()
			for (const key of keys) {
				if (key !== FILES) await caches.delete(key)
			}
			await self.clients.claim()
		})()
	)
})

self.addEventListener('fetch', function (event) {
	if (event.request.method !== 'GET' && !event.request.url.startsWith(self.location.origin)) return

	event.respondWith(
		(async function () {
			try {
				//@ts-ignore
				const preloadResponse = await event.preloadResponse
				if (preloadResponse) return preloadResponse

				const { pathname } = new URL(event.request.url)
				if (staticAssets.has(pathname)) {
					const cachedResponse = await caches.match(event.request)
					if (cachedResponse) return cachedResponse

					const response = await fetch(event.request)
					const cache = await caches.open(FILES)
					await cache.put(event.request, response.clone())
					return response
				} else {
					return await fetch(event.request)
				}
			} catch {
				return await fetch(event.request)
			}
		})()
	)
})
