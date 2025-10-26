import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Navbar } from '@/components/Navbar'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
})
