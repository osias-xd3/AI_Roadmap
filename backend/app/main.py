import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.firebase_client import get_firebase_app, get_firestore_client
from app.routers import chat, certifications, roadmap

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Roadmap v3 Hub API backend...")
    logger.info("Active Firebase Project ID: %s", settings.firebase_project_id)
    try:
        get_firebase_app()
        db = get_firestore_client()
        logger.info("Firestore status: %s", "Connected" if db else "Uninitialized / Offline")
    except Exception as e:
        logger.warning("Firebase Admin initialization deferred: %s", e)
    yield
    logger.info("Shutting down AI Roadmap v3 Hub API backend...")

app = FastAPI(
    title="AI Roadmap v3 Hub & Certification Watchdog API",
    description="FastAPI service for the AI Roadmap v3 platform, AI Tutor chatbot, and automated certification auditing.",
    version="3.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat.router)
app.include_router(certifications.router)
app.include_router(roadmap.router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Roadmap v3 API",
        "version": "3.0.0",
        "firebase_project": settings.firebase_project_id,
    }

@app.get("/")
async def root():
    return {
        "title": "AI Roadmap v3 Hub & Certification Watchdog API",
        "documentation": "/docs",
        "endpoints": {
            "health": "/health",
            "roadmap": "/api/roadmap",
            "progress": "/api/roadmap/progress",
            "chat": "/api/chat",
            "certifications": "/api/certifications",
            "verify_certifications": "/api/certifications/verify",
            "notifications": "/api/certifications/notifications",
        }
    }
