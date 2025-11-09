import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base_path = process.env.BASE_PATH || ''; 

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		/*** unutk github page*/
		/*
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		}
			*/
			//untuk internal esp32 
			adapter: adapter({
				// Path build tetap di 'build' (sesuai kebutuhan ESP32)
				pages: 'build', 
				assets: 'build',
				// Gunakan index.html sebagai fallback, lebih baik untuk SPA
				fallback: 'index.html', 
				precompress: false,
				strict: true
			}),
			
			// Penting untuk memastikan semua file statis di-generate
			prerender: {
				entries: ['*'] 
			},
	
			// Konfigurasi paths
			paths: {
				// Menggunakan variabel yang sudah ditentukan
				base: base_path, 
			}
	}
};

export default config;

