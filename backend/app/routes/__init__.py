from .main import main_bp
from .auth import auth_bp
from .users import users_bp
from .patients import patients_bp
from .diagnoses import diagnoses_bp
from .diseases import diseases_bp
from .symptoms import symptoms_bp
from .signs import signs_bp
from .lab_tests import lab_tests_bp
from .postmortem_tests import postmortem_tests_bp


def register_blueprints(app):
    """Registra todos los blueprints de la aplicación"""
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(diagnoses_bp)
    app.register_blueprint(diseases_bp)
    app.register_blueprint(symptoms_bp)
    app.register_blueprint(signs_bp)
    app.register_blueprint(lab_tests_bp)
    app.register_blueprint(postmortem_tests_bp)

