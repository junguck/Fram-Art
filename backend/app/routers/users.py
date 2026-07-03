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

@router.get("/users")
def get_users(q: str = "", user: dict[str, Any] | None = Depends(optional_user)) -> dict[str, Any]:
    query: dict[str, Any] = {}
    if q:
        query = {"$or": [{"nom_utilisateur": {"$regex": q, "$options": "i"}}, {"email": {"$regex": q, "$options": "i"}}]}
    users = list(db.utilisateurs.find(query).sort("cree_le", -1))
    return response(users)


@router.get("/users/{user_id}")
def get_user(user_id: str) -> dict[str, Any]:
    user = db.utilisateurs.find_one({"_id": oid(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return response(user)


@router.get("/users/username/{username}")
def get_user_by_username(username: str) -> dict[str, Any]:
    user = db.utilisateurs.find_one({"nom_utilisateur": username})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return response(user)


@router.patch("/users/{user_id}")
def update_user(user_id: str, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    target = oid(user_id)
    if target != user["_id"] and user.get("role") != "administrateur":
        raise HTTPException(status_code=403, detail="Permission refusee")
    allowed = {"nom_utilisateur", "email", "url_avatar", "bio"}
    update = {key: value for key, value in body.items() if key in allowed}
    if body.get("password"):
        update["mot_de_passe_hash"] = hash_password(str(body["password"]))
    if update:
        db.utilisateurs.update_one({"_id": target}, {"$set": update})
    return response(db.utilisateurs.find_one({"_id": target}))


@router.patch("/users/{user_id}/ban")
def ban_user(user_id: str, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    require_role(user, {"administrateur"})
    ban = bool(body.get("ban", True))
    db.utilisateurs.update_one(
        {"_id": oid(user_id)},
        {"$set": {"est_banni": ban, "raison_bannissement": body.get("raison") if ban else None}},
    )
    return response(db.utilisateurs.find_one({"_id": oid(user_id)}))


@router.post("/users/follow/{artist_id}")
def follow_artist(artist_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    artist_oid = oid(artist_id)
    if artist_oid == user["_id"]:
        raise HTTPException(status_code=400, detail="Impossible de se suivre soi-meme")
    db.utilisateurs.update_one({"_id": user["_id"]}, {"$addToSet": {"abonnements_ids": artist_oid}})
    db.utilisateurs.update_one({"_id": artist_oid}, {"$addToSet": {"abonnes_ids": user["_id"]}})
    db.utilisateurs.update_one({"_id": user["_id"]}, {"$set": {"compteurs.abonnements": len(db.utilisateurs.find_one({'_id': user['_id']}).get('abonnements_ids', []))}})
    artist_doc = db.utilisateurs.find_one({"_id": artist_oid}) or {}
    db.utilisateurs.update_one({"_id": artist_oid}, {"$set": {"compteurs.abonnes": len(artist_doc.get("abonnes_ids", []))}})
    db.artistes.update_one({"utilisateur_id": artist_oid}, {"$set": {"total_abonnes": len(artist_doc.get("abonnes_ids", []))}})
    db.notifications.insert_one({"destinataire_id": artist_oid, "type": "nouveau_abonne", "meta": {"abonne_id": user["_id"], "auteur_nom": user["nom_utilisateur"]}, "est_lue": False, "cree_le": now()})
    return response({"following": True})


@router.delete("/users/follow/{artist_id}")
def unfollow_artist(artist_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    artist_oid = oid(artist_id)
    db.utilisateurs.update_one({"_id": user["_id"]}, {"$pull": {"abonnements_ids": artist_oid}})
    db.utilisateurs.update_one({"_id": artist_oid}, {"$pull": {"abonnes_ids": user["_id"]}})
    current = db.utilisateurs.find_one({"_id": user["_id"]}) or {}
    artist_doc = db.utilisateurs.find_one({"_id": artist_oid}) or {}
    db.utilisateurs.update_one({"_id": user["_id"]}, {"$set": {"compteurs.abonnements": len(current.get("abonnements_ids", []))}})
    db.utilisateurs.update_one({"_id": artist_oid}, {"$set": {"compteurs.abonnes": len(artist_doc.get("abonnes_ids", []))}})
    db.artistes.update_one({"utilisateur_id": artist_oid}, {"$set": {"total_abonnes": len(artist_doc.get("abonnes_ids", []))}})
    return response({"following": False})
