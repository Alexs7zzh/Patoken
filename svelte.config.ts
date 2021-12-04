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
		adapter: vercel(),
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
