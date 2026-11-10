# WebAR Forêt - Visualisation de Site Historique

Ce dépôt contient l'architecture complète pour la visualisation WebAR d'un site historique en forêt avec ancrage 3D hybride à 360°.

## Features
- **Dissociation Cible / Scène** : Le modèle 3D n'est pas enfant du marqueur, ce qui permet de tourner à 360° autour du modèle sans perte d'affichage.
- **Lissage Temporel (LERP / SLERP)** : Atténuation du bruit de détection de la caméra pour un affichage parfaitement fluide.
- **Filtre Zone Morte Anti-Dérive** : Empêche les micro-saccades et réaligne progressivement la pose lors des réapparitions de la cible.
- **Compatibilité GitHub Pages** : Fichier `.nojekyll` inclus pour corriger le routage des fichiers binaires `.glb` et `.mind`.

## Structure du projet

```text
ar-foret/
├── .nojekyll
├── README.md
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── ARAnchorManager.js
├── models/
│   └── README.md
└── targets/
    └── README.md
```

## Installation & Déploiement

1. Clonez ou décompressez cette archive dans votre dépôt GitHub `BeignetAuPlastique/ar-foret`.
2. Déposez votre fichier 3D `.glb` dans `models/foret_site.glb`.
3. Déposez vos empreintes de cibles ou fichiers de tracking dans `targets/`.
4. Pushez vos modifications sur la branche principale (`main`).
5. Rendez-vous dans **Settings > Pages** de votre d'accès GitHub, choisissez la branche `main` / `root` et enregistrez.
