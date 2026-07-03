# 🎨 Frame'Art - Bienvenue

**Project**: Frame'Art v2 - Plateforme d'art en ligne  
**Date**: Mai 2026  
**Status**: Backend Phase 1 ✅ | Phase 2 🔄 Prêt à commencer

---
prototyope: alice@example.com
            admin@frameart.io
            marc@example.com

ces prototype n'on pas besoin de bd et les mot de passe sont password
## 📍 OÙ ÊTES-VOUS?


Vous êtes dans la **racine du projet** avec structure suivante:

```
frak'Art/
├── frame/                    ← Frontend React (src/)
├── backend/                  ← Backend FastAPI (NOUVEAU!)
├── *.md (documentation)      ← Guides implémentation
└── README files             ← Ce dossier
```

---

## 🚀 DÉMARRER RAPIDEMENT

### 1️⃣ Lancer le Backend

```bash
cd backend

# Installer dépendances
pip install -r requirements.txt

# Vérifier MongoDB
# Assurez-vous que MongoDB s'exécute: mongod

# Démarrer serveur
python main.py
```

**Serveur**: http://localhost:5000  
**Docs API**: http://localhost:5000/docs

### 2️⃣ Tester les endpoints existants

Via Swagger UI (`http://localhost:5000/docs`):

1. **Créer un compte**: `POST /api/auth/register`
   ```json
   {
     "nom_utilisateur": "alice",
     "email": "alice@example.com",
     "password": "password123"
   }
   ```

2. **Se connecter**: `POST /api/auth/login`
   ```json
   {
     "email": "alice@example.com",
     "password": "password123"
   }
   ```
   → Copier le `access_token` reçu

3. **Utiliser le token**: Ajouter dans l'en-tête Authorize
   ```
   Bearer <votre_token>
   ```

4. **Tester**: `GET /api/auth/me` → Affiche votre profil

---


## 🔧 STACK TECHNIQUE

### Backend
- **FastAPI** - Framework web Python moderne
- **PyMongo** - Driver MongoDB (sans ORM)
- **Pydantic** - Validation données + auto-docs
- **JWT** - Authentification tokens
- **Bcrypt** - Hash passwords

### Frontend (existant)
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Daisy UI** - style mini
- **axios** - connescion api
- **lucide-react** icones

### Base de données
- **MongoDB** - 10 collections typées
- **PyMongo** - Requêtes directes

---

## 📂 STRUCTURE BACKEND

```
backend/
├── main.py                 ← Point d'entrée FastAPI
├── requirements.txt        ← Dépendances Python
│
├── config/                 ← Configuration
│   ├── settings.py         (variables env)
│   ├── database.py         (connexion MongoDB)
│   └── constants.py        (énumérés)
│
├── middleware/             ← Middlewares
│   ├── auth.py             (JWT + authentification)
│   └── error_handler.py    (gestion erreurs)
│
├── models/                 ← Schémas Pydantic
│   └── schemas.py          (22 classes)
│
├── services/               ← Logique métier
│   ├── auth_service.py     ✅ (3 méthodes)
│   ├── user_service.py     ✅ (10 méthodes)
│   └── *.py                ⏳ (7 services à faire)
│
├── routes/                 ← Endpoints API
│   ├── auth.py             ✅ (3 endpoints)
│   ├── users.py            ✅ (12 endpoints)
│   └── *.py                ⏳ (9 modules stubs)
│
├── utils/                  ← Fonctions utilitaires
│   ├── jwt.py              (token JWT)
│   ├── encryption.py       (bcrypt)
│   └── db.py               (helpers MongoDB)
│
└── README.md              ← Documentation
```

---

## 🎯 PROCHAINES ÉTAPES

### Immédiat (Aujourd'hui)
```bash
# 1. Démarrer backend
cd backend && python main.py

# 2. Tester endpoints via http://localhost:5000/docs
# 3. Créer un compte + se connecter
```

### Court terme (Cette semaine)
1. Implémenter **OeuvreService** (12 endpoints)
2. Créer **routes/oeuvres.py**
3. Tester tous les endpoints

### Moyen terme (Prochaines 2 semaines)
1. Services restants (Commentaire, Favori, etc.)
2. Tous les 47 endpoints stubs
3. Tests complets

### Long terme (Après Phase 2)
1. Nettoyer frontend
2. Réécrire api.ts
3. Intégrer auth
4. Tests E2E

---

## 💡 ASTUCES UTILES

### Vérifier MongoDB
```bash
# Dans un terminal séparé
mongosh
> db.admin.command('ping')  # { ok: 1 }
```

### Voir les logs FastAPI
```python
# En haut de main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Tester un endpoint
```bash
# Via curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nom_utilisateur":"test","email":"test@example.com","password":"123456"}'
```

### Déboguer requêtes
```python
# Dans une route
@router.post("/test")
async def test(data: MySchema):
    print(f"Données reçues: {data.dict()}")
    return {"debug": "info"}
```

---

## ❓ QUESTIONS FRÉQUENTES

**Q: Où est le code frontend?**  
A: Dans `frame/src/` - À connecter au backend après Phase 2

**Q: MongoDB doit-il être vide?**  
A: Oui, il sera initialisé avec les collections en première utilisation

**Q: Comment ajouter de nouveaux endpoints?**  
A: Voir [PHASE_2_ROADMAP.md](PHASE_2_ROADMAP.md) - Modèle fourni

**Q: Où tester les endpoints?**  
A: Via Swagger UI: http://localhost:5000/docs

**Q: Comment obtenir un token JWT?**  
A: Via `/api/auth/login` - Réutilisable pour 24h par défaut

---

## 📞 RESSOURCES

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **PyMongo Guide**: https://pymongo.readthedocs.io
- **MongoDB Manual**: https://docs.mongodb.com/manual
- **JWT Expliqué**: https://jwt.io/introduction

---

## ✨ RÉSUMÉ PHASE 1

```
✅ Backend structure complète
✅ 13/60 endpoints fonctionnels
✅ Auth + Users implémentés
✅ 9 modules stubs prêts
✅ Documentation complète
✅ Prêt pour Phase 2!
```

---

## 🚀 C'EST PARTI!

**Démarrer backend**:
```bash
cd backend && python main.py
```

**Tester via**: http://localhost:5000/docs

**Lire en priorité**: 
1. [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md) - Ce qui est prêt
2. [PHASE_2_ROADMAP.md](PHASE_2_ROADMAP.md) - Quoi faire ensuite
3. [backend/README.md](backend/README.md) - Guide technique

---

**Bon développement! 🎨🚀**

Questions? Consultez les fichiers `.md` - tout est documenté!
