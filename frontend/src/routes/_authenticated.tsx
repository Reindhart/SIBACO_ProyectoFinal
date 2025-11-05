import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    // Verificar si hay token en localStorage (no podemos usar hooks aquí)
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { isLoading } = useAuth()

  // Mostrar un loading mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return <Outlet />
}
