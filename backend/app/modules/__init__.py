
"""
Módulos de lógica de negocio para el sistema de diagnóstico médico.
"""
from .inference_engine import (
    InferenceEngine,
    get_patient_evidence,
    get_treatment_recommendation,
    parse_numeric_range,
    is_value_abnormal
)

__all__ = [
    'InferenceEngine',
    'get_patient_evidence',
    'get_treatment_recommendation',
    'parse_numeric_range',
    'is_value_abnormal'
]
