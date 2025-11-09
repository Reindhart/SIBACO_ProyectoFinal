import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Activity, X, ChevronDown } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { Disease } from '@/features/enfermedades/components/enfermedades-table'

type Symptom = {
  id: number
  code: string
  name: string
  description?: string
  category: string
}

type Sign = {
  id: number
  code: string
  name: string
  description?: string
  category: string
}

type DiseaseFormData = {
  name: string
  description?: string
  category: string
  severity: string
  treatment_recommendations?: string
  prevention_measures?: string
}

type EditDiseaseModalProps = {
  disease: Disease
  onClose: () => void
  onSave: () => void
}

const DISEASE_CATEGORIES = [
  { label: 'Respiratorio', value: 'RESP' },
  { label: 'Gastrointestinal', value: 'GASTR' },
  { label: 'Cardiovascular', value: 'CARD' },
  { label: 'Neurológico', value: 'NEURO' },
  { label: 'Metabólico', value: 'METAB' },
  { label: 'Infeccioso', value: 'INFEC' },
  { label: 'Dermatológico', value: 'DERM' },
  { label: 'Músculo-esquelético', value: 'MUSCU' },
  { label: 'Endocrino', value: 'ENDOC' },
  { label: 'Inmunológico', value: 'INMUN' },
  { label: 'Renal', value: 'RENAL' },
  { label: 'Hematológico', value: 'HEMAT' },
  { label: 'Oncológico', value: 'ONCOL' },
  { label: 'Psiquiátrico', value: 'PSIQ' },
  { label: 'Oftalmológico', value: 'OFTAL' },
  { label: 'Otorrinolaringológico', value: 'ORL' }
]

export default function EditDiseaseModal({ disease, onClose, onSave }: EditDiseaseModalProps) {
  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([])
  const [allSigns, setAllSigns] = useState<Sign[]>([])
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [selectedSigns, setSelectedSigns] = useState<Sign[]>([])
  const [symptomSearch, setSymptomSearch] = useState('')
  const [signSearch, setSignSearch] = useState('')
  const [isSymptomDropdownOpen, setIsSymptomDropdownOpen] = useState(false)
  const [isSignDropdownOpen, setIsSignDropdownOpen] = useState(false)
  const symptomDropdownRef = useRef<HTMLDivElement>(null)
  const signDropdownRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<DiseaseFormData>({
    defaultValues: {
      name: disease.name,
      description: disease.description || '',
      category: disease.category,
      severity: disease.severity || 'moderada',
      treatment_recommendations: disease.treatment_recommendations || '',
      prevention_measures: disease.prevention_measures || ''
    }
  })

  // Cargar síntomas y signos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [symptomsRes, signsRes] = await Promise.all([
          apiClient.get<{ status: string; data: Symptom[] }>('/api/symptoms'),
          apiClient.get<{ status: string; data: Sign[] }>('/api/signs')
        ])
        setAllSymptoms(symptomsRes.data || [])
        setAllSigns(signsRes.data || [])

        // Establecer síntomas y signos seleccionados si existen
        if (disease.symptoms && Array.isArray(disease.symptoms)) {
          setSelectedSymptoms(disease.symptoms as Symptom[])
        }
        if (disease.signs && Array.isArray(disease.signs)) {
          setSelectedSigns(disease.signs as Sign[])
        }
      } catch (error) {
        console.error('Error loading symptoms/signs:', error)
      }
    }
    fetchData()
  }, [disease])

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (symptomDropdownRef.current && !symptomDropdownRef.current.contains(event.target as Node)) {
        setIsSymptomDropdownOpen(false)
      }
      if (signDropdownRef.current && !signDropdownRef.current.contains(event.target as Node)) {
        setIsSignDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const onSubmit = async (data: DiseaseFormData) => {
    try {
      const payload = {
        ...data,
        symptom_ids: selectedSymptoms.map(s => s.id),
        sign_ids: selectedSigns.map(s => s.id)
      }
      await apiClient.put(`/api/diseases/${disease.code}`, payload)
      onSave()
    } catch (error: any) {
      console.error('Error saving disease:', error)
      alert(error.message || 'Error al guardar la enfermedad')
    }
  }

  const addSymptom = (symptom: Symptom) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  const removeSymptom = (symptomId: number) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId))
  }

  const addSign = (sign: Sign) => {
    if (!selectedSigns.find(s => s.id === sign.id)) {
      setSelectedSigns([...selectedSigns, sign])
    }
  }

  const removeSign = (signId: number) => {
    setSelectedSigns(selectedSigns.filter(s => s.id !== signId))
  }

  const filteredSymptoms = allSymptoms.filter(
    s =>
      !selectedSymptoms.find(sel => sel.id === s.id) &&
      (s.name.toLowerCase().includes(symptomSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(symptomSearch.toLowerCase()))
  )

  const filteredSigns = allSigns.filter(
    s =>
      !selectedSigns.find(sel => sel.id === s.id) &&
      (s.name.toLowerCase().includes(signSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(signSearch.toLowerCase()))
  )

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold">Editar Enfermedad</h3>
              <p className="text-sm text-base-content/70">Código: {disease.code}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label htmlFor="name" className="label-text mb-2 block">
                Nombre de la Enfermedad *
              </label>
              <input
                id="name"
                type="text"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                placeholder="Ej: Gripe, Neumonía, Gastroenteritis"
                {...register('name', { required: 'El nombre es obligatorio' })}
              />
              {errors.name && <span className="text-error text-sm mt-1">{errors.name.message}</span>}
            </div>

            <div className="form-control">
              <label htmlFor="category" className="label-text mb-2 block">
                Tipo de Enfermedad (Categoría) *
              </label>
              <select
                id="category"
                className={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
                {...register('category', { required: 'La categoría es obligatoria' })}
              >
                <option value="">Seleccione una categoría</option>
                {DISEASE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} ({cat.value})
                  </option>
                ))}
              </select>
              {errors.category && <span className="text-error text-sm mt-1">{errors.category.message}</span>}
            </div>

            <div className="form-control">
              <label htmlFor="severity" className="label-text mb-2 block">
                Severidad *
              </label>
              <select
                id="severity"
                className="select select-bordered w-full"
                {...register('severity', { required: 'La severidad es obligatoria' })}
              >
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="grave">Grave</option>
                <option value="crítica">Crítica</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="form-control">
            <label htmlFor="description" className="label-text mb-2 block">
              Descripción
            </label>
            <textarea
              id="description"
              className="textarea textarea-bordered w-full h-24"
              placeholder="Descripción detallada de la enfermedad, causas, manifestaciones clínicas..."
              {...register('description')}
            />
          </div>

          <div className="divider">Información Clínica</div>

          {/* Tratamientos */}
          <div className="form-control">
            <label htmlFor="treatment_recommendations" className="label-text mb-2 block">
              Tratamientos Recomendados
            </label>
            <span className="text-xs text-base-content/70 mb-2 block">
              Ingrese cada tratamiento en una línea separada (se mostrará como lista)
            </span>
            <textarea
              id="treatment_recommendations"
              className="textarea textarea-bordered w-full h-32"
              placeholder={'Ej:\nReposo absoluto por 7 días\nParacetamol 500mg cada 8 horas'}
              {...register('treatment_recommendations')}
            />
          </div>

          {/* Medidas de prevención */}
          <div className="form-control">
            <label htmlFor="prevention_measures" className="label-text mb-2 block">
              Medidas de Prevención
            </label>
            <span className="text-xs text-base-content/70 mb-2 block">
              Ingrese cada medida en una línea separada (se mostrará como lista)
            </span>
            <textarea
              id="prevention_measures"
              className="textarea textarea-bordered w-full h-32"
              placeholder={'Ej:\nLavado frecuente de manos\nVacunación anual'}
              {...register('prevention_measures')}
            />
          </div>

          <div className="divider">Síntomas y Signos</div>

          {/* Selector de Síntomas y Signos con Combobox */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selector de Síntomas con Combobox */}
            <div className="form-control" ref={symptomDropdownRef}>
              <label className="label-text mb-2 block font-semibold">Síntomas</label>
              
              {/* Combobox input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar síntoma..."
                  className="input input-bordered w-full pr-10"
                  value={symptomSearch}
                  onChange={e => setSymptomSearch(e.target.value)}
                  onFocus={() => setIsSymptomDropdownOpen(true)}
                />
                <button
                  type="button"
                  onClick={() => setIsSymptomDropdownOpen(!isSymptomDropdownOpen)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <ChevronDown className={`h-4 w-4 text-base-content/50 transition-transform ${isSymptomDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown list */}
                {isSymptomDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 border border-base-300 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-y-auto">
                    {(symptomSearch ? filteredSymptoms : allSymptoms).length === 0 ? (
                      <p className="text-sm text-base-content/50 text-center py-4">
                        No se encontraron síntomas
                      </p>
                    ) : (
                      <div className="p-1">
                        {(symptomSearch ? filteredSymptoms : allSymptoms).map(symptom => {
                          const isSelected = selectedSymptoms.find(s => s.id === symptom.id)
                          return (
                            <button
                              key={symptom.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  removeSymptom(symptom.id)
                                } else {
                                  addSymptom(symptom)
                                }
                                setSymptomSearch('')
                              }}
                              className={`w-full text-left px-3 py-2 rounded hover:bg-base-200 transition-colors flex items-start gap-2 ${isSelected ? 'bg-base-200' : ''}`}
                            >
                              {isSelected && (
                                <svg className="h-5 w-5 text-success shrink-0 mt-0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-sm">{symptom.name}</div>
                                <div className="text-xs text-base-content/60">{symptom.code}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected symptoms */}
              {selectedSymptoms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedSymptoms.map(symptom => (
                    <div key={symptom.id} className="badge badge-primary gap-2">
                      {symptom.name}
                      <button
                        type="button"
                        onClick={() => removeSymptom(symptom.id)}
                        className="btn btn-ghost btn-xs btn-circle"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selector de Signos con Combobox */}
            <div className="form-control" ref={signDropdownRef}>
              <label className="label-text mb-2 block font-semibold">Signos Clínicos</label>
              
              {/* Combobox input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar signo..."
                  className="input input-bordered w-full pr-10"
                  value={signSearch}
                  onChange={e => setSignSearch(e.target.value)}
                  onFocus={() => setIsSignDropdownOpen(true)}
                />
                <button
                  type="button"
                  onClick={() => setIsSignDropdownOpen(!isSignDropdownOpen)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <ChevronDown className={`h-4 w-4 text-base-content/50 transition-transform ${isSignDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown list */}
                {isSignDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 border border-base-300 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-y-auto">
                    {(signSearch ? filteredSigns : allSigns).length === 0 ? (
                      <p className="text-sm text-base-content/50 text-center py-4">
                        No se encontraron signos
                      </p>
                    ) : (
                      <div className="p-1">
                        {(signSearch ? filteredSigns : allSigns).map(sign => {
                          const isSelected = selectedSigns.find(s => s.id === sign.id)
                          return (
                            <button
                              key={sign.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  removeSign(sign.id)
                                } else {
                                  addSign(sign)
                                }
                                setSignSearch('')
                              }}
                              className={`w-full text-left px-3 py-2 rounded hover:bg-base-200 transition-colors flex items-start gap-2 ${isSelected ? 'bg-base-200' : ''}`}
                            >
                              {isSelected && (
                                <svg className="h-5 w-5 text-success shrink-0 mt-0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-sm">{sign.name}</div>
                                <div className="text-xs text-base-content/60">{sign.code}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected signs */}
              {selectedSigns.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedSigns.map(sign => (
                    <div key={sign.id} className="badge badge-secondary gap-2">
                      {sign.name}
                      <button
                        type="button"
                        onClick={() => removeSign(sign.id)}
                        className="btn btn-ghost btn-xs btn-circle"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
