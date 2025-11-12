import { useForm, Controller } from 'react-hook-form'
import { X, Calendar } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { apiClient } from '@/lib/api'

type PatientFormData = {
  first_name: string
  second_name?: string
  paternal_surname: string
  maternal_surname?: string
  date_of_birth: string
  gender: string
  blood_type?: string
  blood_type_abo?: number
  blood_type_rh?: number
  height?: number
  weight?: number
  smoking_status?: string
  alcohol_consumption?: string
  email?: string
  phone?: string
  address?: string
  allergies?: string
  chronic_conditions?: string
}

type CreatePatientModalProps = {
  onClose: () => void
  onSave: () => void
}

export default function CreatePatientModal({ onClose, onSave }: CreatePatientModalProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PatientFormData>({
    defaultValues: {
      first_name: '',
      second_name: '',
      paternal_surname: '',
      maternal_surname: '',
      date_of_birth: '',
      gender: '',
      blood_type: '',
  blood_type_abo: undefined,
  blood_type_rh: undefined,
      height: undefined,
      weight: undefined,
      smoking_status: '',
      alcohol_consumption: '',
      email: '',
      phone: '',
      address: '',
      allergies: '',
      chronic_conditions: ''
    }
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      // Enviar ABO y RH por separado según el modelo del servidor
      const payload = { ...data }
      if (!payload.blood_type_abo && payload.blood_type) {
        const map = mapBloodStringToCodes(payload.blood_type)
        payload.blood_type_abo = map.abo
        payload.blood_type_rh = map.rh
      }
      // Eliminar el campo combinado para evitar confusión
      delete payload.blood_type
      await apiClient.post('/api/patients', payload)
      onSave()
    } catch (error: any) {
      console.error('Error saving patient:', error)
      alert(error.message || 'Error al guardar el paciente')
    }
  }

  // Mapeo helper: convierte 'A+' -> { abo: 1, rh: 1 } (asumimos mapping ABO: A=1,B=2,AB=3,O=0)
  // NOTA: Asumo la siguiente codificación en el backend: O=0, A=1, B=2, AB=3; Rh: + => 1, - => 0
  const mapBloodStringToCodes = (bt: string | undefined) => {
    if (!bt) return { abo: undefined, rh: undefined }
    const match = bt.match(/^((A|B|AB|O))(\+|-)$/)
    if (!match) return { abo: undefined, rh: undefined }
    const aboStr = match[1]
    const rh = match[3] === '+' ? 1 : 0
    let abo: number | undefined = undefined
    switch (aboStr) {
      case 'O':
        abo = 0
        break
      case 'A':
        abo = 1
        break
      case 'B':
        abo = 2
        break
      case 'AB':
        abo = 3
        break
    }
    return { abo, rh }
  }

  // mapCodesToBloodString removed (no usado en creación)

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Nuevo Paciente</h3>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label htmlFor="first_name" className="label-text mb-2 block">
                Primer Nombre *
              </label>
              <input
                id="first_name"
                type="text"
                className={`input input-bordered w-full ${errors.first_name ? 'input-error' : ''}`}
                {...register('first_name', { required: 'El primer nombre es obligatorio' })}
              />
              {errors.first_name && (
                <span className="text-error text-sm mt-1">{errors.first_name.message}</span>
              )}
            </div>

            <div className="form-control">
              <label htmlFor="second_name" className="label-text mb-2 block">
                Segundo Nombre
              </label>
              <input
                id="second_name"
                type="text"
                className="input input-bordered w-full"
                {...register('second_name')}
              />
            </div>

            <div className="form-control">
              <label htmlFor="paternal_surname" className="label-text mb-2 block">
                Apellido Paterno *
              </label>
              <input
                id="paternal_surname"
                type="text"
                className={`input input-bordered w-full ${errors.paternal_surname ? 'input-error' : ''}`}
                {...register('paternal_surname', { required: 'El apellido paterno es obligatorio' })}
              />
              {errors.paternal_surname && (
                <span className="text-error text-sm mt-1">{errors.paternal_surname.message}</span>
              )}
            </div>

            <div className="form-control">
              <label htmlFor="maternal_surname" className="label-text mb-2 block">
                Apellido Materno
              </label>
              <input
                id="maternal_surname"
                type="text"
                className="input input-bordered w-full"
                {...register('maternal_surname')}
              />
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
              <select
                id="blood_type"
                className="select select-bordered w-full"
                {...register('blood_type', {
                  onChange: (e) => {
                    const val = (e.target as HTMLSelectElement).value
                    const map = mapBloodStringToCodes(val)
                    setValue('blood_type_abo', map.abo)
                    setValue('blood_type_rh', map.rh)
                  }
                })}
              >
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

          {/* Datos antropométricos y hábitos */}
          <div className="divider">Datos Antropométricos y Hábitos</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label htmlFor="height" className="label-text mb-2 block">
                Altura (cm)
              </label>
              <input
                id="height"
                type="number"
                step="0.1"
                min="0"
                max="300"
                placeholder="Ej: 175.5"
                className="input input-bordered w-full"
                {...register('height', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'La altura debe ser positiva' },
                  max: { value: 300, message: 'Altura no válida' }
                })}
              />
              {errors.height && (
                <span className="text-error text-sm mt-1">{errors.height.message}</span>
              )}
            </div>

            <div className="form-control">
              <label htmlFor="weight" className="label-text mb-2 block">
                Peso (kg)
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                max="500"
                placeholder="Ej: 70.5"
                className="input input-bordered w-full"
                {...register('weight', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'El peso debe ser positivo' },
                  max: { value: 500, message: 'Peso no válido' }
                })}
              />
              {errors.weight && (
                <span className="text-error text-sm mt-1">{errors.weight.message}</span>
              )}
            </div>

            <div className="form-control cursor-pointer">
              <label htmlFor="smoking_status" className="label-text mb-2 block">
                Estado de Fumador
              </label>
              <select id="smoking_status" className="select select-bordered w-full" {...register('smoking_status')}>
                <option value="">Seleccionar...</option>
                <option value="nunca">Nunca ha fumado</option>
                <option value="ex-fumador">Ex-fumador</option>
                <option value="fumador">Fumador activo</option>
                <option value="ocasional">Fumador ocasional</option>
              </select>
            </div>

            <div className="form-control cursor-pointer">
              <label htmlFor="alcohol_consumption" className="label-text mb-2 block">
                Consumo de Alcohol
              </label>
              <select id="alcohol_consumption" className="select select-bordered w-full" {...register('alcohol_consumption')}>
                <option value="">Seleccionar...</option>
                <option value="nunca">Nunca</option>
                <option value="ocasional">Ocasional</option>
                <option value="moderado">Moderado</option>
                <option value="frecuente">Frecuente</option>
              </select>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="divider">Información de Contacto</div>

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
