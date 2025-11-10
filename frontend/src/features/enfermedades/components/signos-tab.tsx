import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { Edit, X } from 'lucide-react'
import { apiClient } from '@/lib/api'
import CreateSignModal from './Signos/crearSigno-modal'
import EditSignModal from './Signos/editarSigno-modal'

export type Sign = {
  id?: number
  code: string
  name: string
  description?: string
  category: string
  measurement_unit?: string
  normal_range?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

type ImperativeHandle = {
  toggleFilters: () => void
  openCreate: () => void
}

export default forwardRef<ImperativeHandle, {}>(function SignsCatalog(_, ref) {
  const [signs, setSigns] = useState<Sign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ nombre: '', categoria: '', codigo: '' })
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSign, setEditingSign] = useState<Sign | null>(null)

  const searchTimerRef = useRef<number | null>(null)

  const fetchSigns = async (opts?: { page?: number; page_size?: number; filters?: typeof filters }) => {
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
      if (f.codigo) params.set('codigo', f.codigo)

      const url = `/api/signs?${params.toString()}`
      const res = await apiClient.get<{ 
        status: string
        data: Sign[]
        pagination?: { total_count: number; total_pages: number; page: number; page_size: number }
      }>(url)
      
      setSigns(res.data || [])
      setTotalCount(res.pagination?.total_count ?? 0)
    } catch (err: any) {
      setError(err.message || 'Error al cargar signos clínicos')
    } finally { 
      setLoading(false) 
    }
  }

  // Cargar inicial
  useEffect(() => { 
    fetchSigns({ page: 1, page_size: pageSize })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce en filtros: esperar 1 segundo antes de hacer la petición
  useEffect(() => {
    setCurrentPage(1)
    
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
    }
    
    searchTimerRef.current = window.setTimeout(() => {
      fetchSigns({ page: 1, page_size: pageSize, filters })
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
    fetchSigns({ page: currentPage, page_size: pageSize })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  useImperativeHandle(ref, () => ({
    toggleFilters: () => setShowFilters(s => !s),
    openCreate: () => { setEditingSign(null); setShowCreateModal(true) },
    isFiltersVisible: () => showFilters
  }))

  const openEdit = (s: Sign) => { setEditingSign(s); setShowCreateModal(true) }
  const handleClose = () => { setShowCreateModal(false); setEditingSign(null) }
  const handleSave = async () => { await fetchSigns(); handleClose() }

  if (loading) return (<div className="flex justify-center items-center h-48"><span className="loading loading-spinner loading-lg"></span></div>)

  return (
    <div>
      {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

      {showFilters && (
        <div className="card bg-base-200 shadow-lg mb-4">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-lg">Filtros</h3>
              {(filters.nombre || filters.categoria || filters.codigo) && (
                <button className="btn btn-ghost btn-sm gap-2" onClick={() => setFilters({ nombre: '', categoria: '', codigo: '' })}>
                  <X className="h-4 w-4" /> Limpiar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control flex flex-col">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Código</span></label>
                <input type="text" placeholder="Ej: SG001..." className="input input-bordered input-sm" value={filters.codigo} onChange={e => setFilters({ ...filters, codigo: e.target.value })} />
              </div>
              <div className="form-control flex flex-col">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Nombre</span></label>
                <input type="text" placeholder="Buscar por nombre..." className="input input-bordered input-sm" value={filters.nombre} onChange={e => setFilters({ ...filters, nombre: e.target.value })} />
              </div>
              <div className="form-control flex flex-col">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Categoría</span></label>
                <input type="text" placeholder="Buscar por categoría..." className="input input-bordered input-sm" value={filters.categoria} onChange={e => setFilters({ ...filters, categoria: e.target.value })} />
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
              <th>Categoría</th>
              <th>Unidad de Medida</th>
              <th>Rango Normal</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {signs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-base-content/50">No hay signos clínicos registrados</td>
              </tr>
            ) : (
              signs.map((sign) => (
                <tr key={sign.code} className="hover">
                  <td className="font-mono font-semibold">{sign.code}</td>
                  <td className="font-semibold">{sign.name}</td>
                  <td className="max-w-xs"><p className="text-sm line-clamp-2">{sign.description || 'Sin descripción'}</p></td>
                  <td><span className="badge badge-outline">{sign.category}</span></td>
                  <td className="text-sm">{sign.measurement_unit || <span className="text-base-content/50 italic">N/A</span>}</td>
                  <td className="text-sm">{sign.normal_range || <span className="text-base-content/50 italic">N/A</span>}</td>
                  <td className="text-center">
                    <button className="btn btn-ghost btn-sm btn-circle" onClick={() => openEdit(sign)} title="Editar signo"><Edit className="h-4 w-4" /></button>
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
        {totalCount === 0 ? `Mostrando 0 de 0 signos` : (() => { 
          const start = (currentPage - 1) * pageSize + 1
          const end = Math.min(currentPage * pageSize, totalCount)
          return `Mostrando ${start}-${end} de ${totalCount} signos`
        })()}
      </div>

      {showCreateModal && (editingSign ? <EditSignModal sign={editingSign} onClose={handleClose} onSave={handleSave} /> : <CreateSignModal onClose={handleClose} onSave={handleSave} />)}
    </div>
  )
})
