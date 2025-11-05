import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { X, Calendar } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { apiClient } from '@/lib/api'
import type { Patient } from './pacientes-table'

type PatientFormData = {
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
}

type PatientModalProps = {
  patient: Patient | null
  onClose: () => void
  onSave: () => void
}

export default function PatientModal({ patient, onClose, onSave }: PatientModalProps) {
  const isEditing = patient !== null
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    patient?.date_of_birth ? new Date(patient.date_of_birth) : null
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<PatientFormData>({
    defaultValues: patient
      ? {
          first_name: patient.first_name,
          last_name: patient.last_name,
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
          blood_type: patient.blood_type || '',
          email: patient.email || '',
          phone: patient.phone || '',
          address: patient.address || '',
          allergies: patient.allergies || '',
          chronic_conditions: patient.chronic_conditions || ''
        }
      : {
          first_name: '',
          last_name: '',
          date_of_birth: '',
          gender: '',
          blood_type: '',
          email: '',
          phone: '',
          address: '',
          allergies: '',
          chronic_conditions: ''
        }
  })

  useEffect(() => {
    if (patient) {
      reset({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        blood_type: patient.blood_type || '',
        email: patient.email || '',
        phone: patient.phone || '',
        address: patient.address || '',
        allergies: patient.allergies || '',
        chronic_conditions: patient.chronic_conditions || ''
      })
    }
  }, [patient, reset])

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (isEditing) {
        await apiClient.put(`/api/patients/${patient.id}`, data)
      } else {
        await apiClient.post('/api/patients', data)
      }
      onSave()
    } catch (error: any) {
      console.error('Error saving patient:', error)
      alert(error.message || 'Error al guardar el paciente')
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h3>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label htmlFor="first_name" className="label-text mb-2 block">
                Nombre *
              </label>
              <input
                id="first_name"
                type="text"
                className={`input input-bordered w-full ${errors.first_name ? 'input-error' : ''}`}
                {...register('first_name', { required: 'El nombre es obligatorio' })}
              />
              {errors.first_name && (
                <span className="text-error text-sm mt-1">{errors.first_name.message}</span>
              )}
            </div>

            <div className="form-control">
              <label htmlFor="last_name" className="label-text mb-2 block">
                Apellido *
              </label>
              <input
                id="last_name"
                type="text"
                className={`input input-bordered w-full ${errors.last_name ? 'input-error' : ''}`}
                {...register('last_name', { required: 'El apellido es obligatorio' })}
              />
              {errors.last_name && (
                <span className="text-error text-sm mt-1">{errors.last_name.message}</span>
              )}
            </div>

            <div className="form-control">
              <label htmlFor="date_of_birth" className="label-text mb-2 block">
                Fecha de Nacimiento *
              </label>
              <Controller
                name="date_of_birth"
                control={control}
                rules={{ required: 'La fecha de nacimiento es obligatoria' }}
                render={({ field }) => (
                  <div className="relative">
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) => {
                        if (date) {
                          const isoDate = date.toISOString().split('T')[0]
                          field.onChange(isoDate)
                          setSelectedDate(date)
                        }
                      }}
                      maxDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Haga click para escoger una fecha"
                      className={`cursor-pointer input input-bordered w-full ${errors.date_of_birth ? 'input-error' : ''}`}
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={100}
                      scrollableYearDropdown
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50 pointer-events-none" />
                  </div>
                )}
              />
              {errors.date_of_birth && (
                <span className="text-error text-sm mt-1">{errors.date_of_birth.message}</span>
              )}
            </div>

            <div className="form-control cursor-pointer">
              <label htmlFor="gender" className="label-text mb-2 block">
                Género *
              </label>
              <select
                id="gender"
                className={`select select-bordered w-full ${errors.gender ? 'select-error' : ''}`}
                {...register('gender', { required: 'El género es obligatorio' })}
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
              {errors.gender && (
                <span className="text-error text-sm mt-1">{errors.gender.message}</span>
              )}
            </div>

            <div className="form-control cursor-pointer">
              <label htmlFor="blood_type" className="label-text mb-2 block">
                Tipo de Sangre
              </label>
              <select id="blood_type" className="select select-bordered w-full" {...register('blood_type')}>
                <option value="">Seleccionar...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="phone" className="label-text mb-2 block">
                Teléfono
              </label>
              <input id="phone" type="tel" className="input input-bordered w-full" {...register('phone')} />
            </div>
          </div>

          {/* Información de contacto */}
          <div className="form-control">
            <label htmlFor="email" className="label-text mb-2 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
            />
            {errors.email && (
              <span className="text-error text-sm mt-1">{errors.email.message}</span>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="address" className="label-text mb-2 block">
              Dirección
            </label>
            <textarea id="address" className="textarea textarea-bordered w-full" rows={2} {...register('address')} />
          </div>

          {/* Información médica */}
          <div className="divider">Información Médica</div>

          <div className="form-control">
            <label htmlFor="allergies" className="label-text mb-2 block">
              Alergias
            </label>
            <textarea
              id="allergies"
              className="textarea textarea-bordered w-full"
              rows={2}
              placeholder="Ej: Penicilina, polen, maní..."
              {...register('allergies')}
            />
          </div>

          <div className="form-control">
            <label htmlFor="chronic_conditions" className="label-text mb-2 block">
              Condiciones Crónicas
            </label>
            <textarea
              id="chronic_conditions"
              className="textarea textarea-bordered w-full"
              rows={2}
              placeholder="Ej: Diabetes, hipertensión..."
              {...register('chronic_conditions')}
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
                  Guardando...
                </>
              ) : isEditing ? (
                'Guardar Cambios'
              ) : (
                'Crear Paciente'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
