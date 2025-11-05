import os
import logging
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
    """
    Genera la URI de base de datos según el tipo configurado.
    Soporta: PostgreSQL, SQLite, MySQL/MariaDB, Oracle, SQL Server
    """
    if is_production:
        db_type = os.getenv("DB_TYPE_PROD", "sqlite").lower()
        db_name = os.getenv("DB_NAME_PROD")
        db_user = os.getenv("DB_USER_PROD")
        db_password = os.getenv("DB_PASSWORD_PROD")
        db_host = os.getenv("DB_HOST_PROD", "localhost")
        db_port = os.getenv("DB_PORT_PROD")
    else:
        db_type = os.getenv("DB_TYPE_DEV", "sqlite").lower()
        db_name = os.getenv("DB_NAME_DEV")
        db_user = os.getenv("DB_USER_DEV")
        db_password = os.getenv("DB_PASSWORD_DEV")
        db_host = os.getenv("DB_HOST_DEV", "localhost")
        db_port = os.getenv("DB_PORT_DEV")
    
    # SQLite - No requiere usuario, contraseña, host o puerto
    if db_type == "sqlite":
        db_path = db_name if db_name else "medical_diagnostic.db"
        return f"sqlite:///{db_path}"
    
    # PostgreSQL
    elif db_type == "postgresql" or db_type == "postgres":
        db_port = db_port or "5432"
        return f"postgresql+psycopg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    # MySQL / MariaDB
    elif db_type == "mysql" or db_type == "mariadb":
        db_port = db_port or "3306"
        return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    # Oracle
    elif db_type == "oracle":
        db_port = db_port or "1521"
        # Oracle puede usar diferentes formatos, este es el más común
        return f"oracle+cx_oracle://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    # SQL Server
    elif db_type == "sqlserver" or db_type == "mssql":
        db_port = db_port or "1433"
        # SQL Server con pyodbc
        return f"mssql+pyodbc://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?driver=ODBC+Driver+17+for+SQL+Server"
    
    # Por defecto, usar SQLite
    else:
        print(f"⚠️  Tipo de base de datos '{db_type}' no reconocido. Usando SQLite por defecto.")
        return f"sqlite:///{db_name if db_name else 'medical_diagnostic.db'}"


class BaseConfig:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Configuración de ubicación del token JWT
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # CORS
    CORS_ORIGINS = cors_whitelist
    CORS_HEADERS = "Content-Type"
    
    # SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Rate Limiting
    RATE_LIMIT_WHITELIST = os.getenv("RATE_LIMIT_WHITELIST", "").split(",") if os.getenv("RATE_LIMIT_WHITELIST") else []
    
    # Configuración de Logging
    LOG_LEVEL = logging.INFO
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'


class DevConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    
    # En desarrollo, mostrar más información
    SQLALCHEMY_ECHO = True
    
    # Logging detallado en desarrollo (incluye tracebacks completos)
    LOG_LEVEL = logging.DEBUG


class ProdConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    
    # En producción, asegurarse de que las claves secretas estén configuradas
    if not os.getenv("SECRET_KEY") or not os.getenv("JWT_SECRET_KEY"):
        raise ValueError("SECRET_KEY y JWT_SECRET_KEY deben estar configuradas en producción")
    
    # Configuración adicional de seguridad en producción
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    
    # Logging menos verboso en producción (solo INFO y superiores)
    LOG_LEVEL = logging.WARNING
    SQLALCHEMY_ECHO = False


class TestConfig(BaseConfig):
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
    env = os.getenv("NODE_ENV", "development")
    return config.get(env, config["default"])