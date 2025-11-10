import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { Edit, TestTube, FileText, Eye } from 'lucide-react'
import DatePickerCustom from '@/components/ui/date-picker'
import { apiClient } from '@/lib/api'
import CreateTestModal from './Pruebas/crearPrueba-modal'
import EditTestModal from './Pruebas/editarPrueba-modal'

export type Test = {
  id?: number
  code: string
  name: string
  description?: string
  category: string
  type: 'lab' | 'postmortem'
  normal_range?: string
  unit?: string
  findings_description?: string
  // Campos de PostmortemTest
  death_cause?: string
  disease_diagnosis?: string
  autopsy_date?: string
  macro_findings?: string
  histology?: string
  toxicology_results?: string
  genetic_results?: string
  pathologic_correlation?: string
  observations?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

type ImperativeHandle = { toggleFilters: () => void; openCreate: () => void }

export default forwardRef<ImperativeHandle, {}>(function TestsCatalog(_, ref) {
  const [labTests, setLabTests] = useState<Test[]>([])
  const [postmortemTests, setPostmortemTests] = useState<Test[]>([])
  const [labLoading, setLabLoading] = useState(false)
  const [postLoading, setPostLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showFilters, setShowFilters] = useState(false)
  // Filtros independientes por acordeón
  const [labFilters, setLabFilters] = useState({ nombre: '', categoria: '', tipo: '', codigo: '' })
  const [postFilters, setPostFilters] = useState({ nombre: '', categoria: '', tipo: '', codigo: '', disease: '', autopsy_date: '' })
  const [diseases, setDiseases] = useState<Array<{ code: string; name: string }>>([])
  // Paginación independiente por tipo
  const [labPageSize, setLabPageSize] = useState<number>(10)
  const [labCurrentPage, setLabCurrentPage] = useState<number>(1)
  const [labTotalCount, setLabTotalCount] = useState<number>(0)

  const [postPageSize, setPostPageSize] = useState<number>(10)
  const [postCurrentPage, setPostCurrentPage] = useState<number>(1)
  const [postTotalCount, setPostTotalCount] = useState<number>(0)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const labSearchTimerRef = useRef<number | null>(null)
  const postSearchTimerRef = useRef<number | null>(null)

  const fetchLabTests = async (opts?: { page?: number; page_size?: number; filters?: typeof labFilters }) => {
    const page = opts?.page ?? labCurrentPage
    const page_size = opts?.page_size ?? labPageSize
  const f = opts?.filters ?? labFilters
    try {
      setLabLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('page_size', String(page_size))
      if (f.nombre) params.set('nombre', f.nombre)
      if (f.categoria) params.set('categoria', f.categoria)
      if (f.codigo) params.set('codigo', f.codigo)

      const labRes = await apiClient.get<{
        status: string
        data: Test[]
        pagination?: { total_count: number; total_pages: number; page: number; page_size: number }
      }>(`/api/lab-tests?${params.toString()}`)

      const labTestsData = (labRes.data || []).map(t => ({ ...t, type: 'lab' as const }))
      setLabTests(labTestsData)
      setLabTotalCount(labRes.pagination?.total_count ?? 0)
    } catch (err: any) {
      setError(err.message || 'Error al cargar pruebas de laboratorio')
    } finally {
      setLabLoading(false)
    }
  }

  const fetchPostmortemTests = async (opts?: { page?: number; page_size?: number; filters?: typeof postFilters }) => {
    const page = opts?.page ?? postCurrentPage
    const page_size = opts?.page_size ?? postPageSize
  const f = opts?.filters ?? postFilters
    try {
      setPostLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('page_size', String(page_size))
  if (f.nombre) params.set('nombre', f.nombre)
  if (f.categoria) params.set('categoria', f.categoria)
  if (f.codigo) params.set('codigo', f.codigo)
  if (f.disease) params.set('disease', f.disease)
  if (f.autopsy_date) params.set('autopsy_date', f.autopsy_date)

      const postRes = await apiClient.get<{
        status: string
        data: Test[]
        pagination?: { total_count: number; total_pages: number; page: number; page_size: number }
      }>(`/api/postmortem-tests?${params.toString()}`)

      const postmortemTestsData = (postRes.data || []).map(t => ({ ...t, type: 'postmortem' as const }))
      setPostmortemTests(postmortemTestsData)
      setPostTotalCount(postRes.pagination?.total_count ?? 0)
    } catch (err: any) {
      setError(err.message || 'Error al cargar pruebas post-mortem')
    } finally {
      setPostLoading(false)
    }
  }

  useEffect(() => {
    // cargar ambas tablas al inicio
    fetchLabTests({ page: 1, page_size: labPageSize })
    fetchPostmortemTests({ page: 1, page_size: postPageSize })
    // cargar lista de enfermedades para el filtro de post-mortem
    ;(async () => {
      try {
        const res = await apiClient.get<{ status: string; data: Array<any> }>(`/api/diseases?page=1&page_size=1000`)
        setDiseases(res.data || [])
      } catch (e) {
        // no crítico
      }
    })()
  }, [])

  useEffect(() => {
    // Cuando cambian los filtros de laboratorio, reiniciamos la paginación de laboratorio y recargamos con debounce
    setLabCurrentPage(1)
    if (labSearchTimerRef.current) window.clearTimeout(labSearchTimerRef.current)
    labSearchTimerRef.current = window.setTimeout(() => {
      fetchLabTests({ page: 1, page_size: labPageSize, filters: labFilters })
      labSearchTimerRef.current = null
    }, 500)
    return () => { if (labSearchTimerRef.current) window.clearTimeout(labSearchTimerRef.current) }
  }, [labFilters])

  useEffect(() => {
    // Cuando cambian los filtros de post-mortem, reiniciamos la paginación de post-mortem y recargamos con debounce
    setPostCurrentPage(1)
    if (postSearchTimerRef.current) window.clearTimeout(postSearchTimerRef.current)
    postSearchTimerRef.current = window.setTimeout(() => {
      fetchPostmortemTests({ page: 1, page_size: postPageSize, filters: postFilters })
      postSearchTimerRef.current = null
    }, 500)
    return () => { if (postSearchTimerRef.current) window.clearTimeout(postSearchTimerRef.current) }
  }, [postFilters])

  useEffect(() => {
    fetchLabTests({ page: labCurrentPage, page_size: labPageSize })
  }, [labCurrentPage, labPageSize])

  useEffect(() => {
    fetchPostmortemTests({ page: postCurrentPage, page_size: postPageSize })
  }, [postCurrentPage, postPageSize])

  const labTotalPages = Math.max(1, Math.ceil(labTotalCount / labPageSize))
  const postTotalPages = Math.max(1, Math.ceil(postTotalCount / postPageSize))

  useImperativeHandle(ref, () => ({
    toggleFilters: () => setShowFilters(s => !s),
    openCreate: () => { setEditingTest(null); setShowCreateModal(true) },
    isFiltersVisible: () => showFilters
  }))

  const openEdit = (t: Test) => { setEditingTest(t); setShowCreateModal(true) }
  const handleClose = () => { setShowCreateModal(false); setEditingTest(null) }
  const handleSave = async () => { 
    try {
      if (editingTest && editingTest.type === 'lab') await fetchLabTests()
      else if (editingTest && editingTest.type === 'postmortem') await fetchPostmortemTests()
      else await Promise.all([fetchLabTests(), fetchPostmortemTests()])
    } catch (e) {
      // errores manejados en las funciones de fetch
    }
    handleClose()
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('es-ES')
    } catch {
      return dateString
    }
  }

  if (labLoading && postLoading) return (<div className="flex justify-center items-center h-48"><span className="loading loading-spinner loading-lg"></span></div>)

  return (
    <div>
      {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

      

      {/* Acordeón 1: Pruebas de Laboratorio */}
      <div className="collapse collapse-arrow bg-base-200 mb-4">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title text-xl font-medium flex items-center gap-3">
          <TestTube className="h-6 w-6 text-primary" />
          Laboratorio
        </div>
        <div className="collapse-content">
          
          {/* Filtros específicos de Laboratorio (se ocultan al contraer el acordeón) */}
          {showFilters && (
            <div className="mb-4 card bg-base-200 p-3">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="form-control w-full md:w-1/3">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Código</span></label>
                <input type="text" placeholder="Ej: LAB001" className="input input-bordered input-sm" value={labFilters.codigo} onChange={e => setLabFilters({ ...labFilters, codigo: e.target.value })} />
              </div>
              <div className="form-control w-full md:w-1/3">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Nombre</span></label>
                <input type="text" placeholder="Buscar por nombre..." className="input input-bordered input-sm" value={labFilters.nombre} onChange={e => setLabFilters({ ...labFilters, nombre: e.target.value })} />
              </div>
              <div className="form-control w-full md:w-1/3">
                <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Categoría</span></label>
                <input type="text" placeholder="Buscar por categoría..." className="input input-bordered input-sm" value={labFilters.categoria} onChange={e => setLabFilters({ ...labFilters, categoria: e.target.value })} />
              </div>
              <div className="ml-auto">
                <button className="btn btn-ghost btn-sm" onClick={() => setLabFilters({ nombre: '', categoria: '', tipo: '', codigo: '' })}>Limpiar</button>
              </div>
            </div>
            </div>
          )}
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="table w-full">
              <thead className="bg-base-300">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Rango Normal</th>
                  <th>Unidad</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {labTests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-base-content/50">No hay pruebas de laboratorio registradas</td>
                  </tr>
                ) : (
                  labTests.map((test) => (
                    <tr key={test.code} className="hover">
                      <td className="font-mono font-semibold">{test.code}</td>
                      <td className="font-semibold">{test.name}</td>
                      <td className="max-w-md"><p className="text-sm line-clamp-2">{test.description || 'Sin descripción'}</p></td>
                      <td><span className="badge badge-outline">{test.category}</span></td>
                      <td>{test.normal_range || 'N/A'}</td>
                      <td>{test.unit || 'N/A'}</td>
                      <td className="text-center">
                        <button className="btn btn-ghost btn-sm btn-circle" onClick={() => openEdit(test)} title="Editar prueba">
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación propia de Laboratorio */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-base-content/70">Mostrar</label>
              <select className="select select-bordered select-sm" value={labPageSize} onChange={(e) => { setLabPageSize(Number(e.target.value)); setLabCurrentPage(1); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-base-content/70">por página</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setLabCurrentPage(p => Math.max(1, p - 1))} disabled={labCurrentPage === 1}>Anterior</button>
              <span className="text-sm">Página {labCurrentPage} de {labTotalPages}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setLabCurrentPage(p => Math.min(labTotalPages, p + 1))} disabled={labCurrentPage === labTotalPages}>Siguiente</button>
            </div>
          </div>

          <div className="mt-4 text-sm text-base-content/70 text-center">
            {labTotalCount === 0 ? 'Mostrando 0 de 0 pruebas' : (() => { 
              const start = (labCurrentPage - 1) * labPageSize + 1
              const end = Math.min(labCurrentPage * labPageSize, labTotalCount)
              return 'Mostrando ' + start + '-' + end + ' de ' + labTotalCount + ' pruebas'
            })()}
          </div>
        </div>
      </div>

      {/* Acordeón 2: Pruebas Post-mortem */}
      <div className="collapse collapse-arrow bg-base-200 mb-4">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title text-xl font-medium flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          Post-mortem
        </div>
        <div className="collapse-content">
          {showFilters && (
            <div className="mb-4 card bg-base-200 p-3">
              <div className="flex flex-col md:flex-row md:items-end gap-3">
                <div className="form-control w-full md:w-1/4">
                  <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Código</span></label>
                  <input type="text" placeholder="Ej: PM001" className="input input-bordered input-sm" value={postFilters.codigo} onChange={e => setPostFilters({ ...postFilters, codigo: e.target.value })} />
                </div>
                <div className="form-control w-full md:w-1/4">
                  <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Causa de muerte</span></label>
                  <input type="text" placeholder="Buscar por causa..." className="input input-bordered input-sm" value={postFilters.nombre} onChange={e => setPostFilters({ ...postFilters, nombre: e.target.value })} />
                </div>
                <div className="form-control w-full md:w-1/4">
                  <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Enfermedad</span></label>
                  <select className="select select-bordered select-sm" value={postFilters.disease} onChange={e => setPostFilters({ ...postFilters, disease: e.target.value })}>
                    <option value="">Todas</option>
                    {diseases.map(d => (<option key={d.code} value={d.code}>{d.name}</option>))}
                  </select>
                </div>
                <div className="form-control w-full md:w-1/4">
                  <label className="label mb-1"><span className="label-text text-sm text-base-content/70">Fecha de Autopsia</span></label>
                  <DatePickerCustom
                    selected={postFilters.autopsy_date ? new Date(postFilters.autopsy_date) : null}
                    onChange={(d) => setPostFilters({ ...postFilters, autopsy_date: d ? d.toISOString().slice(0,10) : '' })}
                    placeholder="YYYY-MM-DD"
                    maxDate={new Date()}
                  />
                </div>
                <div className="ml-auto">
                  <button className="btn btn-ghost btn-sm" onClick={() => setPostFilters({ nombre: '', categoria: '', tipo: '', codigo: '', disease: '', autopsy_date: '' })}>Limpiar</button>
                </div>
              </div>
            </div>
          )}
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="table w-full">
              <thead className="bg-base-300">
                <tr>
                  <th>Código</th>
                  <th>Causa de Muerte</th>
                  <th>Enfermedad Diagnosticada</th>
                  <th>Descubrimientos (Macro)</th>
                  <th>Fecha de Autopsia</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {postmortemTests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-base-content/50">No hay pruebas post-mortem registradas</td>
                  </tr>
                ) : (
                  postmortemTests.map((test) => (
                    <tr key={test.code} className="hover">
                      <td className="font-mono font-semibold">{test.code}</td>
                      <td className="max-w-xs"><p className="text-sm line-clamp-2">{test.death_cause || 'N/A'}</p></td>
                      <td className="max-w-xs"><p className="text-sm line-clamp-2">{test.disease_diagnosis || 'N/A'}</p></td>
                      <td className="max-w-xs"><p className="text-sm line-clamp-2">{test.macro_findings || 'N/A'}</p></td>
                      <td>{formatDate(test.autopsy_date)}</td>
                      <td className="text-center">
                        <button className="btn btn-ghost btn-sm btn-circle" onClick={() => openEdit(test)} title="Ver/Editar">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación propia de Post-mortem */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-base-content/70">Mostrar</label>
              <select className="select select-bordered select-sm" value={postPageSize} onChange={(e) => { setPostPageSize(Number(e.target.value)); setPostCurrentPage(1); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-base-content/70">por página</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setPostCurrentPage(p => Math.max(1, p - 1))} disabled={postCurrentPage === 1}>Anterior</button>
              <span className="text-sm">Página {postCurrentPage} de {postTotalPages}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setPostCurrentPage(p => Math.min(postTotalPages, p + 1))} disabled={postCurrentPage === postTotalPages}>Siguiente</button>
            </div>
          </div>

          <div className="mt-4 text-sm text-base-content/70 text-center">
            {postTotalCount === 0 ? 'Mostrando 0 de 0 pruebas' : (() => { 
              const start = (postCurrentPage - 1) * postPageSize + 1
              const end = Math.min(postCurrentPage * postPageSize, postTotalCount)
              return 'Mostrando ' + start + '-' + end + ' de ' + postTotalCount + ' pruebas'
            })()}
          </div>
        </div>
      </div>

      {/* Paginación global eliminada: cada acordeón maneja su propia paginación y recarga independiente. */}

      {showCreateModal && (editingTest ? <EditTestModal test={editingTest} onClose={handleClose} onSave={handleSave} /> : <CreateTestModal onClose={handleClose} onSave={handleSave} />)}
    </div>
  )
})
