from fastapi import FastAPI
from app.core.config import settings
from app.api.endpoints import discovery, projects, gateway
from app.db.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

# Create DB tables (In production, use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(discovery.router, prefix=settings.API_V1_STR + "/discovery", tags=["Discovery"])
app.include_router(projects.router, prefix=settings.API_V1_STR + "/projects", tags=["Projects"])
app.include_router(gateway.router, prefix=settings.API_V1_STR + "/gateway", tags=["Gateway"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Saarthi AI Backend"}
