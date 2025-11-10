import { createFileRoute } from '@tanstack/react-router'
import UsuariosPage from '@/features/admin/usuarios'

export const Route = createFileRoute('/_authenticated/admin/usuarios/')({
  component: UsuariosPage,
})
