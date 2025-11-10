import { Link } from '@tanstack/react-router'
import { ThemeSelector } from './ThemeSelector'
import { useAuth } from '@/lib/auth'
import { ShieldCheck, LogIn, House, Hospital, Users, PersonStanding } from 'lucide-react'

/**
 * Componente de avatar circular con iniciales
 */
function UserAvatar({ firstName, lastName }: { firstName?: string; lastName?: string }) {
  const getInitials = () => {
    const first = firstName?.charAt(0).toUpperCase() || ''
    const last = lastName?.charAt(0).toUpperCase() || ''
    return first + last || 'U'
  }

  return (
    <div className="avatar placeholder">
      <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
        <span className="text-sm font-bold">{getInitials()}</span>
      </div>
    </div>
  )
}

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div className="navbar bg-base-200 shadow-lg">
      <div className="navbar-start">
        <a href="/" className="btn btn-ghost text-xl">
          <ShieldCheck className="h-6 w-6" />
          <span className="hidden sm:inline">Diagnóstico Médico</span>
        </a>
      </div>
      
      {/* Mientras se resuelve la sesión no mostrar enlaces dependientes */}
      {!isLoading && isAuthenticated && (
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to="/dashboard"><House />Inicio</Link>
            </li>
            <li>
              <Link to="/pacientes"><PersonStanding />Pacientes</Link>
            </li>
            <li>
              <Link to="/enfermedades"><Hospital />Catálogo Médico</Link>
            </li>
            {user?.role === 'admin' && (
              <li>
                <Link to="/admin/usuarios"><Users />Usuarios</Link>
              </li>
            )}
          </ul>
        </div>
      )}
      
      <div className="navbar-end gap-2">
        <ThemeSelector />
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <UserAvatar firstName={user?.first_name} lastName={user?.last_name} />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="menu-title">
                <span>{user?.full_name || user?.username}</span>
                <span className="text-xs opacity-60">{user?.role === 'admin' ? 'Administrador' : 'Médico'}</span>
              </li>
              <li>
                <Link to="/" className="justify-between">
                  Perfil
                  <span className="badge">Nuevo</span>
                </Link>
              </li>
              <li><a>Configuración</a></li>
              <li><a onClick={handleLogout}>Cerrar Sesión</a></li>
            </ul>
          </div>
        ) : (
          <Link to="/sign-in" className="btn btn-primary btn-sm gap-2">
            <LogIn className="h-4 w-4" />
            Iniciar Sesión
          </Link>
        )}
      </div>
    </div>
  )
}
