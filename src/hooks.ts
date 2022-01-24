import { minify } from 'html-minifier'
import { prerendering } from '$app/env'
// import type { Handle } from '@sveltejs/kit'

const options = {
	removeAttributeQuotes: true,
	collapseBooleanAttributes: true,
	collapseWhitespace: true,
	removeComments: true,
	sortClassName: true,
	sortAttributes: true,
	html5: true,
	decodeEntities: true,
	minifyJS: true
}

export const handle = async ({ request /* event */, resolve }) => {
	const response = await resolve(request /* event */)

	if (prerendering && response.headers['content-type'] === 'text/html') response.body = minify(response.body, options)

	// if (prerendering && response.headers.get('content-type') === 'text/html')
	// 	return new Response(minify(await response.text(), options), {
	//    	status: response.status,
	//    	headers: response.headers
	//    })

	return response
}
