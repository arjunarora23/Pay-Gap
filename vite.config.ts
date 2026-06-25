import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Pay-Gap/',
  server: {
    historyApiFallback: true,
  } as never,
})
