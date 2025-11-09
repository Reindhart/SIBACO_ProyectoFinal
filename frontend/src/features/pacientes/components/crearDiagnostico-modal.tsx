import { useForm } from 'react-hook-form'
import { X, Stethoscope } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { Patient } from './pacientes-table'

type DiagnosisFormData = {
  symptoms_presented: string
  signs_observed: string
  lab_results?: string
  notes?: string
}

type DiagnosisModalProps = {
  patient: Patient
  onClose: () => void
  onSave: () => void
}

export default function DiagnosisModal({ patient, onClose, onSave }: DiagnosisModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<DiagnosisFormData>({
    defaultValues: {
      symptoms_presented: '',
      signs_observed: '',
      lab_results: '',
      notes: ''
    }
  })

  const onSubmit = async (data: DiagnosisFormData) => {
    try {
      const payload = {
        patient_id: patient.id,
        symptoms_presented: data.symptoms_presented,
        signs_observed: data.signs_observed,
        lab_results: data.lab_results || undefined,
        notes: data.notes || undefined
      }
      
      await apiClient.post('/api/diagnoses', payload)
      onSave()
    } catch (error: any) {
      console.error('Error creating diagnosis:', error)
      alert(error.message || 'Error al crear el diagnóstico')
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold">Nuevo Diagnóstico</h3>
              <p className="text-sm text-base-content/70">
                Paciente: {patient.full_name}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="divider">
            <span className="text-sm font-semibold">Datos Clínicos del Paciente</span>
          </div>

          <div className="form-control">
            <label htmlFor="symptoms_presented" className="label-text mb-2 block">
              Síntomas Presentados *
            </label>
            <span className="text-xs text-base-content/70 mb-2 block">
              Describa los síntomas reportados por el paciente (fiebre, dolor, malestar, etc.)
            </span>
            <textarea
              id="symptoms_presented"
              className={`textarea textarea-bordered w-full h-32 ${errors.symptoms_presented ? 'textarea-error' : ''}`}
              placeholder="Ej: Fiebre de 38.5°C durante 3 días, dolor de cabeza intenso, fatiga, dolor muscular generalizado, escalofríos, pérdida de apetito..."
              {...register('symptoms_presented', { 
                required: 'Los síntomas son obligatorios',
                minLength: { value: 10, message: 'Proporcione una descripción más detallada' }
              })}
            />
            {errors.symptoms_presented && (
              <span className="text-error text-sm mt-1">{errors.symptoms_presented.message}</span>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="signs_observed" className="label-text mb-2 block">
              Signos Observados *
            </label>
            <span className="text-xs text-base-content/70 mb-2 block">
              Describa los signos clínicos objetivos observados durante el examen físico
            </span>
            <textarea
              id="signs_observed"
              className={`textarea textarea-bordered w-full h-32 ${errors.signs_observed ? 'textarea-error' : ''}`}
              placeholder="Ej: Presión arterial 140/90 mmHg, frecuencia cardíaca 95 lpm, temperatura 38.5°C, frecuencia respiratoria 20 rpm, inflamación en articulaciones, hiperemia conjuntival..."
              {...register('signs_observed', { 
                required: 'Los signos observados son obligatorios',
                minLength: { value: 10, message: 'Proporcione una descripción más detallada' }
              })}
            />
            {errors.signs_observed && (
              <span className="text-error text-sm mt-1">{errors.signs_observed.message}</span>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="lab_results" className="label-text mb-2 block">
              Resultados de Laboratorio
            </label>
            <span className="text-xs text-base-content/70 mb-2 block">
              Resultados de análisis clínicos, imágenes y otros estudios complementarios (opcional)
            </span>
            <textarea
              id="lab_results"
              className="textarea textarea-bordered w-full h-24"
              placeholder="Ej: Hemograma completo: leucocitos 12,000/mm³ (elevados), hemoglobina 14 g/dL, plaquetas 250,000/mm³. Glucosa en ayunas: 110 mg/dL. Creatinina: 1.2 mg/dL. PCR: 15 mg/L (elevada)..."
              {...register('lab_results')}
            />
          </div>

          <div className="divider">
            <span className="text-sm font-semibold">Información Adicional</span>
          </div>

          <div className="form-control">
            <label htmlFor="notes" className="label-text mb-2 block">
              Notas del Médico
            </label>
            <span className="text-xs text-base-content/70 mb-2 block">
              Observaciones adicionales, historia clínica relevante o consideraciones especiales (opcional)
            </span>
            <textarea
              id="notes"
              className="textarea textarea-bordered w-full h-20"
              placeholder="Ej: Paciente con antecedentes de diabetes tipo 2 controlada. Viajó recientemente a zona endémica. Tratamiento previo con..."
              {...register('notes')}
            />
          </div>

          {/* Acciones */}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Procesando...
                </>
              ) : (
                'Crear Diagnóstico'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
