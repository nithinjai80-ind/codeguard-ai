import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    PORT = int(os.getenv("FLASK_PORT", 5000))
    SECRET_KEY = os.getenv("SECRET_KEY", "roxai_secret_key_super_secure_development_2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "roxai_jwt_secret_token_secure_key_2026")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "roxai")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    JWT_EXPIRATION_HOURS = 24
