import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			manifest: {
				name: 'Irigasi Dashboard',
				short_name: 'Irigasi',
				start_url: '/',
				display: 'standalone',
				background_color: '#ffffff',
				theme_color: '#2563eb',
				icons: [
					{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
				]
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	},
	server: {
		host: true, // Allow external access (e.g., from ngrok)
		allowedHosts: ['.ngrok-free.app'], // Allow all ngrok subdomains

		// --- KONFIGURASI PROXY UNTUK ESP32 DIMULAI DI SINI ---
        proxy: {
            // Ketika SvelteKit melihat permintaan yang dimulai dengan '/api' 
            // (misalnya, fetch('/api/kontrol')),
            '/api': {
                // Permintaan akan dialihkan ke IP ESP32 Anda
                target: 'http://10.10.10.1', // <-- GANTI DENGAN IP ESP32 ANDA
                // Ini akan mengubah header Host dari 'localhost' menjadi IP target
                changeOrigin: true, 
                // Ini adalah kunci: akan menghapus '/api' dari path sebelum mengirim ke ESP32.
                // Jadi, '/api/kontrol' menjadi '/kontrol' saat dikirim ke 192.168.1.100.
                //rewrite: (path) => path.replace(/^\/api/, ''), 
            }
        }
        // --- KONFIGURASI PROXY SELESAI DI SINI ---
	},
	
});
