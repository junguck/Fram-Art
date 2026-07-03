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

@router.get("/favoris")
def get_favorites(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    favs = list(db.favoris.find({"utilisateur_id": user["_id"]}).sort("cree_le", -1))
    for fav in favs:
        fav["oeuvre"] = enrich_oeuvre(db.oeuvres.find_one({"_id": fav["oeuvre_id"]})) if db.oeuvres.find_one({"_id": fav["oeuvre_id"]}) else None
    return response(favs)


@router.post("/favoris")
def add_favorite(body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    work_id = body.get("oeuvre_id") or body.get("postId")
    if not work_id:
        raise HTTPException(status_code=400, detail="Oeuvre requise")
    doc = {"utilisateur_id": user["_id"], "oeuvre_id": oid(work_id), "collection_nom": body.get("collection_nom"), "cree_le": now()}
    try:
        doc["_id"] = db.favoris.insert_one(doc).inserted_id
        oeuvre = db.oeuvres.find_one({"_id": doc["oeuvre_id"]})
        if oeuvre:
            db.artistes.update_one({"utilisateur_id": oeuvre["artiste_id"]}, {"$inc": {"total_favoris": 1}})
    except DuplicateKeyError:
        doc = db.favoris.find_one({"utilisateur_id": user["_id"], "oeuvre_id": oid(work_id)})
    return response(doc)


@router.delete("/favoris/{oeuvre_id}")
def remove_favorite(oeuvre_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    db.favoris.delete_one({"utilisateur_id": user["_id"], "oeuvre_id": oid(oeuvre_id)})
    return response({"deleted": True})


@router.delete("/favoris/{user_id}/{oeuvre_id}")
def remove_favorite_full(user_id: str, oeuvre_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    target = oid(user_id)
    if target != user["_id"] and user.get("role") != "administrateur":
        raise HTTPException(status_code=403, detail="Permission refusee")
    db.favoris.delete_one({"utilisateur_id": target, "oeuvre_id": oid(oeuvre_id)})
