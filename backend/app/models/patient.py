"""
Modelo de Paciente
Gestiona la información de los pacientes
"""
from datetime import datetime
from app.extensions import db


class Patient(db.Model):
    """Modelo de paciente"""
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    second_name = db.Column(db.String(100))  # Segundo nombre (opcional)
    paternal_surname = db.Column(db.String(100), nullable=False)  # Apellido paterno
    maternal_surname = db.Column(db.String(100))  # Apellido materno (opcional)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20))  # 'male', 'female', 'other'
    blood_type_abo = db.Column(db.Integer)  # 0-3
    blood_type_rh = db.Column(db.Integer)  # 0 o 1
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    allergies = db.Column(db.Text)  # Alergias conocidas
    chronic_conditions = db.Column(db.Text)  # Condiciones crónicas
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # Relaciones
    diagnoses = db.relationship('Diagnosis', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    
    @property
    def full_name(self):
        """Retorna el nombre completo del paciente"""
        # Usar los nuevos campos si están disponibles
        if self.paternal_surname:
            parts = [self.first_name]
            if self.second_name:
                parts.append(self.second_name)
            parts.append(self.paternal_surname)
            if self.maternal_surname:
                parts.append(self.maternal_surname)
            return ' '.join(parts)
        return f"{self.first_name}"
    
    @property
    def age(self):
        """Calcula la edad del paciente"""
        if self.date_of_birth:
            today = datetime.now().date()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None
    
    def to_dict(self):
        """Convierte el paciente a diccionario"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'second_name': self.second_name,
            'paternal_surname': self.paternal_surname,
            'maternal_surname': self.maternal_surname,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'age': self.age,
            'gender': self.gender,
            'blood_type_abo': self.blood_type_abo,
            'blood_type_rh': self.blood_type_rh,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'allergies': self.allergies,
            'chronic_conditions': self.chronic_conditions,
            'doctor_id': self.doctor_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
        }
    
    def __repr__(self):
        return f'<Patient {self.full_name}>'
