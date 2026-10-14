import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config import REPO_ROOT
from app.auth import get_current_user
from app.firebase_client import get_firestore_client

logger = logging.getLogger("roadmap")
router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])

class UserProgressPayload(BaseModel):
    completed_topics: List[str] = Field(default_factory=list, description="IDs/keys of completed topics")
    github_urls: Dict[str, str] = Field(default_factory=dict, description="GitHub URLs mapped by phase ID")
    notes: Optional[Dict[str, str]] = Field(default_factory=dict, description="Personal notes mapped by phase ID")

def load_full_roadmap() -> Dict[str, Any]:
    json_path = REPO_ROOT / "roadmap_v3.json"
    if not json_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="roadmap_v3.json not found on server."
        )
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("")
async def get_roadmap():
    """
    Returns the complete AI Roadmap v3:
    Phases 0 to 11, Metadata, Rules, Weekly Schedule, Self-Check Gates, and Certifications.
    """
    return load_full_roadmap()

@router.get("/progress")
async def get_user_progress(
    current_user: dict = Depends(get_current_user),
):
    """
    Fetches the authenticated user's progress from Cloud Firestore 'user_progress/{uid}'.
    """
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User identity could not be verified."
        )

    db = get_firestore_client()
    if db:
        try:
            doc_ref = db.collection("user_progress").document(uid)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            logger.warning("Failed to fetch progress from Firestore for user %s: %s", uid, e)

    # Default empty progress
    return {
        "uid": uid,
        "completed_topics": [],
        "github_urls": {},
        "notes": {},
    }

@router.post("/progress")
async def save_user_progress(
    payload: UserProgressPayload,
    current_user: dict = Depends(get_current_user),
):
    """
    Saves or updates completed topics, checkboxes, and GitHub repository project URLs
    in Cloud Firestore under 'user_progress/{uid}'.
    """
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User identity could not be verified."
        )

    progress_data = {
        "uid": uid,
        "completed_topics": payload.completed_topics,
        "github_urls": payload.github_urls,
        "notes": payload.notes or {},
        "email": current_user.get("email"),
    }

    db = get_firestore_client()
    if db:
        try:
            doc_ref = db.collection("user_progress").document(uid)
            doc_ref.set(progress_data, merge=True)
            return {"status": "saved", "data": progress_data}
        except Exception as e:
            logger.error("Failed saving progress to Firestore for user %s: %s", uid, e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while saving progress: {str(e)}"
            )

    return {"status": "mock_saved", "data": progress_data}
