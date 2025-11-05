import { createFileRoute } from '@tanstack/react-router'
import PacientesPage from '@/features/pacientes'

export const Route = createFileRoute('/_authenticated/pacientes/pacientes')({
  component: PacientesPage,
})
