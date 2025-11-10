import { useState, useEffect } from 'react'
import DatePickerCustom from '@/components/ui/date-picker'
import { X, FileText, Activity, Beaker } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { Test } from '../pruebas-tab'

type EditTestModalProps = {
  test: Test
  onClose: () => void
  onSave: () => void
}

export default function EditTestModal({ test, onClose, onSave }: EditTestModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    // Lab test fields
    normal_range: '',
    unit: '',
    // Postmortem test fields
    death_cause: '',
    disease_diagnosis: '',
    autopsy_date: '',
    macro_findings: '',
    histology: '',
    toxicology_results: '',
    genetic_results: '',
    pathologic_correlation: '',
    observations: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [diseases, setDiseases] = useState<Array<{ code: string; name: string }>>([])

  useEffect(() => {
    if (test) {
      setFormData({
        code: test.code || '',
        name: test.name || '',
        description: test.description || '',
        category: test.category || '',
        normal_range: test.normal_range || '',
        unit: test.unit || '',
        death_cause: test.death_cause || '',
        disease_diagnosis: test.disease_diagnosis || '',
        autopsy_date: test.autopsy_date || '',
        macro_findings: test.macro_findings || '',
        histology: test.histology || '',
        toxicology_results: test.toxicology_results || '',
        genetic_results: test.genetic_results || '',
        pathologic_correlation: test.pathologic_correlation || '',
        observations: test.observations || ''
      })
    }
  }, [test])

  // Cargar enfermedades para dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/api/diseases?page=1&page_size=1000`)
  const items = ((res as any)?.data || []) as Array<any>
        setDiseases(items.map(d => ({ code: d.code, name: d.name })))
      } catch (err) {
        console.error('Error cargando enfermedades:', err)
      }
    }
    load()
  }, [])

  const parseDate = (v?: string) => (v ? new Date(v) : null)
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, autopsy_date: date ? date.toISOString().split('T')[0] : '' }))
  }

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

    // Validación adicional para postmortem
    if (test.type === 'postmortem' && !formData.death_cause) {
      setError('La causa de muerte es requerida para pruebas post-mortem')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const endpoint = test.type === 'lab' ? `/api/lab-tests/${test.id}` : `/api/postmortem-tests/${test.id}`
      const dataToSend = test.type === 'lab' 
        ? {
            code: formData.code,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            normal_range: formData.normal_range,
            unit: formData.unit
          }
        : {
            code: formData.code,
            death_cause: formData.death_cause,
            disease_diagnosis: formData.disease_diagnosis,
            autopsy_date: formData.autopsy_date,
            macro_findings: formData.macro_findings,
            histology: formData.histology,
            toxicology_results: formData.toxicology_results,
            genetic_results: formData.genetic_results,
            pathologic_correlation: formData.pathologic_correlation,
            observations: formData.observations
          }
      
      await apiClient.post(endpoint, dataToSend)
      
      onSave()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la prueba')
      console.error('Error updating test:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Beaker className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-bold text-xl">Editar Prueba</h3>
              <p className="text-sm text-base-content/60 mt-1">El código no puede ser modificado</p>
            </div>
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
          {/* Indicador de Tipo */}
          <div className="bg-base-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Beaker className="h-5 w-5 text-primary" />
              <div className="flex items-center gap-4">
                <fieldset className="m-0">
                  <legend className="font-semibold">Tipo de Prueba:</legend>
                  <div className="mt-1">
                    <span className="badge badge-lg">
                      {test.type === 'lab' ? 'Laboratorio' : 'Post-mortem'}
                    </span>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          {/* Sección: Información Básica (solo para Laboratorio) */}
          {test.type === 'lab' && (
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  Información Básica
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
                        placeholder={'Ej: Hemograma Completo, Glucosa...'}
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
                        <option value="Hematología">Hematología</option>
                        <option value="Química Sanguínea">Química Sanguínea</option>
                        <option value="Microbiología">Microbiología</option>
                        <option value="Inmunología">Inmunología</option>
                        <option value="Hormonas">Hormonas</option>
                        <option value="Orina">Orina</option>
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
                        placeholder="Descripción detallada de la prueba..."
                      />
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección específica para Lab Tests */}
          {test.type === 'lab' && (
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-primary" />
                  Valores de Referencia
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Unidad de Medida</legend>
                      <p className="text-sm text-base-content/50 mb-2">Unidad en la que se expresa el resultado</p>
                      <input
                        type="text"
                        name="unit"
                        className="input input-bordered"
                        value={formData.unit}
                        onChange={handleChange}
                        placeholder="Ej: mg/dL, mmol/L, células/μL..."
                      />
                    </fieldset>
                  </div>

                  <div className="form-control">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Rango Normal</legend>
                      <p className="text-sm text-base-content/50 mb-2">Valores considerados normales</p>
                      <input
                        type="text"
                        name="normal_range"
                        className="input input-bordered"
                        value={formData.normal_range}
                        onChange={handleChange}
                        placeholder="Ej: 70-100, <200, 4500-11000..."
                      />
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección específica para Postmortem Tests */}
          {test.type === 'postmortem' && (
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-primary" />
                  Datos de Autopsia
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control md:col-span-2">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Causa de Muerte <span className="text-error">*</span></legend>
                      <p className="text-sm text-base-content/50 mb-2">Causa oficial de muerte determinada</p>
                      <input
                        type="text"
                        name="death_cause"
                        className="input input-bordered w-full"
                        value={formData.death_cause}
                        onChange={handleChange}
                        placeholder="Ej: Infarto agudo al miocardio, Neumonía bilateral..."
                        required
                      />
                    </fieldset>
                  </div>

                  <div className="form-control md:col-span-2">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Enfermedad Diagnosticada</legend>
                      <p className="text-sm text-base-content/50 mb-2">Selecciona la enfermedad confirmada</p>
                      <select
                        name="disease_diagnosis"
                        className="select select-bordered w-full"
                        value={formData.disease_diagnosis}
                        onChange={handleChange}
                      >
                        <option value="">-- Ninguna --</option>
                        {diseases.map(d => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    </fieldset>
                  </div>

                  <div className="form-control">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Fecha de Autopsia</legend>
                      <DatePickerCustom
                        selected={parseDate(formData.autopsy_date)}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        className="w-full"
                        placeholder="Seleccionar fecha"
                        maxDate={new Date()}
                      />
                    </fieldset>
                  </div>

                  <div className="form-control md:col-span-2">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Descubrimientos Macroscópicos</legend>
                      <p className="text-sm text-base-content/50 mb-2">Hallazgos visibles durante la autopsia</p>
                      <textarea
                        name="macro_findings"
                        className="textarea textarea-bordered h-20 w-full"
                        value={formData.macro_findings}
                        onChange={handleChange}
                        placeholder="Describe los hallazgos macroscópicos observados..."
                      />
                    </fieldset>
                  </div>

                  <div className="form-control md:col-span-2">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Histología (Microscopía)</legend>
                      <p className="text-sm text-base-content/50 mb-2">Hallazgos microscópicos en tejidos</p>
                      <textarea
                        name="histology"
                        className="textarea textarea-bordered h-20 w-full"
                        value={formData.histology}
                        onChange={handleChange}
                        placeholder="Describe los hallazgos histológicos..."
                      />
                    </fieldset>
                  </div>

                  <div className="form-control">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Resultados Toxicológicos</legend>
                      <textarea
                        name="toxicology_results"
                        className="textarea textarea-bordered h-20 w-full"
                        value={formData.toxicology_results}
                        onChange={handleChange}
                        placeholder="Presencia de sustancias tóxicas..."
                      />
                    </fieldset>
                  </div>

                  <div className="form-control">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Resultados Genéticos</legend>
                      <textarea
                        name="genetic_results"
                        className="textarea textarea-bordered h-20 w-full"
                        value={formData.genetic_results}
                        onChange={handleChange}
                        placeholder="Análisis genéticos realizados..."
                      />
                    </fieldset>
                  </div>

                  <div className="form-control md:col-span-2">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Correlación Clínico-Patológica</legend>
                      <p className="text-sm text-base-content/50 mb-2">Relación entre hallazgos clínicos y autopsia</p>
                      <textarea
                        name="pathologic_correlation"
                        className="textarea textarea-bordered h-20 w-full"
                        value={formData.pathologic_correlation}
                        onChange={handleChange}
                        placeholder="Correlación entre hallazgos clínicos y patológicos..."
                      />
                    </fieldset>
                  </div>

                  <div className="form-control md:col-span-2">
                    <fieldset className="m-0">
                      <legend className="font-medium block mb-1">Observaciones Adicionales</legend>
                      <textarea
                        name="observations"
                        className="textarea textarea-bordered h-20 w-full"
                        value={formData.observations}
                        onChange={handleChange}
                        placeholder="Notas u observaciones adicionales..."
                      />
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              {loading ? <span className="loading loading-spinner"></span> : 'Crear Prueba'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
