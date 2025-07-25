import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  const base = mode === 'production' ? '/FyraXR/' : '/'
  
  console.log(`🔧 Vite配置: mode=${mode}, base=${base}`)
  
  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // 关键：确保生成相对路径
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      // 添加这个配置来确保相对路径
      cssCodeSplit: false
    },
    // 确保开发和生产环境的一致性
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `'./${filename}'` }
        } else {
          return { relative: true }
        }
      }
    }
  }
})