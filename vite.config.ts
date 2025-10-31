import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const REPO_BASE = '/habit-tracker-aistudio/';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    const base = isProduction ? REPO_BASE : '/';

    return {
      base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'prompt',
          includeAssets: [
            'icons/app-icon.svg',
            'icons/pwa-192x192.png',
            'icons/pwa-512x512.png'
          ],
          devOptions: {
            enabled: true,
            suppressWarnings: true,
            navigateFallback: 'index.html'
          },
          manifest: {
            name: 'The Discipline Forge',
            short_name: 'Forge',
            description: 'Single-user habit tracker and progress dashboard.',
            start_url: REPO_BASE,
            scope: REPO_BASE,
            display: 'standalone',
            background_color: '#0f172a',
            theme_color: '#06b6d4',
            icons: [
              {
                src: 'icons/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'icons/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'icons/app-icon.svg',
                sizes: '256x256',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            navigateFallback: `${REPO_BASE}index.html`
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'recharts-vendor': ['recharts'],
            }
          }
        }
      }
    };
});
