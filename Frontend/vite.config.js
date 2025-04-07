import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      global: 'window',
      '@': path.resolve(__dirname, './src'),
      '@admin': path.resolve(__dirname, './src/admin'),
      '@user': path.resolve(__dirname, './src/user'),
      '@models': path.resolve(__dirname, './src/models')
    },
    define: {
      'process.env': process.env
    }
  }
})