import { minify } from 'html-minifier'
import { prerendering } from '$app/env'

export async function handle({ request, resolve }) {
	const response = await resolve(request)

	if (prerendering && response.headers['content-type'] === 'text/html')
		response.body = minify(response.body, {
			removeAttributeQuotes: true,
			collapseBooleanAttributes: true,
			collapseWhitespace: true,
			removeComments: true,
			sortClassName: true,
			sortAttributes: true,
			html5: true,
			decodeEntities: true,
			minifyJS: true
		})

	return response
}
