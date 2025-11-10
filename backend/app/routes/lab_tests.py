"""
Rutas para gestión de pruebas de laboratorio
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from datetime import datetime
from app.extensions import db
from app.models import LabTest

lab_tests_bp = Blueprint('lab_tests', __name__, url_prefix='/api')

@lab_tests_bp.route('/lab-tests', methods=['GET'])
@jwt_required()
def get_lab_tests():
    """Obtener todas las pruebas de laboratorio activas (no eliminadas) con paginación y filtrado
    
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
        query = LabTest.query.filter(
            LabTest.is_active == True,
            LabTest.deleted_at.is_(None)
        )
        
        # Filtros opcionales
        nombre = request.args.get('nombre', '', type=str) or ''
        categoria = request.args.get('categoria', '', type=str) or ''
        codigo = request.args.get('codigo', '', type=str) or ''
        
        if nombre:
            query = query.filter(LabTest.name.ilike(f'%{nombre}%'))
        
        if categoria:
            query = query.filter(LabTest.category.ilike(f'%{categoria}%'))
        
        if codigo:
            query = query.filter(LabTest.code.ilike(f'%{codigo}%'))
        
        # Obtener total count antes de paginar
        total_count = query.count()
        
        # Aplicar paginación
        lab_tests = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return jsonify({
            'status': 'success',
            'data': [
                {
                    'id': test.id,
                    'code': test.code,
                    'name': test.name,
                    'description': test.description,
                    'category': test.category,
                    'normal_range': test.normal_range,
                    'unit': test.unit,
                    'is_active': test.is_active,
                    'created_at': test.created_at.isoformat() if test.created_at else None,
                    'updated_at': test.updated_at.isoformat() if test.updated_at else None
                }
                for test in lab_tests
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
            'message': 'Error al obtener pruebas de laboratorio'
        }), 500

@lab_tests_bp.route('/lab-tests/<int:test_id>', methods=['GET'])
@jwt_required()
def get_lab_test(test_id):
    """Obtener una prueba de laboratorio por ID"""
    try:
        test = LabTest.query.filter_by(id=test_id, deleted_at=None).first()
        if not test:
            return jsonify({
                'status': 'error',
                'message': 'Prueba de laboratorio no encontrada'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': {
                'id': test.id,
                'code': test.code,
                'name': test.name,
                'description': test.description,
                'category': test.category,
                'normal_range': test.normal_range,
                'unit': test.unit,
                'is_active': test.is_active,
                'created_at': test.created_at.isoformat() if test.created_at else None,
                'updated_at': test.updated_at.isoformat() if test.updated_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Prueba de laboratorio no encontrada'
        }), 404

@lab_tests_bp.route('/lab-tests', methods=['POST'])
@jwt_required()
def create_lab_test():
    """Crear una nueva prueba de laboratorio"""
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
        
        # Verificar que no exista una prueba con el mismo código
        existing_test = LabTest.query.filter_by(code=data['code']).first()
        if existing_test:
            return jsonify({
                'status': 'error',
                'message': 'Ya existe una prueba de laboratorio con ese código'
            }), 400
        
        # Crear nueva prueba
        new_test = LabTest(
            code=data['code'],
            name=data['name'],
            description=data.get('description', ''),
            category=data['category'],
            normal_range=data.get('normal_range'),
            unit=data.get('unit'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(new_test)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Prueba de laboratorio creada exitosamente',
            'data': {
                'id': new_test.id,
                'code': new_test.code,
                'name': new_test.name,
                'description': new_test.description,
                'category': new_test.category,
                'normal_range': new_test.normal_range,
                'unit': new_test.unit,
                'is_active': new_test.is_active,
                'created_at': new_test.created_at.isoformat() if new_test.created_at else None,
                'updated_at': new_test.updated_at.isoformat() if new_test.updated_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al crear la prueba de laboratorio'
        }), 500

@lab_tests_bp.route('/lab-tests/<int:test_id>', methods=['PUT'])
@jwt_required()
def update_lab_test(test_id):
    """Actualizar una prueba de laboratorio existente"""
    try:
        test = LabTest.query.filter_by(id=test_id, deleted_at=None).first()
        if not test:
            return jsonify({
                'status': 'error',
                'message': 'Prueba de laboratorio no encontrada'
            }), 404
            
        data = request.get_json()
        
        # Verificar si se está cambiando el código y si ya existe
        if 'code' in data and data['code'] != test.code:
            existing_test = LabTest.query.filter_by(code=data['code']).first()
            if existing_test:
                return jsonify({
                    'status': 'error',
                    'message': 'Ya existe una prueba de laboratorio con ese código'
                }), 400
        
        # Actualizar campos
        if 'code' in data:
            test.code = data['code']
        if 'name' in data:
            test.name = data['name']
        if 'description' in data:
            test.description = data['description']
        if 'category' in data:
            test.category = data['category']
        if 'normal_range' in data:
            test.normal_range = data['normal_range']
        if 'unit' in data:
            test.unit = data['unit']
        if 'is_active' in data:
            test.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Prueba de laboratorio actualizada exitosamente',
            'data': {
                'id': test.id,
                'code': test.code,
                'name': test.name,
                'description': test.description,
                'category': test.category,
                'normal_range': test.normal_range,
                'unit': test.unit,
                'is_active': test.is_active,
                'created_at': test.created_at.isoformat() if test.created_at else None,
                'updated_at': test.updated_at.isoformat() if test.updated_at else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al actualizar la prueba de laboratorio'
        }), 500

@lab_tests_bp.route('/lab-tests/<int:test_id>', methods=['DELETE'])
@jwt_required()
def delete_lab_test(test_id):
    """Eliminar una prueba de laboratorio (soft delete)"""
    try:
        test = LabTest.query.filter_by(id=test_id, deleted_at=None).first()
        if not test:
            return jsonify({
                'status': 'error',
                'message': 'Prueba de laboratorio no encontrada'
            }), 404
        
        # Soft delete: establecer deleted_at y marcar como inactivo
        test.deleted_at = datetime.utcnow()
        test.is_active = False
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Prueba de laboratorio eliminada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al eliminar la prueba de laboratorio'
        }), 500
