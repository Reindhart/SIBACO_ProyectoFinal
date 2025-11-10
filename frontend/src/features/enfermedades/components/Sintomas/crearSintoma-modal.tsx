import { useState } from 'react'
import { X, FileText } from 'lucide-react'
import { apiClient } from '@/lib/api'

type CreateSymptomModalProps = {
  onClose: () => void
  onSave: () => void
}

export default function CreateSymptomModal({ onClose, onSave }: CreateSymptomModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // El código se genera en el backend al crear el registro
  // Formato: Sxxx (donde xxx es el ID del registro)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!formData.name || !formData.category) {
      setError('Nombre y categoría son campos requeridos')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await apiClient.post('/api/symptoms', formData)
      
      onSave()
    } catch (err: any) {
      setError(err.message || 'Error al crear el síntoma')
      console.error('Error creating symptom:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h3 className="font-bold text-xl">Nuevo Síntoma</h3>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección: Información Básica */}
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                Información del Síntoma
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control md:col-span-2">
                  <fieldset className="m-0">
                    <legend className="font-medium block mb-1">Nombre <span className="text-error">*</span></legend>
                    <input
                      type="text"
                      name="name"
                      className="input input-bordered"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ej: Dolor de Cabeza, Fiebre, Náuseas..."
                      required
                    />
                  </fieldset>
                </div>

                <div className="form-control md:col-span-2">
                  <fieldset className="m-0">
                    <legend className="font-medium block mb-1">Categoría <span className="text-error">*</span></legend>
                    <select
                      name="category"
                      className="select select-bordered"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Respiratorios">Respiratorios</option>
                      <option value="Digestivos">Digestivos</option>
                      <option value="Neurológicos">Neurológicos</option>
                      <option value="Cardiovasculares">Cardiovasculares</option>
                      <option value="Dermatológicos">Dermatológicos</option>
                      <option value="Musculoesqueléticos">Musculoesqueléticos</option>
                      <option value="Sistémicos">Sistémicos</option>
                      <option value="Psicológicos">Psicológicos</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </fieldset>
                </div>

                <div className="form-control md:col-span-2">
                  <fieldset className="m-0">
                    <legend className="font-medium block mb-1">Descripción</legend>
                    <textarea
                      name="description"
                      className="textarea textarea-bordered h-24"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Descripción detallada del síntoma..."
                    />
                  </fieldset>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-action mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.name || !formData.category}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Crear Síntoma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
