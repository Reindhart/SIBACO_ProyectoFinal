"""
Modelos de Conocimiento Médico
Gestiona enfermedades, signos, síntomas y pruebas
"""
from datetime import datetime
from app.extensions import db


class Disease(db.Model):
    """Modelo de enfermedad"""
    __tablename__ = 'diseases'
    
    # Usar code como clave primaria (formato: TIPO + número, ej: RESP01, GASTR01)
    code = db.Column(db.String(20), primary_key=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))  # Categoría de la enfermedad (RESP, GASTR, CARD, etc.)
    severity = db.Column(db.String(50))  # 'leve', 'moderada', 'grave', 'crítica'
    
    # Información adicional
    treatment_recommendations = db.Column(db.Text)
    prevention_measures = db.Column(db.Text)
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones muchos a muchos
    symptoms = db.relationship('Symptom', secondary='disease_symptoms', backref='diseases', lazy='dynamic')
    signs = db.relationship('Sign', secondary='disease_signs', backref='diseases', lazy='dynamic')
    lab_tests = db.relationship('LabTest', secondary='disease_lab_tests', backref='diseases', lazy='dynamic')
    postmortem_tests = db.relationship('PostmortemTest', secondary='disease_postmortem_tests', backref='diseases', lazy='dynamic')
    
    # Relación con diagnósticos
    diagnoses = db.relationship('Diagnosis', backref='disease', lazy='dynamic')
    
    def to_dict(self, include_relations=False):
        """Convierte la enfermedad a diccionario"""
        data = {
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'severity': self.severity,
            'treatment_recommendations': self.treatment_recommendations,
            'prevention_measures': self.prevention_measures,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
        if include_relations:
            data['symptoms'] = [s.to_dict() for s in self.symptoms]
            data['signs'] = [s.to_dict() for s in self.signs]
            data['lab_tests'] = [lt.to_dict() for lt in self.lab_tests]
            data['postmortem_tests'] = [pt.to_dict() for pt in self.postmortem_tests]
        
        return data
    
    def __repr__(self):
        return f'<Disease {self.code}: {self.name}>'


class Symptom(db.Model):
    """Modelo de síntoma"""
    __tablename__ = 'symptoms'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))  # Categoría del síntoma
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convierte el síntoma a diccionario"""
        return {
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'is_active': self.is_active,
        }
    
    def __repr__(self):
        return f'<Symptom {self.code}: {self.name}>'


class Sign(db.Model):
    """Modelo de signo clínico"""
    __tablename__ = 'signs'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    measurement_unit = db.Column(db.String(50))  # Unidad de medida si aplica
    normal_range = db.Column(db.String(100))  # Rango normal de valores
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convierte el signo a diccionario"""
        return {
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'measurement_unit': self.measurement_unit,
            'normal_range': self.normal_range,
            'is_active': self.is_active,
        }
    
    def __repr__(self):
        return f'<Sign {self.code}: {self.name}>'


class LabTest(db.Model):
    """Modelo de prueba de laboratorio"""
    __tablename__ = 'lab_tests'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    normal_range = db.Column(db.String(200))
    unit = db.Column(db.String(50))
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convierte la prueba de laboratorio a diccionario"""
        return {
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'normal_range': self.normal_range,
            'unit': self.unit,
            'is_active': self.is_active,
        }
    
    def __repr__(self):
        return f'<LabTest {self.code}: {self.name}>'


class PostmortemTest(db.Model):
    """Modelo de prueba post-mortem"""
    __tablename__ = 'postmortem_tests'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    findings_description = db.Column(db.Text)
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convierte la prueba post-mortem a diccionario"""
        return {
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'findings_description': self.findings_description,
            'is_active': self.is_active,
        }
    
    def __repr__(self):
        return f'<PostmortemTest {self.code}: {self.name}>'


# Tablas de asociación muchos a muchos
# Nota: disease_code referencia el código de enfermedad (String) como clave foránea

disease_symptoms = db.Table('disease_symptoms',
    db.Column('disease_code', db.String(20), db.ForeignKey('diseases.code'), primary_key=True),
    db.Column('symptom_id', db.Integer, db.ForeignKey('symptoms.id'), primary_key=True),
    db.Column('weight', db.Float, default=1.0),  # Peso para el motor de inferencia
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

disease_signs = db.Table('disease_signs',
    db.Column('disease_code', db.String(20), db.ForeignKey('diseases.code'), primary_key=True),
    db.Column('sign_id', db.Integer, db.ForeignKey('signs.id'), primary_key=True),
    db.Column('weight', db.Float, default=1.0),  # Peso para el motor de inferencia
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

disease_lab_tests = db.Table('disease_lab_tests',
    db.Column('disease_code', db.String(20), db.ForeignKey('diseases.code'), primary_key=True),
    db.Column('lab_test_id', db.Integer, db.ForeignKey('lab_tests.id'), primary_key=True),
    db.Column('weight', db.Float, default=1.0),  # Peso para el motor de inferencia
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

disease_postmortem_tests = db.Table('disease_postmortem_tests',
    db.Column('disease_code', db.String(20), db.ForeignKey('diseases.code'), primary_key=True),
    db.Column('postmortem_test_id', db.Integer, db.ForeignKey('postmortem_tests.id'), primary_key=True),
    db.Column('weight', db.Float, default=1.0),  # Peso para el motor de inferencia
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)
