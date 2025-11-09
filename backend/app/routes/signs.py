"""
Rutas para gestión de signos clínicos
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Sign

signs_bp = Blueprint('signs', __name__, url_prefix='/api')

@signs_bp.route('/signs', methods=['GET'])
@jwt_required()
def get_signs():
    """Obtener todos los signos activos"""
    try:
        signs = Sign.query.filter_by(is_active=True).all()
        
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
            ]
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
        sign = Sign.query.get_or_404(sign_id)
        
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
