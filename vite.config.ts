import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base 通过环境变量注入：本地为 "/"，GitHub Pages 子路径部署时传
// VITE_BASE=/meark-blocks/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
