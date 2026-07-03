from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import HTTPException


def now() -> datetime:
    return datetime.now(timezone.utc)


def oid(value: str | ObjectId) -> ObjectId:
    try:
        return value if isinstance(value, ObjectId) else ObjectId(value)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Identifiant invalide") from exc


def serialize(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize(item) for key, item in value.items() if key != "mot_de_passe_hash"}
    return value


def response(data: Any = None, **extra: Any) -> dict[str, Any]:
    payload = {"success": True, "data": serialize(data)}
    payload.update({key: serialize(value) for key, value in extra.items()})
    return payload

