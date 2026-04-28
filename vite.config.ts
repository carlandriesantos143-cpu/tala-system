import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // DITO TAYO NAG-MERGE: Ginamit natin ang totoong icon file mo
      includeAssets: ['tala-logo.ico'], 
      manifest: {
        name: 'TALA — Health Decision Support',
        short_name: 'TALA',
        description: 'Triage and Localized health Assistance para sa Barangay Malinta',
        theme_color: '#0D9488',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          // Pinalitan natin para tugma sa file na meron ka na sa public folder
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],

        screenshots: [
          {
            src: '/screenshot-mobile.png',
            sizes: '804x683',
            type: 'image/png',
            form_factor: 'narrow' // Ito yung para sa mobile warning
          },
          {
            src: '/screenshot-desktop.png',
            sizes: '852x522',
            type: 'image/png',
            form_factor: 'wide' // Ito yung para sa desktop warning
          }
        ]
      },
      workbox: {
        // Cache app shell (JS, CSS, HTML, at Icons)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        // ETO YUNG MAGANDANG DINAGDAG NI CLAUDE: Supabase API Backup Caching
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours lang itatago
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})