"""
Modelo de Diagnóstico
Gestiona los diagnósticos médicos y el historial del paciente
"""
from datetime import datetime
from app.extensions import db


class Diagnosis(db.Model):
    """Modelo de diagnóstico médico"""
    __tablename__ = 'diagnoses'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Relaciones
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    disease_code = db.Column(db.String(20), db.ForeignKey('diseases.code'), nullable=False)
    
    # Información del diagnóstico
    diagnosis_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Síntomas y signos presentados
    symptoms_presented = db.Column(db.Text)  # JSON string con los síntomas
    signs_observed = db.Column(db.Text)  # JSON string con los signos
    lab_results = db.Column(db.Text)  # JSON string con resultados de laboratorio
    
    # Resultado del motor de inferencia
    confidence_score = db.Column(db.Float)  # Nivel de confianza del diagnóstico (0-100)
    inference_details = db.Column(db.Text)  # JSON string con detalles del proceso de inferencia
    
    # Diagnóstico diferencial
    alternative_diseases = db.Column(db.Text)  # JSON string con enfermedades alternativas y sus scores
    
    # Tratamiento
    treatment = db.Column(db.Text, nullable=False)
    treatment_start_date = db.Column(db.Date)
    treatment_end_date = db.Column(db.Date)
    
    # Notas adicionales del médico
    notes = db.Column(db.Text)
    
    # Seguimiento
    status = db.Column(db.String(50), default='active')  # 'active', 'recovered', 'ongoing', 'referred'
    follow_up_date = db.Column(db.Date)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relación con seguimientos
    follow_ups = db.relationship('FollowUp', backref='diagnosis', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_relations=False):
        """Convierte el diagnóstico a diccionario"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'disease_code': self.disease_code,
            'diagnosis_date': self.diagnosis_date.isoformat() if self.diagnosis_date else None,
            'symptoms_presented': self.symptoms_presented,
            'signs_observed': self.signs_observed,
            'lab_results': self.lab_results,
            'confidence_score': self.confidence_score,
            'inference_details': self.inference_details,
            'alternative_diseases': self.alternative_diseases,
            'treatment': self.treatment,
            'treatment_start_date': self.treatment_start_date.isoformat() if self.treatment_start_date else None,
            'treatment_end_date': self.treatment_end_date.isoformat() if self.treatment_end_date else None,
            'notes': self.notes,
            'status': self.status,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_relations:
            data['patient'] = self.patient.to_dict()
            data['doctor'] = self.doctor.to_dict()
            data['disease'] = self.disease.to_dict()
            data['follow_ups'] = [fu.to_dict() for fu in self.follow_ups]
        
        return data
    
    def __repr__(self):
        return f'<Diagnosis {self.id}: Patient {self.patient_id}>'


class FollowUp(db.Model):
    """Modelo de seguimiento del paciente"""
    __tablename__ = 'follow_ups'
    
    id = db.Column(db.Integer, primary_key=True)
    diagnosis_id = db.Column(db.Integer, db.ForeignKey('diagnoses.id'), nullable=False)
    
    # Fecha del seguimiento
    follow_up_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Evolución del paciente
    patient_condition = db.Column(db.String(50))  # 'improved', 'stable', 'worsened', 'critical'
    symptoms_evolution = db.Column(db.Text)  # Descripción de la evolución de síntomas
    
    # Nuevos signos vitales o pruebas
    new_signs = db.Column(db.Text)  # JSON string con nuevos signos
    new_lab_results = db.Column(db.Text)  # JSON string con nuevos resultados
    
    # Ajustes en el tratamiento
    treatment_adjustments = db.Column(db.Text)
    
    # Notas del médico
    notes = db.Column(db.Text)
    
    # Próxima cita
    next_follow_up_date = db.Column(db.Date)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convierte el seguimiento a diccionario"""
        return {
            'id': self.id,
            'diagnosis_id': self.diagnosis_id,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'patient_condition': self.patient_condition,
            'symptoms_evolution': self.symptoms_evolution,
            'new_signs': self.new_signs,
            'new_lab_results': self.new_lab_results,
            'treatment_adjustments': self.treatment_adjustments,
            'notes': self.notes,
            'next_follow_up_date': self.next_follow_up_date.isoformat() if self.next_follow_up_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
    
    def __repr__(self):
        return f'<FollowUp {self.id} for Diagnosis {self.diagnosis_id}>'
