"""
Script temporal para crear todas las tablas en la base de datos
"""
import os
import sys

# Agregar el directorio padre al path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.extensions import db

def create_tables():
    app = create_app()
    
    with app.app_context():
        print("\n" + "="*60)
        print("    CREANDO TABLAS EN LA BASE DE DATOS")
        print("="*60 + "\n")
        
        # Eliminar todas las tablas primero (si existen)
        print("🗑️  Eliminando tablas existentes...")
        db.drop_all()
        print("✅ Tablas eliminadas\n")
        
        # Crear todas las tablas desde los modelos
        print("🏗️  Creando tablas nuevas...")
        db.create_all()
        print("✅ Todas las tablas creadas exitosamente\n")
        
        print("="*60)
        print("    ✅ PROCESO COMPLETADO")
        print("="*60 + "\n")

if __name__ == '__main__':
    create_tables()
