# État de Forméo

## Périmètre

Dépôt public GitHub : daoudasidibe224/formeo, ancien nom FormGenerator. Dossier local conservé pour l’aperçu. Branche improve/public-2026-10, PR3 ouverte en brouillon. Responsable exclusif : agent principal. Aucun dépôt privé, aucune fusion, aucune facturation.

La version 9e08e1a est le point de départ testé, pas la version finale de cette passe. Les six UI hors Social sont rejetées. Reconcevoir complètement cette interface avec une direction propre : studio de documents blanc cassé/gris violet/corail, navigation horizontale compacte, feuille centrale et inspecteur à droite. Conserver les dix champs, modèles, duplications, clavier, édition/réponse, filtres/synthèse/CSV et garanties de stockage. Pas de 3D inutile.

## Critères métier

Voir FEATURES.md. Chaque action remplaçant une saisie doit protéger un brouillon réellement modifié. Ne pas affaiblir Web Locks, CAS, idempotence des réponses, protection des formules CSV, quota/corruption et séparation formulaire/réponse.

## Preuves et publication

Aperçu localhost4311 maintenu. Vérifier vrais états à 1440/800/390/320, 305 px utile, menus/clavier, vide/erreurs/stockage/conflits. Tests strictTS/lint/build/domaines/Chromium avant nouveau SHA et deux CI vertes. Captures avant/après dans outputs/screenshots. README français naturel, noms et liens actuels.

Déploiement gratuit Vercel Hobby autorisé APRÈS UI finale testée. Application local-first, aucun secret ni DB distante nécessaire, Web Locks disponible en HTTPS. Plan gratuit existant vérifié. Ne pas modifier les projets Vercel hors périmètre. Garder previews et données.

## Vérifications de cette passe

Nouvelle composition relue à1440/800/390/320, sans débordement ; document visible avant les réglages sur mobile dès le premier champ. Barre de commandes fixe pendant le défilement et bouton +Champ vers le libellé. Aperçu réversible ne crée aucune réponse. Les changements de document protègent aussi le titre seul et les réglages non appliqués.

Lint, types stricts, compilation et16tests métier passent. Les18tests Chromium de production passent, dont confirmations annulées/acceptées, sauvegardes simultanées, conflits, types, modèles/copies, validation, idempotence, CSV et clavier jusqu’à305px. Audit complet : aucune alerte connue. Les preuves de cette passe sont dans le dossier de travail principal work/logs/form-refonte-* et outputs/screenshots/refonte-form.

## Publication précédente vérifiée

Application publique : https://atelier-de-formulaires.vercel.app, Vercel Hobby gratuit, projet atelier-de-formulaires uniquement. Le build distant réussit et l’accès anonyme HTTPS répond200. Les18tests Chromium passent aussi sur cette URL publique. Captures4largeurs et vérification du bouton vers les réglages, de l’aperçu sans réponse et de la bibliothèque : outputs/screenshots/form-public et work/logs/form-public-* dans le dossier principal.

Les deux CI push/pull_request du commit de code f22f419bb2ec0d459d5e769da2e4cf00da998fda sont vertes. La documentation ajoute maintenant le lien de la version publiée ; contrôler les CI du nouveau HEAD, garder la PR en brouillon et la branche par défaut inchangée. Limites local-first/fichiers nom seul explicites dans README.

## Nom et liens actuels

Le produit s’appelle Forméo, avec la description « Créateur de formulaires ». Le dépôt est https://github.com/daoudasidibe224/formeo et l’adresse publique cible https://formeo-daouda.vercel.app. Le renommage GitHub est confirmé. La publication Vercel est prise en charge dans le dossier de travail principal ; les preuves de publication précédentes ci-dessus concernent l’ancienne adresse.

Le nom du paquet, les textes affichés, les métadonnées et le nom de la sauvegarde JSON suivent ce nom. Les clés allForms/allAnswers et le verrou atelier-formulaires-storage sont conservés pour garder la compatibilité avec les données et les onglets existants sur une même origine. Le changement d’adresse publique crée un stockage distinct ; les données de l’ancienne origine restent accessibles depuis cette adresse.

Lint, types, compilation, 16 tests métier et 18 parcours Chromium passent après renommage. Le contrôle du titre, de la description, de la sauvegarde formeo-sauvegarde.json et de la lecture de données existantes passe à 1440, 390 et 320 px, sans erreur de console ni débordement. Preuves : work/logs/formeo-brand-* et outputs/screenshots/formeo-brand dans le dossier principal. La publication de ce nouveau nom et ses CI restent à vérifier sur le SHA poussé.
