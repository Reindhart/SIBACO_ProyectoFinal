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
                second_name='del',
                paternal_surname='Sistema',
                maternal_surname='Médico',
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
                'first_name': 'María',
                'second_name': 'Elena',
                'paternal_surname': 'García',
                'maternal_surname': 'López',
                'phone': '555-1001',
                'password': 'doctor123'
            },
            {
                'username': 'dr.martinez',
                'email': 'carlos.martinez@medicalsystem.com',
                'first_name': 'Carlos',
                'second_name': 'Alberto',
                'paternal_surname': 'Martínez',
                'maternal_surname': 'Ruiz',
                'phone': '555-1002',
                'password': 'doctor123'
            },
            {
                'username': 'dra.rodriguez',
                'email': 'ana.rodriguez@medicalsystem.com',
                'first_name': 'Ana',
                'second_name': 'Isabel',
                'paternal_surname': 'Rodríguez',
                'maternal_surname': 'Sánchez',
                'phone': '555-1003',
                'password': 'doctor123'
            },
            {
                'username': 'dr.lopez',
                'email': 'jose.lopez@medicalsystem.com',
                'first_name': 'José',
                'second_name': 'Luis',
                'paternal_surname': 'López',
                'maternal_surname': 'Hernández',
                'phone': '555-1004',
                'password': 'doctor123'
            },
            {
                'username': 'dra.fernandez',
                'email': 'laura.fernandez@medicalsystem.com',
                'first_name': 'Laura',
                'second_name': 'Patricia',
                'paternal_surname': 'Fernández',
                'maternal_surname': 'González',
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
            },
            
            # Enfermedades Neurológicas
            {
                'code': 'NEURO01',
                'name': 'Migraña',
                'description': 'Cefalea recurrente de tipo pulsátil, usualmente unilateral',
                'category': 'NEURO',
                'severity': 'moderada',
                'treatment_recommendations': 'Analgésicos (paracetamol, ibuprofeno)\nTriptanos para crisis agudas\nReposo en ambiente oscuro y silencioso\nProfilaxis si crisis frecuentes\nEvitar desencadenantes',
                'prevention_measures': 'Evitar alimentos desencadenantes (chocolate, cafeína, quesos curados)\nDormir horario regular\nManejo de estrés\nHidratación adecuada\nEvitar ayunos prolongados'
            },
            {
                'code': 'NEURO02',
                'name': 'Epilepsia',
                'description': 'Trastorno neurológico caracterizado por convulsiones recurrentes',
                'category': 'NEURO',
                'severity': 'grave',
                'treatment_recommendations': 'Anticonvulsivantes (ácido valproico, levetiracetam)\nMonitoreo de niveles séricos\nEvitar desencadenantes\nEducación al paciente y familia\nBrazalete de identificación',
                'prevention_measures': 'Adherencia estricta a medicación\nEvitar privación de sueño\nNo suspender medicación abruptamente\nEvitar alcohol\nReducir estrés\nConsultar ante cambios'
            },
            {
                'code': 'NEURO03',
                'name': 'Enfermedad de Parkinson',
                'description': 'Trastorno neurodegenerativo que afecta el movimiento',
                'category': 'NEURO',
                'severity': 'grave',
                'treatment_recommendations': 'Levodopa/carbidopa\nAgonistas dopaminérgicos\nFisioterapia y rehabilitación\nTerapia ocupacional\nSoporte psicológico\nAjuste medicación según respuesta',
                'prevention_measures': 'Ejercicio regular\nDieta balanceada\nManejo de estrés\nEstimulación mental\nSeguridad en el hogar\nApoyo familiar'
            },
            
            # Enfermedades Dermatológicas
            {
                'code': 'DERM01',
                'name': 'Dermatitis atópica',
                'description': 'Inflamación crónica de la piel con prurito intenso',
                'category': 'DERM',
                'severity': 'leve',
                'treatment_recommendations': 'Emolientes abundantes\nCorticoides tópicos en brotes\nAntihistamínicos para prurito\nEvitar irritantes\nBaños cortos con agua tibia',
                'prevention_measures': 'Hidratación diaria de la piel\nEvitar jabones fuertes\nRopa de algodón\nEvitar alérgenos conocidos\nMantener uñas cortas\nReducir estrés'
            },
            {
                'code': 'DERM02',
                'name': 'Psoriasis',
                'description': 'Enfermedad inflamatoria crónica con placas eritematosas descamativas',
                'category': 'DERM',
                'severity': 'moderada',
                'treatment_recommendations': 'Corticoides tópicos\nVitamina D tópica\nFototerapia UVB\nInmunomoduladores en casos severos\nHidratación abundante',
                'prevention_measures': 'Evitar traumatismos en piel\nReducir estrés\nEvitar alcohol y tabaco\nHidratación constante\nExposición solar moderada\nTratamiento de infecciones'
            },
            {
                'code': 'DERM03',
                'name': 'Infección micótica (tiña)',
                'description': 'Infección fúngica de la piel causada por dermatofitos',
                'category': 'DERM',
                'severity': 'leve',
                'treatment_recommendations': 'Antifúngicos tópicos (clotrimazol, terbinafina)\nMantener área seca\nContinuar tratamiento 2 semanas después de curación\nAntifúngicos orales si es extensa',
                'prevention_measures': 'Mantener piel seca\nEvitar compartir toallas\nCalzado ventilado\nCambiar ropa húmeda rápidamente\nHigiene adecuada\nEvitar contacto con animales infectados'
            },
            
            # Enfermedades Musculoesqueléticas
            {
                'code': 'MUSCU01',
                'name': 'Osteoartritis',
                'description': 'Degeneración del cartílago articular con dolor y rigidez',
                'category': 'MUSCU',
                'severity': 'moderada',
                'treatment_recommendations': 'Analgésicos (paracetamol, AINEs)\nFisioterapia\nEjercicio de bajo impacto\nPérdida de peso si sobrepeso\nCalor local\nInyecciones intraarticulares en casos seleccionados',
                'prevention_measures': 'Mantener peso saludable\nEjercicio regular\nEvitar sobrecarga articular\nPostura adecuada\nFortalecimiento muscular\nCalzado apropiado'
            },
            {
                'code': 'MUSCU02',
                'name': 'Artritis reumatoide',
                'description': 'Enfermedad autoinmune que causa inflamación articular crónica',
                'category': 'MUSCU',
                'severity': 'grave',
                'treatment_recommendations': 'Metotrexato u otros DMARDs\nAINEs para dolor\nCorticoides en brotes\nFisioterapia\nTerapia biológica si refractaria\nMonitoreo de laboratorio',
                'prevention_measures': 'Adherencia al tratamiento\nEjercicio regular adaptado\nProtección articular\nDieta antiinflamatoria\nNo fumar\nManejo de estrés'
            },
            
            # Enfermedades Endocrinas
            {
                'code': 'ENDOC01',
                'name': 'Hipertiroidismo',
                'description': 'Exceso de hormonas tiroideas causando metabolismo acelerado',
                'category': 'ENDOC',
                'severity': 'moderada',
                'treatment_recommendations': 'Antitiroideos (metimazol)\nBetabloqueadores para síntomas\nYodo radiactivo o cirugía en casos seleccionados\nMonitoreo de función tiroidea\nTratamiento de síntomas oculares',
                'prevention_measures': 'Evitar exceso de yodo\nManejo de estrés\nControl regular con endocrinólogo\nMonitoreo de síntomas\nNo automedicarse con yodo'
            },
            {
                'code': 'ENDOC02',
                'name': 'Síndrome de ovario poliquístico',
                'description': 'Trastorno hormonal con irregularidades menstruales y quistes ováricos',
                'category': 'ENDOC',
                'severity': 'moderada',
                'treatment_recommendations': 'Anticonceptivos orales para regular ciclo\nMetformina si resistencia insulínica\nPérdida de peso\nManejo de hirsutismo\nInducción de ovulación si desea embarazo',
                'prevention_measures': 'Mantener peso saludable\nEjercicio regular\nDieta balanceada baja en azúcares simples\nControl de estrés\nMonitoreo ginecológico regular'
            },
            
            # Enfermedades Inmunológicas
            {
                'code': 'INMUN01',
                'name': 'Lupus eritematoso sistémico',
                'description': 'Enfermedad autoinmune que afecta múltiples órganos',
                'category': 'INMUN',
                'severity': 'grave',
                'treatment_recommendations': 'Corticoides\nInmunosupresores (azatioprina, micofenolato)\nAntimaláricos (hidroxicloroquina)\nTratamiento de órganos afectados\nMonitoreo estrecho\nProtección solar',
                'prevention_measures': 'Evitar exposición solar\nUso de protector solar\nNo suspender tratamiento\nVacunación apropiada\nEvitar infecciones\nRevisiones regulares'
            },
            {
                'code': 'INMUN02',
                'name': 'Enfermedad de Crohn',
                'description': 'Enfermedad inflamatoria intestinal crónica',
                'category': 'INMUN',
                'severity': 'grave',
                'treatment_recommendations': 'Corticoides en brotes agudos\nInmunomoduladores (azatioprina)\nBiológicos (infliximab, adalimumab)\nSoporte nutricional\nCirugía en complicaciones\nManejo multidisciplinario',
                'prevention_measures': 'Adherencia al tratamiento\nEvitar AINEs\nNo fumar\nManejo de estrés\nDieta individualizada\nMonitoreo de complicaciones'
            },
            
            # Enfermedades Renales
            {
                'code': 'RENAL01',
                'name': 'Insuficiencia renal crónica',
                'description': 'Pérdida progresiva de la función renal',
                'category': 'RENAL',
                'severity': 'grave',
                'treatment_recommendations': 'Control de hipertensión y diabetes\nDieta baja en proteínas y potasio\nTratamiento de anemia\nControl de fósforo y calcio\nDiálisis en estadios avanzados\nPreparación para trasplante',
                'prevention_measures': 'Control de diabetes e hipertensión\nEvitar nefrotóxicos\nHidratación adecuada\nNo automedicarse\nControl regular de función renal\nVacunación'
            },
            {
                'code': 'RENAL02',
                'name': 'Litiasis renal (cálculos)',
                'description': 'Formación de piedras en el tracto urinario',
                'category': 'RENAL',
                'severity': 'moderada',
                'treatment_recommendations': 'Analgésicos potentes (AINEs, opioides)\nHidratación abundante\nAntiespasmódicos\nLitotripsia o cirugía si necesario\nTratamiento según composición del cálculo',
                'prevention_measures': 'Ingesta abundante de líquidos (>2L/día)\nReducir sal\nModerar proteína animal\nCitrato de potasio si cálculos recurrentes\nEvitar exceso de oxalatos\nMantener peso saludable'
            },
            
            # Enfermedades Hematológicas
            {
                'code': 'HEMAT01',
                'name': 'Anemia ferropénica',
                'description': 'Anemia por deficiencia de hierro',
                'category': 'HEMAT',
                'severity': 'leve',
                'treatment_recommendations': 'Suplementos de hierro oral\nInvestigar y tratar causa\nDieta rica en hierro\nVitamina C para mejorar absorción\nHierro IV si intolerancia oral\nMonitoreo de hemoglobina',
                'prevention_measures': 'Dieta rica en hierro (carnes rojas, legumbres, vegetales verdes)\nSuplementación en embarazo\nTratamiento de sangrados\nAbsorción adecuada de hierro\nVitamina C en comidas'
            },
            {
                'code': 'HEMAT02',
                'name': 'Trombocitopenia inmune',
                'description': 'Disminución de plaquetas por destrucción autoinmune',
                'category': 'HEMAT',
                'severity': 'moderada',
                'treatment_recommendations': 'Corticoides\nInmunoglobulina IV en sangrado activo\nAgonistas de receptores de trombopoyetina\nEsplenectomía en casos refractarios\nEvitar anticoagulantes\nPrecauciones ante traumas',
                'prevention_measures': 'Evitar traumatismos\nNo tomar AINEs o aspirina\nMonitoreo de conteo plaquetario\nAtención médica ante sangrados\nVacunación antes de esplenectomía'
            },
            
            # Enfermedades Oncológicas
            {
                'code': 'ONCOL01',
                'name': 'Cáncer de pulmón',
                'description': 'Neoplasia maligna del tejido pulmonar',
                'category': 'ONCOL',
                'severity': 'grave',
                'treatment_recommendations': 'Cirugía en estadios tempranos\nQuimioterapia\nRadioterapia\nInmunoterapia\nTerapias dirigidas según mutaciones\nCuidados paliativos\nManejo multidisciplinario',
                'prevention_measures': 'No fumar\nEvitar tabaquismo pasivo\nEvitar exposición a carcinógenos\nDetección temprana en grupos de riesgo\nRadón doméstico\nAsbesto'
            },
            {
                'code': 'ONCOL02',
                'name': 'Cáncer de mama',
                'description': 'Neoplasia maligna del tejido mamario',
                'category': 'ONCOL',
                'severity': 'grave',
                'treatment_recommendations': 'Cirugía (lumpectomía o mastectomía)\nQuimioterapia\nRadioterapia\nHormonoterapia si receptores positivos\nTerapia dirigida (trastuzumab si HER2+)\nReconstrucción mamaria',
                'prevention_measures': 'Autoexploración mensual\nMamografía según edad y riesgo\nMantener peso saludable\nLimitar alcohol\nEjercicio regular\nConsejería genética si antecedentes familiares'
            },
            
            # Enfermedades Psiquiátricas
            {
                'code': 'PSIQ01',
                'name': 'Trastorno depresivo mayor',
                'description': 'Trastorno del estado de ánimo con tristeza persistente',
                'category': 'PSIQ',
                'severity': 'moderada',
                'treatment_recommendations': 'Antidepresivos (ISRS, IRSN)\nPsicoterapia (cognitivo-conductual)\nCombinación farmacoterapia y psicoterapia\nActividad física\nHigiene del sueño\nHospitalización si riesgo suicida',
                'prevention_measures': 'Manejo de estrés\nApoyo social\nEjercicio regular\nSueño adecuado\nEvitar alcohol y drogas\nDetección temprana\nAdherencia al tratamiento'
            },
            
            # Enfermedades Oftalmológicas
            {
                'code': 'OFTAL01',
                'name': 'Glaucoma',
                'description': 'Aumento de presión intraocular que daña el nervio óptico',
                'category': 'OFTAL',
                'severity': 'grave',
                'treatment_recommendations': 'Gotas hipotensoras oculares\nLáser trabeculoplastia\nCirugía si refractario\nMonitoreo regular de presión\nCampo visual periódico\nAdherencia estricta al tratamiento',
                'prevention_measures': 'Exámenes oftalmológicos regulares después de 40 años\nControl de presión arterial\nProtección ocular\nNo automedicarse corticoides\nDetección familiar si antecedentes'
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
            {
                'code': 'SG009',
                'name': 'Talla',
                'description': 'Estatura del paciente',
                'category': 'Antropométrico',
                'measurement_unit': 'cm',
                'normal_range': 'Variable'
            },
            {
                'code': 'SG010',
                'name': 'Perímetro abdominal',
                'description': 'Circunferencia de cintura',
                'category': 'Antropométrico',
                'measurement_unit': 'cm',
                'normal_range': 'H:<94, M:<80'
            },
            {
                'code': 'SG011',
                'name': 'Glucosa capilar',
                'description': 'Glucosa en sangre por punción digital',
                'category': 'Metabólico',
                'measurement_unit': 'mg/dL',
                'normal_range': '70-100 (ayunas)'
            },
            {
                'code': 'SG012',
                'name': 'Reflejos osteotendinosos',
                'description': 'Valoración de reflejos tendinosos',
                'category': 'Neurológico',
                'measurement_unit': 'Escala 0-4',
                'normal_range': '2+ (normal)'
            },
            {
                'code': 'SG013',
                'name': 'Nivel de conciencia',
                'description': 'Estado de alerta del paciente',
                'category': 'Neurológico',
                'measurement_unit': 'Escala Glasgow',
                'normal_range': '15 (alerta)'
            },
            {
                'code': 'SG014',
                'name': 'Tamaño pupilar',
                'description': 'Diámetro de las pupilas',
                'category': 'Neurológico',
                'measurement_unit': 'mm',
                'normal_range': '2-4 (luz), 4-8 (oscuridad)'
            },
            {
                'code': 'SG015',
                'name': 'Reflejo pupilar',
                'description': 'Respuesta pupilar a la luz',
                'category': 'Neurológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Reactivo bilateral'
            },
            {
                'code': 'SG016',
                'name': 'Fuerza muscular',
                'description': 'Evaluación de fuerza en extremidades',
                'category': 'Musculoesquelético',
                'measurement_unit': 'Escala 0-5',
                'normal_range': '5/5 (normal)'
            },
            {
                'code': 'SG017',
                'name': 'Edema',
                'description': 'Presencia de acumulación de líquido',
                'category': 'General',
                'measurement_unit': 'Escala 0-4+',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG018',
                'name': 'Coloración de piel',
                'description': 'Aspecto y color de tegumentos',
                'category': 'Dermatológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Rosado, bien perfundido'
            },
            {
                'code': 'SG019',
                'name': 'Llenado capilar',
                'description': 'Tiempo de retorno del color tras presión',
                'category': 'Cardiovascular',
                'measurement_unit': 'segundos',
                'normal_range': '<2'
            },
            {
                'code': 'SG020',
                'name': 'Ruidos respiratorios',
                'description': 'Auscultación pulmonar',
                'category': 'Respiratorio',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Vesicular, sin agregados'
            },
            # Signos adicionales para enfermedades específicas
            {
                'code': 'SG021',
                'name': 'Ruidos cardíacos',
                'description': 'Auscultación cardíaca',
                'category': 'Cardiovascular',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Rítmicos, sin soplos'
            },
            {
                'code': 'SG022',
                'name': 'Ruidos intestinales',
                'description': 'Auscultación abdominal',
                'category': 'Gastrointestinal',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Presentes, normales'
            },
            {
                'code': 'SG023',
                'name': 'Dolor a la palpación abdominal',
                'description': 'Sensibilidad abdominal',
                'category': 'Gastrointestinal',
                'measurement_unit': 'Escala 0-10',
                'normal_range': '0 (ausente)'
            },
            {
                'code': 'SG024',
                'name': 'Distensión abdominal',
                'description': 'Aumento del perímetro abdominal',
                'category': 'Gastrointestinal',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG025',
                'name': 'Rigidez abdominal',
                'description': 'Contractura muscular abdominal',
                'category': 'Gastrointestinal',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG026',
                'name': 'Signo de rebote',
                'description': 'Dolor al retirar presión abdominal',
                'category': 'Gastrointestinal',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Negativo'
            },
            {
                'code': 'SG027',
                'name': 'Signo de Murphy',
                'description': 'Dolor en hipocondrio derecho con inspiración',
                'category': 'Gastrointestinal',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Negativo'
            },
            {
                'code': 'SG028',
                'name': 'Ictericia',
                'description': 'Coloración amarillenta de piel y mucosas',
                'category': 'Dermatológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG029',
                'name': 'Cianosis',
                'description': 'Coloración azulada de piel y mucosas',
                'category': 'Respiratorio',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG030',
                'name': 'Tiraje intercostal',
                'description': 'Retracción de espacios intercostales',
                'category': 'Respiratorio',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG031',
                'name': 'Sibilancias',
                'description': 'Ruidos respiratorios agudos',
                'category': 'Respiratorio',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausentes'
            },
            {
                'code': 'SG032',
                'name': 'Estertores crepitantes',
                'description': 'Ruidos tipo crepitación en pulmones',
                'category': 'Respiratorio',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausentes'
            },
            {
                'code': 'SG033',
                'name': 'Matidez a la percusión pulmonar',
                'description': 'Sonido apagado al percutir tórax',
                'category': 'Respiratorio',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Resonante'
            },
            {
                'code': 'SG034',
                'name': 'Ingurgitación yugular',
                'description': 'Distensión de venas del cuello',
                'category': 'Cardiovascular',
                'measurement_unit': 'cm H2O',
                'normal_range': '<3'
            },
            {
                'code': 'SG035',
                'name': 'Hepatomegalia',
                'description': 'Aumento del tamaño hepático',
                'category': 'Gastrointestinal',
                'measurement_unit': 'cm bajo reborde costal',
                'normal_range': '<2'
            },
            {
                'code': 'SG036',
                'name': 'Esplenomegalia',
                'description': 'Aumento del tamaño esplénico',
                'category': 'Gastrointestinal',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'No palpable'
            },
            {
                'code': 'SG037',
                'name': 'Lesiones cutáneas',
                'description': 'Alteraciones visibles en la piel',
                'category': 'Dermatológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausentes'
            },
            {
                'code': 'SG038',
                'name': 'Descamación cutánea',
                'description': 'Pérdida de capas superficiales de piel',
                'category': 'Dermatológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG039',
                'name': 'Eritema cutáneo',
                'description': 'Enrojecimiento de la piel',
                'category': 'Dermatológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG040',
                'name': 'Rigidez articular',
                'description': 'Limitación del movimiento articular',
                'category': 'Musculoesquelético',
                'measurement_unit': 'Grados',
                'normal_range': 'Rango completo'
            },
            {
                'code': 'SG041',
                'name': 'Inflamación articular',
                'description': 'Aumento de volumen en articulaciones',
                'category': 'Musculoesquelético',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG042',
                'name': 'Crepitación articular',
                'description': 'Ruido o sensación al mover articulación',
                'category': 'Musculoesquelético',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG043',
                'name': 'Temblor',
                'description': 'Movimiento involuntario rítmico',
                'category': 'Neurológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG044',
                'name': 'Rigidez muscular',
                'description': 'Aumento del tono muscular',
                'category': 'Neurológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG045',
                'name': 'Bradicinesia',
                'description': 'Lentitud en los movimientos',
                'category': 'Neurológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG046',
                'name': 'Deshidratación de piel',
                'description': 'Pérdida de humedad cutánea',
                'category': 'Dermatológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Hidratada'
            },
            {
                'code': 'SG047',
                'name': 'Hiperemia conjuntival',
                'description': 'Enrojecimiento de ojos',
                'category': 'General',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG048',
                'name': 'Adenopatías',
                'description': 'Ganglios linfáticos palpables',
                'category': 'General',
                'measurement_unit': 'cm',
                'normal_range': '<1'
            },
            {
                'code': 'SG049',
                'name': 'Exudado faríngeo',
                'description': 'Secreción en garganta',
                'category': 'Respiratorio',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Ausente'
            },
            {
                'code': 'SG050',
                'name': 'Signo de Babinski',
                'description': 'Respuesta plantar anormal',
                'category': 'Neurológico',
                'measurement_unit': 'Cualitativo',
                'normal_range': 'Negativo'
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
        
        # ==================== ASOCIACIONES ENFERMEDAD-SÍNTOMAS ====================
        print("\n📋 ASOCIACIONES ENFERMEDAD-SÍNTOMAS")
        print("-" * 60)
        
        # Obtener enfermedades y síntomas
        resp01 = Disease.query.filter_by(code='RESP01').first()
        resp02 = Disease.query.filter_by(code='RESP02').first()
        resp03 = Disease.query.filter_by(code='RESP03').first()
        resp04 = Disease.query.filter_by(code='RESP04').first()
        gastr01 = Disease.query.filter_by(code='GASTR01').first()
        gastr02 = Disease.query.filter_by(code='GASTR02').first()
        gastr03 = Disease.query.filter_by(code='GASTR03').first()
        card01 = Disease.query.filter_by(code='CARD01').first()
        card02 = Disease.query.filter_by(code='CARD02').first()
        metab01 = Disease.query.filter_by(code='METAB01').first()
        metab02 = Disease.query.filter_by(code='METAB02').first()
        infec01 = Disease.query.filter_by(code='INFEC01').first()
        infec02 = Disease.query.filter_by(code='INFEC02').first()
        
        # Síntomas
        s001 = Symptom.query.filter_by(code='S001').first()  # Fiebre
        s002 = Symptom.query.filter_by(code='S002').first()  # Tos seca
        s003 = Symptom.query.filter_by(code='S003').first()  # Tos productiva
        s004 = Symptom.query.filter_by(code='S004').first()  # Dolor de garganta
        s005 = Symptom.query.filter_by(code='S005').first()  # Congestión nasal
        s006 = Symptom.query.filter_by(code='S006').first()  # Dolor de cabeza
        s007 = Symptom.query.filter_by(code='S007').first()  # Náuseas
        s008 = Symptom.query.filter_by(code='S008').first()  # Vómito
        s009 = Symptom.query.filter_by(code='S009').first()  # Diarrea
        s010 = Symptom.query.filter_by(code='S010').first()  # Dolor abdominal
        s011 = Symptom.query.filter_by(code='S011').first()  # Fatiga
        s012 = Symptom.query.filter_by(code='S012').first()  # Dolor muscular
        s013 = Symptom.query.filter_by(code='S013').first()  # Dolor articular
        s014 = Symptom.query.filter_by(code='S014').first()  # Dificultad para respirar
        s015 = Symptom.query.filter_by(code='S015').first()  # Dolor torácico
        s016 = Symptom.query.filter_by(code='S016').first()  # Mareo
        s017 = Symptom.query.filter_by(code='S017').first()  # Pérdida de apetito
        s018 = Symptom.query.filter_by(code='S018').first()  # Escalofríos
        s020 = Symptom.query.filter_by(code='S020').first()  # Dolor al orinar
        
        # Asociar síntomas a enfermedades (solo si no existen)
        def add_symptoms_if_not_exist(disease, symptoms_list, disease_name):
            added = 0
            for symptom in symptoms_list:
                if symptom and symptom not in disease.symptoms:
                    disease.symptoms.append(symptom)
                    added += 1
            if added > 0:
                print(f"✅ {disease_name} asociado con {added} síntomas nuevos")
            else:
                print(f"ℹ️  {disease_name} ya tiene todos los síntomas")
        
        if resp01:  # Resfriado común
            add_symptoms_if_not_exist(resp01, [s005, s002, s004, s006, s011, s001], "RESP01")
        
        if resp02:  # Gripe
            add_symptoms_if_not_exist(resp02, [s001, s002, s006, s012, s013, s018, s011], "RESP02")
        
        if resp03:  # Neumonía
            add_symptoms_if_not_exist(resp03, [s001, s003, s014, s015, s011, s018], "RESP03")
        
        if resp04:  # Bronquitis
            add_symptoms_if_not_exist(resp04, [s003, s014, s015, s011, s001], "RESP04")
        
        if gastr01:  # Gastroenteritis
            add_symptoms_if_not_exist(gastr01, [s007, s008, s009, s010, s001, s011], "GASTR01")
        
        if gastr02:  # Gastritis
            add_symptoms_if_not_exist(gastr02, [s010, s007, s017, s006], "GASTR02")
        
        if gastr03:  # Apendicitis
            add_symptoms_if_not_exist(gastr03, [s010, s007, s008, s001, s017], "GASTR03")
        
        if card01:  # Hipertensión
            add_symptoms_if_not_exist(card01, [s006, s016, s015], "CARD01")
        
        if card02:  # Insuficiencia cardíaca
            add_symptoms_if_not_exist(card02, [s014, s011, s016, s015], "CARD02")
        
        if metab01:  # Diabetes
            add_symptoms_if_not_exist(metab01, [s011, s016, s017], "METAB01")
        
        if metab02:  # Hipotiroidismo
            add_symptoms_if_not_exist(metab02, [s011, s017], "METAB02")
        
        if infec01:  # ITU
            add_symptoms_if_not_exist(infec01, [s020, s010, s001], "INFEC01")
        
        if infec02:  # Faringitis
            add_symptoms_if_not_exist(infec02, [s004, s001, s006, s011], "INFEC02")
        
        db.session.commit()
        
        # ==================== ASOCIACIONES ENFERMEDAD-SIGNOS ====================
        print("\n📋 ASOCIACIONES ENFERMEDAD-SIGNOS")
        print("-" * 60)
        
        # Signos
        sg001 = Sign.query.filter_by(code='SG001').first()  # Temperatura
        sg002 = Sign.query.filter_by(code='SG002').first()  # PA sistólica
        sg003 = Sign.query.filter_by(code='SG003').first()  # PA diastólica
        sg004 = Sign.query.filter_by(code='SG004').first()  # FC
        sg005 = Sign.query.filter_by(code='SG005').first()  # FR
        sg006 = Sign.query.filter_by(code='SG006').first()  # SpO2
        
        # Asociar signos a enfermedades (solo si no existen)
        def add_signs_if_not_exist(disease, signs_list, disease_name):
            added = 0
            for sign in signs_list:
                if sign and sign not in disease.signs:
                    disease.signs.append(sign)
                    added += 1
            if added > 0:
                print(f"✅ {disease_name} asociado con {added} signos nuevos")
            else:
                print(f"ℹ️  {disease_name} ya tiene todos los signos")
        
        if resp01:  # Resfriado
            add_signs_if_not_exist(resp01, [sg001, sg005], "RESP01")
        
        if resp02:  # Gripe
            add_signs_if_not_exist(resp02, [sg001, sg004, sg005], "RESP02")
        
        if resp03:  # Neumonía
            add_signs_if_not_exist(resp03, [sg001, sg004, sg005, sg006], "RESP03")
        
        if resp04:  # Bronquitis
            add_signs_if_not_exist(resp04, [sg001, sg005, sg006], "RESP04")
        
        if gastr01:  # Gastroenteritis
            add_signs_if_not_exist(gastr01, [sg001, sg004], "GASTR01")
        
        if gastr02:  # Gastritis
            add_signs_if_not_exist(gastr02, [sg004], "GASTR02")
        
        if gastr03:  # Apendicitis
            add_signs_if_not_exist(gastr03, [sg001, sg004], "GASTR03")
        
        if card01:  # Hipertensión
            add_signs_if_not_exist(card01, [sg002, sg003], "CARD01")
        
        if card02:  # Insuficiencia cardíaca
            add_signs_if_not_exist(card02, [sg002, sg003, sg004, sg005, sg006], "CARD02")
        
        if metab01:  # Diabetes
            add_signs_if_not_exist(metab01, [sg002, sg003], "METAB01")
        
        if infec01:  # ITU
            add_signs_if_not_exist(infec01, [sg001], "INFEC01")
        
        if infec02:  # Faringitis
            add_signs_if_not_exist(infec02, [sg001, sg004], "INFEC02")
        
        db.session.commit()
        
        # ==================== PACIENTES ====================
        print("\n📋 PACIENTES")
        print("-" * 60)
        
        # Asegurarnos de que tenemos al menos un médico
        if doctors:
            import random
            
            patients_data = [
                # Grupo 1: Varios con nombre "Juan" o apellido "García"
                {
                    'first_name': 'Juan',
                    'second_name': 'Carlos',
                    'paternal_surname': 'Pérez',
                    'maternal_surname': 'García',
                    'date_of_birth': date(1985, 3, 15),
                    'gender': 'M',
                    'blood_type_abo': 0,  # O
                    'blood_type_rh': 1,   # Positivo
                    'email': 'juan.perez@email.com',
                    'phone': '555-2001',
                    'address': 'Calle Principal 123, Ciudad',
                    'allergies': 'Penicilina\nMariscos',
                    'chronic_conditions': 'Hipertensión arterial',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'María',
                    'second_name': 'Elena',
                    'paternal_surname': 'González',
                    'maternal_surname': 'López',
                    'date_of_birth': date(1990, 7, 22),
                    'gender': 'F',
                    'blood_type_abo': 1,  # A
                    'blood_type_rh': 1,   # Positivo
                    'email': 'maria.gonzalez@email.com',
                    'phone': '555-2002',
                    'address': 'Av. Central 456, Ciudad',
                    'allergies': 'Polen\nÁcaros',
                    'chronic_conditions': 'Asma leve',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Carlos',
                    'second_name': 'Alberto',
                    'paternal_surname': 'Rodríguez',
                    'maternal_surname': 'Martínez',
                    'date_of_birth': date(1978, 11, 8),
                    'gender': 'M',
                    'blood_type_abo': 2,  # B
                    'blood_type_rh': 1,   # Positivo
                    'email': 'carlos.rodriguez@email.com',
                    'phone': '555-2003',
                    'address': 'Plaza Mayor 789, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Diabetes tipo 2\nHipertensión',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Ana',
                    'second_name': 'María',
                    'paternal_surname': 'Fernández',
                    'maternal_surname': 'Sánchez',
                    'date_of_birth': date(1995, 2, 14),
                    'gender': 'F',
                    'blood_type_abo': 3,  # AB
                    'blood_type_rh': 1,   # Positivo
                    'email': 'ana.fernandez@email.com',
                    'phone': '555-2004',
                    'address': 'Calle Secundaria 321, Ciudad',
                    'allergies': 'Ibuprofeno',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Luis',
                    'second_name': 'Fernando',
                    'paternal_surname': 'Martínez',
                    'maternal_surname': 'Díaz',
                    'date_of_birth': date(1982, 9, 30),
                    'gender': 'M',
                    'blood_type_abo': 0,  # O
                    'blood_type_rh': 0,   # Negativo
                    'email': 'luis.martinez@email.com',
                    'phone': '555-2005',
                    'address': 'Av. Libertad 654, Ciudad',
                    'allergies': 'Látex',
                    'chronic_conditions': 'Enfermedad pulmonar obstructiva crónica (EPOC)',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Elena',
                    'second_name': None,
                    'paternal_surname': 'López',
                    'maternal_surname': 'Ruiz',
                    'date_of_birth': date(1988, 5, 18),
                    'gender': 'F',
                    'blood_type_abo': 1,  # A
                    'blood_type_rh': 0,   # Negativo
                    'email': 'elena.lopez@email.com',
                    'phone': '555-2006',
                    'address': 'Calle Nueva 987, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Hipotiroidismo',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Pedro',
                    'second_name': 'Antonio',
                    'paternal_surname': 'Sánchez',
                    'maternal_surname': 'Torres',
                    'date_of_birth': date(1975, 12, 25),
                    'gender': 'M',
                    'blood_type_abo': 2,  # B
                    'blood_type_rh': 0,   # Negativo
                    'email': 'pedro.sanchez@email.com',
                    'phone': '555-2007',
                    'address': 'Plaza Vieja 147, Ciudad',
                    'allergies': 'Aspirina\nAINEs',
                    'chronic_conditions': 'Insuficiencia cardíaca\nFibrilación auricular',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Carmen',
                    'second_name': 'Rosa',
                    'paternal_surname': 'Ramírez',
                    'maternal_surname': 'Castro',
                    'date_of_birth': date(1992, 8, 7),
                    'gender': 'F',
                    'blood_type_abo': 0,  # O
                    'blood_type_rh': 1,   # Positivo
                    'email': 'carmen.ramirez@email.com',
                    'phone': '555-2008',
                    'address': 'Av. Esperanza 258, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Roberto',
                    'second_name': 'Javier',
                    'paternal_surname': 'Hernández',
                    'maternal_surname': 'Gómez',
                    'date_of_birth': date(1980, 4, 12),
                    'gender': 'M',
                    'blood_type_abo': 1,  # A
                    'blood_type_rh': 1,   # Positivo
                    'email': 'roberto.hernandez@email.com',
                    'phone': '555-2009',
                    'address': 'Calle del Sol 369, Ciudad',
                    'allergies': 'Sulfas',
                    'chronic_conditions': 'Artritis reumatoide',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Isabel',
                    'second_name': None,
                    'paternal_surname': 'Torres',
                    'maternal_surname': 'Morales',
                    'date_of_birth': date(1987, 10, 3),
                    'gender': 'F',
                    'blood_type_abo': 3,  # AB
                    'blood_type_rh': 0,   # Negativo
                    'email': 'isabel.torres@email.com',
                    'phone': '555-2010',
                    'address': 'Av. Luna 741, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Migraña crónica',
                    'doctor_id': random.choice(doctors).id
                },
                # Pacientes adicionales (11-25) con nombres y apellidos repetidos
                {
                    'first_name': 'Juan',  # Nombre repetido
                    'second_name': 'Manuel',
                    'paternal_surname': 'García',  # Apellido repetido
                    'maternal_surname': 'Romero',
                    'date_of_birth': date(1993, 6, 20),
                    'gender': 'M',
                    'blood_type_abo': 2,  # B
                    'blood_type_rh': 1,   # Positivo
                    'email': 'juan.garcia@email.com',
                    'phone': '555-2011',
                    'address': 'Calle Norte 111, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'María',  # Nombre repetido
                    'second_name': 'Luisa',
                    'paternal_surname': 'García',  # Apellido repetido
                    'maternal_surname': 'Vargas',
                    'date_of_birth': date(1991, 1, 11),
                    'gender': 'F',
                    'blood_type_abo': 1,  # A
                    'blood_type_rh': 0,   # Negativo
                    'email': 'maria.garcia@email.com',
                    'phone': '555-2012',
                    'address': 'Av. Sur 222, Ciudad',
                    'allergies': 'Gluten',
                    'chronic_conditions': 'Enfermedad celíaca',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Carlos',  # Nombre repetido
                    'second_name': 'Eduardo',
                    'paternal_surname': 'López',  # Apellido común
                    'maternal_surname': 'Jiménez',
                    'date_of_birth': date(1984, 9, 5),
                    'gender': 'M',
                    'blood_type_abo': 0,  # O
                    'blood_type_rh': 1,   # Positivo
                    'email': 'carlos.lopez@email.com',
                    'phone': '555-2013',
                    'address': 'Calle Este 333, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Colesterol alto',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Ana',  # Nombre repetido
                    'second_name': 'Victoria',
                    'paternal_surname': 'Martínez',  # Apellido repetido
                    'maternal_surname': 'Flores',
                    'date_of_birth': date(1996, 4, 28),
                    'gender': 'F',
                    'blood_type_abo': 3,  # AB
                    'blood_type_rh': 1,   # Positivo
                    'email': 'ana.martinez@email.com',
                    'phone': '555-2014',
                    'address': 'Av. Oeste 444, Ciudad',
                    'allergies': 'Frutos secos',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Luis',  # Nombre repetido
                    'second_name': 'Miguel',
                    'paternal_surname': 'Rodríguez',  # Apellido común
                    'maternal_surname': 'Navarro',
                    'date_of_birth': date(1979, 12, 15),
                    'gender': 'M',
                    'blood_type_abo': 1,  # A
                    'blood_type_rh': 1,   # Positivo
                    'email': 'luis.rodriguez@email.com',
                    'phone': '555-2015',
                    'address': 'Plaza Centro 555, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Gastritis crónica',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Elena',  # Nombre repetido
                    'second_name': 'Patricia',
                    'paternal_surname': 'Fernández',  # Apellido repetido
                    'maternal_surname': 'Medina',
                    'date_of_birth': date(1989, 7, 9),
                    'gender': 'F',
                    'blood_type_abo': 2,  # B
                    'blood_type_rh': 1,   # Positivo
                    'email': 'elena.fernandez@email.com',
                    'phone': '555-2016',
                    'address': 'Calle Paz 666, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Pedro',  # Nombre repetido
                    'second_name': 'Luis',
                    'paternal_surname': 'González',  # Apellido común
                    'maternal_surname': 'Ortiz',
                    'date_of_birth': date(1977, 3, 23),
                    'gender': 'M',
                    'blood_type_abo': 0,  # O
                    'blood_type_rh': 0,   # Negativo
                    'email': 'pedro.gonzalez@email.com',
                    'phone': '555-2017',
                    'address': 'Av. Unión 777, Ciudad',
                    'allergies': 'Lactosa',
                    'chronic_conditions': 'Intolerancia a la lactosa',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Carmen',  # Nombre repetido
                    'second_name': 'Isabel',
                    'paternal_surname': 'López',  # Apellido común
                    'maternal_surname': 'Vega',
                    'date_of_birth': date(1994, 11, 17),
                    'gender': 'F',
                    'blood_type_abo': 1,  # A
                    'blood_type_rh': 1,   # Positivo
                    'email': 'carmen.lopez@email.com',
                    'phone': '555-2018',
                    'address': 'Calle Libertad 888, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Roberto',  # Nombre repetido
                    'second_name': 'Carlos',
                    'paternal_surname': 'García',  # Apellido repetido
                    'maternal_surname': 'Salazar',
                    'date_of_birth': date(1981, 8, 30),
                    'gender': 'M',
                    'blood_type_abo': 3,  # AB
                    'blood_type_rh': 0,   # Negativo
                    'email': 'roberto.garcia@email.com',
                    'phone': '555-2019',
                    'address': 'Plaza Nueva 999, Ciudad',
                    'allergies': 'Penicilina',
                    'chronic_conditions': 'Alergia a antibióticos',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Isabel',  # Nombre repetido
                    'second_name': 'Cristina',
                    'paternal_surname': 'Martínez',  # Apellido repetido
                    'maternal_surname': 'Reyes',
                    'date_of_birth': date(1986, 2, 8),
                    'gender': 'F',
                    'blood_type_abo': 2,  # B
                    'blood_type_rh': 1,   # Positivo
                    'email': 'isabel.martinez@email.com',
                    'phone': '555-2020',
                    'address': 'Av. Progreso 101, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': random.choice(doctors).id
                },
                # Pacientes 21-25 adicionales
                {
                    'first_name': 'Jorge',
                    'second_name': 'Andrés',
                    'paternal_surname': 'Pérez',  # Apellido repetido
                    'maternal_surname': 'Gutiérrez',
                    'date_of_birth': date(1983, 5, 14),
                    'gender': 'M',
                    'blood_type_abo': 0,  # O
                    'blood_type_rh': 1,   # Positivo
                    'email': 'jorge.perez@email.com',
                    'phone': '555-2021',
                    'address': 'Calle Victoria 202, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Hipertensión',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Patricia',
                    'second_name': 'Alejandra',
                    'paternal_surname': 'Sánchez',  # Apellido repetido
                    'maternal_surname': 'Delgado',
                    'date_of_birth': date(1992, 10, 21),
                    'gender': 'F',
                    'blood_type_abo': 1,  # A
                    'blood_type_rh': 0,   # Negativo
                    'email': 'patricia.sanchez@email.com',
                    'phone': '555-2022',
                    'address': 'Av. Independencia 303, Ciudad',
                    'allergies': 'Polen',
                    'chronic_conditions': 'Rinitis alérgica',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Fernando',
                    'second_name': 'José',
                    'paternal_surname': 'Hernández',  # Apellido repetido
                    'maternal_surname': 'Campos',
                    'date_of_birth': date(1976, 1, 19),
                    'gender': 'M',
                    'blood_type_abo': 2,  # B
                    'blood_type_rh': 1,   # Positivo
                    'email': 'fernando.hernandez@email.com',
                    'phone': '555-2023',
                    'address': 'Calle Reforma 404, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Diabetes tipo 2',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Gabriela',
                    'second_name': 'Beatriz',
                    'paternal_surname': 'Torres',  # Apellido repetido
                    'maternal_surname': 'Aguirre',
                    'date_of_birth': date(1990, 6, 12),
                    'gender': 'F',
                    'blood_type_abo': 3,  # AB
                    'blood_type_rh': 1,   # Positivo
                    'email': 'gabriela.torres@email.com',
                    'phone': '555-2024',
                    'address': 'Plaza Revolución 505, Ciudad',
                    'allergies': 'Mariscos',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': random.choice(doctors).id
                },
                {
                    'first_name': 'Ricardo',
                    'second_name': 'Alberto',
                    'paternal_surname': 'Ramírez',  # Apellido repetido
                    'maternal_surname': 'Silva',
                    'date_of_birth': date(1985, 9, 26),
                    'gender': 'M',
                    'blood_type_abo': 0,  # O
                    'blood_type_rh': 1,   # Positivo
                    'email': 'ricardo.ramirez@email.com',
                    'phone': '555-2025',
                    'address': 'Av. Constitución 606, Ciudad',
                    'allergies': 'Ninguna conocida',
                    'chronic_conditions': 'Ninguna',
                    'doctor_id': random.choice(doctors).id
                }
            ]
            
            for patient_data in patients_data:
                patient = Patient.query.filter_by(
                    first_name=patient_data['first_name'],
                    paternal_surname=patient_data['paternal_surname'],
                    date_of_birth=patient_data['date_of_birth']
                ).first()
                if not patient:
                    patient = Patient(**patient_data)
                    db.session.add(patient)
                    full_name = f"{patient_data['first_name']} {patient_data.get('second_name', '')} {patient_data['paternal_surname']} {patient_data.get('maternal_surname', '')}".strip()
                    abo_map = {0: 'O', 1: 'A', 2: 'B', 3: 'AB'}
                    rh_map = {0: '-', 1: '+'}
                    blood_type_str = f"{abo_map[patient_data['blood_type_abo']]}{rh_map[patient_data['blood_type_rh']]}"
                    print(f"✅ Paciente: {full_name} (Tipo: {blood_type_str})")
                else:
                    full_name = f"{patient_data['first_name']} {patient_data.get('second_name', '')} {patient_data['paternal_surname']} {patient_data.get('maternal_surname', '')}".strip()
                    print(f"ℹ️  Paciente {full_name} ya existe")
            
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
