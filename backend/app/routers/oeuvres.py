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

@router.get("/oeuvres")
def list_oeuvres() -> dict[str, Any]:
    items = [enrich_oeuvre(item) for item in db.oeuvres.find({"est_publiee": True}).sort("cree_le", -1)]
    return response(items)


@router.get("/oeuvres/search")
def search_oeuvres(q: str = "") -> dict[str, Any]:
    query = {"est_publiee": True}
    if q:
        query["$or"] = [
            {"titre": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]
    return response([enrich_oeuvre(item) for item in db.oeuvres.find(query).sort("cree_le", -1)])


@router.get("/oeuvres/{oeuvre_id}")
def get_oeuvre(oeuvre_id: str) -> dict[str, Any]:
    item = db.oeuvres.find_one({"_id": oid(oeuvre_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Oeuvre introuvable")
    return response(enrich_oeuvre(item))


@router.post("/oeuvres")
def create_oeuvre(body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    if user.get("role") not in {"artiste", "administrateur"}:
        raise HTTPException(status_code=403, detail="Seuls les artistes peuvent publier")
    doc = {
        "artiste_id": user["_id"],
        "titre": body.get("titre") or body.get("title") or "Sans titre",
        "description": body.get("description"),
        "url_image": body.get("url_image") or body.get("imageUrl") or body.get("image_url"),
        "urls_images_galerie": body.get("urls_images_galerie", []),
        "tags": body.get("tags", []),
        "categorie": body.get("categorie"),
        "est_publiee": bool(body.get("est_publiee", True)),
        "est_signalee": False,
        "cree_le": now(),
        "modifie_le": None,
        "nb_vues": 0,
        "likes": [],
        "nb_likes": 0,
        "commentaires": [],
        "nb_commentaires": 0,
    }
    if not doc["url_image"]:
        raise HTTPException(status_code=400, detail="Image requise")
    doc["_id"] = db.oeuvres.insert_one(doc).inserted_id
    db.utilisateurs.update_one({"_id": user["_id"]}, {"$inc": {"compteurs.oeuvres": 1}})
    return response(enrich_oeuvre(doc))


@router.post("/oeuvres/upload")
async def upload_image(image: UploadFile = File(...), user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return response({"url": f"/uploads/{image.filename}", "filename": image.filename})


@router.get("/oeuvres/artiste/{artist_id}")
def artist_works(artist_id: str) -> dict[str, Any]:
    target = oid(artist_id)
    return response([enrich_oeuvre(item) for item in db.oeuvres.find({"artiste_id": target}).sort("cree_le", -1)])


@router.post("/oeuvres/{oeuvre_id}/like")
def like_oeuvre(oeuvre_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    target = oid(oeuvre_id)
    oeuvre = db.oeuvres.find_one({"_id": target})
    if not oeuvre:
        raise HTTPException(status_code=404, detail="Oeuvre introuvable")
    already = any(item.get("utilisateur_id") == user["_id"] for item in oeuvre.get("likes", []))
    if not already:
        like_doc = {"user_id": user["_id"], "utilisateur_id": user["_id"], "oeuvre_id": target, "date": now(), "cree_le": now()}
        try:
            db.likes.insert_one(like_doc)
        except Exception:
            pass
        db.oeuvres.update_one({"_id": target}, {"$push": {"likes": {"utilisateur_id": user["_id"], "cree_le": now()}}, "$inc": {"nb_likes": 1}})
        db.artistes.update_one({"utilisateur_id": oeuvre["artiste_id"]}, {"$inc": {"total_likes": 1}})
        if oeuvre["artiste_id"] != user["_id"]:
            db.notifications.insert_one({
                "destinataire_id": oeuvre["artiste_id"],
                "type": "nouveau_like",
                "meta": {"oeuvre_id": target, "titre_oeuvre": oeuvre.get("titre"), "auteur_id": user["_id"], "auteur_nom": user.get("nom_utilisateur")},
                "est_lue": False,
                "cree_le": now(),
            })
    return get_oeuvre(oeuvre_id)


@router.delete("/oeuvres/{oeuvre_id}/like")
def unlike_oeuvre(oeuvre_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    target = oid(oeuvre_id)
    db.likes.delete_many({"oeuvre_id": target, "$or": [{"user_id": user["_id"]}, {"utilisateur_id": user["_id"]}]})
    result = db.oeuvres.update_one({"_id": target, "likes.utilisateur_id": user["_id"]}, {"$pull": {"likes": {"utilisateur_id": user["_id"]}}, "$inc": {"nb_likes": -1}})
    oeuvre = db.oeuvres.find_one({"_id": target})
    if result.modified_count and oeuvre:
        db.artistes.update_one({"utilisateur_id": oeuvre["artiste_id"]}, {"$inc": {"total_likes": -1}})
    return get_oeuvre(oeuvre_id)


@router.post("/oeuvres/{oeuvre_id}/view")
def view_oeuvre(oeuvre_id: str) -> dict[str, Any]:
    target = oid(oeuvre_id)
    db.oeuvres.update_one({"_id": target}, {"$inc": {"nb_vues": 1}})
    oeuvre = db.oeuvres.find_one({"_id": target})
    if oeuvre:
        db.artistes.update_one({"utilisateur_id": oeuvre["artiste_id"]}, {"$inc": {"total_vues": 1}})
    return get_oeuvre(oeuvre_id)


@router.get("/oeuvres/{oeuvre_id}/commentaires")
def get_comments(oeuvre_id: str) -> dict[str, Any]:
    target = oid(oeuvre_id)
    oeuvre = db.oeuvres.find_one({"_id": target}) or {}
    comments = list(oeuvre.get("commentaires", [])) + list(db.commentaires.find({"oeuvre_id": target}).sort("cree_le", -1))
    return response(comments)


@router.post("/oeuvres/{oeuvre_id}/commentaires")
def add_comment(oeuvre_id: str, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    target = oid(oeuvre_id)
    content = str(body.get("contenu", "")).strip()
    if not content:
        raise HTTPException(status_code=400, detail="Commentaire vide")
    comment = {"_id": ObjectId(), "utilisateur_id": user["_id"], "contenu": content, "est_signale": False, "cree_le": now(), "reponses": []}
    oeuvre = db.oeuvres.find_one({"_id": target})
    if not oeuvre:
        raise HTTPException(status_code=404, detail="Oeuvre introuvable")
    if len(oeuvre.get("commentaires", [])) < 20:
        db.oeuvres.update_one({"_id": target}, {"$push": {"commentaires": comment}, "$inc": {"nb_commentaires": 1}})
    else:
        overflow = dict(comment)
        overflow["oeuvre_id"] = target
        overflow["likes_utilisateurs_ids"] = []
        overflow["nb_likes"] = 0
        db.commentaires.insert_one(overflow)
        db.oeuvres.update_one({"_id": target}, {"$inc": {"nb_commentaires": 1}})
    if oeuvre["artiste_id"] != user["_id"]:
        db.notifications.insert_one({
            "destinataire_id": oeuvre["artiste_id"],
            "type": "nouveau_commentaire",
            "meta": {"oeuvre_id": target, "titre_oeuvre": oeuvre.get("titre"), "auteur_id": user["_id"], "auteur_nom": user.get("nom_utilisateur")},
            "est_lue": False,
            "cree_le": now(),
        })
    return response(comment)


@router.delete("/oeuvres/{oeuvre_id}/commentaires/{comment_id}")
def delete_comment(oeuvre_id: str, comment_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    target = oid(oeuvre_id)
    cid = oid(comment_id)
    db.oeuvres.update_one({"_id": target}, {"$pull": {"commentaires": {"_id": cid}}, "$inc": {"nb_commentaires": -1}})
    db.commentaires.delete_one({"_id": cid})
