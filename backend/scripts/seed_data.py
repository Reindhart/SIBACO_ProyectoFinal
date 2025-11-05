"""
Script para crear datos de prueba en la base de datos
"""
import sys
import os
from datetime import datetime, date

# Agregar el directorio padre al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models import User, Disease, Symptom, Sign, LabTest, Patient

def create_test_data():
    """Crea datos de prueba en la base de datos"""
    app = create_app()
    
    with app.app_context():
        print("\n" + "="*60)
        print("    CREANDO DATOS DE PRUEBA - SISTEMA MÉDICO")
        print("="*60 + "\n")
        
        # ==================== USUARIOS ====================
        print("📋 USUARIOS")
        print("-" * 60)
        
        # Crear usuario administrador
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@medicalsystem.com',
                role='admin',
                first_name='Administrador',
                last_name='Sistema',
                phone='555-0000'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print("✅ Administrador: admin / admin123")
        else:
            print("ℹ️  Administrador ya existe")
        
        # Crear múltiples médicos
        doctors_data = [
            {
                'username': 'dra.garcia',
                'email': 'maria.garcia@medicalsystem.com',
                'first_name': 'Dra. María',
                'last_name': 'García López',
                'phone': '555-1001',
                'password': 'doctor123'
            },
            {
                'username': 'dr.martinez',
                'email': 'carlos.martinez@medicalsystem.com',
                'first_name': 'Dr. Carlos',
                'last_name': 'Martínez Ruiz',
                'phone': '555-1002',
                'password': 'doctor123'
            },
            {
                'username': 'dra.rodriguez',
                'email': 'ana.rodriguez@medicalsystem.com',
                'first_name': 'Dra. Ana',
                'last_name': 'Rodríguez Sánchez',
                'phone': '555-1003',
                'password': 'doctor123'
            },
            {
                'username': 'dr.lopez',
                'email': 'jose.lopez@medicalsystem.com',
                'first_name': 'Dr. José',
                'last_name': 'López Hernández',
                'phone': '555-1004',
                'password': 'doctor123'
            },
            {
                'username': 'dra.fernandez',
                'email': 'laura.fernandez@medicalsystem.com',
                'first_name': 'Dra. Laura',
                'last_name': 'Fernández González',
                'phone': '555-1005',
                'password': 'doctor123'
            }
        ]
        
        doctors = []
        for doctor_data in doctors_data:
            doctor = User.query.filter_by(username=doctor_data['username']).first()
            if not doctor:
                password = doctor_data.pop('password')
                doctor = User(role='doctor', **doctor_data)
                doctor.set_password(password)
                db.session.add(doctor)
                doctors.append(doctor)
                print(f"✅ Médico: {doctor_data['username']} / doctor123")
            else:
                doctors.append(doctor)
                print(f"ℹ️  Médico {doctor_data['username']} ya existe")
        
        db.session.commit()
        
        # ==================== ENFERMEDADES ====================
        print("\n📋 ENFERMEDADES")
        print("-" * 60)
        
        # Crear enfermedades de ejemplo con códigos auto-generados
        diseases_data = [
            # Enfermedades Respiratorias
            {
                'code': 'RESP01',
                'name': 'Resfriado común',
                'description': 'Infección viral del tracto respiratorio superior causada por rinovirus',
                'category': 'RESP',
                'severity': 'leve',
                'treatment_recommendations': 'Reposo\nHidratación abundante\nAnalgésicos para fiebre (paracetamol)\nDescongestionantes nasales',
                'prevention_measures': 'Lavado frecuente de manos\nEvitar contacto con personas enfermas\nNo tocarse la cara con manos sucias\nMantener distancia social durante epidemias'
            },
            {
                'code': 'RESP02',
                'name': 'Gripe (Influenza)',
                'description': 'Infección viral respiratoria aguda causada por el virus de la influenza',
                'category': 'RESP',
                'severity': 'moderada',
                'treatment_recommendations': 'Antivirales (oseltamivir) en primeras 48h\nReposo absoluto\nHidratación\nAnalgésicos y antipiréticos\nMonitoreo de complicaciones',
                'prevention_measures': 'Vacunación anual\nHigiene de manos\nUso de mascarilla en lugares públicos\nEvitar aglomeraciones\nCubrir boca al toser'
            },
            {
                'code': 'RESP03',
                'name': 'Neumonía bacteriana',
                'description': 'Infección pulmonar causada por bacterias, principalmente Streptococcus pneumoniae',
                'category': 'RESP',
                'severity': 'grave',
                'treatment_recommendations': 'Antibióticos (amoxicilina, azitromicina)\nOxigenoterapia si es necesario\nHidratación IV\nReposo hospitalario en casos graves\nMonitoreo de signos vitales',
                'prevention_measures': 'Vacuna antineumocócica\nVacuna contra influenza\nNo fumar\nEvitar exposición a contaminantes\nTratamiento oportuno de infecciones respiratorias'
            },
            {
                'code': 'RESP04',
                'name': 'Bronquitis aguda',
                'description': 'Inflamación de los bronquios, generalmente de origen viral',
                'category': 'RESP',
                'severity': 'moderada',
                'treatment_recommendations': 'Reposo\nHidratación\nBroncodilatadores si hay sibilancias\nAntitusivos si tos muy molesta\nExpectorantes\nEvitar irritantes',
                'prevention_measures': 'No fumar\nEvitar contaminantes ambientales\nVacunación contra influenza\nLavado de manos\nBuena ventilación en espacios cerrados'
            },
            
            # Enfermedades Gastrointestinales
            {
                'code': 'GASTR01',
                'name': 'Gastroenteritis viral',
                'description': 'Inflamación del tracto gastrointestinal causada por virus (rotavirus, norovirus)',
                'category': 'GASTR',
                'severity': 'moderada',
                'treatment_recommendations': 'Hidratación oral con sales de rehidratación\nDieta blanda (arroz, plátano, manzana)\nProbióticos\nReposo\nEvitar lácteos temporalmente',
                'prevention_measures': 'Higiene alimentaria estricta\nLavado de manos antes de comer\nAgua potable segura\nEvitar alimentos crudos en lugares dudosos\nVacunación contra rotavirus en niños'
            },
            {
                'code': 'GASTR02',
                'name': 'Gastritis aguda',
                'description': 'Inflamación de la mucosa gástrica por diversos factores',
                'category': 'GASTR',
                'severity': 'leve',
                'treatment_recommendations': 'Inhibidores de bomba de protones (omeprazol)\nAntiácidos\nDieta suave y fraccionada\nEvitar irritantes (café, alcohol, picante)\nErradicación de H. pylori si está presente',
                'prevention_measures': 'Evitar AINEs prolongados\nNo fumar\nReducir estrés\nComidas regulares\nLimitar alcohol y café\nTratamiento de H. pylori'
            },
            {
                'code': 'GASTR03',
                'name': 'Apendicitis aguda',
                'description': 'Inflamación del apéndice vermiforme que requiere intervención quirúrgica',
                'category': 'GASTR',
                'severity': 'grave',
                'treatment_recommendations': 'Apendicectomía urgente (laparoscópica o abierta)\nAntibióticos profilácticos\nAnalgesia postoperatoria\nAyuno preoperatorio\nHidratación IV',
                'prevention_measures': 'No existe prevención específica\nDieta rica en fibra puede ayudar\nAtención médica inmediata ante dolor abdominal súbito\nNo automedicarse con analgésicos que enmascaren síntomas'
            },
            
            # Enfermedades Cardiovasculares
            {
                'code': 'CARD01',
                'name': 'Hipertensión arterial',
                'description': 'Presión arterial persistentemente elevada (≥140/90 mmHg)',
                'category': 'CARD',
                'severity': 'moderada',
                'treatment_recommendations': 'Antihipertensivos (IECA, ARA-II, diuréticos)\nDieta DASH baja en sal\nEjercicio regular 150 min/semana\nControl de peso\nReducción de estrés\nMonitoreo domiciliario',
                'prevention_measures': 'Dieta saludable baja en sodio\nEjercicio regular\nMantener peso saludable\nLimitar alcohol\nNo fumar\nControl regular de presión arterial'
            },
            {
                'code': 'CARD02',
                'name': 'Insuficiencia cardíaca',
                'description': 'Incapacidad del corazón para bombear sangre adecuadamente',
                'category': 'CARD',
                'severity': 'grave',
                'treatment_recommendations': 'Diuréticos\nIECA o ARA-II\nBetabloqueadores\nRestricc ión de sal y líquidos\nMonitoreo de peso diario\nOxígeno si es necesario\nTrasplante en casos severos',
                'prevention_measures': 'Control de hipertensión\nTratamiento de enfermedad coronaria\nNo fumar\nEvitar alcohol\nControl de diabetes\nVacunación contra influenza y neumonía'
            },
            
            # Enfermedades Metabólicas
            {
                'code': 'METAB01',
                'name': 'Diabetes Mellitus tipo 2',
                'description': 'Trastorno metabólico caracterizado por hiperglucemia crónica',
                'category': 'METAB',
                'severity': 'moderada',
                'treatment_recommendations': 'Metformina como primera línea\nModificación de estilo de vida\nDieta balanceada baja en azúcares simples\nEjercicio regular\nControl glucémico estricto\nInsu lina si es necesario',
                'prevention_measures': 'Mantener peso saludable\nEjercicio regular 150 min/semana\nDieta balanceada\nControl de factores de riesgo\nTamizaje en población de riesgo\nReducir bebidas azucaradas'
            },
            {
                'code': 'METAB02',
                'name': 'Hipotiroidismo',
                'description': 'Deficiencia de hormonas tiroideas',
                'category': 'METAB',
                'severity': 'moderada',
                'treatment_recommendations': 'Levotiroxina (T4) en ayunas\nControl de TSH cada 6-8 semanas inicialmente\nDosis ajustada según niveles hormonales\nTratamiento de por vida\nSuplementos de yodo si deficiencia',
                'prevention_measures': 'Consumo adecuado de yodo\nTamizaje en embarazo\nControl de autoinmunidad\nEvitar exceso de soya\nMonitoreo en población de riesgo'
            },
            
            # Enfermedades Infecciosas
            {
                'code': 'INFEC01',
                'name': 'Infección urinaria (cistitis)',
                'description': 'Infección bacteriana del tracto urinario inferior',
                'category': 'INFEC',
                'severity': 'leve',
                'treatment_recommendations': 'Antibióticos (nitrofurantoína, trimetoprim-sulfametoxazol)\nHidratación abundante\nAnalgésicos urinarios si dolor\nCultivo de orina previo\nSeguimiento en 2-3 días',
                'prevention_measures': 'Hidratación adecuada\nMicción frecuente\nHigiene genital adecuada\nOrinar después de relaciones sexuales\nEvitar duchas vaginales\nRopa interior de algodón'
            },
            {
                'code': 'INFEC02',
                'name': 'Faringitis bacteriana',
                'description': 'Infección de la faringe por Streptococcus pyogenes',
                'category': 'INFEC',
                'severity': 'leve',
                'treatment_recommendations': 'Penicilina V o amoxicilina 10 días\nAntipireticos\nAnalgésicos\nReposo\nHidratación\nGárgaras con agua salada tibia',
                'prevention_measures': 'Lavado de manos\nEvitar compartir utensilios\nAislamiento temporal del enfermo\nNo fumar\nBuena ventilación\nTratamiento completo de antibióticos'
            }
        ]
        
        for disease_data in diseases_data:
            disease = Disease.query.filter_by(code=disease_data['code']).first()
            if not disease:
                disease = Disease(**disease_data)
                db.session.add(disease)
                print(f"✅ {disease_data['code']}: {disease_data['name']}")
            else:
                print(f"ℹ️  {disease_data['code']} ya existe")
        
        db.session.commit()
        
        # ==================== SÍNTOMAS ====================
        print("\n📋 SÍNTOMAS")
        print("-" * 60)
        
        # Crear síntomas de ejemplo
        symptoms_data = [
            {'code': 'S001', 'name': 'Fiebre', 'description': 'Temperatura corporal elevada >38°C', 'category': 'General'},
            {'code': 'S002', 'name': 'Tos seca', 'description': 'Tos sin expectoración', 'category': 'Respiratorio'},
            {'code': 'S003', 'name': 'Tos productiva', 'description': 'Tos con expectoración', 'category': 'Respiratorio'},
            {'code': 'S004', 'name': 'Dolor de garganta', 'description': 'Odinofagia o dolor faríngeo', 'category': 'Respiratorio'},
            {'code': 'S005', 'name': 'Congestión nasal', 'description': 'Obstrucción de vías nasales', 'category': 'Respiratorio'},
            {'code': 'S006', 'name': 'Dolor de cabeza', 'description': 'Cefalea de diversa intensidad', 'category': 'Neurológico'},
            {'code': 'S007', 'name': 'Náuseas', 'description': 'Sensación de malestar gástrico', 'category': 'Gastrointestinal'},
            {'code': 'S008', 'name': 'Vómito', 'description': 'Expulsión forzada del contenido gástrico', 'category': 'Gastrointestinal'},
            {'code': 'S009', 'name': 'Diarrea', 'description': 'Deposiciones líquidas frecuentes', 'category': 'Gastrointestinal'},
            {'code': 'S010', 'name': 'Dolor abdominal', 'description': 'Dolor en región abdominal', 'category': 'Gastrointestinal'},
            {'code': 'S011', 'name': 'Fatiga', 'description': 'Sensación de cansancio extremo', 'category': 'General'},
            {'code': 'S012', 'name': 'Dolor muscular', 'description': 'Mialgias generalizadas', 'category': 'Musculoesquelético'},
            {'code': 'S013', 'name': 'Dolor articular', 'description': 'Artralgias en articulaciones', 'category': 'Musculoesquelético'},
            {'code': 'S014', 'name': 'Dificultad para respirar', 'description': 'Disnea o falta de aire', 'category': 'Respiratorio'},
            {'code': 'S015', 'name': 'Dolor torácico', 'description': 'Dolor en región pectoral', 'category': 'Cardiovascular'},
            {'code': 'S016', 'name': 'Mareo', 'description': 'Sensación de inestabilidad', 'category': 'Neurológico'},
            {'code': 'S017', 'name': 'Pérdida de apetito', 'description': 'Anorexia o falta de hambre', 'category': 'General'},
            {'code': 'S018', 'name': 'Escalofríos', 'description': 'Sensación de frío con temblores', 'category': 'General'},
            {'code': 'S019', 'name': 'Sudoración excesiva', 'description': 'Diaforesis o sudoración abundante', 'category': 'General'},
            {'code': 'S020', 'name': 'Dolor al orinar', 'description': 'Disuria o ardor miccional', 'category': 'Genitourinario'},
        ]
        
        for symptom_data in symptoms_data:
            symptom = Symptom.query.filter_by(code=symptom_data['code']).first()
            if not symptom:
                symptom = Symptom(**symptom_data)
                db.session.add(symptom)
                print(f"✅ {symptom_data['code']}: {symptom_data['name']}")
            else:
                print(f"ℹ️  {symptom_data['code']} ya existe")
        
        db.session.commit()
        
        # ==================== SIGNOS ====================
        print("\n📋 SIGNOS VITALES Y CLÍNICOS")
        print("-" * 60)
        
        # Crear signos de ejemplo
        signs_data = [
            {
                'code': 'SG001',
                'name': 'Temperatura corporal',
                'description': 'Medición de temperatura axilar o rectal',
                'category': 'Vital',
                'measurement_unit': '°C',
                'normal_range': '36.5-37.5'
            },
            {
                'code': 'SG002',
                'name': 'Presión arterial sistólica',
                'description': 'Presión máxima en arterias',
                'category': 'Vital',
                'measurement_unit': 'mmHg',
                'normal_range': '90-120'
            },
            {
                'code': 'SG003',
                'name': 'Presión arterial diastólica',
                'description': 'Presión mínima en arterias',
                'category': 'Vital',
                'measurement_unit': 'mmHg',
                'normal_range': '60-80'
            },
            {
                'code': 'SG004',
                'name': 'Frecuencia cardíaca',
                'description': 'Pulso cardíaco por minuto',
                'category': 'Vital',
                'measurement_unit': 'lpm',
                'normal_range': '60-100'
            },
            {
                'code': 'SG005',
                'name': 'Frecuencia respiratoria',
                'description': 'Respiraciones por minuto',
                'category': 'Vital',
                'measurement_unit': 'rpm',
                'normal_range': '12-20'
            },
            {
                'code': 'SG006',
                'name': 'Saturación de oxígeno',
                'description': 'SpO2 por pulsioximetría',
                'category': 'Vital',
                'measurement_unit': '%',
                'normal_range': '95-100'
            },
            {
                'code': 'SG007',
                'name': 'Peso corporal',
                'description': 'Peso del paciente',
                'category': 'Antropométrico',
                'measurement_unit': 'kg',
                'normal_range': 'Variable'
            },
            {
                'code': 'SG008',
                'name': 'Índice de masa corporal',
                'description': 'IMC = peso/talla²',
                'category': 'Antropométrico',
                'measurement_unit': 'kg/m²',
                'normal_range': '18.5-24.9'
            },
        ]
        
        for sign_data in signs_data:
            sign = Sign.query.filter_by(code=sign_data['code']).first()
            if not sign:
                sign = Sign(**sign_data)
                db.session.add(sign)
                print(f"✅ {sign_data['code']}: {sign_data['name']}")
            else:
                print(f"ℹ️  {sign_data['code']} ya existe")
        
        db.session.commit()
        
        # ==================== PRUEBAS DE LABORATORIO ====================
        print("\n📋 PRUEBAS DE LABORATORIO")
        print("-" * 60)
        
        # Crear pruebas de laboratorio
        lab_tests_data = [
            {
                'code': 'LAB001',
                'name': 'Hemograma completo',
                'description': 'Conteo de células sanguíneas completo',
                'category': 'Hematología',
                'normal_range': 'Variable según parámetro',
                'unit': 'Varios'
            },
            {
                'code': 'LAB002',
                'name': 'Glucosa en ayunas',
                'description': 'Medición de glucosa plasmática',
                'category': 'Bioquímica',
                'normal_range': '70-100',
                'unit': 'mg/dL'
            },
            {
                'code': 'LAB003',
                'name': 'Hemoglobina glucosilada (HbA1c)',
                'description': 'Control glucémico de últimos 3 meses',
                'category': 'Bioquímica',
                'normal_range': '<5.7',
                'unit': '%'
            },
            {
                'code': 'LAB004',
                'name': 'Creatinina sérica',
                'description': 'Evaluación de función renal',
                'category': 'Bioquímica',
                'normal_range': '0.6-1.2',
                'unit': 'mg/dL'
            },
            {
                'code': 'LAB005',
                'name': 'Urea',
                'description': 'Evaluación de función renal',
                'category': 'Bioquímica',
                'normal_range': '15-45',
                'unit': 'mg/dL'
            },
            {
                'code': 'LAB006',
                'name': 'Perfil lipídico',
                'description': 'Colesterol total, HDL, LDL, triglicéridos',
                'category': 'Bioquímica',
                'normal_range': 'Variable',
                'unit': 'mg/dL'
            },
            {
                'code': 'LAB007',
                'name': 'Examen general de orina',
                'description': 'Análisis físico, químico y microscópico de orina',
                'category': 'Urología',
                'normal_range': 'Variable',
                'unit': 'Varios'
            },
            {
                'code': 'LAB008',
                'name': 'Proteína C reactiva (PCR)',
                'description': 'Marcador de inflamación',
                'category': 'Inmunología',
                'normal_range': '<10',
                'unit': 'mg/L'
            },
            {
                'code': 'LAB009',
                'name': 'VSG (Velocidad de sedimentación)',
                'description': 'Marcador inespecífico de inflamación',
                'category': 'Hematología',
                'normal_range': '<20',
                'unit': 'mm/h'
            },
            {
                'code': 'LAB010',
                'name': 'Enzimas hepáticas (AST, ALT)',
                'description': 'Evaluación de función hepática',
                'category': 'Bioquímica',
                'normal_range': '<40',
                'unit': 'U/L'
            },
        ]
        
        for lab_test_data in lab_tests_data:
            lab_test = LabTest.query.filter_by(code=lab_test_data['code']).first()
            if not lab_test:
                lab_test = LabTest(**lab_test_data)
                db.session.add(lab_test)
                print(f"✅ {lab_test_data['code']}: {lab_test_data['name']}")
            else:
                print(f"ℹ️  {lab_test_data['code']} ya existe")
        
        db.session.commit()
        
        # ==================== PACIENTES ====================
        print("\n📋 PACIENTES")
        print("-" * 60)
        
        # Asegurarnos de que tenemos al menos un médico
        if doctors:
            first_doctor = doctors[0]
            
            patients_data = [
                {
                    'first_name': 'Juan',
                    'last_name': 'Pérez García',
                    'date_of_birth': date(1985, 3, 15),
                    'gender': 'M',
                    'blood_type': 'O+',
                    'email': 'juan.perez@email.com',
                    'phone': '555-2001',
                    'address': 'Calle Principal 123, Ciudad',
                    'allergies': 'Penicilina\nMariscos',
                    'chronic_conditions': 'Hipertensión arterial',
                    'doctor_id': first_doctor.id
                },
                {
                    'first_name': 'María',
                    'last_name': 'González López',
                    'date_of_birth': date(1990, 7, 22),
                    'gender': 'F',
                    'blood_type': 'A+',
                    'email': 'maria.gonzalez@email.com',
                    'phone': '555-2002',
                    'address': 'Av. Central 456, Ciudad',
                    'allergies': 'Polen\nÁcaros',
                    'chronic_conditions': 'Asma leve',
                    'doctor_id': first_doctor.id
                },
                {
                    'first_name': 'Carlos',
                    'last_name': 'Rodríguez Martínez',
                    'date_of_birth': date(1978, 11, 8),
                    'gender': 'M',
                    'blood_type': 'B+',
                    'email': 'carlos.rodriguez@email.com',
                    'phone': '555-2003',
                    'address': 'Plaza Mayor 789, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Diabetes tipo 2\nHipertensión',
                    'doctor_id': first_doctor.id
                },
                {
                    'first_name': 'Ana',
                    'last_name': 'Fernández Sánchez',
                    'date_of_birth': date(1995, 2, 14),
                    'gender': 'F',
                    'blood_type': 'AB+',
                    'email': 'ana.fernandez@email.com',
                    'phone': '555-2004',
                    'address': 'Calle Secundaria 321, Ciudad',
                    'allergies': 'Ibuprofeno',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': first_doctor.id
                },
                {
                    'first_name': 'Luis',
                    'last_name': 'Martínez Díaz',
                    'date_of_birth': date(1982, 9, 30),
                    'gender': 'M',
                    'blood_type': 'O-',
                    'email': 'luis.martinez@email.com',
                    'phone': '555-2005',
                    'address': 'Av. Libertad 654, Ciudad',
                    'allergies': 'Látex',
                    'chronic_conditions': 'Enfermedad pulmonar obstructiva crónica (EPOC)',
                    'doctor_id': first_doctor.id
                },
                {
                    'first_name': 'Elena',
                    'last_name': 'López Ruiz',
                    'date_of_birth': date(1988, 5, 18),
                    'gender': 'F',
                    'blood_type': 'A-',
                    'email': 'elena.lopez@email.com',
                    'phone': '555-2006',
                    'address': 'Calle Nueva 987, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Hipotiroidismo',
                    'doctor_id': first_doctor.id
                },
                {
                    'first_name': 'Pedro',
                    'last_name': 'Sánchez Torres',
                    'date_of_birth': date(1975, 12, 25),
                    'gender': 'M',
                    'blood_type': 'B-',
                    'email': 'pedro.sanchez@email.com',
                    'phone': '555-2007',
                    'address': 'Plaza Vieja 147, Ciudad',
                    'allergies': 'Aspirina\nAINEs',
                    'chronic_conditions': 'Insuficiencia cardíaca\nFibrilación auricular',
                    'doctor_id': first_doctor.id
                },
                {
                    'first_name': 'Carmen',
                    'last_name': 'Ramírez Castro',
                    'date_of_birth': date(1992, 8, 7),
                    'gender': 'F',
                    'blood_type': 'O+',
                    'email': 'carmen.ramirez@email.com',
                    'phone': '555-2008',
                    'address': 'Av. Esperanza 258, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': first_doctor.id
                },
                {
                    'first_name': 'Roberto',
                    'last_name': 'Hernández Gómez',
                    'date_of_birth': date(1980, 4, 12),
                    'gender': 'M',
                    'blood_type': 'A+',
                    'email': 'roberto.hernandez@email.com',
                    'phone': '555-2009',
                    'address': 'Calle del Sol 369, Ciudad',
                    'allergies': 'Sulfas',
                    'chronic_conditions': 'Artritis reumatoide',
                    'doctor_id': first_doctor.id
                },
                {
                    'first_name': 'Isabel',
                    'last_name': 'Torres Morales',
                    'date_of_birth': date(1987, 10, 3),
                    'gender': 'F',
                    'blood_type': 'AB-',
                    'email': 'isabel.torres@email.com',
                    'phone': '555-2010',
                    'address': 'Av. Luna 741, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Migraña crónica',
                    'doctor_id': first_doctor.id
                }
            ]
            
            for patient_data in patients_data:
                patient = Patient.query.filter_by(
                    first_name=patient_data['first_name'],
                    last_name=patient_data['last_name']
                ).first()
                if not patient:
                    patient = Patient(**patient_data)
                    db.session.add(patient)
                    print(f"✅ Paciente: {patient_data['first_name']} {patient_data['last_name']}")
                else:
                    print(f"ℹ️  Paciente {patient_data['first_name']} {patient_data['last_name']} ya existe")
            
            db.session.commit()
        else:
            print("⚠️  No hay médicos disponibles para asignar pacientes")
        
        # Guardar todos los cambios
        db.session.commit()
        
        print("\n" + "="*60)
        print("    ✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE")
        print("="*60 + "\n")
        
        print("📝 CREDENCIALES DE ACCESO:")
        print("-" * 60)
        print("   👤 Admin: username='admin', password='admin123'")
        print("\n   👨‍⚕️ Médicos (todos con password='doctor123'):")
        for doctor_data in doctors_data:
            print(f"      - {doctor_data['username']}")
        
        print("\n📊 RESUMEN:")
        print("-" * 60)
        print(f"   • {len(doctors_data) + 1} Usuarios (1 admin + {len(doctors_data)} médicos)")
        print(f"   • {len(diseases_data)} Enfermedades")
        print(f"   • {len(symptoms_data)} Síntomas")
        print(f"   • {len(signs_data)} Signos vitales")
        print(f"   • {len(lab_tests_data)} Pruebas de laboratorio")
        print(f"   • {len(patients_data)} Pacientes")
        print("\n" + "="*60 + "\n")

if __name__ == '__main__':
    create_test_data()
