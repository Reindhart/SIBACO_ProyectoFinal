import { createRouter, RouterProvider } from '@tanstack/react-router'

// Importar las rutas generadas
import { routeTree } from './routeTree.gen'

// Crear la instancia del router
const router = createRouter({ routeTree })

// Registrar el tipo del router para type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return <RouterProvider router={router} />
}

export default App
