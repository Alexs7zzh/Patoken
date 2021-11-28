import { getAuthors } from './_ghost'
import type { Author } from '$lib/types'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async () => {
	const authors = await getAuthors()
	return {
		body: authors as Author[]
	}
}
