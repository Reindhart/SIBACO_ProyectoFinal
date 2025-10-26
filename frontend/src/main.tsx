import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Establecer título de la aplicación desde la variable de entorno Vite (VITE_APP_TITLE)
// Usamos "any" para evitar errores de tipado si no se han declarado tipos de Vite
const appTitle = ((import.meta as any).env?.VITE_APP_TITLE as string) || 'React-Flask Template'
try {
  if (typeof document !== 'undefined') document.title = appTitle
} catch (e) {
  // en entornos sin DOM (tests/SSR) no hacemos nada
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
