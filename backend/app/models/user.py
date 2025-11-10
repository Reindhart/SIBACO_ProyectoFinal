"""
Modelo de Usuario del Sistema
Gestiona usuarios, médicos y administradores
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


class User(db.Model):
    """Modelo base de usuario del sistema"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Tipo de usuario: 'admin', 'doctor'
    role = db.Column(db.String(20), nullable=False, default='doctor')
    
    # Información personal
    first_name = db.Column(db.String(100), nullable=False)
    second_name = db.Column(db.String(100))  # Segundo nombre (opcional)
    paternal_surname = db.Column(db.String(100), nullable=False)  # Apellido paterno
    maternal_surname = db.Column(db.String(100))  # Apellido materno (opcional)
    phone = db.Column(db.String(20))
    
    # Estado del usuario
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # Relaciones
    # Si es doctor, tendrá pacientes
    patients = db.relationship('Patient', backref='doctor', lazy='dynamic', foreign_keys='Patient.doctor_id')
    # Si es doctor, tendrá diagnósticos realizados
    diagnoses = db.relationship('Diagnosis', backref='doctor', lazy='dynamic')
    
    def set_password(self, password):
        """Genera hash de la contraseña"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica la contraseña"""
        return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        """Retorna el nombre completo del usuario"""
        if self.first_name and self.paternal_surname:
            parts = [self.first_name]
            if self.second_name:
                parts.append(self.second_name)
            parts.append(self.paternal_surname)
            if self.maternal_surname:
                parts.append(self.maternal_surname)
            return ' '.join(parts)
        return self.username
    
    def to_dict(self, include_email=True):
        """Convierte el usuario a diccionario"""
        data = {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'first_name': self.first_name,
            'second_name': self.second_name,
            'paternal_surname': self.paternal_surname,
            'maternal_surname': self.maternal_surname,
            'full_name': self.full_name,
            'phone': self.phone,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
        }
        if include_email:
            data['email'] = self.email
        return data
    
    def __repr__(self):
        return f'<User {self.username}>'
