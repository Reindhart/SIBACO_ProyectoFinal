"""
Modelos de la aplicación
"""
from .user import User
from .patient import Patient
from .medical_knowledge import Disease, Symptom, Sign, LabTest, PostmortemTest
from .medical_knowledge import disease_symptoms, disease_signs, disease_lab_tests, disease_postmortem_tests
from .diagnosis import Diagnosis, FollowUp

__all__ = [
    'User',
    'Patient',
    'Disease',
    'Symptom',
    'Sign',
    'LabTest',
    'PostmortemTest',
    'Diagnosis',
    'FollowUp',
    'disease_symptoms',
    'disease_signs',
    'disease_lab_tests',
    'disease_postmortem_tests',
]
