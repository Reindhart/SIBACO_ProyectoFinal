import { useAuth } from '@/lib/auth'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export type Patient = {
  id: string
  first_name: string
  last_name: string
  middle_name?: string
  diagnoses: string[]
}

export type Disease = {
  id: string
  name: string
  signs?: string
  symptoms?: string
  treatments?: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const role = user?.role || 'doctor'

  // por ahora solo navegación desde el dashboard hacia páginas dedicadas

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Bienvenido, <strong>{user?.full_name || user?.username}</strong></p>

      {role === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Administra y consulta los pacientes. Aquí puedes ver el historial y crear diagnósticos.</p>
              <div className="flex gap-2">
                <Link to="/pacientes/pacientes">
                  <Button>Ir a Pacientes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enfermedades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Consulta y administra el catálogo de enfermedades y sus tratamientos.</p>
              <div>
                <Link to="/enfermedades/enfermedades">
                  <Button variant="outline">Ir a Enfermedades</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Gestiona usuarios del sistema: roles, datos y acceso.</p>
              <Link to="/admin/usuarios/usuarios">
                <Button>Ir a Usuarios</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Administra y consulta los pacientes. Aquí puedes ver el historial y crear diagnósticos.</p>
              <div className="flex gap-2">
                <Link to="/pacientes/pacientes">
                  <Button>Ir a Pacientes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enfermedades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Consulta y administra el catálogo de enfermedades y sus tratamientos.</p>
              <div>
                <Link to="/enfermedades/enfermedades">
                  <Button variant="outline">Ir a Enfermedades</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
