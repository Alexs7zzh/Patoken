import { getPostsByPagination } from './_ghost'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async ({ params }) => {
	const posts = await getPostsByPagination(Number(params.num))
	return {
		body: {
			posts
		}
	}
}
