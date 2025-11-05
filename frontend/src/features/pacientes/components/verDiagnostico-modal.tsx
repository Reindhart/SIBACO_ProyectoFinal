import { X, FileText, Activity, Calendar, Pill } from 'lucide-react'
import type { Diagnosis } from './pacientes-table'

type DiagnosisDetailModalProps = {
  diagnosis: Diagnosis
  onClose: () => void
}

export default function DiagnosisDetailModal({ diagnosis, onClose }: DiagnosisDetailModalProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const parseJSON = (jsonString: string | undefined) => {
    if (!jsonString) return null
    try {
      return JSON.parse(jsonString)
    } catch {
      return jsonString
    }
  }

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    ongoing: 'En curso',
    recovered: 'Recuperado',
    referred: 'Referido'
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Diagnóstico Completo</h3>
              <p className="text-sm text-base-content/70">{formatDate(diagnosis.diagnosis_date)}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Información general */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Información General
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-sm font-semibold text-base-content/70">Enfermedad:</span>
                  <p className="text-base font-medium mt-1">
                    <span className="badge badge-primary badge-lg">
                      {diagnosis.disease?.name || `ID: ${diagnosis.disease_id}`}
                    </span>
                  </p>
                  {diagnosis.disease?.description && (
                    <p className="text-sm text-base-content/70 mt-1">{diagnosis.disease.description}</p>
                  )}
                </div>
                <div>
                  <span className="text-sm font-semibold text-base-content/70">Doctor:</span>
                  <p className="text-base mt-1">
                    Dr. {diagnosis.doctor?.first_name || diagnosis.doctor?.username || `ID: ${diagnosis.doctor_id}`}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-base-content/70">Estado:</span>
                  <p className="text-base mt-1">
                    <span className={`badge ${
                      diagnosis.status === 'recovered' ? 'badge-success' :
                      diagnosis.status === 'active' ? 'badge-warning' :
                      diagnosis.status === 'ongoing' ? 'badge-info' :
                      'badge-neutral'
                    }`}>
                      {statusLabels[diagnosis.status] || diagnosis.status}
                    </span>
                  </p>
                </div>
                {diagnosis.confidence_score !== undefined && (
                  <div>
                    <span className="text-sm font-semibold text-base-content/70">Nivel de Confianza:</span>
                    <p className="text-base mt-1">
                      <span className="font-semibold text-primary">{diagnosis.confidence_score}%</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información clínica */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-lg">Información Clínica</h4>
              
              <div className="space-y-4 mt-4">
                {diagnosis.symptoms_presented && (
                  <div>
                    <span className="text-sm font-semibold text-base-content/70">Síntomas Presentados:</span>
                    <div className="mt-2 p-3 bg-base-100 rounded-lg">
                      {typeof parseJSON(diagnosis.symptoms_presented) === 'object' ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(parseJSON(diagnosis.symptoms_presented), null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm">{diagnosis.symptoms_presented}</p>
                      )}
                    </div>
                  </div>
                )}

                {diagnosis.signs_observed && (
                  <div>
                    <span className="text-sm font-semibold text-base-content/70">Signos Observados:</span>
                    <div className="mt-2 p-3 bg-base-100 rounded-lg">
                      {typeof parseJSON(diagnosis.signs_observed) === 'object' ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(parseJSON(diagnosis.signs_observed), null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm">{diagnosis.signs_observed}</p>
                      )}
                    </div>
                  </div>
                )}

                {diagnosis.lab_results && (
                  <div>
                    <span className="text-sm font-semibold text-base-content/70">Resultados de Laboratorio:</span>
                    <div className="mt-2 p-3 bg-base-100 rounded-lg">
                      {typeof parseJSON(diagnosis.lab_results) === 'object' ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(parseJSON(diagnosis.lab_results), null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm">{diagnosis.lab_results}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tratamiento */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-lg flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Plan de Tratamiento
              </h4>
              
              <div className="mt-4">
                <div className="p-4 bg-base-100 rounded-lg">
                  <p className="text-base whitespace-pre-wrap">{diagnosis.treatment}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-xs text-base-content/70">Inicio:</span>
                      <p className="font-medium">{formatDate(diagnosis.treatment_start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-xs text-base-content/70">Fin:</span>
                      <p className="font-medium">
                        {diagnosis.treatment_end_date ? formatDate(diagnosis.treatment_end_date) : 'En curso'}
                      </p>
                    </div>
                  </div>
                </div>

                {diagnosis.follow_up_date && (
                  <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-warning" />
                      <div>
                        <span className="text-sm font-semibold">Seguimiento Programado:</span>
                        <p className="text-sm mt-1">{formatDate(diagnosis.follow_up_date)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detalles de inferencia */}
          {diagnosis.inference_details && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h4 className="card-title text-lg">Detalles de Inferencia</h4>
                <div className="mt-4 p-3 bg-base-100 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                    {typeof parseJSON(diagnosis.inference_details) === 'object'
                      ? JSON.stringify(parseJSON(diagnosis.inference_details), null, 2)
                      : diagnosis.inference_details}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Enfermedades alternativas */}
          {diagnosis.alternative_diseases && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h4 className="card-title text-lg">Diagnósticos Alternativos</h4>
                <div className="mt-4 p-3 bg-base-100 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                    {typeof parseJSON(diagnosis.alternative_diseases) === 'object'
                      ? JSON.stringify(parseJSON(diagnosis.alternative_diseases), null, 2)
                      : diagnosis.alternative_diseases}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          {diagnosis.notes && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h4 className="card-title text-lg">Notas Adicionales</h4>
                <div className="mt-4 p-3 bg-base-100 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{diagnosis.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-base-content/50 text-center space-y-1">
            <p>Creado: {formatDate(diagnosis.created_at)}</p>
            {diagnosis.updated_at && <p>Última actualización: {formatDate(diagnosis.updated_at)}</p>}
          </div>
        </div>

        {/* Acciones */}
        <div className="modal-action">
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
