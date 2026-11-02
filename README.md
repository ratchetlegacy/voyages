# Nos voyages

Carnet de voyages de Chloé et Mathieu : tous les voyages à l'étranger et les vacances en France, année par année, sur deux cartes interactives.

👉 **Ouvrir l'appli : https://ratchetlegacy.github.io/voyages/**

## Fonctionnalités

- Carte du monde et carte de France, avec zoom et déplacement au doigt
- Pays et régions visités coloriés, un point par lieu
- Trois profils : Chloé, Mathieu et les voyages à deux
- Ajout d'un voyage : année, pays ou ville, raison du voyage
- Recherche de n'importe quelle ville de France, placée automatiquement sur la carte
- Données synchronisées entre les téléphones
- Installable sur téléphone comme une vraie application

## Installer sur téléphone

- **iPhone** : ouvrir le lien dans Safari → Partager → « Sur l'écran d'accueil »
- **Android** : ouvrir le lien dans Chrome → menu ⋮ → « Installer l'application »

## Technique

- HTML, CSS et JavaScript, sans framework
- Cartes dessinées avec [d3-geo](https://d3js.org/d3-geo) et [Natural Earth](https://www.naturalearthdata.com/)
- Contours des régions : [france-geojson](https://github.com/gregoiredavid/france-geojson)
- Villes de France : [API Géo](https://geo.api.gouv.fr/) (data.gouv.fr)
- Données et connexion : [Supabase](https://supabase.com/)
- Application installable (PWA) : manifeste et service worker

---
Réalisé par MR Compétition
