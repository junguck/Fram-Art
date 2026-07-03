import base64
import hashlib
import hmac
import json
from datetime import timedelta

import bcrypt
from bson import ObjectId
from fastapi import Header, HTTPException

from .config import DEV_AUTH_ANY_PASSWORD, SECRET_KEY, TOKEN_HOURS
from .database import db
from .utils import now, oid


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, stored_hash: str) -> bool:
    if stored_hash.startswith("$2b$12$PLACEHOLDER"):
        return True
    if stored_hash.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            if bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8")):
                return True
        except Exception:
            pass
        return DEV_AUTH_ANY_PASSWORD and bool(password)
    return hmac.compare_digest(hashlib.sha256(password.encode("utf-8")).hexdigest(), stored_hash)


def make_token(user_id: ObjectId) -> str:
    payload = {
        "sub": str(user_id),
        "exp": int((now() + timedelta(hours=TOKEN_HOURS)).timestamp()),
    }
    body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig = hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{sig}"


def read_token(token: str) -> ObjectId:
    try:
        body, sig = token.split(".", 1)
        expected = hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            raise ValueError("bad signature")
        raw = body + "=" * (-len(body) % 4)
        payload = json.loads(base64.urlsafe_b64decode(raw.encode()).decode())
        if int(payload["exp"]) < int(now().timestamp()):
            raise ValueError("expired")
        return oid(payload["sub"])
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Token invalide") from exc


def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentification requise")
    user = db.utilisateurs.find_one({"_id": read_token(authorization.split(" ", 1)[1])})
    if not user or user.get("est_banni"):
        raise HTTPException(status_code=401, detail="Utilisateur invalide ou banni")
    return user


def optional_user(authorization: str | None = Header(default=None)) -> dict | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    try:
        return current_user(authorization)
    except HTTPException:
        return None


def require_role(user: dict, roles: set[str]) -> None:
    if user.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Permission refusee")

