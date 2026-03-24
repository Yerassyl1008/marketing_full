import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.config import settings
from app.database import AsyncSessionLocal, check_database_connection
from app.routers import auth_router, comment_router, lead_router
from app.service.auth_service import AuthService


logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

auth_service = AuthService()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.BOOTSTRAP_ADMIN_ON_STARTUP:
        async with AsyncSessionLocal() as session:
            await auth_service.ensure_admin_user(session)
        logger.info("Admin bootstrap check completed")
    yield


app = FastAPI(
    title="CRM API",
    version="1.0.0",
    docs_url="/docs" if settings.docs_enabled else None,
    redoc_url="/redoc" if settings.docs_enabled else None,
    openapi_url="/openapi.json" if settings.docs_enabled else None,
    lifespan=lifespan,
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS or ["*"],
)

app.add_middleware(
    GZipMiddleware,
    minimum_size=settings.GZIP_MINIMUM_SIZE,
)

if settings.effective_cors_origins:
    allow_all_origins = settings.effective_cors_origins == ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.effective_cors_origins,
        allow_credentials=not allow_all_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )


app.include_router(auth_router.router)
app.include_router(lead_router.public_router)
app.include_router(lead_router.router)
app.include_router(comment_router.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "crm-api"}


@app.get("/health/live", tags=["Health"])
async def live_health_check():
    return {"status": "ok"}


@app.get("/health/ready", tags=["Health"])
async def ready_health_check():
    if not await check_database_connection():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable",
        )
    return {"status": "ok"}
