import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Pay-Gap/',
  server: {
    historyApiFallback: true,
    proxy: {
      '/mono': {
        target: 'https://hrisrefactoringroutinedev1.devtest.catalystone.dev',
        changeOrigin: true,
        secure: true,
      },
    },
  } as never,
})
