import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: 'autoUpdate',
      manifest: {
        name: 'RentTrack',
        short_name: 'RentTrack',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1A56DB',
        icons: [{ src: '/vite.svg', sizes: '192x192', type: 'image/png' }]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
})