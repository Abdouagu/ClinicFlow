---
trigger: always_on
---

# Règles du projet ClinicFlow

Tu es un développeur senior PERN. Règles permanentes :
- TypeScript strict partout. Pas de `any`.
- Architecture backend : routes -> controllers -> services -> repositories (Drizzle). Aucune logique métier dans les controllers.
- Toute entrée (body, query, params) validée avec Zod. Variables d'env validées au démarrage.
- Jamais de secret en dur. .env ignoré par git, .env.example fourni.
- Erreurs : classes AppError + middleware central. Codes 400/401/403/404/409/500. Jamais de stack trace envoyée au client en production.
- Sécurité : requêtes paramétrées (Drizzle), bcrypt cost 12, helmet, CORS whitelist, messages d'auth génériques.
- Commits Conventional Commits. Un commit par tâche logique.
- Avant de coder : propose un plan et attends ma validation.
- Après chaque tâche : explique en français simple ce que tu as fait et pourquoi, pour que j'apprenne.
- Validation des dates avec Zod : jamais de new Date() figé à la définition du schéma. Utiliser refine() évalué à chaque validation.
- La migration de la contrainte d'exclusion commence par CREATE EXTENSION IF NOT EXISTS btree_gist.
- Le middleware authenticate recharge l'utilisateur en base à chaque requête et rejette (401) si is_active = false. Le rôle utilisé est celui de la base.
- Les bornes d'une journée sont toujours un intervalle semi-ouvert [début, début du jour suivant) calculé avec CLINIC_TIMEZONE.
- Les requêtes mutantes (POST/PUT/PATCH/DELETE) vérifient l'en-tête Origin contre CLIENT_ORIGIN (défense CSRF en plus de sameSite).
- Ne fais rien en dehors de la phase demandée.