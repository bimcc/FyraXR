import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  // 使用相对路径而不是绝对路径
  const base = './' // 改为相对路径
  
  console.log(`🔧 Vite配置: mode=${mode}, base=${base}`)
  
  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      cssCodeSplit: false
    }
  }
})