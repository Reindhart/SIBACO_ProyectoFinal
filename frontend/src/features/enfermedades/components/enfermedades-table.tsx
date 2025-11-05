import { Edit } from 'lucide-react'

export type Disease = {
  code: string
  name: string
  description?: string
  category: string
  severity?: string
  treatment_recommendations?: string
  prevention_measures?: string
  symptoms?: Array<{ code: string; name: string }>
  signs?: Array<{ code: string; name: string }>
  is_active?: boolean
}

type DiseasesTableProps = {
  diseases: Disease[]
  onEdit: (disease: Disease) => void
}

export default function DiseasesTable({ diseases, onEdit }: DiseasesTableProps) {
  // Función para convertir texto con saltos de línea en bullet list
  const renderBulletList = (text?: string) => {
    if (!text) return <span className="text-base-content/50 text-sm italic">No especificado</span>
    
    const items = text.split('\n').filter(item => item.trim())
    if (items.length === 0) return <span className="text-base-content/50 text-sm italic">No especificado</span>
    
    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm">{item.trim()}</li>
        ))}
      </ul>
    )
  }

  // Función para renderizar lista de síntomas/signos
  const renderRelationList = (items?: Array<{ code: string; name: string }>) => {
    if (!items || items.length === 0) {
      return <span className="text-base-content/50 text-sm italic">No especificados</span>
    }
    
    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item) => (
          <li key={item.code} className="text-sm">{item.name}</li>
        ))}
      </ul>
    )
  }

  const severityBadge = (severity?: string) => {
    const colors = {
      'leve': 'badge-success',
      'moderada': 'badge-warning',
      'grave': 'badge-error',
      'crítica': 'badge-error'
    }
    return (
      <span className={`badge ${colors[severity as keyof typeof colors] || 'badge-ghost'}`}>
        {severity || 'No especificada'}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <table className="table w-full">
        <thead className="bg-base-200">
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Severidad</th>
            <th>Categoría</th>
            <th>Síntomas</th>
            <th>Signos</th>
            <th>Tratamientos</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {diseases.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-8 text-base-content/50">
                No hay enfermedades registradas
              </td>
            </tr>
          ) : (
            diseases.map((disease) => (
              <tr key={disease.code} className="hover">
                <td className="font-mono font-semibold">{disease.code}</td>
                <td className="font-semibold">{disease.name}</td>
                <td className="max-w-xs">
                  <p className="text-sm line-clamp-3">{disease.description || 'Sin descripción'}</p>
                </td>
                <td>{severityBadge(disease.severity)}</td>
                <td>
                  <span className="badge badge-outline">{disease.category}</span>
                </td>
                <td className="max-w-xs">
                  {renderRelationList(disease.symptoms)}
                </td>
                <td className="max-w-xs">
                  {renderRelationList(disease.signs)}
                </td>
                <td className="max-w-xs">
                  {renderBulletList(disease.treatment_recommendations)}
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-ghost btn-circle btn-sm"
                    onClick={() => onEdit(disease)}
                    title="Editar enfermedad"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
