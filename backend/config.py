import os
from pathlib import Path
from dotenv import load_dotenv

# Load root .env first, then local backend .env if present
root_dir = Path(__file__).resolve().parent.parent
load_dotenv(root_dir / '.env')
load_dotenv(root_dir / '.env.local')
load_dotenv(Path(__file__).resolve().parent / '.env')

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", "https://vxxlmonjqqrhmxcsnxhq.supabase.co"))
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # Postgres asyncpg connection string
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        os.getenv("SUPABASE_DB_URL", "")
    )
    
    # Connection pool configuration
    POOL_MIN_SIZE: int = int(os.getenv("POOL_MIN_SIZE", "5"))
    POOL_MAX_SIZE: int = int(os.getenv("POOL_MAX_SIZE", "20"))
    POOL_TIMEOUT: float = float(os.getenv("POOL_TIMEOUT", "30.0"))
    
    # Allowed CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://ameira.app",
    ]

settings = Settings()
