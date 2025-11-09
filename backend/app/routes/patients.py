from flask import Blueprint, request, jsonify  # type: ignore[import]
from flask_jwt_extended import jwt_required, get_jwt_identity  # type: ignore[import]
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
    """Obtener todos los pacientes (admin ve todos, doctor solo los suyos)
    
    Query params opcionales:
    - page: número de página (default: 1)
    - page_size: tamaño de página (default: 10, max: 100)
    """
    try:
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'status': 'error', 'message': 'Usuario no encontrado'}), 404
        
        # Parámetros de paginación
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        
        # Validar parámetros
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 1000:
            page_size = 10
        
        # Admin ve todos los pacientes, doctor solo los suyos
        if user.role == 'admin':
            query = Patient.query.filter_by(is_active=True)
        elif user.role == 'doctor':
            query = Patient.query.filter_by(doctor_id=current_user_id, is_active=True)
        else:
            return jsonify({'status': 'error', 'message': 'No autorizado'}), 403

        # Filtros opcionales (búsqueda server-side)
        nombre = request.args.get('nombre', '', type=str) or ''
        apellido_paterno = request.args.get('apellido_paterno', '', type=str) or ''
        apellido_materno = request.args.get('apellido_materno', '', type=str) or ''
        enfermedad = request.args.get('enfermedad', '', type=str) or ''

        # Aplicar filtros de nombre/apellidos
        if nombre:
            term = f"%{nombre}%"
            query = query.filter(
                (Patient.first_name.ilike(term)) |
                (Patient.second_name.ilike(term))
            )

        if apellido_paterno:
            term = f"%{apellido_paterno}%"
            query = query.filter(Patient.paternal_surname.ilike(term))

        if apellido_materno:
            term = f"%{apellido_materno}%"
            query = query.filter(Patient.maternal_surname.ilike(term))

        # Filtro por enfermedad necesita join con diagnósticos y enfermedades
        if enfermedad:
            term = f"%{enfermedad}%"
            # Import aquí para evitar ciclos si no se usan globalmente
            from app.models.diagnosis import Diagnosis
            from app.models.medical_knowledge import Disease

            query = query.join(Diagnosis, Diagnosis.patient_id == Patient.id)
            query = query.join(Disease, Disease.code == Diagnosis.disease_code)
            query = query.filter(Disease.name.ilike(term)).distinct()
        
        # Obtener total count
        total_count = query.count()
        
        # Aplicar paginación
        patients = query.offset((page - 1) * page_size).limit(page_size).all()
        
        patients_data = [{
            'id': p.id,
            'first_name': p.first_name,
            'second_name': p.second_name,
            'paternal_surname': p.paternal_surname,
            'maternal_surname': p.maternal_surname,
            'full_name': p.full_name,
            'date_of_birth': p.date_of_birth.isoformat() if p.date_of_birth else None,
            'age': p.age,
            'gender': p.gender,
            'blood_type_abo': p.blood_type_abo,
            'blood_type_rh': p.blood_type_rh,
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
        
        return jsonify({
            'status': 'success',
            'data': patients_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size
            }
        }), 200
        
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
            'second_name': patient.second_name,
            'paternal_surname': patient.paternal_surname,
            'maternal_surname': patient.maternal_surname,
            'full_name': patient.full_name,
            'date_of_birth': patient.date_of_birth.isoformat() if patient.date_of_birth else None,
            'age': patient.age,
            'gender': patient.gender,
            'blood_type_abo': patient.blood_type_abo,
            'blood_type_rh': patient.blood_type_rh,
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
        
        # Validar campos requeridos (actualizados)
        required_fields = ['first_name', 'paternal_surname', 'date_of_birth', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'status': 'error', 'message': f'Campo requerido: {field}'}), 400
        
        # Crear el paciente
        patient = Patient(
            first_name=data['first_name'],
            second_name=data.get('second_name'),
            paternal_surname=data['paternal_surname'],
            maternal_surname=data.get('maternal_surname'),
            date_of_birth=datetime.fromisoformat(data['date_of_birth']),
            gender=data['gender'],
            blood_type_abo=data.get('blood_type_abo'),
            blood_type_rh=data.get('blood_type_rh'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address'),
            allergies=data.get('allergies'),
            chronic_conditions=data.get('chronic_conditions'),
            doctor_id=current_user_id  # Asignar al doctor que lo crea
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({'status': 'success', 'data': patient.to_dict()}), 201
        
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
        if 'second_name' in data:
            patient.second_name = data['second_name']
        if 'paternal_surname' in data:
            patient.paternal_surname = data['paternal_surname']
        if 'maternal_surname' in data:
            patient.maternal_surname = data['maternal_surname']
        if 'date_of_birth' in data:
            patient.date_of_birth = datetime.fromisoformat(data['date_of_birth'])
        if 'gender' in data:
            patient.gender = data['gender']
        if 'blood_type_abo' in data:
            patient.blood_type_abo = data['blood_type_abo']
        if 'blood_type_rh' in data:
            patient.blood_type_rh = data['blood_type_rh']
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
        
        return jsonify({'status': 'success', 'message': 'Paciente actualizado correctamente', 'data': patient.to_dict()}), 200
        
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
