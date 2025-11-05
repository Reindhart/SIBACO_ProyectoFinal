/**
 * Página de Inicio de Sesión
 */
import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, AlertCircle, Info } from 'lucide-react'

interface LoginFormData {
  username: string
  password: string
}

export default function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: LoginFormData) => {
    setError(null)

    try {
      await login(data.username, data.password)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-base-200">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-primary-content" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-base">
            Sistema de Diagnóstico Médico
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="alert alert-error">
                <AlertCircle className="h-6 w-6" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Usuario</span>
              </label>
              <input
                type="text"
                placeholder="Ingresa tu usuario"
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

            {/* Password Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Contraseña</span>
              </label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
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
              <label className="label">
                <span className="label-text-alt link link-hover">¿Olvidaste tu contraseña?</span>
              </label>
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
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Divider */}
            <div className="divider">O</div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm">
                ¿No tienes una cuenta?{' '}
                <Link to="/sign-up" className="link link-primary font-semibold">
                  Crear cuenta
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="alert alert-info mt-4">
              <Info className="w-6 h-6" />
              <div className="text-xs">
                <p className="font-bold">Cuentas de prueba:</p>
                <p>Admin: admin / admin123</p>
                <p>Doctor: doctor / doctor123</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
