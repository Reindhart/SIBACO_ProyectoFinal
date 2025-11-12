"""
Motor de Inferencia para Diagnóstico Médico
=============================================

Implementa lógica basada en reglas simples con suma de pesos para diagnosticar
enfermedades basándose en síntomas, signos clínicos y resultados de laboratorio del paciente.

El motor:
1. Recupera toda la evidencia del paciente desde los logs atómicos
2. Consulta las reglas (asociaciones disease-evidence con pesos) de todas las enfermedades
3. Calcula un score acumulado para cada enfermedad sumando los pesos de evidencia coincidente
4. Retorna la enfermedad con mayor score junto con su nivel de confianza
"""

import re
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime
from sqlalchemy import text
from app.extensions import db
from app.models.medical_knowledge import (
    Disease, Symptom, Sign, LabTest,
    PatientSymptomsLog, PatientSignsLog, PatientLabResultsLog
)


def get_patient_evidence(patient_id: int, visit_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Recupera toda la evidencia clínica del paciente desde los logs atómicos.
    
    Args:
        patient_id: ID del paciente
        visit_id: ID opcional de visita para filtrar logs de una consulta específica
        
    Returns:
        Diccionario estructurado con:
        {
            'symptoms': [symptom_id1, symptom_id2, ...],
            'signs': {
                sign_id1: {'value': 39.5, 'unit': '°C', 'code': 'SG001'},
                sign_id2: {'value': 110, 'unit': 'lpm', 'code': 'SG004'},
                ...
            },
            'labs': {
                lab_id1: {'value': 150.0, 'unit': 'mg/L', 'code': 'LAB008'},
                lab_id2: {'value': 12.1, 'unit': 'g/dL', 'code': 'LAB001'},
                ...
            },
            'visit_id': visit_id,
            'patient_id': patient_id
        }
    """
    
    # Query síntomas
    symptoms_query = PatientSymptomsLog.query.filter_by(patient_id=patient_id)
    if visit_id:
        symptoms_query = symptoms_query.filter_by(visit_id=visit_id)
    
    symptoms_logs = symptoms_query.all()
    symptoms_ids = [log.symptom_id for log in symptoms_logs]
    
    # Query signos
    signs_query = PatientSignsLog.query.filter_by(patient_id=patient_id)
    if visit_id:
        signs_query = signs_query.filter_by(visit_id=visit_id)
    
    signs_logs = signs_query.all()
    signs_data = {}
    for log in signs_logs:
        sign = Sign.query.get(log.sign_id)
        signs_data[log.sign_id] = {
            'value_numeric': log.value_numeric,
            'value_text': log.value_text,
            'unit': log.unit or (sign.measurement_unit if sign else None),
            'code': sign.code if sign else None,
            'name': sign.name if sign else None,
            'normal_range': sign.normal_range if sign else None
        }
    
    # Query laboratorios
    labs_query = PatientLabResultsLog.query.filter_by(patient_id=patient_id)
    if visit_id:
        labs_query = labs_query.filter_by(visit_id=visit_id)
    
    labs_logs = labs_query.all()
    labs_data = {}
    for log in labs_logs:
        lab_test = LabTest.query.get(log.lab_test_id)
        labs_data[log.lab_test_id] = {
            'value_numeric': log.value_numeric,
            'value_text': log.value_text,
            'unit': log.unit or (lab_test.unit if lab_test else None),
            'code': lab_test.code if lab_test else None,
            'name': lab_test.name if lab_test else None,
            'normal_range': lab_test.normal_range if lab_test else None
        }
    
    return {
        'symptoms': symptoms_ids,
        'signs': signs_data,
        'labs': labs_data,
        'visit_id': visit_id,
        'patient_id': patient_id
    }


def parse_numeric_range(range_str: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Parsea un string de rango a valores min/max.
    
    Ejemplos:
        '36.5-37.5' -> (36.5, 37.5)
        '<10' -> (None, 10)
        '>90' -> (90, None)
        '70-100' -> (70, 100)
        
    Args:
        range_str: String representando el rango normal
        
    Returns:
        Tupla (min_value, max_value) donde None indica sin límite
    """
    if not range_str or range_str == 'Variable':
        return (None, None)
    
    # Pattern: número-número (ej. 70-100)
    match = re.match(r'^(\d+\.?\d*)\s*-\s*(\d+\.?\d*)$', range_str.strip())
    if match:
        return (float(match.group(1)), float(match.group(2)))
    
    # Pattern: <número (ej. <10)
    match = re.match(r'^<\s*(\d+\.?\d*)$', range_str.strip())
    if match:
        return (None, float(match.group(1)))
    
    # Pattern: >número (ej. >90)
    match = re.match(r'^>\s*(\d+\.?\d*)$', range_str.strip())
    if match:
        return (float(match.group(1)), None)
    
    # Pattern: ≥número o >=número
    match = re.match(r'^(≥|>=)\s*(\d+\.?\d*)$', range_str.strip())
    if match:
        return (float(match.group(2)), None)
    
    # Pattern: ≤número o <=número
    match = re.match(r'^(≤|<=)\s*(\d+\.?\d*)$', range_str.strip())
    if match:
        return (None, float(match.group(2)))
    
    return (None, None)


def is_value_abnormal(value: Optional[float], normal_range: str) -> bool:
    """
    Determina si un valor numérico está fuera del rango normal.
    
    Args:
        value: Valor numérico a evaluar
        normal_range: String con el rango normal (ej. '70-100', '<10', etc.)
        
    Returns:
        True si el valor está fuera del rango normal (anormal), False si está dentro
    """
    if value is None:
        return False
    
    min_val, max_val = parse_numeric_range(normal_range)
    
    # Si no pudimos parsear el rango, asumimos que es normal
    if min_val is None and max_val is None:
        return False
    
    # Verificar si está fuera del rango
    if min_val is not None and value < min_val:
        return True
    if max_val is not None and value > max_val:
        return True
    
    return False


class InferenceEngine:
    """
    Motor de inferencia basado en reglas con suma de pesos.
    
    Calcula scores para cada enfermedad sumando los pesos de la evidencia
    del paciente que coincide con las reglas de asociación en la base de conocimiento.
    """
    
    def __init__(self):
        """Inicializa el motor de inferencia."""
        self.diseases_cache = None
        self.rules_cache = None
    
    def _load_disease_rules(self) -> Dict[str, Dict[str, List[Dict]]]:
        """
        Carga todas las reglas (asociaciones disease-evidence con pesos) desde la BD.
        
        Returns:
            Dict estructurado:
            {
                'RESP01': {
                    'symptoms': [{'id': 1, 'weight': 1.0, 'code': 'S001'}, ...],
                    'signs': [{'id': 2, 'weight': 0.8, 'code': 'SG002'}, ...],
                    'labs': [{'id': 3, 'weight': 0.9, 'code': 'LAB008'}, ...]
                },
                ...
            }
        """
        if self.rules_cache is not None:
            return self.rules_cache
        
        rules = {}
        
        # Obtener todas las enfermedades activas
        diseases = Disease.query.filter_by(is_active=True).all()
        
        for disease in diseases:
            disease_code = disease.code
            rules[disease_code] = {
                'symptoms': [],
                'signs': [],
                'labs': [],
                'disease_name': disease.name,
                'category': disease.category,
                'severity': disease.severity
            }
            
            # Síntomas con pesos
            symptoms_query = text("""
                SELECT symptom_id, weight 
                FROM disease_symptoms 
                WHERE disease_code = :disease_code
            """)
            symptoms_results = db.session.execute(symptoms_query, {'disease_code': disease_code})
            for row in symptoms_results:
                symptom = Symptom.query.get(row.symptom_id)
                if symptom and symptom.is_active:
                    rules[disease_code]['symptoms'].append({
                        'id': row.symptom_id,
                        'weight': row.weight,
                        'code': symptom.code,
                        'name': symptom.name
                    })
            
            # Signos con pesos
            signs_query = text("""
                SELECT sign_id, weight 
                FROM disease_signs 
                WHERE disease_code = :disease_code
            """)
            signs_results = db.session.execute(signs_query, {'disease_code': disease_code})
            for row in signs_results:
                sign = Sign.query.get(row.sign_id)
                if sign and sign.is_active:
                    rules[disease_code]['signs'].append({
                        'id': row.sign_id,
                        'weight': row.weight,
                        'code': sign.code,
                        'name': sign.name,
                        'normal_range': sign.normal_range
                    })
            
            # Laboratorios con pesos
            labs_query = text("""
                SELECT lab_test_id, weight 
                FROM disease_lab_tests 
                WHERE disease_code = :disease_code
            """)
            labs_results = db.session.execute(labs_query, {'disease_code': disease_code})
            for row in labs_results:
                lab_test = LabTest.query.get(row.lab_test_id)
                if lab_test and lab_test.is_active:
                    rules[disease_code]['labs'].append({
                        'id': row.lab_test_id,
                        'weight': row.weight,
                        'code': lab_test.code,
                        'name': lab_test.name,
                        'normal_range': lab_test.normal_range
                    })
        
        self.rules_cache = rules
        return rules
    
    def diagnose(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta el motor de inferencia para diagnosticar basándose en la evidencia del paciente.
        
        Args:
            patient_data: Diccionario con evidencia del paciente (retornado por get_patient_evidence)
            
        Returns:
            Diccionario con:
            {
                'primary_diagnosis': {
                    'disease_code': 'RESP03',
                    'disease_name': 'Neumonía bacteriana',
                    'score': 8.5,
                    'confidence': 85.0,
                    'max_possible_score': 10.0,
                    'matched_evidence': {
                        'symptoms': [...],
                        'signs': [...],
                        'labs': [...]
                    }
                },
                'alternative_diagnoses': [
                    {'disease_code': 'RESP02', 'score': 5.2, 'confidence': 52.0, ...},
                    ...
                ],
                'total_diseases_evaluated': 45,
                'inference_timestamp': '2024-11-12T...'
            }
        """
        
        # Cargar reglas
        disease_rules = self._load_disease_rules()
        
        # Resultados
        disease_scores = []
        
        # Evaluar cada enfermedad
        for disease_code, rules in disease_rules.items():
            score = 0.0
            max_possible_score = 0.0
            matched_evidence = {
                'symptoms': [],
                'signs': [],
                'labs': []
            }
            
            # ===== SÍNTOMAS =====
            for symptom_rule in rules['symptoms']:
                max_possible_score += symptom_rule['weight']
                
                # Si el paciente tiene este síntoma, sumar el peso
                if symptom_rule['id'] in patient_data['symptoms']:
                    score += symptom_rule['weight']
                    matched_evidence['symptoms'].append({
                        'code': symptom_rule['code'],
                        'name': symptom_rule['name'],
                        'weight': symptom_rule['weight']
                    })
            
            # ===== SIGNOS =====
            for sign_rule in rules['signs']:
                max_possible_score += sign_rule['weight']
                
                # Si el paciente tiene este signo registrado
                if sign_rule['id'] in patient_data['signs']:
                    patient_sign = patient_data['signs'][sign_rule['id']]
                    
                    # Verificar si el valor está anormal (fuera de rango normal)
                    if patient_sign['value_numeric'] is not None:
                        if is_value_abnormal(patient_sign['value_numeric'], sign_rule['normal_range']):
                            score += sign_rule['weight']
                            matched_evidence['signs'].append({
                                'code': sign_rule['code'],
                                'name': sign_rule['name'],
                                'value': patient_sign['value_numeric'],
                                'unit': patient_sign['unit'],
                                'weight': sign_rule['weight'],
                                'abnormal': True
                            })
                    else:
                        # Si no hay valor numérico pero hay texto, contar como evidencia
                        if patient_sign['value_text']:
                            score += sign_rule['weight'] * 0.5  # Peso reducido para valores cualitativos
                            matched_evidence['signs'].append({
                                'code': sign_rule['code'],
                                'name': sign_rule['name'],
                                'value': patient_sign['value_text'],
                                'weight': sign_rule['weight'] * 0.5,
                                'qualitative': True
                            })
            
            # ===== LABORATORIOS =====
            for lab_rule in rules['labs']:
                max_possible_score += lab_rule['weight']
                
                # Si el paciente tiene este laboratorio
                if lab_rule['id'] in patient_data['labs']:
                    patient_lab = patient_data['labs'][lab_rule['id']]
                    
                    # Verificar si el valor está anormal
                    if patient_lab['value_numeric'] is not None:
                        if is_value_abnormal(patient_lab['value_numeric'], lab_rule['normal_range']):
                            score += lab_rule['weight']
                            matched_evidence['labs'].append({
                                'code': lab_rule['code'],
                                'name': lab_rule['name'],
                                'value': patient_lab['value_numeric'],
                                'unit': patient_lab['unit'],
                                'weight': lab_rule['weight'],
                                'abnormal': True
                            })
                    else:
                        # Valor cualitativo
                        if patient_lab['value_text']:
                            score += lab_rule['weight'] * 0.5
                            matched_evidence['labs'].append({
                                'code': lab_rule['code'],
                                'name': lab_rule['name'],
                                'value': patient_lab['value_text'],
                                'weight': lab_rule['weight'] * 0.5,
                                'qualitative': True
                            })
            
            # Calcular confianza (porcentaje del score máximo posible)
            confidence = (score / max_possible_score * 100.0) if max_possible_score > 0 else 0.0
            
            # Solo incluir enfermedades con al menos algo de score
            if score > 0:
                disease_scores.append({
                    'disease_code': disease_code,
                    'disease_name': rules['disease_name'],
                    'category': rules['category'],
                    'severity': rules['severity'],
                    'score': round(score, 2),
                    'confidence': round(confidence, 2),
                    'max_possible_score': round(max_possible_score, 2),
                    'matched_evidence': matched_evidence
                })
        
        # Ordenar por score descendente
        disease_scores.sort(key=lambda x: x['score'], reverse=True)
        
        # Preparar resultado
        result = {
            'primary_diagnosis': disease_scores[0] if disease_scores else None,
            'alternative_diagnoses': disease_scores[1:6] if len(disease_scores) > 1 else [],  # Top 5 alternativas
            'total_diseases_evaluated': len(disease_rules),
            'total_candidates': len(disease_scores),
            'inference_timestamp': datetime.utcnow().isoformat(),
            'patient_id': patient_data.get('patient_id'),
            'visit_id': patient_data.get('visit_id')
        }
        
        return result


def get_treatment_recommendation(disease_code: str) -> Optional[Dict[str, str]]:
    """
    Obtiene las recomendaciones de tratamiento y prevención para una enfermedad.
    
    Args:
        disease_code: Código de la enfermedad (ej. 'RESP03')
        
    Returns:
        Diccionario con:
        {
            'disease_code': 'RESP03',
            'disease_name': 'Neumonía bacteriana',
            'treatment_recommendations': 'Antibióticos...',
            'prevention_measures': 'Vacunación...',
            'severity': 'grave'
        }
        O None si no se encuentra la enfermedad
    """
    disease = Disease.query.filter_by(code=disease_code, is_active=True).first()
    
    if not disease:
        return None
    
    return {
        'disease_code': disease.code,
        'disease_name': disease.name,
        'treatment_recommendations': disease.treatment_recommendations,
        'prevention_measures': disease.prevention_measures,
        'severity': disease.severity,
        'category': disease.category,
        'description': disease.description
    }


# ==================== EJEMPLO DE USO ====================

if __name__ == '__main__':
    """
    Ejemplo de uso del motor de inferencia.
    
    Para ejecutar este ejemplo:
    1. Asegúrate de tener la base de datos creada y poblada con seed_data.py
    2. Ejecuta: python -m app.modules.inference_engine
    """
    
    from app import create_app
    
    # Crear contexto de aplicación
    app = create_app()
    
    with app.app_context():
        print("\n" + "="*80)
        print("EJEMPLO DE USO DEL MOTOR DE INFERENCIA")
        print("="*80 + "\n")
        
        # PASO 1: Especificar un paciente de ejemplo
        # (Asume que existe un paciente con ID 1 y tiene logs de síntomas/signos/labs)
        patient_id = 1
        visit_id = None  # Usar None para obtener todos los logs o especificar un visit_id
        
        print(f"📋 PASO 1: Recuperando evidencia del paciente ID={patient_id}")
        print("-" * 80)
        
        try:
            # Recuperar evidencia del paciente
            patient_data = get_patient_evidence(patient_id, visit_id)
            
            print(f"✅ Evidencia recuperada:")
            print(f"   • Síntomas: {len(patient_data['symptoms'])} registrados")
            print(f"   • Signos: {len(patient_data['signs'])} registrados")
            print(f"   • Laboratorios: {len(patient_data['labs'])} registrados")
            
            if not patient_data['symptoms'] and not patient_data['signs'] and not patient_data['labs']:
                print("\n⚠️  ADVERTENCIA: No se encontró evidencia para este paciente.")
                print("   Por favor, asegúrate de que existan logs en las tablas:")
                print("   - patient_symptoms_log")
                print("   - patient_signs_log")
                print("   - patient_lab_results_log")
                exit(0)
            
            # PASO 2: Ejecutar motor de inferencia
            print(f"\n🔍 PASO 2: Ejecutando motor de inferencia")
            print("-" * 80)
            
            engine = InferenceEngine()
            diagnosis_result = engine.diagnose(patient_data)
            
            print(f"✅ Inferencia completada:")
            print(f"   • Enfermedades evaluadas: {diagnosis_result['total_diseases_evaluated']}")
            print(f"   • Candidatos con evidencia: {diagnosis_result['total_candidates']}")
            
            # PASO 3: Mostrar diagnóstico principal
            if diagnosis_result['primary_diagnosis']:
                print(f"\n🏥 PASO 3: Diagnóstico Principal")
                print("-" * 80)
                
                primary = diagnosis_result['primary_diagnosis']
                print(f"Enfermedad: {primary['disease_name']} ({primary['disease_code']})")
                print(f"Categoría: {primary['category']}")
                print(f"Severidad: {primary['severity']}")
                print(f"Score: {primary['score']} / {primary['max_possible_score']}")
                print(f"Confianza: {primary['confidence']}%")
                
                print(f"\nEvidencia coincidente:")
                if primary['matched_evidence']['symptoms']:
                    print(f"  Síntomas ({len(primary['matched_evidence']['symptoms'])}):")
                    for s in primary['matched_evidence']['symptoms'][:5]:  # Mostrar top 5
                        print(f"    - {s['name']} (peso: {s['weight']})")
                
                if primary['matched_evidence']['signs']:
                    print(f"  Signos ({len(primary['matched_evidence']['signs'])}):")
                    for s in primary['matched_evidence']['signs'][:5]:
                        val = s.get('value', 'N/A')
                        unit = s.get('unit', '')
                        print(f"    - {s['name']}: {val} {unit} (peso: {s['weight']})")
                
                if primary['matched_evidence']['labs']:
                    print(f"  Laboratorios ({len(primary['matched_evidence']['labs'])}):")
                    for l in primary['matched_evidence']['labs'][:5]:
                        val = l.get('value', 'N/A')
                        unit = l.get('unit', '')
                        print(f"    - {l['name']}: {val} {unit} (peso: {l['weight']})")
                
                # PASO 4: Obtener recomendaciones de tratamiento
                print(f"\n💊 PASO 4: Recomendaciones de Tratamiento")
                print("-" * 80)
                
                treatment = get_treatment_recommendation(primary['disease_code'])
                if treatment:
                    print(f"Tratamiento:\n{treatment['treatment_recommendations'][:200]}...")
                    print(f"\nPrevención:\n{treatment['prevention_measures'][:200]}...")
                
                # PASO 5: Mostrar diagnósticos alternativos
                if diagnosis_result['alternative_diagnoses']:
                    print(f"\n🔄 PASO 5: Diagnósticos Alternativos (Top 3)")
                    print("-" * 80)
                    
                    for i, alt in enumerate(diagnosis_result['alternative_diagnoses'][:3], 1):
                        print(f"{i}. {alt['disease_name']} ({alt['disease_code']})")
                        print(f"   Score: {alt['score']} - Confianza: {alt['confidence']}%")
            
            else:
                print("\n⚠️  No se pudo determinar un diagnóstico basándose en la evidencia disponible.")
            
            print("\n" + "="*80)
            print("FIN DEL EJEMPLO")
            print("="*80 + "\n")
            
        except Exception as e:
            print(f"\n❌ ERROR durante la ejecución:")
            print(f"   {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
