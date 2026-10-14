import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from firebase_admin import auth
from app.firebase_client import get_firebase_app

logger = logging.getLogger("auth")

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Validates the Firebase ID token in the Authorization header.
    Expects format: 'Bearer <firebase_id_token>'
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required (Bearer <token>)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    id_token = parts[1].strip()
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty ID token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Ensure Firebase app is initialized
    try:
        get_firebase_app()
    except Exception as e:
        logger.error("Error initializing Firebase App for auth: %s", e)

    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has expired. Please re-authenticate.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.InvalidIdTokenError as e:
        # Development fallback: if token is a dev mock token for local testing
        if id_token.startswith("dev-test-token:"):
            mock_uid = id_token.split("dev-test-token:")[1] or "test-user-id"
            logger.warning("Using dev mock token for user: %s", mock_uid)
            return {
                "uid": mock_uid,
                "email": f"{mock_uid}@example.com",
                "name": "Dev Test User",
            }

        logger.warning("Invalid Firebase ID token: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase ID token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        # Check dev bypass fallback
        if id_token.startswith("dev-test-token:"):
            mock_uid = id_token.split("dev-test-token:")[1] or "test-user-id"
            return {
                "uid": mock_uid,
                "email": f"{mock_uid}@example.com",
                "name": "Dev Test User",
            }
        logger.error("Unexpected error verifying token: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
