import json
import logging
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import REPO_ROOT
from app.firebase_client import get_firestore_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed")

def seed_roadmap():
    json_path = REPO_ROOT / "roadmap_v3.json"
    if not json_path.exists():
        logger.error("roadmap_v3.json not found at %s", json_path)
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    db = get_firestore_client()
    if not db:
        logger.error("Could not obtain Firestore client. Please check your credentials.")
        return

    phases = data.get("phases", [])
    logger.info("Found %d phases to seed into Firestore collection 'roadmap_phases'...", len(phases))

    for phase in phases:
        phase_id = phase.get("id", f"phase-{phase.get('phase_number')}")
        doc_ref = db.collection("roadmap_phases").document(phase_id)
        doc_ref.set(phase, merge=True)
        logger.info("Seeded phase: %s - %s", phase_id, phase.get("title"))

    # Also seed metadata and rules
    metadata = data.get("metadata", {})
    rules = data.get("rules", [])
    gates = data.get("self_check_gates", [])
    weekly_schedule = data.get("weekly_schedule", {})

    meta_doc = db.collection("roadmap_meta").document("config")
    meta_doc.set({
        "metadata": metadata,
        "rules": rules,
        "self_check_gates": gates,
        "weekly_schedule": weekly_schedule,
    }, merge=True)
    logger.info("Seeded roadmap metadata and rules into 'roadmap_meta/config'.")
    logger.info("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_roadmap()
