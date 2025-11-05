"""
Rutas para gestión de usuarios (admin)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models import User
from app.schemas import UserSchema, UpdateProfileSchema

# Crear blueprint
users_bp = Blueprint("users", __name__, url_prefix="/api/users")

# Schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
update_profile_schema = UpdateProfileSchema()


def is_admin(current_user_id: str) -> bool:
    """Verifica si el usuario actual es administrador"""
    user = User.query.get(int(current_user_id))
    return user and user.role == 'admin'


@users_bp.route("", methods=["GET"])
@jwt_required()
def get_users():
    """
    Obtener lista de todos los usuarios (solo admin)
    ---
    Headers:
        Authorization: Bearer <access_token>
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Verificar que sea admin
        if not is_admin(current_user_id):
            return jsonify({
                'status': 'error',
                'message': 'No tiene permisos para acceder a este recurso'
            }), 403
        
        # Obtener todos los usuarios
        users = User.query.all()
        
        return jsonify({
            'status': 'success',
            'data': users_schema.dump(users)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error al obtener usuarios: {str(e)}'
        }), 500


@users_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    """
    Obtener un usuario específico (solo admin)
    ---
    Headers:
        Authorization: Bearer <access_token>
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Verificar que sea admin
        if not is_admin(current_user_id):
            return jsonify({
                'status': 'error',
                'message': 'No tiene permisos para acceder a este recurso'
            }), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Usuario no encontrado'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': user_schema.dump(user)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error al obtener usuario: {str(e)}'
        }), 500


@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    """
    Actualizar un usuario (solo admin)
    ---
    Headers:
        Authorization: Bearer <access_token>
    Body:
        first_name: str (opcional)
        last_name: str (opcional)
        phone: str (opcional)
        email: str (opcional)
        role: str (opcional)
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Verificar que sea admin
        if not is_admin(current_user_id):
            return jsonify({
                'status': 'error',
                'message': 'No tiene permisos para acceder a este recurso'
            }), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Usuario no encontrado'
            }), 404
        
        # Obtener datos de la petición
        data = request.get_json()
        
        # Actualizar campos permitidos
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'email' in data:
            user.email = data['email']
        if 'role' in data and data['role'] in ['admin', 'doctor']:
            user.role = data['role']
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Usuario actualizado exitosamente',
            'data': user_schema.dump(user)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Error al actualizar usuario: {str(e)}'
        }), 500


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    """
    Eliminar/desactivar un usuario (solo admin)
    ---
    Headers:
        Authorization: Bearer <access_token>
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Verificar que sea admin
        if not is_admin(current_user_id):
            return jsonify({
                'status': 'error',
                'message': 'No tiene permisos para acceder a este recurso'
            }), 403
        
        # No permitir que un admin se elimine a sí mismo
        if int(current_user_id) == user_id:
            return jsonify({
                'status': 'error',
                'message': 'No puede eliminar su propio usuario'
            }), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Usuario no encontrado'
            }), 404
        
        # En lugar de eliminar, desactivar el usuario
        user.is_active = False
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Usuario desactivado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Error al eliminar usuario: {str(e)}'
        }), 500
