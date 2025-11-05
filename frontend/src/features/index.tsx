import { Link } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  CheckCircle, 
  TrendingUp,
  ClipboardCheck,
  Lightbulb,
  FileText,
  BarChart3,
  Code,
  Server
} from 'lucide-react'

export default function Index() {
  const { isAuthenticated, user, isLoading } = useAuth()

  // Mostrar spinner mientras carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  // Si está autenticado, mostrar enlace al dashboard en vez de formularios
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl">
            <ShieldCheck className="h-16 w-16 text-primary-content" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
          Sistema de Diagnóstico Médico
        </h1>
        
        <p className="text-xl text-base-content/70">
          Motor de Inferencia para Diagnóstico Clínico Inteligente
        </p>

        <div className="divider"></div>

        <p className="text-lg leading-relaxed">
          Sistema experto basado en conocimientos que ayuda a los profesionales de la salud 
          en el proceso de diagnóstico médico mediante análisis de <strong>síntomas</strong>, 
          <strong> signos clínicos</strong>, <strong>pruebas de laboratorio</strong> y 
          <strong> estudios post-mortem</strong>.
        </p>

        {isAuthenticated ? (
          <div className="space-y-4 pt-6">
            <div className="alert alert-success">
              <CheckCircle className="h-6 w-6" />
              <span>Bienvenido, <strong>{user?.full_name || user?.username}</strong></span>
            </div>
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                <TrendingUp className="h-5 w-5" />
                Ir al Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center pt-6">
            <Link to="/sign-in">
              <Button size="lg" className="gap-2">
                <LogIn className="h-5 w-5" />
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button variant="outline" size="lg" className="gap-2">
                <UserPlus className="h-5 w-5" />
                Crear Cuenta
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Características del Sistema */}
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-8">Características del Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Gestión de Pacientes</CardTitle>
              <CardDescription>
                Registro completo de información médica, historial y datos demográficos de cada paciente.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2 */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-lg">Motor de Inferencia</CardTitle>
              <CardDescription>
                Algoritmo inteligente que analiza síntomas, signos y pruebas para sugerir diagnósticos probables.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3 */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Base de Conocimientos</CardTitle>
              <CardDescription>
                Amplio catálogo de enfermedades, síntomas, signos clínicos y pruebas diagnósticas.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 4 */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-info" />
              </div>
              <CardTitle className="text-lg">Seguimiento Clínico</CardTitle>
              <CardDescription>
                Historial detallado de diagnósticos, tratamientos y evolución de cada paciente.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Tecnologías */}
      <div className="w-full max-w-4xl pt-8">
        <div className="divider">Tecnologías Utilizadas</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-base-200 shadow-xl">
            <CardContent className="pt-6">
              <h3 className="card-title text-primary mb-4">
                <Code className="h-6 w-6" />
                Frontend
              </h3>
              <ul className="space-y-2">
                {['React 19 + TypeScript', 'TanStack Router', 'Tailwind CSS v4', 'DaisyUI + shadcn/ui'].map((tech) => (
                  <li key={tech} className="flex items-center gap-2">
                    <div className="badge badge-primary badge-sm"></div>
                    <span className="text-sm">{tech}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-base-200 shadow-xl">
            <CardContent className="pt-6">
              <h3 className="card-title text-secondary mb-4">
                <Server className="h-6 w-6" />
                Backend
              </h3>
              <ul className="space-y-2">
                {['Flask 3 + Python', 'SQLAlchemy + SQLite', 'JWT Authentication', 'Motor de Inferencia'].map((tech) => (
                  <li key={tech} className="flex items-center gap-2">
                    <div className="badge badge-secondary badge-sm"></div>
                    <span className="text-sm">{tech}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
