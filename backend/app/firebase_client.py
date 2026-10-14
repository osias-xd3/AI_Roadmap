import os
import logging
from typing import Optional, Any
import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings

logger = logging.getLogger("firebase_client")

_db: Optional[Any] = None

def get_firebase_app():
    if not firebase_admin._apps:
        cred_path = settings.google_application_credentials
        if cred_path and os.path.isfile(cred_path):
            logger.info("Initializing Firebase Admin with service account key: %s", cred_path)
            cred = credentials.Certificate(cred_path)
            return firebase_admin.initialize_app(cred, {
                "projectId": settings.firebase_project_id
            })
        else:
            logger.info(
                "Initializing Firebase Admin with default credentials for project: %s",
                settings.firebase_project_id
            )
            try:
                return firebase_admin.initialize_app(options={
                    "projectId": settings.firebase_project_id
                })
            except Exception as e:
                logger.warning(
                    "Default credentials initialization failed (%s). Initializing app with explicit projectId.",
                    e
                )
                return firebase_admin.initialize_app(options={
                    "projectId": settings.firebase_project_id
                })
    return firebase_admin.get_app()

def get_firestore_client():
    global _db
    if _db is None:
        try:
            get_firebase_app()
            _db = firestore.client()
        except Exception as e:
            logger.error("Failed to connect to Cloud Firestore: %s", e)
            _db = None
    return _db
