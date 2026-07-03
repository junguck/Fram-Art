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

@router.get("/artistes")
def list_artists(q: str = "") -> dict[str, Any]:
    pipeline: list[dict[str, Any]] = [
        {"$lookup": {"from": "utilisateurs", "localField": "utilisateur_id", "foreignField": "_id", "as": "utilisateur"}},
        {"$unwind": "$utilisateur"},
    ]
    if q:
        pipeline.append({"$match": {"$or": [{"utilisateur.nom_utilisateur": {"$regex": q, "$options": "i"}}, {"specialites": {"$regex": q, "$options": "i"}}]}})
    artists = []
    for item in db.artistes.aggregate(pipeline):
        artist = dict(item)
        user = artist.pop("utilisateur")
        artist.update({
            "nom_utilisateur": user.get("nom_utilisateur"),
            "email": user.get("email"),
            "url_avatar": user.get("url_avatar"),
            "bio": user.get("bio"),
            "role": user.get("role"),
            "compteurs": user.get("compteurs", {}),
        })
        artists.append(artist)
    return response(artists)


@router.get("/artistes/{user_id}")
def get_artist(user_id: str) -> dict[str, Any]:
    artist = db.artistes.find_one({"utilisateur_id": oid(user_id)})
    if not artist:
        return response(None)
    user = db.utilisateurs.find_one({"_id": artist["utilisateur_id"]})
    artist["utilisateur"] = user
    return response(artist)


@router.patch("/artistes/{user_id}")
def update_artist(user_id: str, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    target = oid(user_id)
    if target != user["_id"] and user.get("role") != "administrateur":
        raise HTTPException(status_code=403, detail="Permission refusee")
    update = {key: body[key] for key in ("url_portfolio", "specialites", "abonnement_payant_actif", "tarif_mensuel_euros") if key in body}
    db.artistes.update_one({"utilisateur_id": target}, {"$set": update}, upsert=True)
    return get_artist(user_id)


@router.get("/artistes/{user_id}/stats")
def artist_stats(user_id: str) -> dict[str, Any]:
    target = oid(user_id)
    works = list(db.oeuvres.find({"artiste_id": target}))
    stats = {
        "total_vues": sum(item.get("nb_vues", 0) for item in works),
        "total_likes": sum(item.get("nb_likes", 0) for item in works),
        "total_oeuvres": len(works),
        "total_abonnes": len((db.utilisateurs.find_one({"_id": target}) or {}).get("abonnes_ids", [])),
        "daily_views": [{"date": (now() - timedelta(days=6 - i)).date().isoformat(), "views": max(0, i * 3 + len(works))} for i in range(7)],
    }
    return response(stats, **stats)


@router.patch("/artistes/{user_id}/revoke")
def revoke_artist(user_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    require_role(user, {"administrateur"})
    target = oid(user_id)
    db.utilisateurs.update_one({"_id": target}, {"$set": {"role": "utilisateur"}})
    db.artistes.delete_one({"utilisateur_id": target})
