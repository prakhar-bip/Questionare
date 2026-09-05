import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Saarthi AI Backend"
    API_V1_STR: str = "/api"
    
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "saarthi")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    SQLALCHEMY_DATABASE_URI: str = os.getenv("SQLALCHEMY_DATABASE_URI", f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}")
    
    # Google Cloud Vertex AI settings
    USE_VERTEX_AI: bool = True
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "project-e3e4dcb5-593d-4e61-9a8")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION", "us-central1")
    GCP_MODEL: str = os.getenv("GCP_MODEL", "gemini-2.5-pro")

    # AI settings (Nvidia fallback)
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-4-340b-instruct")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
