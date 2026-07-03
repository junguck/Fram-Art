from fastapi import APIRouter

from .routers import abonnements, artists, auth, candidatures, favoris, health, messages, notifications, oeuvres, signalements, users


router = APIRouter(prefix="/api")

for module in (
    health,
    auth,
    users,
    artists,
    oeuvres,
    favoris,
    candidatures,
    notifications,
    signalements,
    messages,
    abonnements,
):
    router.include_router(module.router)
