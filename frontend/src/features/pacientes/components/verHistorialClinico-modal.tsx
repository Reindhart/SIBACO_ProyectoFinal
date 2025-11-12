import { useState, useEffect } from 'react'
import apiClient from '@/api/fetchApi'

type Patient = {
  id: number
  first_name: string
  second_name?: string
  paternal_surname?: string
  maternal_surname?: string
  full_name?: string
  ci?: string
  age?: number
  date_of_birth: string
  gender: string
  blood_type?: string
  blood_type_abo?: number
  blood_type_rh?: number
  height?: number
  weight?: number
  bmi?: number
  smoking_status?: string
  alcohol_consumption?: string
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

type Disease = {
  code: string
  name: string
  description: string
}

type Diagnosis = {
  id: number
  patient_id: number
  disease_code: string
  diagnosis_date: string
  confidence_score: number
  status: string
  notes?: string
  disease?: Disease
  created_at: string
}

type HistorialClinicoModalProps = {
  patient: Patient
  onClose: () => void
  onViewDiagnosis?: (diagnosisId: number) => void
}

export default function HistorialClinicoModal({ 
  patient, 
  onClose,
  onViewDiagnosis 
}: HistorialClinicoModalProps) {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para mapear códigos de tipo de sangre a string legible
  const mapBloodType = (abo?: number, rh?: number): string => {
    if (abo === undefined || rh === undefined) return 'No especificado'
    const aboMap: { [key: number]: string } = { 0: 'O', 1: 'A', 2: 'B', 3: 'AB' }
    const rhMap: { [key: number]: string } = { 0: '-', 1: '+' }
    return `${aboMap[abo] || '?'}${rhMap[rh] || '?'}`
  }

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Función para obtener badge de estado
  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; class: string } } = {
      active: { label: 'Activo', class: 'badge-primary' },
      completed: { label: 'Completado', class: 'badge-success' },
      followup: { label: 'Seguimiento', class: 'badge-warning' },
      inactive: { label: 'Inactivo', class: 'badge-ghost' }
    }
    const config = statusMap[status] || { label: status, class: 'badge-ghost' }
    return <span className={`badge ${config.class}`}>{config.label}</span>
  }

  // Función para obtener badge de confianza
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return <span className="badge badge-success">Alta ({confidence}%)</span>
    } else if (confidence >= 60) {
      return <span className="badge badge-warning">Media ({confidence}%)</span>
    } else {
      return <span className="badge badge-error">Baja ({confidence}%)</span>
    }
  }

  // Cargar diagnósticos del paciente
  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get({
          url: `/api/patients/${patient.id}/diagnoses`
        })
        
        // Parsear respuesta JSON
        const responseData = await response.json()
        
        // Normalizar respuesta
        const data = responseData?.data || responseData || []
        setDiagnoses(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err: any) {
        console.error('Error fetching diagnoses:', err)
        
        // Intentar obtener mensaje de error
        let errorMessage = 'Error al cargar historial clínico'
        try {
          if (err instanceof Response) {
            const errorData = await err.json()
            errorMessage = errorData.message || errorMessage
          } else if (err.message) {
            errorMessage = err.message
          }
        } catch (parseError) {
          // Si falla el parseo, usar el mensaje por defecto
        }
        
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchDiagnoses()
  }, [patient.id])

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">📋 Historial Clínico</h3>
            <p className="text-sm text-gray-500 mt-1">
              Paciente: {patient.first_name} {patient.paternal_surname} • CI: {patient.ci}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>

        {/* Información del paciente */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body">
            <h4 className="card-title text-lg">Información General</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Edad</p>
                <p className="font-semibold">{patient.age} años</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sexo</p>
                <p className="font-semibold capitalize">{patient.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo de Sangre</p>
                <p className="font-semibold">
                  {mapBloodType(patient.blood_type_abo, patient.blood_type_rh)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Diagnósticos</p>
                <p className="font-semibold">{diagnoses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="ml-4">Cargando historial clínico...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && diagnoses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h4 className="text-xl font-semibold mb-2">Sin diagnósticos previos</h4>
            <p className="text-gray-500">
              Este paciente aún no tiene diagnósticos registrados en el sistema.
            </p>
          </div>
        )}

        {/* Lista de diagnósticos */}
        {!loading && !error && diagnoses.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg mb-3">
              Historial de Diagnósticos ({diagnoses.length})
            </h4>
            
            {diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="card bg-base-100 border border-base-300 hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="card-title text-lg">
                          {diagnosis.disease?.name || diagnosis.disease_code}
                        </h5>
                        {getStatusBadge(diagnosis.status)}
                        {diagnosis.confidence_score && getConfidenceBadge(diagnosis.confidence_score)}
                      </div>
                      
                      {diagnosis.disease?.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {diagnosis.disease.description.length > 150 
                            ? `${diagnosis.disease.description.substring(0, 150)}...`
                            : diagnosis.disease.description
                          }
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm mt-3">
                        <div>
                          <span className="text-gray-500">Fecha:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(diagnosis.diagnosis_date || diagnosis.created_at)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Código:</span>
                          <span className="ml-2 font-mono text-xs bg-base-200 px-2 py-1 rounded">
                            {diagnosis.disease_code}
                          </span>
                        </div>
                      </div>

                      {diagnosis.notes && (
                        <div className="mt-3 p-3 bg-base-200 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Notas:</p>
                          <p className="text-sm">{diagnosis.notes}</p>
                        </div>
                      )}
                    </div>

                    {onViewDiagnosis && (
                      <button
                        onClick={() => onViewDiagnosis(diagnosis.id)}
                        className="btn btn-sm btn-primary"
                      >
                        Ver Detalle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Cerrar
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
