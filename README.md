# Jeu Concours - Ivoirshop

Il s'agit d'une application Google Apps Script (GAS) pour gérer un jeu concours pour Ivoirshop.

## Déploiement

1. Créez un nouveau projet sur [Google Apps Script](https://script.google.com/).
2. Remplacez le contenu de `Code.gs` par celui de ce dépôt.
3. Créez un nouveau fichier HTML nommé `Index.html` et collez-y le code correspondant.
4. Cliquez sur **Déployer > Nouvelle implémentation**.
5. Choisissez "Application Web".
6. Configurez l'accès sur "Tout le monde" pour permettre aux utilisateurs de participer.
7. Assurez-vous d'avoir une feuille de calcul associée (nommée "Clients") ou laissez le script la créer automatiquement lors de la première exécution.

## Fichiers

- `Index.html` : L'interface utilisateur avec le formulaire de vérification.
- `Code.gs` : Le backend qui gère les requêtes et les interactions avec Google Sheets.
