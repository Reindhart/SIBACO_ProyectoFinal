import { useState, useEffect, useMemo } from 'react'
import { UserPlus, Edit, Filter, FunnelX, X } from 'lucide-react'
import CrearUsuarioModal from './crearUsuario-modal'
import EditarUsuarioModal from './editarUsuario-modal'
import { apiClient } from '@/lib/api'

type UserItem = {
  id: number
  username: string
  email: string
  role: 'admin' | 'doctor'
  first_name?: string
  second_name?: string
  paternal_surname?: string
  maternal_surname?: string
  phone?: string
  is_active: boolean
}

export default function UsersCrud() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  
  // Estados de filtros
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    username: '',
    role: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  })
  
  // Paginación
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Cargar usuarios desde la base de datos
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      // IMPORTANTE: Siempre cargar TODOS los usuarios para que los filtros funcionen correctamente
      const response = await apiClient.get<{ status: string; data: UserItem[] }>('/api/users')
      // La respuesta del backend tiene formato { status: 'success', data: [...] }
      setUsers(response.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al cargar usuarios')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])
  
  // Resetear a página 1 cuando cambien los filtros (sin debounce, sin recargar)
  useEffect(() => {
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // Función para normalizar texto (sin acentos, minúsculas)
  const normalizeText = (text: string | undefined): string => {
    if (!text) return ''
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchUsername = normalizeText(user.username).includes(normalizeText(filters.username))
      const matchRole = !filters.role || user.role === filters.role
      const matchNombre = normalizeText(user.first_name).includes(normalizeText(filters.nombre))
      const matchApellidoPaterno = normalizeText(user.paternal_surname).includes(normalizeText(filters.apellidoPaterno))
      const matchApellidoMaterno = normalizeText(user.maternal_surname).includes(normalizeText(filters.apellidoMaterno))
      
      return matchUsername && matchRole && matchNombre && matchApellidoPaterno && matchApellidoMaterno
    })
  }, [users, filters])

  // Paginación: calcular slice
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  if (currentPage > totalPages) setCurrentPage(1)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleCreate = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEdit = (user: UserItem) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSave = async () => {
    await fetchUsers()
    handleCloseModal()
  }

  const clearFilters = () => {
    setFilters({
      username: '',
      role: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-base-content/70">Gestiona los usuarios del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn btn-ghost btn-circle ${showFilters ? 'btn-active' : ''}`}
            onClick={() => {
              if (showFilters) {
                // Solo limpiar filtros si hay alguno activo
                if (hasActiveFilters) {
                  clearFilters()
                }
                setShowFilters(false)
              } else {
                setShowFilters(true)
              }
              setCurrentPage(1)
            }}
            title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          >
            {showFilters ? <FunnelX className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
          </button>
          <button
            className="btn btn-primary btn-circle"
            onClick={handleCreate}
            title="Crear usuario"
          >
            <UserPlus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="card bg-base-200 shadow-lg mb-4">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-lg">Filtros</h3>
              {hasActiveFilters && (
                <button
                  className="btn btn-ghost btn-sm gap-2"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Usuario</span>
                </label>
                <input
                  type="text"
                  placeholder="Buscar por usuario..."
                  className="input input-bordered input-sm"
                  value={filters.username}
                  onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Rol</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="admin">Administrador</option>
                  <option value="doctor">Médico</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nombre</span>
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="input input-bordered input-sm"
                  value={filters.nombre}
                  onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Apellido Paterno</span>
                </label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="input input-bordered input-sm"
                  value={filters.apellidoPaterno}
                  onChange={(e) => setFilters({ ...filters, apellidoPaterno: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Apellido Materno</span>
                </label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="input input-bordered input-sm"
                  value={filters.apellidoMaterno}
                  onChange={(e) => setFilters({ ...filters, apellidoMaterno: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="table w-full">
          <thead className="bg-base-200">
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/50">
                  {hasActiveFilters ? 'No se encontraron usuarios con los filtros aplicados' : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                          <span className="text-sm font-bold">{user.username.substring(0, 2).toUpperCase()}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">{user.username}</div>
                        <div className="text-sm text-base-content/70">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                      {user.role === 'admin' ? 'Administrador' : user.role === 'doctor' ? 'Médico' : user.role}
                    </span>
                  </td>
                  <td>
                    {user.first_name || '-'} {user.second_name || ''}
                  </td>
                  <td>{user.paternal_surname || '-'}</td>
                  <td>{user.maternal_surname || '-'}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-ghost btn-circle btn-sm"
                      onClick={() => handleEdit(user)}
                      title="Editar usuario"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-base-content/70">Mostrar</label>
          <select
            className="select select-bordered select-sm"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-base-content/70">por página</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</button>
          <span className="text-sm">Página {currentPage} de {totalPages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente</button>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mt-4 text-sm text-base-content/70 text-center">
        {filteredUsers.length === 0 ? (
          'Mostrando 0 de 0 usuarios'
        ) : (
          (() => {
            const start = (currentPage - 1) * pageSize + 1
            const end = Math.min(currentPage * pageSize, filteredUsers.length)
            return `Mostrando ${start}-${end} de ${filteredUsers.length} usuarios`
          })()
        )}
      </div>

      {/* Modales */}
      {isModalOpen && !editingUser && (
        <CrearUsuarioModal
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}

      {isModalOpen && editingUser && (
        <EditarUsuarioModal
          user={editingUser}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
