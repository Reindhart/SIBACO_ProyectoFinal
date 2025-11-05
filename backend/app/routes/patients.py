from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.patient import Patient
from app.models.user import User
from datetime import datetime

patients_bp = Blueprint('patients', __name__, url_prefix='/api/patients')

def is_admin(current_user_id):
    """Helper para verificar si el usuario actual es admin"""
    user = db.session.get(User, int(current_user_id))
    return user and user.role == 'admin'

def is_doctor(current_user_id):
    """Helper para verificar si el usuario actual es doctor"""
    user = db.session.get(User, int(current_user_id))
    return user and user.role in ['admin', 'doctor']

@patients_bp.route('', methods=['GET'])
@jwt_required()
def get_patients():
    """Obtener todos los pacientes (admin ve todos, doctor solo los suyos)"""
    try:
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'status': 'error', 'message': 'Usuario no encontrado'}), 404
        
        # Admin ve todos los pacientes, doctor solo los suyos
        if user.role == 'admin':
            patients = Patient.query.filter_by(is_active=True).all()
        elif user.role == 'doctor':
            patients = Patient.query.filter_by(doctor_id=current_user_id, is_active=True).all()
        else:
            return jsonify({'status': 'error', 'message': 'No autorizado'}), 403
        
        patients_data = [{
            'id': p.id,
            'first_name': p.first_name,
            'last_name': p.last_name,
            'date_of_birth': p.date_of_birth.isoformat() if p.date_of_birth else None,
            'gender': p.gender,
            'blood_type': p.blood_type,
            'email': p.email,
            'phone': p.phone,
            'address': p.address,
            'allergies': p.allergies,
            'chronic_conditions': p.chronic_conditions,
            'doctor_id': p.doctor_id,
            'is_active': p.is_active,
            'created_at': p.created_at.isoformat() if p.created_at else None,
            'updated_at': p.updated_at.isoformat() if p.updated_at else None
        } for p in patients]
        
        return jsonify({'status': 'success', 'data': patients_data}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@patients_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    """Obtener un paciente específico con sus diagnósticos"""
    try:
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'status': 'error', 'message': 'Usuario no encontrado'}), 404
        
        patient = db.session.get(Patient, patient_id)
        
        if not patient or not patient.is_active:
            return jsonify({'status': 'error', 'message': 'Paciente no encontrado'}), 404
        
        # Verificar permisos: admin ve todo, doctor solo sus pacientes
        if user.role != 'admin' and patient.doctor_id != current_user_id:
            return jsonify({'status': 'error', 'message': 'No autorizado'}), 403
        
        patient_data = {
            'id': patient.id,
            'first_name': patient.first_name,
            'last_name': patient.last_name,
            'date_of_birth': patient.date_of_birth.isoformat() if patient.date_of_birth else None,
            'gender': patient.gender,
            'blood_type': patient.blood_type,
            'email': patient.email,
            'phone': patient.phone,
            'address': patient.address,
            'allergies': patient.allergies,
            'chronic_conditions': patient.chronic_conditions,
            'doctor_id': patient.doctor_id,
            'is_active': patient.is_active,
            'created_at': patient.created_at.isoformat() if patient.created_at else None,
            'updated_at': patient.updated_at.isoformat() if patient.updated_at else None
        }
        
        return jsonify({'status': 'success', 'data': patient_data}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@patients_bp.route('', methods=['POST'])
@jwt_required()
def create_patient():
    """Crear un nuevo paciente (solo doctores y admin)"""
    try:
        current_user_id = int(get_jwt_identity())
        
        if not is_doctor(current_user_id):
            return jsonify({'status': 'error', 'message': 'Solo doctores pueden crear pacientes'}), 403
        
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['first_name', 'last_name', 'date_of_birth', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'status': 'error', 'message': f'Campo requerido: {field}'}), 400
        
        # Crear el paciente
        patient = Patient(
            first_name=data['first_name'],
            last_name=data['last_name'],
            date_of_birth=datetime.fromisoformat(data['date_of_birth']),
            gender=data['gender'],
            blood_type=data.get('blood_type'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address'),
            allergies=data.get('allergies'),
            chronic_conditions=data.get('chronic_conditions'),
            doctor_id=current_user_id  # Asignar al doctor que lo crea
        )
        
        db.session.add(patient)
        db.session.commit()
        
        patient_data = {
            'id': patient.id,
            'first_name': patient.first_name,
            'last_name': patient.last_name,
            'date_of_birth': patient.date_of_birth.isoformat(),
            'gender': patient.gender,
            'blood_type': patient.blood_type,
            'email': patient.email,
            'phone': patient.phone,
            'address': patient.address,
            'allergies': patient.allergies,
            'chronic_conditions': patient.chronic_conditions,
            'doctor_id': patient.doctor_id,
            'is_active': patient.is_active
        }
        
        return jsonify({'status': 'success', 'data': patient_data}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@patients_bp.route('/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    """Actualizar un paciente existente"""
    try:
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'status': 'error', 'message': 'Usuario no encontrado'}), 404
        
        patient = db.session.get(Patient, patient_id)
        
        if not patient or not patient.is_active:
            return jsonify({'status': 'error', 'message': 'Paciente no encontrado'}), 404
        
        # Verificar permisos
        if user.role != 'admin' and patient.doctor_id != current_user_id:
            return jsonify({'status': 'error', 'message': 'No autorizado'}), 403
        
        data = request.get_json()
        
        # Actualizar campos permitidos
        if 'first_name' in data:
            patient.first_name = data['first_name']
        if 'last_name' in data:
            patient.last_name = data['last_name']
        if 'date_of_birth' in data:
            patient.date_of_birth = datetime.fromisoformat(data['date_of_birth'])
        if 'gender' in data:
            patient.gender = data['gender']
        if 'blood_type' in data:
            patient.blood_type = data['blood_type']
        if 'email' in data:
            patient.email = data['email']
        if 'phone' in data:
            patient.phone = data['phone']
        if 'address' in data:
            patient.address = data['address']
        if 'allergies' in data:
            patient.allergies = data['allergies']
        if 'chronic_conditions' in data:
            patient.chronic_conditions = data['chronic_conditions']
        
        patient.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Paciente actualizado correctamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@patients_bp.route('/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    """Desactivar un paciente (solo admin)"""
    try:
        current_user_id = int(get_jwt_identity())
        
        if not is_admin(current_user_id):
            return jsonify({'status': 'error', 'message': 'Solo administradores pueden desactivar pacientes'}), 403
        
        patient = db.session.get(Patient, patient_id)
        
        if not patient:
            return jsonify({'status': 'error', 'message': 'Paciente no encontrado'}), 404
        
        # Desactivar en lugar de eliminar
        patient.is_active = False
        patient.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Paciente desactivado correctamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
