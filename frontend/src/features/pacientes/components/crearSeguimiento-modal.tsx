import { useForm } from 'react-hook-form'
import apiClient from '@/api/fetchApi'

type Diagnosis = {
  id: number
  patient_id: number
  disease_code: string
  disease?: {
    name: string
    code: string
  }
}

type FollowUpFormData = {
  patient_condition: string
  symptoms_evolution: string
  treatment_adjustments?: string
  notes?: string
  next_follow_up_date?: string
}

type CrearSeguimientoModalProps = {
  diagnosis: Diagnosis
  onClose: () => void
  onSave: () => void
}

export default function CrearSeguimientoModal({ 
  diagnosis, 
  onClose, 
  onSave 
}: CrearSeguimientoModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FollowUpFormData>({
    defaultValues: {
      patient_condition: 'stable',
      symptoms_evolution: '',
      treatment_adjustments: '',
      notes: '',
      next_follow_up_date: ''
    }
  })

  const onSubmit = async (data: FollowUpFormData) => {
    try {
      const payload = {
        diagnosis_id: diagnosis.id,
        patient_condition: data.patient_condition,
        symptoms_evolution: data.symptoms_evolution,
        treatment_adjustments: data.treatment_adjustments || undefined,
        notes: data.notes || undefined,
        next_follow_up_date: data.next_follow_up_date || undefined
      }

      const response: Response = await apiClient.post({
        url: '/api/follow-ups',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      }) as Response
      
      // Verificar respuesta exitosa
      if (response.ok) {
        alert('✅ Seguimiento registrado exitosamente')
        onSave()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear seguimiento')
      }
    } catch (error: any) {
      console.error('Error creating follow-up:', error)
      
      // Intentar obtener mensaje de error
      let errorMessage = 'Error al crear seguimiento'
      try {
        if (error instanceof Response) {
          const errorData = await error.json()
          errorMessage = errorData.message || errorMessage
        } else if (error.message) {
          errorMessage = error.message
        }
      } catch (parseError) {
        // Si falla el parseo, usar el mensaje por defecto
      }
      
      alert(errorMessage)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">📝 Nuevo Seguimiento</h3>
            <p className="text-sm text-gray-500 mt-1">
              Diagnóstico: {diagnosis.disease?.name || diagnosis.disease_code}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Condición del paciente */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Condición del Paciente <span className="text-error">*</span>
              </span>
            </label>
            <select
              {...register('patient_condition', { required: 'Campo requerido' })}
              className={`select select-bordered w-full ${errors.patient_condition ? 'select-error' : ''}`}
            >
              <option value="improved">✅ Mejorado - El paciente muestra mejoría significativa</option>
              <option value="stable">⚖️ Estable - Sin cambios en el estado del paciente</option>
              <option value="worsened">⚠️ Empeorado - El estado del paciente ha empeorado</option>
              <option value="critical">🚨 Crítico - Requiere atención inmediata</option>
            </select>
            {errors.patient_condition && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.patient_condition.message}</span>
              </label>
            )}
          </div>

          {/* Evolución de síntomas */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Evolución de Síntomas <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              {...register('symptoms_evolution', { 
                required: 'Campo requerido',
                minLength: { value: 10, message: 'Mínimo 10 caracteres' }
              })}
              className={`textarea textarea-bordered h-24 ${errors.symptoms_evolution ? 'textarea-error' : ''}`}
              placeholder="Describe la evolución de los síntomas del paciente..."
            />
            {errors.symptoms_evolution && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.symptoms_evolution.message}</span>
              </label>
            )}
            <label className="label">
              <span className="label-text-alt">
                Ej: "La fiebre ha disminuido de 39°C a 37.5°C. La tos persiste pero es menos frecuente."
              </span>
            </label>
          </div>

          {/* Ajustes al tratamiento */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Ajustes al Tratamiento</span>
            </label>
            <textarea
              {...register('treatment_adjustments')}
              className="textarea textarea-bordered h-20"
              placeholder="¿Se realizaron cambios en el tratamiento? (Opcional)"
            />
            <label className="label">
              <span className="label-text-alt">
                Ej: "Se aumentó dosis de amoxicilina a 1g cada 8h. Se añadió ibuprofeno 400mg."
              </span>
            </label>
          </div>

          {/* Notas adicionales */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Notas Adicionales</span>
            </label>
            <textarea
              {...register('notes')}
              className="textarea textarea-bordered h-20"
              placeholder="Observaciones adicionales sobre el seguimiento... (Opcional)"
            />
          </div>

          {/* Próxima cita */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Próxima Cita de Seguimiento</span>
            </label>
            <input
              type="date"
              {...register('next_follow_up_date')}
              className="input input-bordered"
              min={new Date().toISOString().split('T')[0]}
            />
            <label className="label">
              <span className="label-text-alt">
                Fecha recomendada para el próximo control
              </span>
            </label>
          </div>

          {/* Información de ayuda */}
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm">
              El seguimiento permite rastrear la evolución del paciente a lo largo del tiempo.
              Registra cambios en síntomas, efectividad del tratamiento y ajustes realizados.
            </span>
          </div>

          {/* Botones de acción */}
          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Guardando...
                </>
              ) : (
                '💾 Guardar Seguimiento'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
