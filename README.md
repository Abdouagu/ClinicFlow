# ClinicFlow — Gestion Patients & Rendez-vous

Système moderne de gestion de clinique médicale (patients, rendez-vous, statistiques et authentification sécurisée).

---

## Architecture du projet

Le projet est structuré en deux applications indépendantes :
- `/server` : API REST (Node.js, Express, TypeScript strict, Drizzle ORM, PostgreSQL).
- `/client` : Application web frontend (React, Vite, TypeScript strict).

---

## Prérequis

- **Node.js** >= 22 (voir `.nvmrc`)
- **npm** >= 10
- **PostgreSQL** >= 16

---

## Démarrage rapide

### 1. Configuration de l'environnement serveur
Copiez le fichier d'exemple et renseignez vos variables d'environnement :
```bash
cp server/.env.example server/.env
```
Éditez ensuite `server/.env` avec vos identifiants réels (notamment `DATABASE_URL` et un `JWT_SECRET` aléatoire de plus de 32 caractères).

### 2. Démarrage du backend (/server)
```bash
cd server
npm install
npm run dev
```
Le serveur démarrera sur `http://localhost:5000` (ou le port défini dans votre `.env`).

### 3. Démarrage du frontend (/client)
```bash
cd client
npm install
npm run dev
```
L'interface sera accessible sur `http://localhost:5173`.
