import { useAuth } from '@/lib/auth'
import UsersCrud from '@/features/admin/usuarios/components/usuarios-table'
import NotFoundPage from '@/features/errors/not-found'

export default function UsuariosPage() {
	const { user, isLoading } = useAuth()

	// mientras cargamos estado de auth, evitar render incorrecto
	if (isLoading) return null

	// si no es admin, mostrar 404 (según requerimiento)
	if (!user || user.role !== 'admin') {
		return <NotFoundPage />
	}

	return (
		<div className="container mx-auto p-6">
			<UsersCrud />
		</div>
	)
}
