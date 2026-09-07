import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sarthi AI Backend"
    API_V1_STR: str = "/api"
    
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "sarthi")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    SQLALCHEMY_DATABASE_URI: str = os.getenv("SQLALCHEMY_DATABASE_URI", f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}")
    
    # Environment mode: 'production' uses Gemini 2.5 Pro on Vertex AI; 'development' uses Nvidia model
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Google Cloud Vertex AI settings
    USE_VERTEX_AI: bool = os.getenv("USE_VERTEX_AI", "true").lower() in ("true", "1", "yes")
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "project-e3e4dcb5-593d-4e61-9a8")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION", "us-central1")
    GCP_PRIMARY_MODEL: str = os.getenv("GCP_PRIMARY_MODEL", "gemini-2.5-pro")
    GCP_SECONDARY_MODEL: str = os.getenv("GCP_SECONDARY_MODEL", "gemini-2.5-flash")
    GCP_MODEL: str = os.getenv("GCP_MODEL", GCP_PRIMARY_MODEL)

    # Nvidia AI settings (Development LLM)
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3-ultra-550b-a55b")

    # JWT Authentication settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "sarthi-super-secret-key-capstone-project-2026-auth-jwt")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = (
            str(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")),
            ".env"
        )
        extra = "ignore"

settings = Settings()
