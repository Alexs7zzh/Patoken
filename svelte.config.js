import path from 'path'
import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-static'
import autoprefixer from 'autoprefixer'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		cssHash: ({ hash, css }) => `s-${hash(css)}`
	},
	preprocess: preprocess({
		scss: {
			renderSync: true
		}
	}),
	kit: {
		prerender: {
			default: true
		},
		adapter: adapter({ pages: 'public' }),
		trailingSlash: 'never',
		vite: {
			resolve: {
				alias: {
					$components: path.resolve('./src/components')
				}
			},
			clearScreen: false,
			css: {
				postcss: {
					plugins: [autoprefixer()]
				}
			}
		}
	}
}

export default config
