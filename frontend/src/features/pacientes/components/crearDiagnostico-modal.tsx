import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { X, Stethoscope, Trash2, ChevronDown } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { Patient } from './pacientes-table'

type Symptom = {
  id: number
  code: string
  name: string
  category: string
}

type Sign = {
  id: number
  code: string
  name: string
  measurement_unit?: string
}

type LabTest = {
  id: number
  code: string
  name: string
  unit: string
}

type SelectedSign = {
  id: number
  code: string
  name: string
  unit: string
  value: string
}

type SelectedLabTest = {
  id: number
  code: string
  name: string
  unit: string
  value: string
}

type DiagnosisFormData = {
  notes?: string
}

type DiagnosisModalProps = {
  patient: Patient
  onClose: () => void
  onSave: () => void
}

export default function DiagnosisModal({ patient, onClose, onSave }: DiagnosisModalProps) {
  // Estados para datos desde API
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [signs, setSigns] = useState<Sign[]>([])
  const [labTests, setLabTests] = useState<LabTest[]>([])
  
  // Estados para búsqueda/filtrado
  const [symptomSearch, setSymptomSearch] = useState('')
  const [signSearch, setSignSearch] = useState('')
  const [labTestSearch, setLabTestSearch] = useState('')
  
  // Estados para selecciones
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [selectedSigns, setSelectedSigns] = useState<SelectedSign[]>([])
  const [selectedLabTests, setSelectedLabTests] = useState<SelectedLabTest[]>([])
  
  // Estados para dropdowns
  const [showSymptomDropdown, setShowSymptomDropdown] = useState(false)
  const [showSignDropdown, setShowSignDropdown] = useState(false)
  const [showLabTestDropdown, setShowLabTestDropdown] = useState(false)
  
  // Referencias para detectar clicks fuera
  const symptomDropdownRef = useRef<HTMLDivElement>(null)
  const signDropdownRef = useRef<HTMLDivElement>(null)
  const labTestDropdownRef = useRef<HTMLDivElement>(null)

  // Timeouts para manejar blur sin bloquear clicks en el dropdown
  const symptomBlurTimeoutRef = useRef<number | null>(null)
  const signBlurTimeoutRef = useRef<number | null>(null)
  const labTestBlurTimeoutRef = useRef<number | null>(null)

  const handleSymptomBlur = () => {
    symptomBlurTimeoutRef.current = window.setTimeout(() => {
      setShowSymptomDropdown(false)
      symptomBlurTimeoutRef.current = null
    }, 150)
  }
  const handleSymptomFocus = () => {
    if (symptomBlurTimeoutRef.current) {
      window.clearTimeout(symptomBlurTimeoutRef.current)
      symptomBlurTimeoutRef.current = null
    }
    setShowSymptomDropdown(true)
  }

  const handleSignBlur = () => {
    signBlurTimeoutRef.current = window.setTimeout(() => {
      setShowSignDropdown(false)
      signBlurTimeoutRef.current = null
    }, 150)
  }
  const handleSignFocus = () => {
    if (signBlurTimeoutRef.current) {
      window.clearTimeout(signBlurTimeoutRef.current)
      signBlurTimeoutRef.current = null
    }
    setShowSignDropdown(true)
  }

  const handleLabBlur = () => {
    labTestBlurTimeoutRef.current = window.setTimeout(() => {
      setShowLabTestDropdown(false)
      labTestBlurTimeoutRef.current = null
    }, 150)
  }
  const handleLabFocus = () => {
    if (labTestBlurTimeoutRef.current) {
      window.clearTimeout(labTestBlurTimeoutRef.current)
      labTestBlurTimeoutRef.current = null
    }
    setShowLabTestDropdown(true)
  }

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting }
  } = useForm<DiagnosisFormData>({
    defaultValues: {
      notes: ''
    }
  })

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar síntomas, signos y pruebas de laboratorio
        const [symptoms, signs, labTests] = await Promise.all([
          apiClient.get<{ data: Symptom[] }>('/api/symptoms?page=1&page_size=1000'),
          apiClient.get<{ data: Sign[] }>('/api/signs?page=1&page_size=1000'),
          apiClient.get<{ data: LabTest[] }>('/api/lab-tests?page=1&page_size=1000')
        ])

        setSymptoms(symptoms.data || [])
        setSigns(signs.data || [])
        setLabTests(labTests.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (symptomDropdownRef.current && !symptomDropdownRef.current.contains(event.target as Node)) {
        setShowSymptomDropdown(false)
      }
      if (signDropdownRef.current && !signDropdownRef.current.contains(event.target as Node)) {
        setShowSignDropdown(false)
      }
      if (labTestDropdownRef.current && !labTestDropdownRef.current.contains(event.target as Node)) {
        setShowLabTestDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrar síntomas
  const filteredSymptoms = symptoms.filter(symptom =>
    symptom.name.toLowerCase().includes(symptomSearch.toLowerCase()) &&
    !selectedSymptoms.find(s => s.id === symptom.id)
  )

  // Filtrar signos
  const filteredSigns = signs.filter(sign =>
    sign.name.toLowerCase().includes(signSearch.toLowerCase()) &&
    !selectedSigns.find(s => s.id === sign.id)
  )

  // Filtrar pruebas de laboratorio
  const filteredLabTests = labTests.filter(test =>
    test.name.toLowerCase().includes(labTestSearch.toLowerCase()) &&
    !selectedLabTests.find(t => t.id === test.id)
  )

  // Agregar síntoma
  const addSymptom = (symptom: Symptom) => {
    setSelectedSymptoms([...selectedSymptoms, symptom])
    setSymptomSearch('')
    setShowSymptomDropdown(false)
    // Limpiar error de validación si existe
    clearErrors('notes') // Usamos 'notes' como proxy para errores custom
  }

  // Eliminar síntoma
  const removeSymptom = (id: number) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== id))
  }

  // Agregar signo
  const addSign = (sign: Sign) => {
    // Normalizar unidad: preferir unit, luego measurement_unit
    const unit = (sign.measurement_unit as string) || ''
    setSelectedSigns([...selectedSigns, { ...sign, unit, value: '' }])
    setSignSearch('')
    setShowSignDropdown(false)
    // Limpiar error de validación si existe
    clearErrors('notes')
  }

  // Eliminar signo
  const removeSign = (id: number) => {
    setSelectedSigns(selectedSigns.filter(s => s.id !== id))
  }

  // Actualizar valor de signo
  const updateSignValue = (id: number, value: string) => {
    setSelectedSigns(selectedSigns.map(s => 
      s.id === id ? { ...s, value } : s
    ))
  }

  // Agregar prueba de laboratorio
  const addLabTest = (test: LabTest) => {
    setSelectedLabTests([...selectedLabTests, { ...test, value: '' }])
    setLabTestSearch('')
    setShowLabTestDropdown(false)
  }

  // Eliminar prueba de laboratorio
  const removeLabTest = (id: number) => {
    setSelectedLabTests(selectedLabTests.filter(t => t.id !== id))
  }

  // Actualizar valor de prueba de laboratorio
  const updateLabTestValue = (id: number, value: string) => {
    setSelectedLabTests(selectedLabTests.map(t => 
      t.id === id ? { ...t, value } : t
    ))
  }

  const onSubmit = async (data: DiagnosisFormData) => {
    try {
      // Validaciones - Signos obligatorios
      if (selectedSigns.length === 0) {
        setError('notes', { 
          type: 'manual', 
          message: 'Debe registrar al menos un signo vital' 
        })
        alert('Debe registrar al menos un signo vital')
        return
      }

      // Validar que todos los signos tengan valores
      const emptySigns = selectedSigns.filter(s => !s.value.trim())
      if (emptySigns.length > 0) {
        setError('notes', { 
          type: 'manual', 
          message: 'Todos los signos deben tener un valor registrado' 
        })
        alert('Todos los signos deben tener un valor registrado')
        return
      }

      // Validar que todas las pruebas de laboratorio tengan valores (si se agregaron)
      const emptyLabTests = selectedLabTests.filter(t => !t.value.trim())
      if (emptyLabTests.length > 0) {
        setError('notes', { 
          type: 'manual', 
          message: 'Todas las pruebas de laboratorio agregadas deben tener un valor registrado' 
        })
        alert('Todas las pruebas de laboratorio agregadas deben tener un valor registrado')
        return
      }

      // Construir los datos en formato que el backend espera (arrays de objetos)
      const symptomsData = selectedSymptoms.map(s => ({
        symptom_id: s.id,
        note: undefined
      }))

      const signsData = selectedSigns.map(s => {
        const numericValue = parseFloat(s.value)
        return {
          sign_id: s.id,
          value_numeric: !isNaN(numericValue) ? numericValue : undefined,
          value_text: isNaN(numericValue) ? s.value : undefined,
          unit: s.unit || undefined,
          note: undefined
        }
      })

      const labResultsData = selectedLabTests.length > 0 ? selectedLabTests.map(t => {
        const numericValue = parseFloat(t.value)
        return {
          lab_test_id: t.id,
          value_numeric: !isNaN(numericValue) ? numericValue : undefined,
          value_text: isNaN(numericValue) ? t.value : undefined,
          unit: t.unit || undefined,
          note: undefined
        }
      }) : undefined

      // El backend espera 'symptoms' y 'signs' (arrays, NO strings)
      const payload = {
        patient_id: patient.id,
        symptoms: symptomsData, // Array de objetos (puede estar vacío)
        signs: signsData,        // Array de objetos (obligatorio, mínimo 1)
        lab_results: labResultsData, // Array de objetos o undefined
        notes: data.notes || undefined
      }
      
      console.log('📤 Sending payload:', payload)
      
      // Usar apiClient.post correctamente (endpoint: string, data: unknown)
      const responseData = await apiClient.post<{ data: any }>('/api/diagnoses', payload)
      
      console.log('📥 Response:', responseData)
      
      // Mostrar resultado del diagnóstico
      if (responseData?.data) {
        const result = responseData.data
        const message = `✅ Diagnóstico creado exitosamente\n\n` +
          `ID: ${result.id}\n` +
          (result.disease_name ? `🏥 Enfermedad: ${result.disease_name} (${result.disease_code})\n` : '') +
          (result.confidence_score ? `📊 Confianza: ${result.confidence_score}%\n` : '') +
          (result.treatment ? `\n💊 Tratamiento:\n${result.treatment}\n` : '') +
          (result.alternative_diagnoses?.length > 0 
            ? `\n🔄 Diagnósticos alternativos:\n${result.alternative_diagnoses.map((alt: any, i: number) => 
                `${i + 1}. ${alt.disease_name} (${alt.confidence}%)`
              ).join('\n')}`
            : '')
        
        alert(message)
      } else {
        alert('✅ Diagnóstico creado exitosamente')
      }
      
      onSave()
    } catch (error: any) {
      console.error('❌ Error creating diagnosis:', error)
      
      // El error ya viene procesado por apiClient.request()
      const errorMessage = error.message || 'Error al crear el diagnóstico'
      alert(`Error: ${errorMessage}`)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold">Nuevo Diagnóstico</h3>
              <p className="text-sm text-base-content/70">
                Paciente: {patient.full_name}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* SÍNTOMAS */}
          <div className="form-control" ref={symptomDropdownRef}>
            <div className="divider">
              <span className="text-sm font-semibold">Síntomas Presentados (Opcional)</span>
            </div>
            
            <label className="label-text mb-2 block text-xs text-base-content/70">
              Seleccione los síntomas reportados por el paciente (opcional - para chequeos normales puede dejarse vacío)
            </label>

            {/* Selector de síntomas */}
            <div className="relative">
              <input
                type="text"
                className="input input-bordered w-full pr-10"
                placeholder="Buscar síntoma... (Ej: Fiebre, Dolor de cabeza, Tos)"
                value={symptomSearch}
                onChange={(e) => setSymptomSearch(e.target.value)}
                onFocus={handleSymptomFocus}
                onBlur={handleSymptomBlur}
              />
              <button
                type="button"
                onClick={() => setShowSymptomDropdown(!showSymptomDropdown)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <ChevronDown className={`h-4 w-4 text-base-content/50 transition-transform ${showSymptomDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown de síntomas */}
              {showSymptomDropdown && filteredSymptoms.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredSymptoms.slice(0, 20).map((symptom) => (
                    <button
                      key={symptom.id}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-base-300 flex justify-between items-center cursor-pointer"
                      onClick={() => addSymptom(symptom)}
                    >
                      <span>{symptom.name}</span>
                      <span className="badge badge-sm">{symptom.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Badges de síntomas seleccionados */}
            <div className="flex flex-wrap gap-2 mt-3 min-h-8">
              {selectedSymptoms.length === 0 ? (
                <span className="text-sm text-base-content/50 italic">No hay síntomas seleccionados (chequeo normal)</span>
              ) : (
                selectedSymptoms.map((symptom) => (
                  <div key={symptom.id} className="badge badge-primary gap-2 p-3">
                    <span>{symptom.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSymptom(symptom.id)}
                      className="hover:text-error"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SIGNOS */}
          <div className="form-control" ref={signDropdownRef}>
            <div className="divider">
              <span className="text-sm font-semibold">Signos Observados *</span>
            </div>
            
            <label className="label-text mb-2 block text-xs text-base-content/70">
              Seleccione los signos clínicos y registre sus valores (obligatorio - mínimo 1 signo vital)
            </label>

            {/* Selector de signos */}
            <div className="relative">
              <input
                type="text"
                className={`input input-bordered w-full pr-10 ${selectedSigns.length === 0 ? 'input-warning' : ''}`}
                placeholder="Buscar signo... (Ej: Temperatura, Presión arterial)"
                value={signSearch}
                onChange={(e) => setSignSearch(e.target.value)}
                onFocus={handleSignFocus}
                onBlur={handleSignBlur}
              />
              <button
                type="button"
                onClick={() => setShowSignDropdown(!showSignDropdown)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <ChevronDown className={`h-4 w-4 text-base-content/50 transition-transform ${showSignDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown de signos */}
              {showSignDropdown && filteredSigns.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredSigns.slice(0, 20).map((sign) => (
                    <button
                      key={sign.id}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-base-300 flex justify-between items-center cursor-pointer"
                      onClick={() => addSign(sign)}
                    >
                      <span>{sign.name}</span>
                      <span className="badge badge-sm badge-outline">{sign.measurement_unit || ''}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inputs de signos seleccionados */}
            <div className="space-y-3 mt-3">
              {selectedSigns.length === 0 ? (
                <div className="alert alert-warning shadow-lg">
                  <span className="text-sm">⚠️ No hay signos registrados. Debe agregar al menos un signo vital.</span>
                </div>
              ) : (
                selectedSigns.map((sign) => (
                  <div key={sign.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="label-text text-sm font-medium block mb-1">
                        {sign.name} <span className="text-error">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className={`input input-bordered flex-1 ${!sign.value.trim() ? 'input-error' : ''}`}
                          value={sign.value}
                          onChange={(e) => updateSignValue(sign.id, e.target.value)}
                          placeholder="Ingrese valor"
                          required
                        />
                        <span className="px-3 py-2 bg-base-200 rounded-lg text-sm flex items-center min-w-[60px] justify-center">
                          {sign.unit}
                        </span>
                      </div>
                      {!sign.value.trim() && (
                        <span className="text-error text-xs mt-1 block">Este campo es obligatorio</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-circle text-error"
                      onClick={() => removeSign(sign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PRUEBAS DE LABORATORIO */}
          <div className="form-control" ref={labTestDropdownRef}>
            <div className="divider">
              <span className="text-sm font-semibold">Resultados de Laboratorio (Opcional)</span>
            </div>
            
            <label className="label-text mb-2 block text-xs text-base-content/70">
              Agregue pruebas de laboratorio y sus resultados
            </label>

            {/* Selector de pruebas */}
            <div className="relative">
              <input
                type="text"
                className="input input-bordered w-full pr-10"
                placeholder="Buscar prueba... (Ej: Hemograma, Glucosa, Creatinina)"
                value={labTestSearch}
                onChange={(e) => setLabTestSearch(e.target.value)}
                onFocus={handleLabFocus}
                onBlur={handleLabBlur}
              />
              <button
                type="button"
                onClick={() => setShowLabTestDropdown(!showLabTestDropdown)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <ChevronDown className={`h-4 w-4 text-base-content/50 transition-transform ${showLabTestDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown de pruebas */}
              {showLabTestDropdown && filteredLabTests.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredLabTests.slice(0, 20).map((test) => (
                    <button
                      key={test.id}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-base-300 flex justify-between items-center cursor-pointer"
                      onClick={() => addLabTest(test)}
                    >
                      <span>{test.name}</span>
                      <span className="badge badge-sm badge-outline">{test.unit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inputs de pruebas seleccionadas */}
            <div className="space-y-3 mt-3">
              {selectedLabTests.length === 0 ? (
                <span className="text-sm text-base-content/50 italic">No hay pruebas de laboratorio registradas (opcional)</span>
              ) : (
                selectedLabTests.map((test) => (
                  <div key={test.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="label-text text-sm font-medium block mb-1">
                        {test.name} ({test.code}) <span className="text-error">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className={`input input-bordered flex-1 ${!test.value.trim() ? 'input-error' : ''}`}
                          value={test.value}
                          onChange={(e) => updateLabTestValue(test.id, e.target.value)}
                          placeholder="Ingrese resultado"
                          required
                        />
                        <span className="px-3 py-2 bg-base-200 rounded-lg text-sm flex items-center min-w-[60px] justify-center">
                          {test.unit}
                        </span>
                      </div>
                      {!test.value.trim() && (
                        <span className="text-error text-xs mt-1 block">Este campo es obligatorio</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-circle text-error"
                      onClick={() => removeLabTest(test.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* NOTAS DEL MÉDICO */}
          <div className="form-control">
            <div className="divider">
              <span className="text-sm font-semibold">Notas del Médico (Opcional)</span>
            </div>
            
            <label htmlFor="notes" className="label-text mb-2 block text-xs text-base-content/70">
              Observaciones adicionales, historia clínica relevante o consideraciones especiales
            </label>
            <textarea
              id="notes"
              className="textarea textarea-bordered w-full h-24"
              placeholder="Ej: Paciente con antecedentes de diabetes tipo 2 controlada. Viajó recientemente a zona endémica..."
              {...register('notes')}
            />
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
                  Procesando...
                </>
              ) : (
                'Crear Diagnóstico'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
