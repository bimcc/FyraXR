import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs-extra'

export default defineConfig(({ command, mode }) => {
  const base = './'
  
  console.log(`🔧 Vite配置: mode=${mode}, base=${base}`)
  
  const copyFilesAfterBuild = () => {
    return {
      name: 'copy-files-after-build',
      closeBundle: async () => {
        try {
          await fs.ensureDir('dist/models')
          console.log('📁 正在复制models目录到dist...')
          await fs.copy('models', 'dist/models', {
            overwrite: true,
            errorOnExist: false,
            recursive: true
          })
          
          console.log('📄 正在复制Service Worker文件...')
          await fs.copy('sw.js', 'dist/sw.js', { overwrite: true })
          
          console.log('🖼️ 正在复制icon目录到dist...')
          await fs.ensureDir('dist/icon')
          await fs.copy('icon', 'dist/icon', { overwrite: true })
          
          console.log('📄 正在复制manifest.json...')
          if (fs.existsSync('manifest.json')) {
            await fs.copy('manifest.json', 'dist/manifest.json', { overwrite: true })
          }
          
          console.log('✅ 文件复制完成!')
        } catch (err) {
          console.error('❌ 复制文件时出错:', err)
        }
      }
    }
  }
  
  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // 移除 manualChunks 配置，让所有代码打包到一个文件中
          // manualChunks: undefined,
          format: 'es',
          // 关键：使用内联动态导入，避免模块分离
          inlineDynamicImports: true
        }
      },
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false
        }
      },
      cssCodeSplit: false
    },
    optimizeDeps: {
      include: ['three', '3d-tiles-renderer']
    },
    plugins: [
      copyFilesAfterBuild()
    ]
  }
})