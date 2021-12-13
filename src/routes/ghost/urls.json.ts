import { getPaginationUrls } from './_ghost'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async () => {
	const res = await getPaginationUrls()
	return {
		body: {
			...res
		}
	}
}
