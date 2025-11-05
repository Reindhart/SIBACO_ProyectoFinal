"""
Schemas de validación para autenticación
"""
from marshmallow import Schema, fields, validate, validates, ValidationError
from app.models import User


class RegisterSchema(Schema):
    """Schema para registro de usuario"""
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    first_name = fields.Str(validate=validate.Length(max=100))
    last_name = fields.Str(validate=validate.Length(max=100))
    phone = fields.Str(validate=validate.Length(max=20))
    role = fields.Str(validate=validate.OneOf(['admin', 'doctor']), load_default='doctor')
    
    @validates('username')
    def validate_username(self, value):
        """Valida que el username no exista"""
        if User.query.filter_by(username=value).first():
            raise ValidationError('El nombre de usuario ya está en uso')
    
    @validates('email')
    def validate_email(self, value):
        """Valida que el email no exista"""
        if User.query.filter_by(email=value).first():
            raise ValidationError('El correo electrónico ya está registrado')


class LoginSchema(Schema):
    """Schema para login de usuario"""
    username = fields.Str(required=True)
    password = fields.Str(required=True)


class UserSchema(Schema):
    """Schema para información de usuario"""
    id = fields.Int(dump_only=True)
    username = fields.Str()
    email = fields.Email()
    first_name = fields.Str()
    last_name = fields.Str()
    full_name = fields.Str(dump_only=True)
    phone = fields.Str()
    role = fields.Str()
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)


class ChangePasswordSchema(Schema):
    """Schema para cambio de contraseña"""
    old_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=6))


class UpdateProfileSchema(Schema):
    """Schema para actualización de perfil"""
    first_name = fields.Str(validate=validate.Length(max=100))
    last_name = fields.Str(validate=validate.Length(max=100))
    phone = fields.Str(validate=validate.Length(max=20))
    email = fields.Email()
