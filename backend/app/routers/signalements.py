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

@router.get("/signalements")
def list_reports(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    require_role(user, {"administrateur"})
    return response(list(db.signalements.find().sort("cree_le", -1)))


@router.post("/signalements")
def create_report(body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    doc = {
        "signaleur_id": user["_id"],
        "cible_type": body.get("cible_type", "oeuvre"),
        "cible_id": oid(body.get("cible_id")),
        "raison": body.get("raison", "autre"),
        "details": body.get("details"),
        "statut": "en_attente",
        "traite_par_id": None,
        "traite_le": None,
        "cree_le": now(),
    }
    doc["_id"] = db.signalements.insert_one(doc).inserted_id
    if doc["cible_type"] == "oeuvre":
        db.oeuvres.update_one({"_id": doc["cible_id"]}, {"$set": {"est_signalee": True}})
    return response(doc)


@router.patch("/signalements/{signalement_id}")
def process_report(signalement_id: str, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    require_role(user, {"administrateur"})
    db.signalements.update_one({"_id": oid(signalement_id)}, {"$set": {"statut": body.get("statut", "traite"), "traite_par_id": user["_id"], "traite_le": now()}})
