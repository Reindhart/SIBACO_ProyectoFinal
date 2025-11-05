/**
 * Página de Registro
 */
import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, AlertCircle } from 'lucide-react'

interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  first_name: string
  last_name: string
  phone?: string
  role: 'admin' | 'doctor'
}

export default function SignUp() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'doctor'
    }
  })
  const [error, setError] = useState<string | null>(null)
  
  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)

    try {
      const { confirmPassword, ...registerData } = data
      await registerUser(registerData)
      navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-base-200">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
              <UserPlus className="h-12 w-12 text-secondary-content" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-base">
            Registro en el Sistema de Diagnóstico Médico
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="alert alert-error">
                <AlertCircle className="h-6 w-6" />
                <span className="whitespace-pre-line">{error}</span>
              </div>
            )}

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
                disabled={isSubmitting}
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

            {/* Contraseñas */}
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
                  placeholder="Repite tu contraseña"
                  className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>

            {/* Divider */}
            <div className="divider">O</div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/sign-in" className="link link-primary font-semibold">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
