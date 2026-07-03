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

@router.get("/notifications")
def list_notifications(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    query = {} if user.get("role") == "administrateur" else {"destinataire_id": user["_id"]}
    return response(list(db.notifications.find(query).sort("cree_le", -1)))


@router.patch("/notifications/{notification_id}/mark-read")
def mark_notification_read(notification_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    query = {"_id": oid(notification_id)}
    if user.get("role") != "administrateur":
        query["destinataire_id"] = user["_id"]
    db.notifications.update_one(query, {"$set": {"est_lue": True}})
    return response({"read": True})


@router.patch("/notifications/mark-all-read")
def mark_all_notifications_read(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    query = {} if user.get("role") == "administrateur" else {"destinataire_id": user["_id"]}
    db.notifications.update_many(query, {"$set": {"est_lue": True}})
    return response({"read": True})

@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    db.notifications.delete_one({"_id": oid(notification_id), "destinataire_id": user["_id"]})
