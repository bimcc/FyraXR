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
      // 拷贝public文件夹内容到dist根目录
      copyPublicDir: true,
      // 添加这个配置来确保相对路径
      cssCodeSplit: false
    },
    // 确保生成的HTML文件使用相对路径
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js' || hostType === 'html') {
          return { relative: true };
        }
        return { relative: true };
      }
    }
  }
})