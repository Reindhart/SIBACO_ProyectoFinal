from flask import Blueprint

# Crear blueprint para autenticación
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# Aquí puedes agregar tus rutas de autenticación en el futuro
# Ejemplo:
# @auth_bp.route("/login", methods=["POST"])
# def login():
#     pass
