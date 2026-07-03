import os


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "frameart_v2_db")
SECRET_KEY = os.getenv("SECRET_KEY", "frameart-dev-secret")
TOKEN_HOURS = int(os.getenv("TOKEN_HOURS", "168"))
DEV_AUTH_ANY_PASSWORD = os.getenv("DEV_AUTH_ANY_PASSWORD", "0") == "1"
