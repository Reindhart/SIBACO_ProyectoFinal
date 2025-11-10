"""
Rutas para gestión de pruebas post-mortem
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from datetime import datetime
from app.extensions import db
from app.models import PostmortemTest

postmortem_tests_bp = Blueprint('postmortem_tests', __name__, url_prefix='/api')

@postmortem_tests_bp.route('/postmortem-tests', methods=['GET'])
@jwt_required()
def get_postmortem_tests():
    """Obtener todas las pruebas post-mortem activas (no eliminadas) con paginación y filtrado
    
    Query params opcionales:
    - page: número de página (default: 1)
    - page_size: tamaño de página (default: 10, max: 1000)
    - nombre: filtrar por nombre (búsqueda parcial case-insensitive)
    - death_cause: filtrar por causa de muerte
    - codigo: filtrar por código de la prueba (partial match)
    - disease: filtrar por enfermedad diagnosticada (partial match, busca en disease_diagnosis)
    - autopsy_date: filtrar por fecha de autopsia (YYYY-MM-DD exact match)
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
        query = PostmortemTest.query.filter(
            PostmortemTest.deleted_at.is_(None)
        )
        
        # Filtros opcionales
        death_cause = request.args.get('death_cause', '', type=str) or ''
        codigo = request.args.get('codigo', '', type=str) or ''
        disease = request.args.get('disease', '', type=str) or ''
        autopsy_date_str = request.args.get('autopsy_date', '', type=str) or ''

        if death_cause:
            query = query.filter(PostmortemTest.death_cause.ilike(f'%{death_cause}%'))

        if codigo:
            query = query.filter(PostmortemTest.code.ilike(f'%{codigo}%'))

        if disease:
            query = query.filter(PostmortemTest.disease_diagnosis.ilike(f'%{disease}%'))

        if autopsy_date_str:
            try:
                adate = datetime.strptime(autopsy_date_str, '%Y-%m-%d').date()
                query = query.filter(PostmortemTest.autopsy_date == adate)
            except Exception:
                # ignore invalid date format
                pass

        # Obtener total count antes de paginar
        total_count = query.count()
        
        # Aplicar paginación
        tests = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return jsonify({
            'status': 'success',
            'data': [test.to_dict() for test in tests],
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
            'message': 'Error al obtener pruebas post-mortem'
        }), 500

@postmortem_tests_bp.route('/postmortem-tests/<string:code>', methods=['GET'])
@jwt_required()
def get_postmortem_test(code):
    """Obtener una prueba post-mortem por código"""
    try:
        test = PostmortemTest.query.filter_by(code=code, deleted_at=None).first()
        if not test:
            return jsonify({
                'status': 'error',
                'message': 'Prueba post-mortem no encontrada'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': test.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Prueba post-mortem no encontrada'
        }), 404

@postmortem_tests_bp.route('/postmortem-tests', methods=['POST'])
@jwt_required()
def create_postmortem_test():
    """Crear una nueva prueba post-mortem"""
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['code', '_death_cause']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'El campo {field} es requerido'
                }), 400
        
        # Verificar que no exista una prueba con el mismo código
        existing_test = PostmortemTest.query.filter_by(code=data['code']).first()
        if existing_test:
            return jsonify({
                'status': 'error',
                'message': 'Ya existe una prueba post-mortem con ese código'
            }), 400
        
        # Crear nueva prueba con todos los campos nuevos
        new_test = PostmortemTest(
            code=data['code'],
            autopsy_date=datetime.strptime(data['autopsy_date'], '%Y-%m-%d').date() if data.get('autopsy_date') else None,
            death_cause=data['death_cause'],
            disease_diagnosis=data.get('disease_diagnosis'),
            macro_findings=data.get('macro_findings'),
            histology=data.get('histology'),
            toxicology_results=data.get('toxicology_results'),
            genetic_results=data.get('genetic_results'),
            pathologic_correlation=data.get('pathologic_correlation'),
            observations=data.get('observations'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(new_test)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Prueba post-mortem creada exitosamente',
            'data': new_test.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Error al crear la prueba post-mortem: {str(e)}'
        }), 500

@postmortem_tests_bp.route('/postmortem-tests/<string:code>', methods=['PUT'])
@jwt_required()
def update_postmortem_test(code):
    """Actualizar una prueba post-mortem existente"""
    try:
        test = PostmortemTest.query.filter_by(code=code, deleted_at=None).first()
        if not test:
            return jsonify({
                'status': 'error',
                'message': 'Prueba post-mortem no encontrada'
            }), 404
            
        data = request.get_json()
        
        # Verificar si se está cambiando el código y si ya existe
        if 'code' in data and data['code'] != test.code:
            existing_test = PostmortemTest.query.filter_by(code=data['code']).first()
            if existing_test:
                return jsonify({
                    'status': 'error',
                    'message': 'Ya existe una prueba post-mortem con ese código'
                }), 400
        
        # Actualizar campos básicos
        if 'code' in data:
            test.code = data['code']
        if 'autopsy_date' in data:
            test.autopsy_date = datetime.strptime(data['autopsy_date'], '%Y-%m-%d').date() if data['autopsy_date'] else None
        if 'death_cause' in data:
            test.death_cause = data['death_cause']
        if 'disease_diagnosis' in data:
            test.disease_diagnosis = data['disease_diagnosis']
        
        # Actualizar hallazgos y resultados
        if 'macro_findings' in data:
            test.macro_findings = data['macro_findings']
        if 'histology' in data:
            test.histology = data['histology']
        if 'toxicology_results' in data:
            test.toxicology_results = data['toxicology_results']
        if 'genetic_results' in data:
            test.genetic_results = data['genetic_results']
        if 'pathologic_correlation' in data:
            test.pathologic_correlation = data['pathologic_correlation']
        if 'observations' in data:
            test.observations = data['observations']
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Prueba post-mortem actualizada exitosamente',
            'data': test.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Error al actualizar la prueba post-mortem: {str(e)}'
        }), 500

@postmortem_tests_bp.route('/postmortem-tests/<string:code>', methods=['DELETE'])
@jwt_required()
def delete_postmortem_test(code):
    """Eliminar una prueba post-mortem (soft delete)"""
    try:
        test = PostmortemTest.query.filter_by(code=code, deleted_at=None).first()
        if not test:
            return jsonify({
                'status': 'error',
                'message': 'Prueba post-mortem no encontrada'
            }), 404
        
        # Soft delete: establecer deleted_at y marcar como inactivo
        test.deleted_at = datetime.utcnow()
        test.is_active = False
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Prueba post-mortem eliminada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Error al eliminar la prueba post-mortem'
        }), 500
