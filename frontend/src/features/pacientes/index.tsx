import { useAuth } from '@/lib/auth'
import PatientsTable from '@/features/pacientes/components/pacientes-table'
import NotFoundPage from '@/features/errors/not-found'

export default function PacientesPage() {
  const { user, isLoading } = useAuth()

  // Mientras se determina el estado de autenticación, evitar render
  if (isLoading) return null

  // si no está autenticado, mostrar 404 (no exponer la página)
  if (!user) return <NotFoundPage />

  return (
    <div className="container mx-auto p-6">
      <PatientsTable />
    </div>
  )
}
