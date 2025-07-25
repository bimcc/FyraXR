import { defineConfig } from 'vite'
import fs from 'fs'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('localhost+2-key.pem'),
      cert: fs.readFileSync('localhost+2.pem'),
    },
    host: '0.0.0.0',
    port: 5173
  },
  // 确保public目录被正确处理
  publicDir: 'public',
  build: {
    // 确保sw.js被复制到构建输出
    rollupOptions: {
      input: {
        main: 'index.html',
        sw: 'public/sw.js'
      }
    }
  }
})