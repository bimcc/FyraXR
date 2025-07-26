import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs-extra' // 需要安装: npm install fs-extra --save-dev

export default defineConfig(({ command, mode }) => {
  // 使用相对路径而不是绝对路径
  const base = './' // 改为相对路径
  
  console.log(`🔧 Vite配置: mode=${mode}, base=${base}`)
  
  // 添加构建后钩子，复制静态资源和SW
  const copyFilesAfterBuild = () => {
    return {
      name: 'copy-files-after-build',
      closeBundle: async () => {
        try {
          // 确保目标目录存在
          await fs.ensureDir('dist/models')
          
          // 复制models目录
          console.log('📁 正在复制models目录到dist...')
          await fs.copy('models', 'dist/models', {
            overwrite: true,
            errorOnExist: false,
            recursive: true
          })
          
          // 复制Service Worker
          console.log('📄 正在复制Service Worker文件...')
          await fs.copy('sw.js', 'dist/sw.js', { overwrite: true })
          
          // 复制icon目录
          console.log('🖼️ 正在复制icon目录到dist...')
          await fs.ensureDir('dist/icon')
          await fs.copy('icon', 'dist/icon', { overwrite: true })
          
          // 复制manifest.json
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
          manualChunks: {
            three: ['three', 'three/examples/jsm/controls/OrbitControls.js'],
            '3d-tiles': ['3d-tiles-renderer']
          }
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