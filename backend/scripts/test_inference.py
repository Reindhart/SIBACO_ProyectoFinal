"""
Script de prueba del motor de inferencia.

Ejecutar desde la raíz del proyecto backend:
    python scripts/test_inference.py
"""

import sys
import os

# Añadir el directorio padre al path para poder importar app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.modules.inference_engine import (
    get_patient_evidence,
    InferenceEngine,
    get_treatment_recommendation
)
from app.models.medical_knowledge import Patient

def print_separator(title="", char="=", length=80):
    """Imprime un separador visual."""
    if title:
        padding = (length - len(title) - 2) // 2
        print(f"\n{char * padding} {title} {char * padding}")
    else:
        print(f"\n{char * length}")

def test_inference_engine(patient_id=None, visit_id=None):
    """
    Prueba el motor de inferencia con un paciente específico.
    
    Args:
        patient_id: ID del paciente (None para listar pacientes disponibles)
        visit_id: ID de visita opcional
    """
    app = create_app()
    
    with app.app_context():
        # Si no se especifica paciente, listar pacientes disponibles
        if patient_id is None:
            print_separator("PACIENTES DISPONIBLES")
            patients = Patient.query.filter_by(is_active=True).limit(10).all()
            
            if not patients:
                print("❌ No se encontraron pacientes en la base de datos.")
                print("   Ejecuta 'python scripts/seed_data.py' para poblar la BD.")
                return
            
            print(f"\nEncontrados {len(patients)} pacientes:\n")
            for p in patients:
                print(f"  ID: {p.id:3d} | {p.first_name} {p.last_name} | CI: {p.ci}")
            
            print("\nEjecuta: python scripts/test_inference.py <patient_id>")
            return
        
        # Verificar que el paciente existe
        patient = Patient.query.get(patient_id)
        if not patient:
            print(f"❌ No se encontró el paciente con ID {patient_id}")
            return
        
        print_separator(f"PACIENTE: {patient.first_name} {patient.last_name}")
        print(f"ID: {patient.id} | CI: {patient.ci}")
        print(f"Edad: {patient.age} años | Sexo: {patient.gender}")
        
        # PASO 1: Recuperar evidencia
        print_separator("PASO 1: Recuperación de Evidencia")
        
        try:
            evidence = get_patient_evidence(patient_id, visit_id)
            
            print(f"\n✅ Evidencia recuperada:")
            print(f"   • Síntomas: {len(evidence['symptoms'])} registrados")
            print(f"   • Signos: {len(evidence['signs'])} registrados")
            print(f"   • Laboratorios: {len(evidence['labs'])} registrados")
            
            # Mostrar detalle de evidencia
            if evidence['symptoms']:
                print("\n📋 Síntomas registrados:")
                from app.models.medical_knowledge import Symptom
                for symptom_id in evidence['symptoms'][:10]:  # Mostrar máximo 10
                    symptom = Symptom.query.get(symptom_id)
                    if symptom:
                        print(f"   - {symptom.name} ({symptom.code})")
            
            if evidence['signs']:
                print("\n🔬 Signos clínicos registrados:")
                for sign_id, sign_data in list(evidence['signs'].items())[:10]:
                    name = sign_data.get('name', 'N/A')
                    val = sign_data.get('value_numeric', sign_data.get('value_text', 'N/A'))
                    unit = sign_data.get('unit', '')
                    print(f"   - {name}: {val} {unit}")
            
            if evidence['labs']:
                print("\n🧪 Resultados de laboratorio:")
                for lab_id, lab_data in list(evidence['labs'].items())[:10]:
                    name = lab_data.get('name', 'N/A')
                    val = lab_data.get('value_numeric', lab_data.get('value_text', 'N/A'))
                    unit = lab_data.get('unit', '')
                    print(f"   - {name}: {val} {unit}")
            
            if not evidence['symptoms'] and not evidence['signs'] and not evidence['labs']:
                print("\n⚠️  No se encontró evidencia para este paciente.")
                print("   El motor de inferencia necesita datos en las tablas de logs.")
                return
            
            # PASO 2: Ejecutar motor de inferencia
            print_separator("PASO 2: Ejecución del Motor de Inferencia")
            
            engine = InferenceEngine()
            result = engine.diagnose(evidence)
            
            print(f"\n✅ Análisis completado:")
            print(f"   • Enfermedades evaluadas: {result['total_diseases_evaluated']}")
            print(f"   • Candidatos con evidencia: {result['total_candidates']}")
            print(f"   • Timestamp: {result['inference_timestamp']}")
            
            # PASO 3: Diagnóstico principal
            if result['primary_diagnosis']:
                print_separator("PASO 3: Diagnóstico Principal")
                
                primary = result['primary_diagnosis']
                print(f"\n🏥 {primary['disease_name']}")
                print(f"   Código: {primary['disease_code']}")
                print(f"   Categoría: {primary['category']}")
                print(f"   Severidad: {primary['severity']}")
                print(f"\n   📊 Métricas:")
                print(f"      Score obtenido: {primary['score']}")
                print(f"      Score máximo posible: {primary['max_possible_score']}")
                print(f"      Confianza: {primary['confidence']}%")
                
                # Evidencia coincidente
                print(f"\n   🎯 Evidencia coincidente:")
                
                if primary['matched_evidence']['symptoms']:
                    print(f"\n      Síntomas ({len(primary['matched_evidence']['symptoms'])}):")
                    for s in primary['matched_evidence']['symptoms'][:5]:
                        print(f"         • {s['name']} (peso: {s['weight']})")
                    if len(primary['matched_evidence']['symptoms']) > 5:
                        remaining = len(primary['matched_evidence']['symptoms']) - 5
                        print(f"         ... y {remaining} síntoma(s) más")
                
                if primary['matched_evidence']['signs']:
                    print(f"\n      Signos ({len(primary['matched_evidence']['signs'])}):")
                    for s in primary['matched_evidence']['signs'][:5]:
                        val = s.get('value', 'N/A')
                        unit = s.get('unit', '')
                        abn = " [ANORMAL]" if s.get('abnormal') else ""
                        print(f"         • {s['name']}: {val} {unit}{abn} (peso: {s['weight']})")
                    if len(primary['matched_evidence']['signs']) > 5:
                        remaining = len(primary['matched_evidence']['signs']) - 5
                        print(f"         ... y {remaining} signo(s) más")
                
                if primary['matched_evidence']['labs']:
                    print(f"\n      Laboratorios ({len(primary['matched_evidence']['labs'])}):")
                    for l in primary['matched_evidence']['labs'][:5]:
                        val = l.get('value', 'N/A')
                        unit = l.get('unit', '')
                        abn = " [ANORMAL]" if l.get('abnormal') else ""
                        print(f"         • {l['name']}: {val} {unit}{abn} (peso: {l['weight']})")
                    if len(primary['matched_evidence']['labs']) > 5:
                        remaining = len(primary['matched_evidence']['labs']) - 5
                        print(f"         ... y {remaining} laboratorio(s) más")
                
                # PASO 4: Recomendaciones de tratamiento
                print_separator("PASO 4: Recomendaciones Terapéuticas")
                
                treatment = get_treatment_recommendation(primary['disease_code'])
                if treatment:
                    print(f"\n💊 Tratamiento:")
                    treatment_text = treatment['treatment_recommendations'] or "No disponible"
                    print(f"   {treatment_text[:300]}{'...' if len(treatment_text) > 300 else ''}")
                    
                    print(f"\n🛡️  Prevención:")
                    prevention_text = treatment['prevention_measures'] or "No disponible"
                    print(f"   {prevention_text[:300]}{'...' if len(prevention_text) > 300 else ''}")
                
                # PASO 5: Diagnósticos alternativos
                if result['alternative_diagnoses']:
                    print_separator("PASO 5: Diagnósticos Alternativos")
                    
                    print(f"\nTop {min(5, len(result['alternative_diagnoses']))} diagnósticos alternativos:\n")
                    for i, alt in enumerate(result['alternative_diagnoses'][:5], 1):
                        print(f"   {i}. {alt['disease_name']} ({alt['disease_code']})")
                        print(f"      Score: {alt['score']} | Confianza: {alt['confidence']}%")
                        print(f"      Categoría: {alt['category']} | Severidad: {alt['severity']}")
                        print()
            
            else:
                print_separator("RESULTADO")
                print("\n⚠️  No se pudo determinar un diagnóstico con la evidencia disponible.")
                print("   Posibles causas:")
                print("   - La evidencia no coincide con ninguna enfermedad en la BD")
                print("   - Los pesos de las asociaciones son muy bajos")
                print("   - Se necesita más evidencia clínica")
            
            print_separator()
            
        except Exception as e:
            print(f"\n❌ ERROR durante la ejecución:")
            print(f"   {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()


if __name__ == '__main__':
    # Parsear argumentos de línea de comandos
    if len(sys.argv) > 1:
        try:
            pid = int(sys.argv[1])
            vid = sys.argv[2] if len(sys.argv) > 2 else None
            test_inference_engine(patient_id=pid, visit_id=vid)
        except ValueError:
            print("❌ Error: El patient_id debe ser un número entero")
            print("   Uso: python scripts/test_inference.py <patient_id> [visit_id]")
    else:
        # Listar pacientes disponibles
        test_inference_engine()
