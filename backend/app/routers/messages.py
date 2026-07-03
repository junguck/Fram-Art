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

@router.get("/messages")
def list_messages(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return response(list(db.messages.find({"$or": [{"expediteur_id": user["_id"]}, {"destinataire_id": user["_id"]}]}).sort("envoye_le", -1)))


@router.post("/messages")
def send_message(body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    doc = {
        "expediteur_id": user["_id"],
        "destinataire_id": oid(body.get("destinataire_id")),
        "contenu": body.get("contenu", ""),
        "est_lu": False,
        "lu_le": None,
        "envoye_le": now(),
        "type": body.get("type", "direct"),
        "thread_id": oid(body["thread_id"]) if body.get("thread_id") else None,
        "pieces_jointes": body.get("pieces_jointes", []),
    }
    doc["_id"] = db.messages.insert_one(doc).inserted_id
    db.notifications.insert_one({"destinataire_id": doc["destinataire_id"], "type": "nouveau_message", "meta": {"auteur_nom": user.get("nom_utilisateur")}, "est_lue": False, "cree_le": now()})
    return response(doc)


@router.delete("/messages/{message_id}")
def delete_message(message_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    db.messages.delete_one({"_id": oid(message_id), "$or": [{"expediteur_id": user["_id"]}, {"destinataire_id": user["_id"]}]})
