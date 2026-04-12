import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['react-native', 'expo-secure-store'],
  },
  base: './',
  build:{
    outDir: 'dist-react'
  },
  server: {
    port:5123,
    strictPort: true
  },
  resolve: {
    alias: {
      '@commons': path.resolve(__dirname, '../commons'),
    }
  }
})
