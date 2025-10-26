import os
from datetime import timedelta
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Determinar el ambiente
is_production = os.getenv("NODE_ENV") == "production"
is_development = os.getenv("NODE_ENV") == "development"

# Configuración de CORS
cors_whitelist = os.getenv("CORS_WHITELIST", "").split(",") if os.getenv("CORS_WHITELIST") else []

# Configuración de base de datos según el ambiente
def get_database_uri():
    """Obtiene la URI de la base de datos según el ambiente"""
    if is_production:
        db_name = os.getenv("DB_NAME_PROD")
        db_user = os.getenv("DB_USER_PROD")
        db_password = os.getenv("DB_PASSWORD_PROD")
        db_host = os.getenv("DB_HOST_PROD", "localhost")
        db_port = os.getenv("DB_PORT_PROD", "5432")
    else:
        db_name = os.getenv("DB_NAME_DEV")
        db_user = os.getenv("DB_USER_DEV")
        db_password = os.getenv("DB_PASSWORD_DEV")
        db_host = os.getenv("DB_HOST_DEV", "localhost")
        db_port = os.getenv("DB_PORT_DEV", "5432")
    
    return f"postgresql+psycopg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


class BaseConfig:
    """Configuración base para todas las configuraciones"""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS
    CORS_ORIGINS = cors_whitelist
    CORS_HEADERS = "Content-Type"
    
    # SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Rate Limiting
    RATE_LIMIT_WHITELIST = os.getenv("RATE_LIMIT_WHITELIST", "").split(",") if os.getenv("RATE_LIMIT_WHITELIST") else []


class DevConfig(BaseConfig):
    """Configuración de desarrollo"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    
    # En desarrollo, mostrar más información
    SQLALCHEMY_ECHO = True


class ProdConfig(BaseConfig):
    """Configuración de producción"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    
    # En producción, asegurarse de que las claves secretas estén configuradas
    if not os.getenv("SECRET_KEY") or not os.getenv("JWT_SECRET_KEY"):
        raise ValueError("SECRET_KEY y JWT_SECRET_KEY deben estar configuradas en producción")
    
    # Configuración adicional de seguridad en producción
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"


class TestConfig(BaseConfig):
    """Configuración de testing"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    SQLALCHEMY_ECHO = False


# Configuración por defecto según el ambiente
config = {
    "development": DevConfig,
    "production": ProdConfig,
    "test": TestConfig,
    "default": DevConfig
}

def get_config():
    """Retorna la configuración según el ambiente"""
    env = os.getenv("NODE_ENV", "development")
    return config.get(env, config["default"])