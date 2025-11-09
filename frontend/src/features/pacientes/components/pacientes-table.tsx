import { Fragment, useState, useEffect, useRef } from 'react'
import { UserPlus, FileText, Stethoscope, ChevronDown, ChevronRight, Filter, FunnelX, X, Edit } from 'lucide-react'
import { apiClient } from '@/lib/api'
import CreatePatientModal from './crearPaciente-modal'
import EditPatientModal from './editarPaciente-modal'
import DiagnosisModal from './crearDiagnostico-modal'
import DiagnosisDetailModal from './verDiagnostico-modal'

export type Patient = {
  id: number
  first_name: string
  second_name?: string
  paternal_surname?: string
  maternal_surname?: string
  full_name?: string
  age?: number
  date_of_birth: string
  gender: string
  blood_type?: string
  email?: string
  phone?: string
  address?: string
  allergies?: string
  chronic_conditions?: string
  doctor_id: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Disease = {
  id: number
  name: string
  description?: string
}

export type Diagnosis = {
  id: number
  patient_id: number
  doctor_id: number
  disease_id: number
  diagnosis_date: string
  symptoms_presented?: string
  signs_observed?: string
  lab_results?: string
  confidence_score?: number
  inference_details?: string
  alternative_diseases?: string
  treatment: string
  treatment_start_date?: string
  treatment_end_date?: string
  notes?: string
  status: string
  follow_up_date?: string
  created_at: string
  updated_at: string
  // Relaciones
  disease?: Disease
  doctor?: { id: number; username: string; first_name?: string; paternal_surname?: string }
}

export default function PatientsTable() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [diagnoses, setDiagnoses] = useState<Record<number, Diagnosis[]>>({})
  const [diagnosesLoading, setDiagnosesLoading] = useState<Record<number, boolean>>({})
  // Cache TTL: guardar timestamp de cuando se cargaron los diagnósticos
  const [diagnosesCache, setDiagnosesCache] = useState<Record<number, number>>({})
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutos en milisegundos
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados de expansión de filas
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  
  // Estados de modales
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false)
  const [selectedPatientForDiagnosis, setSelectedPatientForDiagnosis] = useState<Patient | null>(null)
  const [isDiagnosisDetailModalOpen, setIsDiagnosisDetailModalOpen] = useState(false)
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null)
  
  // Estados de filtros
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    enfermedad: ''
  })
  // Paginación
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const searchTimerRef = useRef<number | null>(null)

  // Cargar pacientes (soporta paginado y búsquedas)
  const fetchPatients = async (opts?: { page?: number; page_size?: number; filters?: typeof filters }) => {
    const page = opts?.page ?? 1
    const page_size = opts?.page_size ?? pageSize
    const f = opts?.filters
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('page_size', String(page_size))
      if (f) {
        if (f.nombre) params.set('nombre', f.nombre)
        if (f.apellidoPaterno) params.set('apellido_paterno', f.apellidoPaterno)
        if (f.apellidoMaterno) params.set('apellido_materno', f.apellidoMaterno)
        if (f.enfermedad) params.set('enfermedad', f.enfermedad)
      }

      const url = `/api/patients?${params.toString()}`

      const response = await apiClient.get<{ 
        status: string; 
        data: Patient[];
        pagination?: { total_count: number; total_pages: number; page: number; page_size: number }
      }>(url)

      // Cuando hay filtros, backend devolverá los pacientes coincidentes (posiblemente con page_size grande)
      setPatients(response.data || [])
      setTotalCount(response.pagination?.total_count ?? (response.data || []).length)
    } catch (err: any) {
      setError(err.message || 'Error al cargar pacientes')
      console.error('Error fetching patients:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar diagnósticos de un paciente
  const fetchPatientDiagnoses = async (patientId: number) => {
    // Marcar como cargando para este paciente
    setDiagnosesLoading(prev => ({ ...prev, [patientId]: true }))
    try {
      const response = await apiClient.get<{ status: string; data: Diagnosis[] }>(`/api/patients/${patientId}/diagnoses`)
      setDiagnoses(prev => ({ ...prev, [patientId]: response.data || [] }))
      // Guardar timestamp del cache
      setDiagnosesCache(prev => ({ ...prev, [patientId]: Date.now() }))
    } catch (err) {
      console.error('Error fetching diagnoses:', err)
      setDiagnoses(prev => ({ ...prev, [patientId]: [] }))
    } finally {
      setDiagnosesLoading(prev => ({ ...prev, [patientId]: false }))
    }
  }

  useEffect(() => {
    // Inicial: cargar primera página sin filtros
    fetchPatients({ page: 1, page_size: pageSize })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Cargar solo una vez al inicio
  
  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
    // Si no hay filtros activos: volver al modo paginado y recargar página 1
    const hasFilters = Object.values(filters).some(v => v !== '')
  if (!hasFilters) {
      // cancelar debounce si existiera
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current)
        searchTimerRef.current = null
      }
      fetchPatients({ page: 1, page_size: pageSize })
    } else {
      // Debounce: esperar 1s desde la última tecla
      
      if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current)
      searchTimerRef.current = window.setTimeout(() => {
        // Pedimos muchos resultados para obtener el set completo de coincidencias
        fetchPatients({ page: 1, page_size: 1000, filters })
        searchTimerRef.current = null
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // Toggle expansión de fila
  const toggleRow = async (patientId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(patientId)) {
      // Colapsar inmediatamente (pero mantener cache)
      newExpanded.delete(patientId)
      setExpandedRows(newExpanded)
      return
    }

    // Expandir inmediatamente (optimistic UI)
    newExpanded.add(patientId)
    setExpandedRows(newExpanded)

    // Verificar si el cache es válido (menos de 5 minutos)
    const cacheTimestamp = diagnosesCache[patientId]
    const isCacheValid = cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)
    
    // Si no tenemos diagnósticos, cache expirado, o no están cargando, solicitarlos
    if ((!diagnoses[patientId] || !isCacheValid) && !diagnosesLoading[patientId]) {
      // no await - cargar en background para que la UI se expanda de inmediato
      fetchPatientDiagnoses(patientId)
    }
  }

  const handleCreatePatient = () => {
    setEditingPatient(null)
    setIsPatientModalOpen(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient)
    setIsPatientModalOpen(true)
  }

  const handleClosePatientModal = () => {
    setIsPatientModalOpen(false)
    setEditingPatient(null)
  }

  const handleSavePatient = async () => {
    await fetchPatients()
    handleClosePatientModal()
  }

  const handleCreateDiagnosis = (patient: Patient) => {
    setSelectedPatientForDiagnosis(patient)
    setIsDiagnosisModalOpen(true)
  }

  const handleCloseDiagnosisModal = () => {
    setIsDiagnosisModalOpen(false)
    setSelectedPatientForDiagnosis(null)
  }

  const handleSaveDiagnosis = async () => {
    if (selectedPatientForDiagnosis) {
      await fetchPatientDiagnoses(selectedPatientForDiagnosis.id)
    }
    handleCloseDiagnosisModal()
  }

  const handleViewLastDiagnosis = async (patient: Patient) => {
    if (!diagnoses[patient.id]) {
      await fetchPatientDiagnoses(patient.id)
    }
    const patientDiagnoses = diagnoses[patient.id] || []
    if (patientDiagnoses.length > 0) {
      // Ordenar por fecha y tomar el más reciente
      const latest = [...patientDiagnoses].sort((a, b) => 
        new Date(b.diagnosis_date).getTime() - new Date(a.diagnosis_date).getTime()
      )[0]
      setSelectedDiagnosis(latest)
      setIsDiagnosisDetailModalOpen(true)
    }
  }

  const handleViewDiagnosisDetail = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis)
    setIsDiagnosisDetailModalOpen(true)
  }

  const handleCloseDiagnosisDetailModal = () => {
    setIsDiagnosisDetailModalOpen(false)
    setSelectedDiagnosis(null)
  }

  const clearFilters = () => {
    setFilters({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', enfermedad: '' })
  }

  // NOTE: la normalización para búsquedas se realiza en el servidor; si se necesita
  // filtrar client-side en el futuro, podemos restaurar este helper.

  // Filtrar pacientes
  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  // Paginación mixta:
  // - Si hay filtros activos: asumimos que `patients` contiene el conjunto de coincidencias (pedimos page_size grande)
  //   y hacemos paginación client-side sobre esos resultados.
  // - Si no hay filtros: `patients` es la página devuelta por el servidor.
  let totalPages = 1
  let paginatedPatients: Patient[] = []
  if (hasActiveFilters) {
    const totalMatched = patients.length
    totalPages = Math.max(1, Math.ceil(totalMatched / pageSize))
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1)
    paginatedPatients = patients.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  } else {
    // Servidor aporta totalCount (número total de pacientes activos)
    totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize))
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1)
    paginatedPatients = patients // ya viene paginado desde el servidor
  }


  // Obtener enfermedades únicas de un paciente
  const getPatientDiseases = (patientId: number): string[] => {
    const patientDiagnoses = diagnoses[patientId] || []
    const uniqueDiseases = new Set(patientDiagnoses.map(d => d.disease?.name).filter(Boolean))
    return Array.from(uniqueDiseases) as string[]
  }

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
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-base-content/70">Gestiona los pacientes y sus diagnósticos</p>
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
            onClick={handleCreatePatient}
            title="Crear paciente"
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
                <button className="btn btn-ghost btn-sm gap-2" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                  Limpiar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Enfermedad</span>
                </label>
                <input
                  type="text"
                  placeholder="Buscar por enfermedad..."
                  className="input input-bordered input-sm"
                  value={filters.enfermedad}
                  onChange={(e) => setFilters({ ...filters, enfermedad: e.target.value })}
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
              <th className="w-12"></th>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>Enfermedades</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/50">
                  {hasActiveFilters ? 'No se encontraron pacientes con los filtros aplicados' : 'No hay pacientes registrados'}
                </td>
              </tr>
            ) : (
              paginatedPatients.map(patient => {
                const isExpanded = expandedRows.has(patient.id)
                const patientDiagnoses = diagnoses[patient.id] || []
                const diseases = getPatientDiseases(patient.id)
                
                return (
                  <Fragment key={patient.id}>
                    {/* Fila principal (clicable para expandir) */}
                    <tr key={patient.id} className="hover cursor-pointer" onClick={() => toggleRow(patient.id)}>
                      <td>
                        <button
                          className="btn btn-ghost btn-circle btn-xs"
                          onClick={(e) => { e.stopPropagation(); toggleRow(patient.id); }}
                          title={isExpanded ? "Ocultar diagnósticos" : "Ver diagnósticos"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                              <span className="text-sm font-bold">
                                {patient.first_name.substring(0, 1).toUpperCase()}
                                {(patient.paternal_surname || '').substring(0, 1).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="font-semibold">
                            {patient.first_name} {patient.second_name || ''}
                          </div>
                        </div>
                      </td>
                      <td>{patient.paternal_surname || ''}</td>
                      <td>{patient.maternal_surname || ''}</td>
                      <td>
                        {diseases.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {diseases.map((disease) => (
                              <span key={disease} className="badge badge-outline badge-sm">
                                {disease}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-base-content/50 text-sm">Sin diagnósticos</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            className="btn btn-ghost btn-circle btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleEditPatient(patient); }}
                            title="Editar paciente"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-circle btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleViewLastDiagnosis(patient); }}
                            title="Ver último diagnóstico"
                            disabled={diseases.length === 0}
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-primary btn-circle btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleCreateDiagnosis(patient); }}
                            title="Crear diagnóstico"
                          >
                            <Stethoscope className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Fila expandida con historial de diagnósticos */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-base-100 p-0">
                          <div className="p-4 bg-base-200/50">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Historial de Diagnósticos
                            </h4>
                            {diagnosesLoading[patient.id] ? (
                              <div className="flex items-center gap-2">
                                <span className="loading loading-spinner"></span>
                                <span className="text-sm text-base-content/70">Cargando diagnósticos...</span>
                              </div>
                            ) : patientDiagnoses.length === 0 ? (
                              <p className="text-sm text-base-content/70 italic">
                                No hay diagnósticos registrados para este paciente
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {patientDiagnoses
                                  .sort((a, b) => new Date(b.diagnosis_date).getTime() - new Date(a.diagnosis_date).getTime())
                                  .map(diagnosis => (
                                    <div
                                      key={diagnosis.id}
                                      className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                      onClick={() => handleViewDiagnosisDetail(diagnosis)}
                                    >
                                      <div className="card-body p-4">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="font-semibold">
                                                {new Date(diagnosis.diagnosis_date).toLocaleDateString('es-ES', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric'
                                                })}
                                              </span>
                                              <span className="text-sm text-base-content/70">
                                                • Dr. {diagnosis.doctor?.first_name || diagnosis.doctor?.username}
                                              </span>
                                            </div>
                                            <div className="mb-2">
                                              <span className="text-sm font-medium">Enfermedad:</span>
                                              <span className="ml-2 badge badge-primary">{diagnosis.disease?.name}</span>
                                            </div>
                                            <div className="mb-2">
                                              <span className="text-sm font-medium">Tratamiento:</span>
                                              <p className="text-sm mt-1">{diagnosis.treatment}</p>
                                            </div>
                                            {(diagnosis.treatment_start_date || diagnosis.treatment_end_date) && (
                                              <div className="text-sm text-base-content/70">
                                                <span className="font-medium">Periodo:</span>{' '}
                                                {diagnosis.treatment_start_date && new Date(diagnosis.treatment_start_date).toLocaleDateString('es-ES')}
                                                {' - '}
                                                {diagnosis.treatment_end_date ? new Date(diagnosis.treatment_end_date).toLocaleDateString('es-ES') : 'Presente'}
                                              </div>
                                            )}
                                          </div>
                                          <button className="btn btn-ghost btn-sm btn-circle">
                                            <FileText className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })
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

      {/* Contador */}
      <div className="mt-4 text-sm text-base-content/70 text-center">
        {(() => {
          const total = hasActiveFilters ? patients.length : totalCount
          if (!total) return 'Mostrando 0 de 0 pacientes'
          const start = (currentPage - 1) * pageSize + 1
          let end = 0
          if (hasActiveFilters) {
            end = Math.min(currentPage * pageSize, patients.length)
          } else {
            end = (currentPage - 1) * pageSize + paginatedPatients.length
          }
          return `Mostrando ${start}-${end} de ${total} pacientes${hasActiveFilters ? ' (filtrados)' : ''}`
        })()}
      </div>

      {/* Modales */}
      {isPatientModalOpen && !editingPatient && (
        <CreatePatientModal onClose={handleClosePatientModal} onSave={handleSavePatient} />
      )}

      {isPatientModalOpen && editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          onClose={handleClosePatientModal}
          onSave={handleSavePatient}
        />
      )}

      {isDiagnosisModalOpen && selectedPatientForDiagnosis && (
        <DiagnosisModal
          patient={selectedPatientForDiagnosis}
          onClose={handleCloseDiagnosisModal}
          onSave={handleSaveDiagnosis}
        />
      )}

      {isDiagnosisDetailModalOpen && selectedDiagnosis && (
        <DiagnosisDetailModal
          diagnosis={selectedDiagnosis}
          onClose={handleCloseDiagnosisDetailModal}
        />
      )}
    </div>
  )
}
