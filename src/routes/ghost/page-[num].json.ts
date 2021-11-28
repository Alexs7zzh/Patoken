import { getPostsByPagination, getPaginationUrls } from './_ghost'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async ({ params }) => {
	const urls = await getPaginationUrls()
	const posts = await getPostsByPagination(Number(params.num))
	return {
		body: {
			urls,
			posts
		}
	}
}
