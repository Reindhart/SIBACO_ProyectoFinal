from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app.extensions import db
from app.models.medical_knowledge import Disease, Symptom, Sign
from app.models.user import User

diseases_bp = Blueprint('diseases', __name__, url_prefix='/api')

def is_admin(current_user_id):
    """Helper para verificar si el usuario actual es admin"""
    user = db.session.get(User, int(current_user_id))
    return user and user.role == 'admin'

def get_next_code_for_category(category: str) -> str:
    """
    Genera el siguiente código para una categoría.
    Formato: CATEGORIA + número (ej: RESP01, RESP02, GASTR01, etc.)
    """
    # Obtener el prefijo de la categoría (máximo 6 caracteres en mayúsculas)
    prefix = category.upper()[:6]
    
    # Buscar el último código de esta categoría
    last_disease = db.session.query(Disease).filter(
        Disease.code.like(f'{prefix}%')
    ).order_by(Disease.code.desc()).first()
    
    if last_disease:
        # Extraer el número del último código
        try:
            last_number = int(last_disease.code[len(prefix):])
            next_number = last_number + 1
        except ValueError:
            next_number = 1
    else:
        next_number = 1
    
    # Formatear con ceros a la izquierda (2 dígitos)
    return f"{prefix}{next_number:02d}"

@diseases_bp.route('/diseases', methods=['GET'])
@jwt_required()
def get_diseases():
    """Obtener todas las enfermedades activas"""
    try:
        diseases = Disease.query.filter_by(is_active=True).order_by(Disease.code).all()
        
        diseases_data = []
        for disease in diseases:
            disease_dict = disease.to_dict(include_relations=True)
            diseases_data.append(disease_dict)
        
        return jsonify({'status': 'success', 'data': diseases_data}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@diseases_bp.route('/diseases/<string:code>', methods=['GET'])
@jwt_required()
def get_disease(code):
    """Obtener una enfermedad específica por código"""
    try:
        disease = db.session.get(Disease, code)
        
        if not disease or not disease.is_active:
            return jsonify({'status': 'error', 'message': 'Enfermedad no encontrada'}), 404
        
        disease_data = disease.to_dict(include_relations=True)
        
        return jsonify({'status': 'success', 'data': disease_data}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@diseases_bp.route('/diseases', methods=['POST'])
@jwt_required()
def create_disease():
    """Crear una nueva enfermedad (solo admin)"""
    try:
        current_user_id = int(get_jwt_identity())
        
        if not is_admin(current_user_id):
            return jsonify({'status': 'error', 'message': 'Solo administradores pueden crear enfermedades'}), 403
        
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['name', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({'status': 'error', 'message': f'Campo requerido: {field}'}), 400
        
        # Generar código automáticamente basado en la categoría
        code = get_next_code_for_category(data['category'])
        
        # Verificar que el código no exista
        existing_disease = db.session.get(Disease, code)
        if existing_disease:
            return jsonify({'status': 'error', 'message': 'Error generando código único. Intente nuevamente.'}), 400
        
        # Crear la enfermedad
        disease = Disease(
            code=code,
            name=data['name'],
            description=data.get('description'),
            category=data['category'],
            severity=data.get('severity', 'moderada'),
            treatment_recommendations=data.get('treatment_recommendations'),
            prevention_measures=data.get('prevention_measures')
        )
        
        db.session.add(disease)
        
        # Asociar síntomas si se proporcionan (por ID)
        if 'symptom_ids' in data and data['symptom_ids']:
            for symptom_id in data['symptom_ids']:
                symptom = db.session.get(Symptom, symptom_id)
                if symptom:
                    disease.symptoms.append(symptom)
        
        # Asociar signos si se proporcionan (por ID)
        if 'sign_ids' in data and data['sign_ids']:
            for sign_id in data['sign_ids']:
                sign = db.session.get(Sign, sign_id)
                if sign:
                    disease.signs.append(sign)
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': f'Enfermedad creada con código {code}',
            'data': disease.to_dict(include_relations=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@diseases_bp.route('/diseases/<string:code>', methods=['PUT'])
@jwt_required()
def update_disease(code):
    """Actualizar una enfermedad (solo admin)"""
    try:
        current_user_id = int(get_jwt_identity())
        
        if not is_admin(current_user_id):
            return jsonify({'status': 'error', 'message': 'Solo administradores pueden editar enfermedades'}), 403
        
        disease = db.session.get(Disease, code)
        
        if not disease:
            return jsonify({'status': 'error', 'message': 'Enfermedad no encontrada'}), 404
        
        data = request.get_json()
        
        # Actualizar campos
        if 'name' in data:
            disease.name = data['name']
        if 'description' in data:
            disease.description = data['description']
        if 'category' in data:
            disease.category = data['category']
        if 'severity' in data:
            disease.severity = data['severity']
        if 'treatment_recommendations' in data:
            disease.treatment_recommendations = data['treatment_recommendations']
        if 'prevention_measures' in data:
            disease.prevention_measures = data['prevention_measures']
        
        # Actualizar síntomas si se proporcionan (por ID)
        if 'symptom_ids' in data:
            # Limpiar síntomas existentes
            disease.symptoms = []
            # Agregar nuevos síntomas
            for symptom_id in data['symptom_ids']:
                symptom = db.session.get(Symptom, symptom_id)
                if symptom:
                    disease.symptoms.append(symptom)
        
        # Actualizar signos si se proporcionan (por ID)
        if 'sign_ids' in data:
            # Limpiar signos existentes
            disease.signs = []
            # Agregar nuevos signos
            for sign_id in data['sign_ids']:
                sign = db.session.get(Sign, sign_id)
                if sign:
                    disease.signs.append(sign)
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Enfermedad actualizada',
            'data': disease.to_dict(include_relations=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@diseases_bp.route('/diseases/<string:code>', methods=['DELETE'])
@jwt_required()
def delete_disease(code):
    """Desactivar una enfermedad (eliminación lógica, solo admin)"""
    try:
        current_user_id = int(get_jwt_identity())
        
        if not is_admin(current_user_id):
            return jsonify({'status': 'error', 'message': 'Solo administradores pueden eliminar enfermedades'}), 403
        
        disease = db.session.get(Disease, code)
        
        if not disease:
            return jsonify({'status': 'error', 'message': 'Enfermedad no encontrada'}), 404
        
        disease.is_active = False
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Enfermedad desactivada'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@diseases_bp.route('/diseases/categories', methods=['GET'])
@jwt_required()
def get_disease_categories():
    """Obtener todas las categorías de enfermedades disponibles"""
    try:
        categories = db.session.query(Disease.category).filter(
            Disease.is_active == True
        ).distinct().all()
        
        category_list = [cat[0] for cat in categories if cat[0]]
        
        return jsonify({'status': 'success', 'data': category_list}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
