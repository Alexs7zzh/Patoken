import path from 'path'
import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-static'
import autoprefixer from 'autoprefixer'

const config = {
	compilerOptions: {
		cssHash: ({ hash, css }) => `s-${hash(css)}`
	},
	prerender: {
		concurrency: 2
	},
	preprocess: preprocess({
		scss: {
			renderSync: true
		}
	}),
	kit: {
		adapter: adapter({ pages: 'public' }),
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
