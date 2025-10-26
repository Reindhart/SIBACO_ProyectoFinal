from flask import Blueprint, jsonify

# Crear blueprint para rutas principales
main_bp = Blueprint("main", __name__, url_prefix="/api")


@main_bp.route("/health", methods=["GET"])
def health_check():
    """Endpoint para verificar que el servidor está funcionando"""
    return jsonify({
        "status": "success",
        "message": "Server is running"
    }), 200


@main_bp.route("/", methods=["GET"])
def home():
    """Endpoint principal que retorna el mensaje de bienvenida"""
    return jsonify({
        "status": "success",
        "message": "Proyecto React + Flask",
        "version": "1.0.0"
    }), 200
