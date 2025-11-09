import { useState, useEffect } from 'react'
import { Plus, Filter, FunnelX, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import DiseasesTable from '@/features/enfermedades/components/enfermedades-table'
import CreateDiseaseModal from '@/features/enfermedades/components/crearEnfermedad-modal'
import EditDiseaseModal from '@/features/enfermedades/components/editarEnfermedad-modal'
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
  
  // Paginación
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

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
  
  // Debounce para filtros: esperar 1 segundo después de que el usuario deje de escribir
  useEffect(() => {
    if (Object.values(filters).every(v => v === '')) {
      // Si todos los filtros están vacíos, no hacer nada
      return
    }
    
    const timeoutId = setTimeout(() => {
      // Resetear a página 1 cuando cambien los filtros
      setCurrentPage(1)
    }, 1000) // 1 segundo de debounce

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

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

  // Paginación: calcular slice
  const totalPages = Math.max(1, Math.ceil(filteredDiseases.length / pageSize))
  if (currentPage > totalPages) setCurrentPage(1)
  const paginatedDiseases = filteredDiseases.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
            className={`btn btn-ghost btn-circle ${showFilters ? 'btn-active' : ''}`}
            onClick={() => {
              if (showFilters) {
                clearFilters()
                setShowFilters(false)
              } else {
                setShowFilters(true)
              }
              setCurrentPage(1)
            }}
            title={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          >
            {showFilters ? <FunnelX className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
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
      <DiseasesTable diseases={paginatedDiseases} onEdit={handleEditDisease} />

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

      {/* Contador */}
      <div className="mt-4 text-sm text-base-content/70 text-center">
        {filteredDiseases.length === 0 ? (
          'Mostrando 0 de 0 enfermedades'
        ) : (
          (() => {
            const start = (currentPage - 1) * pageSize + 1
            const end = Math.min(currentPage * pageSize, filteredDiseases.length)
            return `Mostrando ${start}-${end} de ${filteredDiseases.length} enfermedades`
          })()
        )}
      </div>

      {/* Modales */}
      {showModal && !editingDisease && (
        <CreateDiseaseModal onClose={handleCloseModal} onSave={handleSaveDisease} />
      )}
      {showModal && editingDisease && (
        <EditDiseaseModal disease={editingDisease} onClose={handleCloseModal} onSave={handleSaveDisease} />
      )}
    </div>
  )
}
