import { minify } from 'html-minifier'

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

export const handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPage: ({ html }) => minify(html, options)
	})

	return response
}
