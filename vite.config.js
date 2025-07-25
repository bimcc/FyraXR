import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  const base = mode === 'production' ? '/FyraXR/' : '/'
  
  console.log(`🔧 Vite配置: mode=${mode}, base=${base}`)
  
  return {
    base,
    build: {
      outDir: 'dist'
    }
  }
})