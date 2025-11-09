"""
Rutas para gestión de síntomas
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Symptom

symptoms_bp = Blueprint('symptoms', __name__, url_prefix='/api')

@symptoms_bp.route('/symptoms', methods=['GET'])
@jwt_required()
def get_symptoms():
    """Obtener todos los síntomas activos"""
    try:
        symptoms = Symptom.query.filter_by(is_active=True).all()
        
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
            ]
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
        symptom = Symptom.query.get_or_404(symptom_id)
        
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
