import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import init_db_pool, close_db_pool, get_pool
from backend.routers import people, roles, invites

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ameira.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Ameira Capability Enforcement Service...")
    await init_db_pool()
    yield
    logger.info("Shutting down Ameira Capability Enforcement Service...")
    await close_db_pool()

app = FastAPI(
    title="Ameira Capability Enforcement Service",
    description="FastAPI enforcement layer for Access Levels, Role mutations, Sole-Owner guards, and Invite acceptance.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(people.router)
app.include_router(roles.router)
app.include_router(invites.router)

@app.get("/health", tags=["System"])
async def health_check():
    pool = get_pool()
    return {
        "status": "healthy",
        "service": "ameira-capability-enforcement",
        "pool_active": pool is not None,
        "supabase_url": settings.SUPABASE_URL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
