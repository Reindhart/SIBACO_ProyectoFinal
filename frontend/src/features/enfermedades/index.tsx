import { useRef, useState, useEffect } from 'react'
import { Plus, Filter, FunnelX } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import DiseasesTable from '@/features/enfermedades/components/enfermedades-tab'
import SignsTable from '@/features/enfermedades/components/signos-tab'
import SymptomsTable from '@/features/enfermedades/components/sintomas-tab'
import TestsTable from '@/features/enfermedades/components/pruebas-tab'
import NotFoundPage from '@/features/errors/not-found'

type TabKey = 'enfermedades' | 'signos' | 'sintomas' | 'pruebas'

      export default function EnfermedadesPage() {
        const { user, isLoading: authLoading } = useAuth()
        const [activeTab, setActiveTab] = useState<TabKey>('enfermedades')

        const diseasesRef = useRef<any>(null)
        const signsRef = useRef<any>(null)
        const symptomsRef = useRef<any>(null)
        const testsRef = useRef<any>(null)

        const getActiveRef = () => {
          if (activeTab === 'enfermedades') return diseasesRef
          if (activeTab === 'signos') return signsRef
          if (activeTab === 'sintomas') return symptomsRef
          return testsRef
        }

        const [filtersActive, setFiltersActive] = useState(false)

        const handleToggleFilters = () => {
          const r = getActiveRef()
          const current = r.current?.isFiltersVisible?.() ?? false
          r.current?.toggleFilters?.()
          // Toggle local state in sync with child (we invert the child's previous state)
          setFiltersActive(!current)
        }

        const handleOpenCreate = () => {
          const r = getActiveRef()
          r.current?.openCreate?.()
        }

        // When activeTab changes, query child for its filter state (after render)
        useEffect(() => {
          const t = setTimeout(() => {
            const r = getActiveRef()
            setFiltersActive(r.current?.isFiltersVisible?.() ?? false)
          }, 0)
          return () => clearTimeout(t)
        }, [activeTab])

        if (authLoading) return null
        if (!user) return <NotFoundPage />

        return (
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Catálogo Médico</h1>
                <p className="text-base-content/70">Gestiona enfermedades, signos, síntomas y pruebas del sistema</p>
              </div>

              <div className="flex gap-2">
                <button
                  className={`btn btn-circle ${filtersActive ? 'bg-primary text-white' : 'btn-ghost'}`}
                  onClick={handleToggleFilters}
                  title="Filtros"
                >
                  {filtersActive ? <FunnelX className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
                </button>

                <button
                  className="btn btn-primary btn-circle"
                  onClick={handleOpenCreate}
                  title="Crear" 
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div role="tablist" className="flex h-8 w-full rounded-lg overflow-hidden bg-base-200 shadow-sm">
                <button
                  role="tab"
                  onClick={() => setActiveTab('enfermedades')}
                  className={`tab flex-1 text-center flex items-center justify-center transition ${activeTab === 'enfermedades' ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white' : 'bg-transparent hover:bg-base-300'}`}
                >
                  Enfermedades
                </button>

                <button
                  role="tab"
                  onClick={() => setActiveTab('signos')}
                  className={`tab flex-1 text-center flex items-center justify-center transition ${activeTab === 'signos' ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white' : 'bg-transparent hover:bg-base-300'}`}
                >
                  Signos
                </button>

                <button
                  role="tab"
                  onClick={() => setActiveTab('sintomas')}
                  className={`tab flex-1 text-center flex items-center justify-center transition ${activeTab === 'sintomas' ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white' : 'bg-transparent hover:bg-base-300'}`}
                >
                  Síntomas
                </button>

                <button
                  role="tab"
                  onClick={() => setActiveTab('pruebas')}
                  className={`tab flex-1 text-center flex items-center justify-center transition ${activeTab === 'pruebas' ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white' : 'bg-transparent hover:bg-base-300'}`}
                >
                  Pruebas
                </button>
              </div>
            </div>

            <div>
              {activeTab === 'enfermedades' && <DiseasesTable ref={diseasesRef} />}
              {activeTab === 'signos' && <SignsTable ref={signsRef} />}
              {activeTab === 'sintomas' && <SymptomsTable ref={symptomsRef} />}
              {activeTab === 'pruebas' && <TestsTable ref={testsRef} />}
            </div>
          </div>
        )
      }
