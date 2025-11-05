"""
Rutas de autenticación
Maneja el registro, login y gestión de usuarios
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models import User
from app.schemas import (
    RegisterSchema,
    LoginSchema,
    UserSchema,
    ChangePasswordSchema,
    UpdateProfileSchema
)

# Crear blueprint para autenticación
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Inicializar schemas
register_schema = RegisterSchema()
login_schema = LoginSchema()
user_schema = UserSchema()
change_password_schema = ChangePasswordSchema()
update_profile_schema = UpdateProfileSchema()


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Registro de nuevo usuario
    ---
    Body:
        username: str (requerido)
        email: str (requerido)
        password: str (requerido, mínimo 6 caracteres)
        first_name: str (opcional)
        last_name: str (opcional)
        phone: str (opcional)
        role: str (opcional, 'admin' o 'doctor', por defecto 'doctor')
    """
    try:
        # Validar datos de entrada
        data = register_schema.load(request.get_json())
        
        # Crear nuevo usuario
        user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'doctor'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            phone=data.get('phone')
        )
        user.set_password(data['password'])
        
        # Guardar en la base de datos
        db.session.add(user)
        db.session.commit()
        
        # Generar tokens (identity debe ser string)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'status': 'success',
            'message': 'Usuario registrado exitosamente',
            'data': {
                'user': user_schema.dump(user),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        }), 201
        
    except ValidationError as err:
        return jsonify({
            'status': 'error',
            'message': 'Error de validación',
            'errors': err.messages
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Error al registrar usuario: {str(e)}'
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login de usuario
    ---
    Body:
        username: str (requerido)
        password: str (requerido)
    """
    try:
        # Validar datos de entrada
        data = login_schema.load(request.get_json())
        
        # Buscar usuario
        user = User.query.filter_by(username=data['username']).first()
        
        # Verificar que el usuario existe y la contraseña es correcta
        if not user or not user.check_password(data['password']):
            return jsonify({
                'status': 'error',
                'message': 'Credenciales inválidas'
            }), 401
        
        # Verificar que el usuario está activo
        if not user.is_active:
            return jsonify({
                'status': 'error',
                'message': 'Usuario inactivo. Contacte al administrador'
            }), 403
        
        # Generar tokens (identity debe ser string)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'status': 'success',
            'message': 'Login exitoso',
            'data': {
                'user': user_schema.dump(user),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        }), 200
        
    except ValidationError as err:
        return jsonify({
            'status': 'error',
            'message': 'Error de validación',
            'errors': err.messages
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error al iniciar sesión: {str(e)}'
        }), 500


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    Refrescar token de acceso
    ---
    Headers:
        Authorization: Bearer <refresh_token>
    """
    try:
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'status': 'success',
            'data': {
                'access_token': new_access_token
            }
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error al refrescar token: {str(e)}'
        }), 500


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    Obtener información del usuario actual
    ---
    Headers:
        Authorization: Bearer <access_token>
    """
    try:
        print(f"[DEBUG] Headers recibidos: {dict(request.headers)}")
        current_user_id = get_jwt_identity()  # Ahora es string
        print(f"[DEBUG] User ID from token: {current_user_id} (type: {type(current_user_id).__name__})")
        
        # Convertir a int para consultar la base de datos
        user = User.query.get(int(current_user_id))
        
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
        print(f"[DEBUG] Error en /me: {type(e).__name__}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error al obtener usuario: {str(e)}'
        }), 500


@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_profile():
    """
    Actualizar perfil del usuario actual
    ---
    Headers:
        Authorization: Bearer <access_token>
    Body:
        first_name: str (opcional)
        last_name: str (opcional)
        phone: str (opcional)
        email: str (opcional)
    """
    try:
        current_user_id = get_jwt_identity()  # String
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Usuario no encontrado'
            }), 404
        
        # Validar datos de entrada
        data = update_profile_schema.load(request.get_json())
        
        # Actualizar campos
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'email' in data:
            # Verificar que el email no esté en uso por otro usuario
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({
                    'status': 'error',
                    'message': 'El correo electrónico ya está en uso'
                }), 400
            user.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Perfil actualizado exitosamente',
            'data': user_schema.dump(user)
        }), 200
        
    except ValidationError as err:
        return jsonify({
            'status': 'error',
            'message': 'Error de validación',
            'errors': err.messages
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Error al actualizar perfil: {str(e)}'
        }), 500


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """
    Cambiar contraseña del usuario actual
    ---
    Headers:
        Authorization: Bearer <access_token>
    Body:
        old_password: str (requerido)
        new_password: str (requerido, mínimo 6 caracteres)
    """
    try:
        current_user_id = get_jwt_identity()  # String
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Usuario no encontrado'
            }), 404
        
        # Validar datos de entrada
        data = change_password_schema.load(request.get_json())
        
        # Verificar contraseña actual
        if not user.check_password(data['old_password']):
            return jsonify({
                'status': 'error',
                'message': 'La contraseña actual es incorrecta'
            }), 401
        
        # Actualizar contraseña
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Contraseña actualizada exitosamente'
        }), 200
        
    except ValidationError as err:
        return jsonify({
            'status': 'error',
            'message': 'Error de validación',
            'errors': err.messages
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Error al cambiar contraseña: {str(e)}'
        }), 500

