import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // El generador sin marca de agua no se compila para el navegador: esa rama
  // desaparece del bundle. Ver el comentario de __PDF_SERVIDOR__ en src/pdf.ts.
  define: { __PDF_SERVIDOR__: "false" },
})
