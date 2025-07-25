import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  // ngrok使用根路径，GitHub Pages使用子路径
  const base = mode === 'production' ? '/FyraXR/' : '/'
  
  return {
    base,
    build: {
      outDir: 'dist'
    }
  }
})