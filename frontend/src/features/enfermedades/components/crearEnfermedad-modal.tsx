import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Activity } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { Disease } from './enfermedades-table'

type DiseaseFormData = {
  name: string
  description?: string
  category: string
  severity: string
  treatment_recommendations?: string
  prevention_measures?: string
}

type DiseaseModalProps = {
  disease: Disease | null
  onClose: () => void
  onSave: () => void
}

export default function DiseaseModal({ disease, onClose, onSave }: DiseaseModalProps) {
  const isEditing = disease !== null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<DiseaseFormData>({
    defaultValues: disease
      ? {
          name: disease.name,
          description: disease.description || '',
          category: disease.category,
          severity: disease.severity || 'moderada',
          treatment_recommendations: disease.treatment_recommendations || '',
          prevention_measures: disease.prevention_measures || ''
        }
      : {
          name: '',
          description: '',
          category: '',
          severity: 'moderada',
          treatment_recommendations: '',
          prevention_measures: ''
        }
  })

  useEffect(() => {
    if (disease) {
      reset({
        name: disease.name,
        description: disease.description || '',
        category: disease.category,
        severity: disease.severity || 'moderada',
        treatment_recommendations: disease.treatment_recommendations || '',
        prevention_measures: disease.prevention_measures || ''
      })
    } else {
      reset({
        name: '',
        description: '',
        category: '',
        severity: 'moderada',
        treatment_recommendations: '',
        prevention_measures: ''
      })
    }
  }, [disease, reset])

  const onSubmit = async (data: DiseaseFormData) => {
    try {
      if (isEditing) {
        await apiClient.put(`/api/diseases/${disease.code}`, data)
      } else {
        await apiClient.post('/api/diseases', data)
      }
      onSave()
    } catch (error: any) {
      console.error('Error saving disease:', error)
      alert(error.message || 'Error al guardar la enfermedad')
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold">
                {isEditing ? 'Editar Enfermedad' : 'Nueva Enfermedad'}
              </h3>
              {isEditing && (
                <p className="text-sm text-base-content/70">Código: {disease.code}</p>
              )}
            </div>
          </div>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label htmlFor="name" className="label-text mb-2 block">
                Nombre de la Enfermedad *
              </label>
              <input
                id="name"
                type="text"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                placeholder="Ej: Gripe, Neumonía, Gastroenteritis"
                {...register('name', { required: 'El nombre es obligatorio' })}
              />
              {errors.name && (
                <span className="text-error text-sm mt-1">{errors.name.message}</span>
              )}
            </div>

            <div className="form-control">
              <label htmlFor="category" className="label-text mb-2 block">
                Tipo de Enfermedad (Categoría) *
              </label>
              <input
                id="category"
                type="text"
                className={`input input-bordered w-full ${errors.category ? 'input-error' : ''}`}
                placeholder="Ej: RESP, GASTR, CARD, NEURO"
                {...register('category', {
                  required: 'La categoría es obligatoria',
                  pattern: {
                    value: /^[A-Z]+$/,
                    message: 'Solo letras mayúsculas sin espacios'
                  },
                  maxLength: {
                    value: 6,
                    message: 'Máximo 6 caracteres'
                  }
                })}
              />
              {errors.category && (
                <span className="text-error text-sm mt-1">{errors.category.message}</span>
              )}
              <span className="text-xs text-base-content/70 mt-1">
                El código se generará automáticamente: {'{CATEGORIA + número}'}
              </span>
            </div>

            <div className="form-control">
              <label htmlFor="severity" className="label-text mb-2 block">
                Severidad *
              </label>
              <select
                id="severity"
                className={`select select-bordered w-full ${errors.severity ? 'select-error' : ''}`}
                {...register('severity', { required: 'La severidad es obligatoria' })}
              >
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="grave">Grave</option>
                <option value="crítica">Crítica</option>
              </select>
              {errors.severity && (
                <span className="text-error text-sm mt-1">{errors.severity.message}</span>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="form-control">
            <label htmlFor="description" className="label-text mb-2 block">
              Descripción
            </label>
            <textarea
              id="description"
              className="textarea textarea-bordered w-full h-24"
              placeholder="Descripción detallada de la enfermedad, causas, manifestaciones clínicas..."
              {...register('description')}
            />
          </div>

          <div className="divider">Información Clínica</div>

          {/* Tratamientos */}
          <div className="form-control">
            <label htmlFor="treatment_recommendations" className="label-text mb-2 block">
              Tratamientos Recomendados
            </label>
            <span className="text-xs text-base-content/70 mb-2 block">
              Ingrese cada tratamiento en una línea separada (se mostrará como lista)
            </span>
            <textarea
              id="treatment_recommendations"
              className="textarea textarea-bordered w-full h-32"
              placeholder={'Ej:\nReposo absoluto por 7 días\nParacetamol 500mg cada 8 horas\nAbundantes líquidos\nEvitar cambios bruscos de temperatura'}
              {...register('treatment_recommendations')}
            />
          </div>

          {/* Medidas de prevención */}
          <div className="form-control">
            <label htmlFor="prevention_measures" className="label-text mb-2 block">
              Medidas de Prevención
            </label>
            <span className="text-xs text-base-content/70 mb-2 block">
              Ingrese cada medida en una línea separada (se mostrará como lista)
            </span>
            <textarea
              id="prevention_measures"
              className="textarea textarea-bordered w-full h-32"
              placeholder={'Ej:\nLavado frecuente de manos\nVacunación anual\nEvitar contacto con personas enfermas\nMantener ambientes ventilados\nAlimentación balanceada rica en vitamina C'}
              {...register('prevention_measures')}
            />
          </div>

          {!isEditing && (
            <div className="alert alert-info">
              <Activity className="h-5 w-5" />
              <div className="text-sm">
                <p className="font-semibold">Código Automático</p>
                <p>
                  El código se generará automáticamente basándose en la categoría. Por ejemplo:
                  RESP01, RESP02, GASTR01, GASTR02, etc.
                </p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Guardando...
                </>
              ) : isEditing ? (
                'Guardar Cambios'
              ) : (
                'Crear Enfermedad'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
