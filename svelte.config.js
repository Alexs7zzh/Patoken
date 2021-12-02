import path from 'path'
import preprocess from 'svelte-preprocess'
import vercel from '@sveltejs/adapter-vercel'
import autoprefixer from 'autoprefixer'

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
					$components: path.resolve('./src/components')
				}
			},
			clearScreen: false,
			optimizeDeps: {
				exclude: ['sswr']
			},
			css: {
				postcss: {
					plugins: [autoprefixer()]
				}
			}
		}
	}
}

export default config
