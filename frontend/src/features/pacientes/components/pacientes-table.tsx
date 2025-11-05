import { useState, useEffect } from 'react'
import { UserPlus, FileText, Stethoscope, ChevronDown, ChevronRight, Filter, X, Edit } from 'lucide-react'
import { apiClient } from '@/lib/api'
import PatientModal from './crearPaciente-modal'
import DiagnosisModal from './crearDiagnostico-modal'
import DiagnosisDetailModal from './verDiagnostico-modal'

export type Patient = {
  id: number
  first_name: string
  last_name: string
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
  doctor?: { id: number; username: string; first_name?: string; last_name?: string }
}

export default function PatientsTable() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [diagnoses, setDiagnoses] = useState<Record<number, Diagnosis[]>>({})
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
    apellido: '',
    enfermedad: ''
  })

  // Cargar pacientes
  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<{ status: string; data: Patient[] }>('/api/patients')
      setPatients(response.data || [])
    } catch (err: any) {
      setError(err.message || 'Error al cargar pacientes')
      console.error('Error fetching patients:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar diagnósticos de un paciente
  const fetchPatientDiagnoses = async (patientId: number) => {
    try {
      const response = await apiClient.get<{ status: string; data: Diagnosis[] }>(`/api/patients/${patientId}/diagnoses`)
      setDiagnoses(prev => ({ ...prev, [patientId]: response.data || [] }))
    } catch (err) {
      console.error('Error fetching diagnoses:', err)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // Toggle expansión de fila
  const toggleRow = async (patientId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(patientId)) {
      newExpanded.delete(patientId)
    } else {
      newExpanded.add(patientId)
      // Cargar diagnósticos si no están cargados
      if (!diagnoses[patientId]) {
        await fetchPatientDiagnoses(patientId)
      }
    }
    setExpandedRows(newExpanded)
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
    setFilters({ nombre: '', apellido: '', enfermedad: '' })
  }

  const normalizeText = (text: string | undefined): string => {
    if (!text) return ''
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  // Filtrar pacientes
  const filteredPatients = patients.filter(patient => {
    const matchNombre = normalizeText(patient.first_name).includes(normalizeText(filters.nombre))
    const matchApellido = normalizeText(patient.last_name).includes(normalizeText(filters.apellido))
    
    // Filtro por enfermedad (buscar en diagnósticos)
    let matchEnfermedad = true
    if (filters.enfermedad) {
      const patientDiagnoses = diagnoses[patient.id] || []
      matchEnfermedad = patientDiagnoses.some(d => 
        normalizeText(d.disease?.name).includes(normalizeText(filters.enfermedad))
      )
    }
    
    return matchNombre && matchApellido && matchEnfermedad
  })

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

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
            className="btn btn-ghost btn-circle"
            onClick={() => setShowFilters(!showFilters)}
            title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <Filter className="h-5 w-5" />
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
              <th>Apellido</th>
              <th>Enfermedades</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-base-content/50">
                  {hasActiveFilters ? 'No se encontraron pacientes con los filtros aplicados' : 'No hay pacientes registrados'}
                </td>
              </tr>
            ) : (
              filteredPatients.map(patient => {
                const isExpanded = expandedRows.has(patient.id)
                const patientDiagnoses = diagnoses[patient.id] || []
                const diseases = getPatientDiseases(patient.id)
                
                return (
                  <>
                    {/* Fila principal */}
                    <tr key={patient.id} className="hover">
                      <td>
                        <button
                          className="btn btn-ghost btn-circle btn-xs"
                          onClick={() => toggleRow(patient.id)}
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
                                {patient.last_name.substring(0, 1).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="font-semibold">{patient.first_name}</div>
                        </div>
                      </td>
                      <td>{patient.last_name}</td>
                      <td>
                        {diseases.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {diseases.map((disease, idx) => (
                              <span key={idx} className="badge badge-outline badge-sm">
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
                            onClick={() => handleEditPatient(patient)}
                            title="Editar paciente"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-circle btn-sm"
                            onClick={() => handleViewLastDiagnosis(patient)}
                            title="Ver último diagnóstico"
                            disabled={diseases.length === 0}
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-primary btn-circle btn-sm"
                            onClick={() => handleCreateDiagnosis(patient)}
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
                        <td colSpan={5} className="bg-base-100 p-0">
                          <div className="p-4 bg-base-200/50">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Historial de Diagnósticos
                            </h4>
                            {patientDiagnoses.length === 0 ? (
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
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Contador */}
      <div className="mt-4 text-sm text-base-content/70 text-center">
        Mostrando {filteredPatients.length} de {patients.length} pacientes
      </div>

      {/* Modales */}
      {isPatientModalOpen && (
        <PatientModal
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
