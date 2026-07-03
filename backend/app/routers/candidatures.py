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

@router.get("/candidatures")
def list_applications(user: dict[str, Any] | None = Depends(optional_user)) -> dict[str, Any]:
    items = list(db.candidatures.find().sort("soumis_le", -1))
    for item in items:
        item["utilisateur_id"] = db.utilisateurs.find_one({"_id": item["utilisateur_id"]}) or item["utilisateur_id"]
    return response(items)


@router.get("/candidatures/{candidature_id}")
def get_application(candidature_id: str) -> dict[str, Any]:
    item = db.candidatures.find_one({"_id": oid(candidature_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    return response(item)


def decide_application(candidature_id: str, approved: bool, body: dict[str, Any], user: dict[str, Any]) -> dict[str, Any]:
    require_role(user, {"administrateur"})
    target = oid(candidature_id)
    candidature = db.candidatures.find_one({"_id": target})
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    status = "approuve" if approved else "rejete"
    update = {
        "statut": status,
        "examine_le": now(),
        "examine_par_id": user["_id"],
        "message_decision": body.get("message_decision"),
    }
    db.candidatures.update_one({"_id": target}, {"$set": update, "$push": {"historique": {"statut": status, "date": now(), "admin_id": user["_id"], "commentaire": body.get("message_decision", "")}}})
    notif_type = "candidature_approuvee" if approved else "candidature_rejetee"
    if approved:
        db.utilisateurs.update_one({"_id": candidature["utilisateur_id"]}, {"$set": {"role": "artiste"}})
        db.artistes.update_one(
            {"utilisateur_id": candidature["utilisateur_id"]},
            {"$setOnInsert": {"verifie_le": now()}, "$set": {"url_portfolio": candidature.get("url_portfolio"), "specialites": [], "total_vues": 0, "total_likes": 0, "total_favoris": 0, "total_abonnes": 0, "abonnement_payant_actif": False, "tarif_mensuel_euros": None}},
            upsert=True,
        )
    db.notifications.insert_one({"destinataire_id": candidature["utilisateur_id"], "type": notif_type, "meta": {"message": body.get("message_decision")}, "est_lue": False, "cree_le": now()})
    return response(db.candidatures.find_one({"_id": target}))


@router.patch("/candidatures/{candidature_id}/approve")
def approve_application(candidature_id: str, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return decide_application(candidature_id, True, body, user)


@router.patch("/candidatures/{candidature_id}/reject")
def reject_application(candidature_id: str, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return decide_application(candidature_id, False, body, user)
