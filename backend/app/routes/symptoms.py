"""
Rutas para gestión de síntomas
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from datetime import datetime
from app.extensions import db
from app.models import Symptom

symptoms_bp = Blueprint('symptoms', __name__, url_prefix='/api')

@symptoms_bp.route('/symptoms', methods=['GET'])
@jwt_required()
def get_symptoms():
    """Obtener todos los síntomas activos (no eliminados) con paginación y filtrado
    
    Query params opcionales:
    - page: número de página (default: 1)
    - page_size: tamaño de página (default: 10, max: 1000)
    - nombre: filtrar por nombre (búsqueda parcial case-insensitive)
    - categoria: filtrar por categoría (búsqueda parcial case-insensitive)
    """
    try:
        # Parámetros de paginación
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        
        # Validar parámetros
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 1000:
            page_size = 10
        
        # Construir query base
        query = Symptom.query.filter(
            Symptom.is_active == True,
            Symptom.deleted_at.is_(None)
        )
        
        # Filtros opcionales
        nombre = request.args.get('nombre', '', type=str) or ''
        categoria = request.args.get('categoria', '', type=str) or ''
        
        if nombre:
            query = query.filter(Symptom.name.ilike(f'%{nombre}%'))
        
        if categoria:
            query = query.filter(Symptom.category.ilike(f'%{categoria}%'))
        
        # Obtener total count antes de paginar
        total_count = query.count()
        
        # Aplicar paginación
        symptoms = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return jsonify({
            'status': 'success',
            'data': [
                {
                    'id': symptom.id,
                    'code': symptom.code,
                    'name': symptom.name,
                    'description': symptom.description,
                    'category': symptom.category,
                    'is_active': symptom.is_active,
                    'created_at': symptom.created_at.isoformat() if symptom.created_at else None,
                    'updated_at': symptom.updated_at.isoformat() if symptom.updated_at else None
                }
                for symptom in symptoms
            ],
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Error al obtener síntomas'
        }), 500

@symptoms_bp.route('/symptoms/<int:symptom_id>', methods=['GET'])
@jwt_required()
def get_symptom(symptom_id):
    """Obtener un síntoma por ID"""
    try:
        symptom = Symptom.query.filter_by(id=symptom_id, deleted_at=None).first()
        if not symptom:
            return jsonify({
                'status': 'error',
                'message': 'Síntoma no encontrado'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': {
                'id': symptom.id,
                'code': symptom.code,
                'name': symptom.name,
                'description': symptom.description,
                'category': symptom.category,
                'is_active': symptom.is_active,
                'created_at': symptom.created_at.isoformat() if symptom.created_at else None,
                'updated_at': symptom.updated_at.isoformat() if symptom.updated_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Síntoma no encontrado'
        }), 404

@symptoms_bp.route('/symptoms', methods=['POST'])
@jwt_required()
def create_symptom():
    """Crear un nuevo síntoma"""
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['code', 'name', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'El campo {field} es requerido'
                }), 400
        
        # Verificar que no exista un síntoma con el mismo código
        existing_symptom = Symptom.query.filter_by(code=data['code']).first()
        if existing_symptom:
            return jsonify({
                'status': 'error',
                'message': 'Ya existe un síntoma con ese código'
            }), 400
        
        # Crear nuevo síntoma
        new_symptom = Symptom(
            code=data['code'],
            name=data['name'],
            description=data.get('description', ''),
            category=data['category'],
            is_active=data.get('is_active', True)
        )
        
        db.session.add(new_symptom)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Síntoma creado exitosamente',
            'data': {
                'id': new_symptom.id,
                'code': new_symptom.code,
                'name': new_symptom.name,
                'description': new_symptom.description,
                'category': new_symptom.category,
                'is_active': new_symptom.is_active,
                'created_at': new_symptom.created_at.isoformat() if new_symptom.created_at else None,
                'updated_at': new_symptom.updated_at.isoformat() if new_symptom.updated_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al crear el síntoma'
        }), 500

@symptoms_bp.route('/symptoms/<int:symptom_id>', methods=['PUT'])
@jwt_required()
def update_symptom(symptom_id):
    """Actualizar un síntoma existente"""
    try:
        symptom = Symptom.query.filter_by(id=symptom_id, deleted_at=None).first()
        if not symptom:
            return jsonify({
                'status': 'error',
                'message': 'Síntoma no encontrado'
            }), 404
            
        data = request.get_json()
        
        # Verificar si se está cambiando el código y si ya existe
        if 'code' in data and data['code'] != symptom.code:
            existing_symptom = Symptom.query.filter_by(code=data['code']).first()
            if existing_symptom:
                return jsonify({
                    'status': 'error',
                    'message': 'Ya existe un síntoma con ese código'
                }), 400
        
        # Actualizar campos
        if 'code' in data:
            symptom.code = data['code']
        if 'name' in data:
            symptom.name = data['name']
        if 'description' in data:
            symptom.description = data['description']
        if 'category' in data:
            symptom.category = data['category']
        if 'is_active' in data:
            symptom.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Síntoma actualizado exitosamente',
            'data': {
                'id': symptom.id,
                'code': symptom.code,
                'name': symptom.name,
                'description': symptom.description,
                'category': symptom.category,
                'is_active': symptom.is_active,
                'created_at': symptom.created_at.isoformat() if symptom.created_at else None,
                'updated_at': symptom.updated_at.isoformat() if symptom.updated_at else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al actualizar el síntoma'
        }), 500

@symptoms_bp.route('/symptoms/<int:symptom_id>', methods=['DELETE'])
@jwt_required()
def delete_symptom(symptom_id):
    """Eliminar un síntoma (soft delete)"""
    try:
        symptom = Symptom.query.filter_by(id=symptom_id, deleted_at=None).first()
        if not symptom:
            return jsonify({
                'status': 'error',
                'message': 'Síntoma no encontrado'
            }), 404
        
        # Soft delete: establecer deleted_at y marcar como inactivo
        symptom.deleted_at = datetime.utcnow()
        symptom.is_active = False
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Síntoma eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al eliminar el síntoma'
        }), 500
