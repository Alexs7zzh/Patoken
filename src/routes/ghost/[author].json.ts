import { getAsidePostsByAuthor, getPostsByAuthor } from './_ghost'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async ({ params }) => {
	const posts = await getPostsByAuthor(params.author)
	const toc = await getAsidePostsByAuthor(params.author)
	return {
		body: {
			posts,
			toc
		}
	}
}
