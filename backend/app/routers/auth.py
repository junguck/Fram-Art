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

@router.post("/auth/register")
def register(body: dict[str, Any]) -> dict[str, Any]:
    email = str(body.get("email", "")).strip().lower()
    username = str(body.get("nom_utilisateur") or body.get("name") or "").strip()
    password = str(body.get("password", ""))
    if len(username) < 3 or "@" not in email or len(password) < 3:
        raise HTTPException(status_code=400, detail="Nom, email ou mot de passe invalide")
    user = {
        "nom_utilisateur": username,
        "email": email,
        "mot_de_passe_hash": hash_password(password),
        "url_avatar": body.get("url_avatar"),
        "bio": body.get("bio"),
        "role": "utilisateur",
        "est_actif": True,
        "est_banni": False,
        "raison_bannissement": None,
        "cree_le": now(),
        "derniere_connexion": now(),
        "abonnements_ids": [],
        "abonnes_ids": [],
        "compteurs": {"abonnements": 0, "abonnes": 0, "oeuvres": 0},
        "notifications": {
            "email_nouveaux_likes": True,
            "email_nouveaux_commentaires": True,
            "email_nouveaux_abonnes": True,
        },
    }
    try:
        result = db.utilisateurs.insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Email ou nom deja utilise") from exc
    user["_id"] = result.inserted_id
    return response(user, access_token=make_token(result.inserted_id))


@router.post("/auth/login")
def login(body: dict[str, Any]) -> dict[str, Any]:
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    user = db.utilisateurs.find_one({"email": email})
    if not user or not verify_password(password, user.get("mot_de_passe_hash", "")):
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    if user.get("est_banni"):
        raise HTTPException(status_code=403, detail="Compte banni")
    db.utilisateurs.update_one({"_id": user["_id"]}, {"$set": {"derniere_connexion": now()}})
    return response(user, access_token=make_token(user["_id"]))


@router.get("/auth/me")
def me(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return response(user)


@router.post("/auth/logout")
def logout() -> dict[str, Any]:
    return response({"message": "Deconnecte"})


@router.post("/auth/refresh-token")
def refresh_token(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return response(user, access_token=make_token(user["_id"]))


@router.post("/auth/apply-artist")
def apply_artist(body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    existing = db.candidatures.find_one({"utilisateur_id": user["_id"]})
    doc = {
        "utilisateur_id": user["_id"],
        "motivation": body.get("motivation", ""),
        "url_portfolio": body.get("url_portfolio", ""),
        "oeuvres_exemple_ids": [oid(item) for item in body.get("oeuvres_exemple_ids", []) if ObjectId.is_valid(item)],
        "pieces_jointes": body.get("pieces_jointes", []),
        "statut": "en_attente" if not existing else "resoumis",
        "soumis_le": now(),
        "examine_le": None,
        "examine_par_id": None,
        "historique": existing.get("historique", []) if existing else [],
        "note_interne": None,
        "message_decision": None,
        "nb_resoumissions": (existing.get("nb_resoumissions", 0) + 1) if existing else 0,
    }
    if existing:
        db.candidatures.update_one({"_id": existing["_id"]}, {"$set": doc})
        doc["_id"] = existing["_id"]
    else:
        doc["_id"] = db.candidatures.insert_one(doc).inserted_id
    return response(doc)


@router.get("/auth/application/{user_id}")
def get_my_application(user_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    target = oid(user_id)
    if target != user["_id"] and user.get("role") != "administrateur":
        raise HTTPException(status_code=403, detail="Permission refusee")
    return response(db.candidatures.find_one({"utilisateur_id": target}))
