import path from 'path'
import preprocess from 'svelte-preprocess'
import vercel from '@sveltejs/adapter-vercel'

const config = {
	preprocess: preprocess({
		scss: {
			renderSync: true
		}
	}),
	kit: {
		target: '#svelte',
		adapter: vercel({ precompress: true }),
		vite: {
			resolve: {
				alias: {
					$utils: path.resolve('./src/utils'),
					$components: path.resolve('./src/components')
				}
			},
			clearScreen: false,
			optimizeDeps: {
				exclude: ['sswr']
			}
		}
	}
}

export default config
