import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base 用相对路径：既能部署到 <user>.github.io/<repo>/，也能部署到自定义域名根路径。
// 需要固定前缀时通过 VITE_BASE 覆盖，例如 VITE_BASE=/meark-blocks/
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
