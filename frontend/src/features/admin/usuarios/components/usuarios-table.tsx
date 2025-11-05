import { useState, useEffect, useMemo } from 'react'
import { UserPlus, Edit, Filter, X } from 'lucide-react'
import UserModal from './UserModal'
import { apiClient } from '@/lib/api'

type UserItem = {
  id: number
  username: string
  email: string
  role: 'admin' | 'doctor'
  first_name?: string
  last_name?: string
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
    apellido: ''
  })

  // Cargar usuarios desde la base de datos
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
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
      const matchApellido = normalizeText(user.last_name).includes(normalizeText(filters.apellido))
      
      return matchUsername && matchRole && matchNombre && matchApellido
    })
  }, [users, filters])

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
      apellido: ''
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
            className="btn btn-ghost btn-circle"
            onClick={() => setShowFilters(!showFilters)}
            title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <Filter className="h-5 w-5" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <span className="label-text">Apellido</span>
                </label>
                <input
                  type="text"
                  placeholder="Buscar por apellido..."
                  className="input input-bordered input-sm"
                  value={filters.apellido}
                  onChange={(e) => setFilters({ ...filters, apellido: e.target.value })}
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
              <th>Apellido</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-base-content/50">
                  {hasActiveFilters ? 'No se encontraron usuarios con los filtros aplicados' : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
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
                      {user.role === 'admin' ? 'Administrador' : 'Médico'}
                    </span>
                  </td>
                  <td>{user.first_name || '-'}</td>
                  <td>{user.last_name || '-'}</td>
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

      {/* Contador de resultados */}
      <div className="mt-4 text-sm text-base-content/70 text-center">
        Mostrando {filteredUsers.length} de {users.length} usuarios
      </div>

      {/* Modal */}
      {isModalOpen && (
        <UserModal
          user={editingUser}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
