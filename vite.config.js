import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  const base = mode === 'production' ? '/FyraXR/' : '/'
  
  console.log(`🔧 Vite配置: mode=${mode}, base=${base}`)
  
  return {
    base,
    build: {
      outDir: 'dist',
      // 确保资源路径正确
      assetsDir: 'assets',
      // 生成相对路径
      rollupOptions: {
        output: {
          // 确保chunk文件名不包含绝对路径
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    }
  }
})