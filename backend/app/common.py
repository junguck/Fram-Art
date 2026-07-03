from typing import Any

from bson import ObjectId

from .database import db
from .utils import oid, serialize


def public_user(user: dict[str, Any] | None) -> dict[str, Any] | None:
    return serialize(user) if user else None


def enrich_oeuvre(oeuvre: dict[str, Any]) -> dict[str, Any]:
    artist = db.utilisateurs.find_one({"_id": oeuvre.get("artiste_id")})
    item = dict(oeuvre)
    item["artiste"] = public_user(artist)
    item["id"] = str(item["_id"])
    item["title"] = item.get("titre", "")
    item["imageUrl"] = item.get("url_image", "")
    item["author"] = {
        "id": str(artist.get("_id")) if artist else None,
        "name": artist.get("nom_utilisateur", "Artiste") if artist else "Artiste",
        "avatar": artist.get("url_avatar") if artist else None,
    }
    item["stats"] = {"likes": item.get("nb_likes", 0), "views": item.get("nb_vues", 0)}
    return item


def user_id_from_body(body: dict[str, Any], fallback: ObjectId | None = None) -> ObjectId:
    value = body.get("utilisateur_id") or body.get("user_id")
    return oid(value) if value else fallback
