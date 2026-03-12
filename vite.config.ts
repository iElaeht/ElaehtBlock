import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Eliminamos tailwindcss de aquí porque usaremos la versión estable (v3)
export default defineConfig({
  plugins: [react()],
})