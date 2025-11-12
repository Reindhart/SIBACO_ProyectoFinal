from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.diagnosis import Diagnosis
from app.models.patient import Patient
from app.models.user import User
from app.models.medical_knowledge import (
    Disease, Symptom, Sign, LabTest, 
    PatientSymptomsLog, PatientSignsLog, PatientLabResultsLog
)
from app.modules.inference_engine import (
    get_patient_evidence, 
    InferenceEngine, 
    get_treatment_recommendation
)
from datetime import datetime
import uuid
import json

diagnoses_bp = Blueprint('diagnoses', __name__, url_prefix='/api')

def is_doctor(current_user_id):
    """Helper para verificar si el usuario actual es doctor"""
    user = db.session.get(User, int(current_user_id))
    return user and user.role in ['admin', 'doctor']

def can_access_patient(current_user_id, patient_id):
    """Verificar si el usuario puede acceder al paciente"""
    user = db.session.get(User, int(current_user_id))
    if not user:
        return False
    
    if user.role == 'admin':
        return True
    
    patient = db.session.get(Patient, patient_id)
    return patient and patient.doctor_id == int(current_user_id)

@diagnoses_bp.route('/patients/<int:patient_id>/diagnoses', methods=['GET'])
@jwt_required()
def get_patient_diagnoses(patient_id):
    """Obtener todos los diagnósticos de un paciente"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Verificar acceso al paciente
        if not can_access_patient(current_user_id, patient_id):
            return jsonify({'status': 'error', 'message': 'No autorizado'}), 403
        
        patient = db.session.get(Patient, patient_id)
        if not patient or not patient.is_active:
            return jsonify({'status': 'error', 'message': 'Paciente no encontrado'}), 404
        
        # Obtener diagnósticos con relaciones
        diagnoses = Diagnosis.query.filter_by(patient_id=patient_id).order_by(Diagnosis.diagnosis_date.desc()).all()
        
        diagnoses_data = []
        for d in diagnoses:
            # Obtener información del doctor
            doctor = db.session.get(User, d.doctor_id)
            doctor_data = {
                'id': doctor.id,
                'username': doctor.username,
                'first_name': doctor.first_name,
                'paternal_surname': doctor.paternal_surname
            } if doctor else None
            
            # Obtener información de la enfermedad
            disease = db.session.get(Disease, d.disease_code)
            disease_data = {
                'code': disease.code,
                'name': disease.name,
                'description': disease.description
            } if disease else None
            
            diagnoses_data.append({
                'id': d.id,
                'patient_id': d.patient_id,
                'doctor_id': d.doctor_id,
                'disease_code': d.disease_code,
                'diagnosis_date': d.diagnosis_date.isoformat() if d.diagnosis_date else None,
                'visit_id': d.visit_id,
                # Obtener logs de síntomas, signos y resultados de laboratorio
                'symptoms_logs': [s.to_dict() for s in d.symptoms_logs.all()],
                'signs_logs': [s.to_dict() for s in d.signs_logs.all()],
                'lab_results_logs': [l.to_dict() for l in d.lab_results_logs.all()],
                'confidence_score': d.confidence_score,
                'inference_details': d.inference_details,
                'alternative_diseases': d.alternative_diseases,
                'treatment': d.treatment,
                'treatment_start_date': d.treatment_start_date.isoformat() if d.treatment_start_date else None,
                'treatment_end_date': d.treatment_end_date.isoformat() if d.treatment_end_date else None,
                'notes': d.notes,
                'status': d.status,
                'follow_up_date': d.follow_up_date.isoformat() if d.follow_up_date else None,
                'created_at': d.created_at.isoformat() if d.created_at else None,
                'updated_at': d.updated_at.isoformat() if d.updated_at else None,
                'doctor': doctor_data,
                'disease': disease_data
            })
        
        return jsonify({'status': 'success', 'data': diagnoses_data}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@diagnoses_bp.route('/diagnoses/<int:diagnosis_id>', methods=['GET'])
@jwt_required()
def get_diagnosis(diagnosis_id):
    """Obtener un diagnóstico específico con todas sus relaciones y logs atómicos"""
    try:
        current_user_id = int(get_jwt_identity())
        
        diagnosis = db.session.get(Diagnosis, diagnosis_id)
        if not diagnosis:
            return jsonify({'status': 'error', 'message': 'Diagnóstico no encontrado'}), 404
        
        # Verificar acceso
        if not can_access_patient(current_user_id, diagnosis.patient_id):
            return jsonify({'status': 'error', 'message': 'No autorizado'}), 403
        
        # Obtener relaciones
        doctor = db.session.get(User, diagnosis.doctor_id)
        disease = db.session.get(Disease, diagnosis.disease_code)
        patient = db.session.get(Patient, diagnosis.patient_id)
        
        # Obtener logs atómicos
        symptoms_logs = PatientSymptomsLog.query.filter_by(diagnosis_id=diagnosis_id).all()
        signs_logs = PatientSignsLog.query.filter_by(diagnosis_id=diagnosis_id).all()
        lab_results_logs = PatientLabResultsLog.query.filter_by(diagnosis_id=diagnosis_id).all()
        
        # Construir datos de síntomas con sus detalles
        symptoms_data = []
        for log in symptoms_logs:
            symptom = db.session.get(Symptom, log.symptom_id)
            symptoms_data.append({
                'log_id': log.id,
                'symptom_id': log.symptom_id,
                'symptom_name': symptom.name if symptom else None,
                'symptom_code': symptom.code if symptom else None,
                'recorded_at': log.recorded_at.isoformat() if log.recorded_at else None,
                'note': log.note
            })
        
        # Construir datos de signos con sus valores
        signs_data = []
        for log in signs_logs:
            sign = db.session.get(Sign, log.sign_id)
            signs_data.append({
                'log_id': log.id,
                'sign_id': log.sign_id,
                'sign_name': sign.name if sign else None,
                'sign_code': sign.code if sign else None,
                'value_numeric': log.value_numeric,
                'value_text': log.value_text,
                'unit': log.unit,
                'recorded_at': log.recorded_at.isoformat() if log.recorded_at else None,
                'note': log.note
            })
        
        # Construir datos de pruebas de laboratorio con sus resultados
        lab_results_data = []
        for log in lab_results_logs:
            lab_test = db.session.get(LabTest, log.lab_test_id)
            lab_results_data.append({
                'log_id': log.id,
                'lab_test_id': log.lab_test_id,
                'lab_test_name': lab_test.name if lab_test else None,
                'lab_test_code': lab_test.code if lab_test else None,
                'value_numeric': log.value_numeric,
                'value_text': log.value_text,
                'unit': log.unit,
                'recorded_at': log.recorded_at.isoformat() if log.recorded_at else None,
                'note': log.note
            })
        
        diagnosis_data = {
            'id': diagnosis.id,
            'patient_id': diagnosis.patient_id,
            'doctor_id': diagnosis.doctor_id,
            'disease_code': diagnosis.disease_code,
            'diagnosis_date': diagnosis.diagnosis_date.isoformat() if diagnosis.diagnosis_date else None,
            'visit_id': diagnosis.visit_id,
            'symptoms': symptoms_data,
            'signs': signs_data,
            'lab_results': lab_results_data,
            'confidence_score': diagnosis.confidence_score,
            'inference_details': diagnosis.inference_details,
            'alternative_diseases': diagnosis.alternative_diseases,
            'treatment': diagnosis.treatment,
            'treatment_start_date': diagnosis.treatment_start_date.isoformat() if diagnosis.treatment_start_date else None,
            'treatment_end_date': diagnosis.treatment_end_date.isoformat() if diagnosis.treatment_end_date else None,
            'notes': diagnosis.notes,
            'status': diagnosis.status,
            'follow_up_date': diagnosis.follow_up_date.isoformat() if diagnosis.follow_up_date else None,
            'created_at': diagnosis.created_at.isoformat() if diagnosis.created_at else None,
            'updated_at': diagnosis.updated_at.isoformat() if diagnosis.updated_at else None,
            'doctor': {
                'id': doctor.id,
                'username': doctor.username,
                'first_name': doctor.first_name,
                'paternal_surname': doctor.paternal_surname
            } if doctor else None,
            'disease': {
                'id': disease.id,
                'name': disease.name,
                'description': disease.description
            } if disease else None,
            'patient': {
                'id': patient.id,
                'first_name': patient.first_name,
                'paternal_surname': patient.paternal_surname
            } if patient else None
        }
        
        return jsonify({'status': 'success', 'data': diagnosis_data}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@diagnoses_bp.route('/diagnoses', methods=['POST'])
@jwt_required()
def create_diagnosis():
    """
    Crear un nuevo diagnóstico utilizando el motor de inferencia.
    
    El motor de inferencia procesará los síntomas, signos y resultados de laboratorio
    para determinar automáticamente:
    - disease_code: Código de la enfermedad diagnosticada
    - confidence_score: Nivel de confianza del diagnóstico
    - alternative_diseases: Diagnósticos diferenciales
    - treatment: Tratamiento recomendado
    - inference_details: Detalles del proceso de inferencia
    
    Request body esperado:
    {
        "patient_id": int,
        "symptoms": [{"symptom_id": int, "note": str (opcional)}],
        "signs": [{"sign_id": int, "value_numeric": float (opcional), "value_text": str (opcional), "unit": str (opcional), "note": str (opcional)}],
        "lab_results": [{"lab_test_id": int, "value_numeric": float (opcional), "value_text": str (opcional), "unit": str (opcional), "note": str (opcional)}] (opcional),
        "notes": str (opcional)
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        if not is_doctor(current_user_id):
            return jsonify({'status': 'error', 'message': 'Solo doctores pueden crear diagnósticos'}), 403
        
        data = request.get_json()
        
        # Validar campos requeridos (solo los que el doctor ingresa)
        required_fields = ['patient_id', 'symptoms', 'signs']
        for field in required_fields:
            if field not in data:
                return jsonify({'status': 'error', 'message': f'Campo requerido: {field}'}), 400
        
        # Verificar acceso al paciente
        if not can_access_patient(current_user_id, data['patient_id']):
            return jsonify({'status': 'error', 'message': 'No autorizado para este paciente'}), 403
        
        # Generar un visit_id único para esta consulta
        visit_id = str(uuid.uuid4())
        recorded_at = datetime.utcnow()
        
        # PASO 1: Guardar logs atómicos primero (necesarios para la inferencia)
        # Crear logs atómicos de síntomas
        symptoms_data = data.get('symptoms', [])
        for symptom in symptoms_data:
            symptom_log = PatientSymptomsLog(
                patient_id=data['patient_id'],
                symptom_id=symptom['symptom_id'],
                recorded_at=recorded_at,
                visit_id=visit_id,
                diagnosis_id=None,  # Se actualizará después
                note=symptom.get('note')
            )
            db.session.add(symptom_log)
        
        # Crear logs atómicos de signos
        signs_data = data.get('signs', [])
        for sign in signs_data:
            sign_log = PatientSignsLog(
                patient_id=data['patient_id'],
                sign_id=sign['sign_id'],
                value_numeric=sign.get('value_numeric'),
                value_text=sign.get('value_text'),
                unit=sign.get('unit'),
                recorded_at=recorded_at,
                visit_id=visit_id,
                diagnosis_id=None,  # Se actualizará después
                note=sign.get('note')
            )
            db.session.add(sign_log)
        
        # Crear logs atómicos de pruebas de laboratorio
        lab_results_data = data.get('lab_results', [])
        for lab_result in lab_results_data:
            lab_log = PatientLabResultsLog(
                patient_id=data['patient_id'],
                lab_test_id=lab_result['lab_test_id'],
                value_numeric=lab_result.get('value_numeric'),
                value_text=lab_result.get('value_text'),
                unit=lab_result.get('unit'),
                recorded_at=recorded_at,
                visit_id=visit_id,
                diagnosis_id=None,  # Se actualizará después
                note=lab_result.get('note')
            )
            db.session.add(lab_log)
        
        db.session.flush()  # Guardar logs en BD para que sean consultables
        
        # PASO 2: Ejecutar motor de inferencia
        try:
            # Recuperar evidencia del paciente (incluye los logs recién creados)
            patient_evidence = get_patient_evidence(data['patient_id'], visit_id)
            
            # Ejecutar motor de inferencia
            engine = InferenceEngine()
            inference_result = engine.diagnose(patient_evidence)
            
            # Extraer resultado principal
            if inference_result['primary_diagnosis']:
                primary = inference_result['primary_diagnosis']
                inferred_disease_code = primary['disease_code']
                confidence_score = primary['confidence']
                
                # Obtener recomendaciones de tratamiento
                treatment_info = get_treatment_recommendation(inferred_disease_code)
                inferred_treatment = treatment_info['treatment_recommendations'] if treatment_info else 'No disponible'
                
                # Preparar detalles de inferencia
                inference_details = json.dumps({
                    'score': primary['score'],
                    'max_possible_score': primary['max_possible_score'],
                    'matched_evidence': primary['matched_evidence'],
                    'inference_timestamp': inference_result['inference_timestamp'],
                    'total_diseases_evaluated': inference_result['total_diseases_evaluated']
                })
                
                # Preparar diagnósticos alternativos
                alternative_diseases = json.dumps([
                    {
                        'disease_code': alt['disease_code'],
                        'disease_name': alt['disease_name'],
                        'confidence': alt['confidence'],
                        'score': alt['score']
                    }
                    for alt in inference_result['alternative_diagnoses']
                ])
                
            else:
                # No se pudo inferir diagnóstico
                return jsonify({
                    'status': 'error',
                    'message': 'No se pudo determinar un diagnóstico con la evidencia disponible',
                    'data': {
                        'total_diseases_evaluated': inference_result.get('total_diseases_evaluated', 0),
                        'total_candidates': inference_result.get('total_candidates', 0)
                    }
                }), 400
                
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'status': 'error',
                'message': f'Error en motor de inferencia: {str(e)}'
            }), 500
        
        # PASO 3: Crear el diagnóstico con resultados de la inferencia
        diagnosis = Diagnosis(
            patient_id=data['patient_id'],
            doctor_id=current_user_id,
            disease_code=inferred_disease_code,
            diagnosis_date=recorded_at,
            visit_id=visit_id,
            confidence_score=confidence_score,
            inference_details=inference_details,
            alternative_diseases=alternative_diseases,
            treatment=inferred_treatment,
            treatment_start_date=recorded_at,
            treatment_end_date=None,
            notes=data.get('notes'),
            status='active',
            follow_up_date=None
        )
        
        db.session.add(diagnosis)
        db.session.flush()  # Obtener diagnosis.id
        
        # PASO 4: Actualizar los logs con el diagnosis_id
        PatientSymptomsLog.query.filter_by(visit_id=visit_id).update({'diagnosis_id': diagnosis.id})
        PatientSignsLog.query.filter_by(visit_id=visit_id).update({'diagnosis_id': diagnosis.id})
        PatientLabResultsLog.query.filter_by(visit_id=visit_id).update({'diagnosis_id': diagnosis.id})
        
        db.session.commit()
        
        # Obtener información completa de la enfermedad para la respuesta
        disease = db.session.get(Disease, inferred_disease_code)
        disease_data = {
            'code': disease.code,
            'name': disease.name,
            'description': disease.description
        } if disease else None
        
        # Devolver datos completos del diagnóstico creado
        return jsonify({
            'status': 'success',
            'message': 'Diagnóstico creado correctamente',
            'data': {
                'id': diagnosis.id,
                'patient_id': diagnosis.patient_id,
                'disease_code': diagnosis.disease_code,
                'disease_name': disease.name if disease else 'Desconocida',
                'confidence_score': diagnosis.confidence_score or 0,
                'treatment': diagnosis.treatment,
                'diagnosis_date': diagnosis.diagnosis_date.isoformat() if diagnosis.diagnosis_date else None,
                'status': diagnosis.status,
                'notes': diagnosis.notes,
                'visit_id': diagnosis.visit_id,
                # Obtener logs en lugar de campos antiguos
                'symptoms_logs': [s.to_dict() for s in diagnosis.symptoms_logs.all()],
                'signs_logs': [s.to_dict() for s in diagnosis.signs_logs.all()],
                'lab_results_logs': [l.to_dict() for l in diagnosis.lab_results_logs.all()],
                'alternative_diseases': diagnosis.alternative_diseases,
                'inference_details': diagnosis.inference_details,
                'disease': disease_data
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@diagnoses_bp.route('/diagnoses/<int:diagnosis_id>', methods=['PUT'])
@jwt_required()
def update_diagnosis(diagnosis_id):
    """Actualizar un diagnóstico existente"""
    try:
        current_user_id = int(get_jwt_identity())
        
        diagnosis = db.session.get(Diagnosis, diagnosis_id)
        if not diagnosis:
            return jsonify({'status': 'error', 'message': 'Diagnóstico no encontrado'}), 404
        
        # Verificar acceso
        if not can_access_patient(current_user_id, diagnosis.patient_id):
            return jsonify({'status': 'error', 'message': 'No autorizado'}), 403
        
        data = request.get_json()
        
        # Actualizar campos permitidos del diagnóstico
        # NOTA: symptoms_presented, signs_observed y lab_results ya no existen
        # Ahora se usan las tablas *_logs que no se actualizan desde aquí
        if 'disease_code' in data:
            diagnosis.disease_code = data['disease_code']
        if 'diagnosis_date' in data:
            diagnosis.diagnosis_date = datetime.fromisoformat(data['diagnosis_date'])
        if 'confidence_score' in data:
            diagnosis.confidence_score = data['confidence_score']
        if 'inference_details' in data:
            diagnosis.inference_details = data['inference_details']
        if 'alternative_diseases' in data:
            diagnosis.alternative_diseases = data['alternative_diseases']
        if 'treatment' in data:
            diagnosis.treatment = data['treatment']
        if 'treatment_start_date' in data:
            diagnosis.treatment_start_date = datetime.fromisoformat(data['treatment_start_date']) if data['treatment_start_date'] else None
        if 'treatment_end_date' in data:
            diagnosis.treatment_end_date = datetime.fromisoformat(data['treatment_end_date']) if data['treatment_end_date'] else None
        if 'notes' in data:
            diagnosis.notes = data['notes']
        if 'status' in data:
            diagnosis.status = data['status']
        if 'follow_up_date' in data:
            diagnosis.follow_up_date = datetime.fromisoformat(data['follow_up_date']) if data['follow_up_date'] else None
        
        diagnosis.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Diagnóstico actualizado correctamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@diagnoses_bp.route('/diagnoses/<int:diagnosis_id>', methods=['DELETE'])
@jwt_required()
def delete_diagnosis(diagnosis_id):
    """Eliminar un diagnóstico (solo admin)"""
    try:
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'status': 'error', 'message': 'Solo administradores pueden eliminar diagnósticos'}), 403
        
        diagnosis = db.session.get(Diagnosis, diagnosis_id)
        if not diagnosis:
            return jsonify({'status': 'error', 'message': 'Diagnóstico no encontrado'}), 404
        
        db.session.delete(diagnosis)
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Diagnóstico eliminado correctamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
