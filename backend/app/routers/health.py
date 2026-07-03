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

@router.get("/health")
def health() -> dict[str, Any]:
    return {"success": True, "db": DB_NAME, "time": now().isoformat()}
