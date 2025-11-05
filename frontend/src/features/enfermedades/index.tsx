import { useState, useEffect } from 'react'
import { Plus, Filter, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import DiseasesTable from '@/features/enfermedades/components/enfermedades-table'
import DiseaseModal from '@/features/enfermedades/components/crearEnfermedad-modal'
import type { Disease } from '@/features/enfermedades/components/enfermedades-table'
import NotFoundPage from '@/features/errors/not-found'

export default function EnfermedadesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)

  // Estados de filtros
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    nombre: '',
    categoria: '',
    severidad: ''
  })

  // Cargar enfermedades
  const fetchDiseases = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<{ status: string; data: Disease[] }>('/api/diseases')
      setDiseases(response.data || [])
    } catch (err: any) {
      setError(err.message || 'Error al cargar enfermedades')
      console.error('Error fetching diseases:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDiseases()
    }
  }, [user])

  const handleCreateDisease = () => {
    setEditingDisease(null)
    setShowModal(true)
  }

  const handleEditDisease = (disease: Disease) => {
    setEditingDisease(disease)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDisease(null)
  }

  const handleSaveDisease = async () => {
    await fetchDiseases()
    handleCloseModal()
  }

  const clearFilters = () => {
    setFilters({ nombre: '', categoria: '', severidad: '' })
  }

  const normalizeText = (text: string | undefined): string => {
    if (!text) return ''
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  // Filtrar enfermedades
  const filteredDiseases = diseases.filter(disease => {
    const matchNombre = normalizeText(disease.name).includes(normalizeText(filters.nombre))
    const matchCategoria = normalizeText(disease.category).includes(normalizeText(filters.categoria))
    const matchSeveridad = filters.severidad ? disease.severity === filters.severidad : true

    return matchNombre && matchCategoria && matchSeveridad
  })

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!user) return <NotFoundPage />

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Enfermedades</h1>
          <p className="text-base-content/70">Gestiona el catálogo de enfermedades del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setShowFilters(!showFilters)}
            title={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          >
            <Filter className="h-5 w-5" />
          </button>
          <button
            className="btn btn-primary btn-circle"
            onClick={handleCreateDisease}
            title="Crear enfermedad"
          >
            <Plus className="h-5 w-5" />
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
                <button className="btn btn-ghost btn-sm gap-2" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                  Limpiar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <span className="label-text">Categoría</span>
                </label>
                <input
                  type="text"
                  placeholder="Buscar por categoría..."
                  className="input input-bordered input-sm"
                  value={filters.categoria}
                  onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Severidad</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={filters.severidad}
                  onChange={(e) => setFilters({ ...filters, severidad: e.target.value })}
                >
                  <option value="">Todas</option>
                  <option value="leve">Leve</option>
                  <option value="moderada">Moderada</option>
                  <option value="grave">Grave</option>
                  <option value="crítica">Crítica</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <DiseasesTable diseases={filteredDiseases} onEdit={handleEditDisease} />

      {/* Contador */}
      <div className="mt-4 text-sm text-base-content/70 text-center">
        Mostrando {filteredDiseases.length} de {diseases.length} enfermedades
      </div>

      {/* Modal */}
      {showModal && (
        <DiseaseModal
          disease={editingDisease}
          onClose={handleCloseModal}
          onSave={handleSaveDisease}
        />
      )}
    </div>
  )
}
