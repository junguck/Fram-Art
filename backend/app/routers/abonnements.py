from datetime import timedelta
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pymongo.errors import DuplicateKeyError

from ..common import enrich_oeuvre
from ..config import DB_NAME
from ..database import db
from ..security import current_user, hash_password, make_token, optional_user, require_role, verify_password
from ..utils import now, oid, response


router = APIRouter()

@router.post("/abonnements")
def create_subscription(body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    doc = {
        "abonne_id": user["_id"],
        "artiste_id": oid(body.get("artiste_id")),
        "statut": "actif",
        "montant_euros": float(body.get("montant_euros", 0)),
        "debut_le": now(),
        "fin_le": None,
        "renouvellement_auto": bool(body.get("renouvellement_auto", True)),
    }
    try:
        doc["_id"] = db.abonnements_premium.insert_one(doc).inserted_id
    except DuplicateKeyError:
        db.abonnements_premium.update_one({"abonne_id": user["_id"], "artiste_id": doc["artiste_id"]}, {"$set": {"statut": "actif"}})
        doc = db.abonnements_premium.find_one({"abonne_id": user["_id"], "artiste_id": doc["artiste_id"]})
    return response(doc)


@router.get("/abonnements/{artist_id}")
def get_subscriptions(artist_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return response(list(db.abonnements_premium.find({"artiste_id": oid(artist_id)})))


@router.delete("/abonnements/{subscription_id}")
def cancel_subscription(subscription_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    db.abonnements_premium.update_one({"_id": oid(subscription_id)}, {"$set": {"statut": "annule", "fin_le": now()}})
