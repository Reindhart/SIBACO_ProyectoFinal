import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Save, AlertCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'

type UserItem = {
  id: number
  username: string
  email: string
  role: 'admin' | 'doctor'
  first_name?: string
  last_name?: string
  phone?: string
  is_active: boolean
}

interface UserFormData {
  username: string
  email: string
  password?: string
  confirmPassword?: string
  first_name: string
  last_name: string
  phone?: string
  role: 'admin' | 'doctor'
}

interface UserModalProps {
  user: UserItem | null
  onClose: () => void
  onSave: () => void
}

export default function UserModal({ user, onClose, onSave }: UserModalProps) {
  const isEditing = !!user
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    defaultValues: {
      role: 'doctor',
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone: '',
    }
  })

  const password = watch('password')

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role: user.role,
      })
    }
  }, [user, reset])

  const onSubmit = async (data: UserFormData) => {
    setError(null)
    setSuccess(null)

    try {
      if (isEditing) {
        // Actualizar usuario
        const { password: _password, confirmPassword: _confirmPassword, ...updateData } = data
        await apiClient.put(`/api/users/${user.id}`, updateData)
        setSuccess('Usuario actualizado correctamente')
      } else {
        // Crear nuevo usuario
        const { confirmPassword: _confirmPassword, ...createData } = data
        await apiClient.post('/api/auth/register', createData)
        setSuccess('Usuario creado correctamente')
      }

      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        onSave()
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al guardar usuario')
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl">
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h3>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error mb-4">
            <AlertCircle className="h-6 w-6" />
            <span className="whitespace-pre-line">{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Grid de 2 columnas para nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Nombre</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Juan"
                className={`input input-bordered w-full ${errors.first_name ? 'input-error' : ''}`}
                {...register('first_name')}
                disabled={isSubmitting}
              />
              {errors.first_name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.first_name.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Apellido</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Pérez"
                className={`input input-bordered w-full ${errors.last_name ? 'input-error' : ''}`}
                {...register('last_name')}
                disabled={isSubmitting}
              />
              {errors.last_name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.last_name.message}</span>
                </label>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Usuario *</span>
            </label>
            <input
              type="text"
              placeholder="Nombre de usuario único"
              className={`input input-bordered w-full ${errors.username ? 'input-error' : ''}`}
              {...register('username', {
                required: 'El usuario es requerido',
                minLength: { value: 3, message: 'El usuario debe tener al menos 3 caracteres' }
              })}
              disabled={isSubmitting || isEditing}
            />
            {errors.username && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.username.message}</span>
              </label>
            )}
          </div>

          {/* Email y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Email *</span>
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                disabled={isSubmitting}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Teléfono</span>
              </label>
              <input
                type="tel"
                placeholder="555-1234"
                className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                {...register('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.phone.message}</span>
                </label>
              )}
            </div>
          </div>

          {/* Rol */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Rol *</span>
            </label>
            <select
              className={`select select-bordered w-full ${errors.role ? 'select-error' : ''}`}
              {...register('role', { required: 'El rol es requerido' })}
              disabled={isSubmitting}
            >
              <option value="doctor">Médico</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.role && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.role.message}</span>
              </label>
            )}
          </div>

          {/* Contraseñas - Solo al crear */}
          {!isEditing && (
            <>
              <div className="divider">Contraseña</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Contraseña *</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                    })}
                    disabled={isSubmitting}
                  />
                  {errors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.password.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Confirmar Contraseña *</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Repetir contraseña"
                    className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Debe confirmar la contraseña',
                      validate: value => value === password || 'Las contraseñas no coinciden'
                    })}
                    disabled={isSubmitting}
                  />
                  {errors.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
                    </label>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {isEditing ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
