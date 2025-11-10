import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { Edit, X } from 'lucide-react'
import { apiClient } from '@/lib/api'
import CreateDiseaseModal from './Enfermedades/crearEnfermedad-modal'
import EditDiseaseModal from './Enfermedades/editarEnfermedad-modal'

export type Disease = {
  code: string
  name: string
  description?: string
  category: string
  severity?: string
  treatment_recommendations?: string
  prevention_measures?: string
  symptoms?: Array<{ code: string; name: string }>
  signs?: Array<{ code: string; name: string }>
  is_active?: boolean
}

type ImperativeHandle = {
  toggleFilters: () => void
  openCreate: () => void
}

export default forwardRef<ImperativeHandle, {}>(function DiseasesCatalog(_, ref) {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ nombre: '', categoria: '', severidad: '', codigo: '' })
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)

  const searchTimerRef = useRef<number | null>(null)

  const fetchDiseases = async (opts?: { page?: number; page_size?: number; filters?: typeof filters }) => {
    const page = opts?.page ?? currentPage
    const page_size = opts?.page_size ?? pageSize
    const f = opts?.filters ?? filters
    
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('page_size', String(page_size))
      if (f.nombre) params.set('nombre', f.nombre)
      if (f.categoria) params.set('categoria', f.categoria)
      if (f.severidad) params.set('severidad', f.severidad)
      if (f.codigo) params.set('codigo', f.codigo)

      const url = `/api/diseases?${params.toString()}`
      const res = await apiClient.get<{ 
        status: string
        data: Disease[]
        pagination?: { total_count: number; total_pages: number; page: number; page_size: number }
      }>(url)
      
      setDiseases(res.data || [])
      setTotalCount(res.pagination?.total_count ?? 0)
    } catch (err: any) {
      setError(err.message || 'Error al cargar enfermedades')
    } finally { 
      setLoading(false) 
    }
  }

  // Cargar inicial
  useEffect(() => { 
    fetchDiseases({ page: 1, page_size: pageSize })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce en filtros: esperar 1 segundo antes de hacer la petición
  useEffect(() => {
    setCurrentPage(1)
    
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
    }
    
    searchTimerRef.current = window.setTimeout(() => {
      fetchDiseases({ page: 1, page_size: pageSize, filters })
      searchTimerRef.current = null
    }, 1000)
    
    return () => {
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // Recargar cuando cambie página o tamaño de página
  useEffect(() => {
    fetchDiseases({ page: currentPage, page_size: pageSize })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  useImperativeHandle(ref, () => ({
    toggleFilters: () => setShowFilters(s => !s),
    openCreate: () => { setEditingDisease(null); setShowCreateModal(true) },
    isFiltersVisible: () => showFilters
  }))

  const openEdit = (d: Disease) => { setEditingDisease(d); setShowCreateModal(true) }
  const handleCloseModal = () => { setShowCreateModal(false); setEditingDisease(null) }
  const handleSave = async () => { await fetchDiseases(); handleCloseModal() }

  // Presentational helpers
  const renderBulletList = (text?: string) => {
    if (!text) return <span className="text-base-content/50 text-sm italic">No especificado</span>
    const items = text.split('\n').filter(i => i.trim())
    if (items.length === 0) return <span className="text-base-content/50 text-sm italic">No especificado</span>
    return (<ul className="list-disc list-inside space-y-1">{items.map((it, idx) => <li key={idx} className="text-sm">{it.trim()}</li>)}</ul>)
  }

  const renderRelationList = (items?: Array<{ code: string; name: string }>) => {
    if (!items || items.length === 0) return <span className="text-base-content/50 text-sm italic">No especificados</span>
    return (<ul className="list-disc list-inside space-y-1">{items.map(it => <li key={it.code} className="text-sm">{it.name}</li>)}</ul>)
  }

  const severityBadge = (severity?: string) => {
    const colors: Record<string,string> = { 'leve': 'badge-success', 'moderada': 'badge-warning', 'grave': 'badge-error', 'crítica': 'badge-error' }
    return (<span className={`badge ${colors[severity as keyof typeof colors] || 'badge-ghost'}`}>{severity || 'No especificada'}</span>)
  }

  if (loading) return (<div className="flex justify-center items-center h-48"><span className="loading loading-spinner loading-lg"></span></div>)

  return (
    <div>
      {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

      {showFilters && (
        <div className="card bg-base-200 shadow-lg mb-4">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-lg">Filtros</h3>
              {(filters.nombre || filters.categoria || filters.severidad || filters.codigo) && (
                <button className="btn btn-ghost btn-sm gap-2" onClick={() => setFilters({ nombre: '', categoria: '', severidad: '', codigo: '' })}>
                  <X className="h-4 w-4" /> Limpiar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="form-control flex flex-col">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Código</span></label>
                <input type="text" placeholder="Ej: ENF001..." className="input input-bordered input-sm" value={filters.codigo} onChange={e => setFilters({ ...filters, codigo: e.target.value })} />
              </div>
              <div className="form-control flex flex-col">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Nombre</span></label>
                <input type="text" placeholder="Buscar por nombre..." className="input input-bordered input-sm" value={filters.nombre} onChange={e => setFilters({ ...filters, nombre: e.target.value })} />
              </div>
              <div className="form-control flex flex-col">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Categoría</span></label>
                <input type="text" placeholder="Buscar por categoría..." className="input input-bordered input-sm" value={filters.categoria} onChange={e => setFilters({ ...filters, categoria: e.target.value })} />
              </div>
              <div className="form-control flex flex-col">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Severidad</span></label>
                <select className="select select-bordered select-sm" value={filters.severidad} onChange={e => setFilters({ ...filters, severidad: e.target.value })}>
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

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="table w-full">
          <thead className="bg-base-200">
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Severidad</th>
              <th>Categoría</th>
              <th>Síntomas</th>
              <th>Signos</th>
              <th>Tratamientos</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {diseases.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-base-content/50">No hay enfermedades registradas</td>
              </tr>
            ) : (
              diseases.map((disease) => (
                <tr key={disease.code} className="hover">
                  <td className="font-mono font-semibold">{disease.code}</td>
                  <td className="font-semibold">{disease.name}</td>
                  <td className="max-w-xs"><p className="text-sm line-clamp-3">{disease.description || 'Sin descripción'}</p></td>
                  <td>{severityBadge(disease.severity)}</td>
                  <td><span className="badge badge-outline">{disease.category}</span></td>
                  <td className="max-w-xs">{renderRelationList(disease.symptoms)}</td>
                  <td className="max-w-xs">{renderRelationList(disease.signs)}</td>
                  <td className="max-w-xs">{renderBulletList(disease.treatment_recommendations)}</td>
                  <td className="text-center">
                    <button className="btn btn-ghost btn-circle btn-sm" onClick={() => openEdit(disease)} title="Editar enfermedad">
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-base-content/70">Mostrar</label>
          <select className="select select-bordered select-sm" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
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

      <div className="mt-4 text-sm text-base-content/70 text-center">
        {totalCount === 0 ? 'Mostrando 0 de 0 enfermedades' : (() => { 
          const start = (currentPage - 1) * pageSize + 1
          const end = Math.min(currentPage * pageSize, totalCount)
          return `Mostrando ${start}-${end} de ${totalCount} enfermedades`
        })()}
      </div>

      {showCreateModal && (editingDisease ? <EditDiseaseModal disease={editingDisease} onClose={handleCloseModal} onSave={handleSave} /> : <CreateDiseaseModal onClose={handleCloseModal} onSave={handleSave} />)}
    </div>
  )
})
