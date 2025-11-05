import { createFileRoute } from '@tanstack/react-router'
import EnfermedadesPage from '@/features/enfermedades'

export const Route = createFileRoute('/_authenticated/enfermedades/enfermedades')({
  component: EnfermedadesPage,
})
