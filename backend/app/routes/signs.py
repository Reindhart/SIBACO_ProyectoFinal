"""
Rutas para gestión de signos clínicos
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from datetime import datetime
from app.extensions import db
from app.models import Sign

signs_bp = Blueprint('signs', __name__, url_prefix='/api')

@signs_bp.route('/signs', methods=['GET'])
@jwt_required()
def get_signs():
    """Obtener todos los signos activos (no eliminados) con paginación y filtrado
    
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
        query = Sign.query.filter(
            Sign.is_active == True,
            Sign.deleted_at.is_(None)
        )
        
        # Filtros opcionales
        nombre = request.args.get('nombre', '', type=str) or ''
        categoria = request.args.get('categoria', '', type=str) or ''
        
        if nombre:
            query = query.filter(Sign.name.ilike(f'%{nombre}%'))
        
        if categoria:
            query = query.filter(Sign.category.ilike(f'%{categoria}%'))
        
        # Obtener total count antes de paginar
        total_count = query.count()
        
        # Aplicar paginación
        signs = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return jsonify({
            'status': 'success',
            'data': [
                {
                    'id': sign.id,
                    'code': sign.code,
                    'name': sign.name,
                    'description': sign.description,
                    'category': sign.category,
                    'measurement_unit': sign.measurement_unit,
                    'normal_range': sign.normal_range,
                    'is_active': sign.is_active,
                    'created_at': sign.created_at.isoformat() if sign.created_at else None,
                    'updated_at': sign.updated_at.isoformat() if sign.updated_at else None
                }
                for sign in signs
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
            'message': 'Error al obtener signos'
        }), 500

@signs_bp.route('/signs/<int:sign_id>', methods=['GET'])
@jwt_required()
def get_sign(sign_id):
    """Obtener un signo por ID"""
    try:
        sign = Sign.query.filter_by(id=sign_id, deleted_at=None).first()
        if not sign:
            return jsonify({
                'status': 'error',
                'message': 'Signo no encontrado'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': {
                'id': sign.id,
                'code': sign.code,
                'name': sign.name,
                'description': sign.description,
                'category': sign.category,
                'measurement_unit': sign.measurement_unit,
                'normal_range': sign.normal_range,
                'is_active': sign.is_active,
                'created_at': sign.created_at.isoformat() if sign.created_at else None,
                'updated_at': sign.updated_at.isoformat() if sign.updated_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Signo no encontrado'
        }), 404

@signs_bp.route('/signs', methods=['POST'])
@jwt_required()
def create_sign():
    """Crear un nuevo signo clínico"""
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
        
        # Verificar que no exista un signo con el mismo código
        existing_sign = Sign.query.filter_by(code=data['code']).first()
        if existing_sign:
            return jsonify({
                'status': 'error',
                'message': 'Ya existe un signo con ese código'
            }), 400
        
        # Crear nuevo signo
        new_sign = Sign(
            code=data['code'],
            name=data['name'],
            description=data.get('description', ''),
            category=data['category'],
            measurement_unit=data.get('measurement_unit'),
            normal_range=data.get('normal_range'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(new_sign)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Signo creado exitosamente',
            'data': {
                'id': new_sign.id,
                'code': new_sign.code,
                'name': new_sign.name,
                'description': new_sign.description,
                'category': new_sign.category,
                'measurement_unit': new_sign.measurement_unit,
                'normal_range': new_sign.normal_range,
                'is_active': new_sign.is_active,
                'created_at': new_sign.created_at.isoformat() if new_sign.created_at else None,
                'updated_at': new_sign.updated_at.isoformat() if new_sign.updated_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al crear el signo'
        }), 500

@signs_bp.route('/signs/<int:sign_id>', methods=['PUT'])
@jwt_required()
def update_sign(sign_id):
    """Actualizar un signo existente"""
    try:
        sign = Sign.query.filter_by(id=sign_id, deleted_at=None).first()
        if not sign:
            return jsonify({
                'status': 'error',
                'message': 'Signo no encontrado'
            }), 404
            
        data = request.get_json()
        
        # Verificar si se está cambiando el código y si ya existe
        if 'code' in data and data['code'] != sign.code:
            existing_sign = Sign.query.filter_by(code=data['code']).first()
            if existing_sign:
                return jsonify({
                    'status': 'error',
                    'message': 'Ya existe un signo con ese código'
                }), 400
        
        # Actualizar campos
        if 'code' in data:
            sign.code = data['code']
        if 'name' in data:
            sign.name = data['name']
        if 'description' in data:
            sign.description = data['description']
        if 'category' in data:
            sign.category = data['category']
        if 'measurement_unit' in data:
            sign.measurement_unit = data['measurement_unit']
        if 'normal_range' in data:
            sign.normal_range = data['normal_range']
        if 'is_active' in data:
            sign.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Signo actualizado exitosamente',
            'data': {
                'id': sign.id,
                'code': sign.code,
                'name': sign.name,
                'description': sign.description,
                'category': sign.category,
                'measurement_unit': sign.measurement_unit,
                'normal_range': sign.normal_range,
                'is_active': sign.is_active,
                'created_at': sign.created_at.isoformat() if sign.created_at else None,
                'updated_at': sign.updated_at.isoformat() if sign.updated_at else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al actualizar el signo'
        }), 500

@signs_bp.route('/signs/<int:sign_id>', methods=['DELETE'])
@jwt_required()
def delete_sign(sign_id):
    """Eliminar un signo (soft delete)"""
    try:
        sign = Sign.query.filter_by(id=sign_id, deleted_at=None).first()
        if not sign:
            return jsonify({
                'status': 'error',
                'message': 'Signo no encontrado'
            }), 404
        
        # Soft delete: establecer deleted_at y marcar como inactivo
        sign.deleted_at = datetime.utcnow()
        sign.is_active = False
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Signo eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al eliminar el signo'
        }), 500
