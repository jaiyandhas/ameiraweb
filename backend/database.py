import logging
from typing import Optional, AsyncGenerator
import asyncpg
import httpx
from backend.config import settings

logger = logging.getLogger("ameira.database")

_pool: Optional[asyncpg.Pool] = None
_httpx_client: Optional[httpx.AsyncClient] = None

async def init_db_pool():
    global _pool, _httpx_client
    _httpx_client = httpx.AsyncClient(timeout=15.0)

    if settings.DATABASE_URL:
        try:
            logger.info("Initializing asyncpg connection pool...")
            _pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=settings.POOL_MIN_SIZE,
                max_size=settings.POOL_MAX_SIZE,
                command_timeout=settings.POOL_TIMEOUT,
            )
            logger.info(f"Database connection pool initialized with min_size={settings.POOL_MIN_SIZE}, max_size={settings.POOL_MAX_SIZE}")
        except Exception as e:
            logger.warning(f"Failed to connect asyncpg pool with DATABASE_URL: {e}. Fallback to Supabase REST engine.")
            _pool = None
    else:
        logger.info("No direct DATABASE_URL provided; using high-speed Supabase client engine.")

async def close_db_pool():
    global _pool, _httpx_client
    if _pool:
        logger.info("Closing asyncpg connection pool...")
        await _pool.close()
        _pool = None
    if _httpx_client:
        await _httpx_client.aclose()
        _httpx_client = None

def get_pool() -> Optional[asyncpg.Pool]:
    return _pool

def get_http_client() -> httpx.AsyncClient:
    global _httpx_client
    if _httpx_client is None:
        _httpx_client = httpx.AsyncClient(timeout=15.0)
    return _httpx_client
