# État — Atelier de formulaires

## Périmètre

Dépôt public GitHub : daoudasidibe224/atelier-de-formulaires, ancien nom FormGenerator. Dossier local conservé pour l’aperçu. Branche improve/public-2026-10, PR3 ouverte en brouillon. Responsable exclusif : agent principal. Aucun dépôt privé, aucune fusion, aucune facturation.

La version 9e08e1a est le point de départ testé, pas la version finale de cette passe. Les six UI hors Social sont rejetées. Reconcevoir complètement cette interface avec une direction propre : studio de documents blanc cassé/gris violet/corail, navigation horizontale compacte, feuille centrale et inspecteur à droite. Conserver les dix champs, modèles, duplications, clavier, édition/réponse, filtres/synthèse/CSV et garanties de stockage. Pas de 3D inutile.

## Critères métier

Voir FEATURES.md. Chaque action remplaçant une saisie doit protéger un brouillon réellement modifié. Ne pas affaiblir Web Locks, CAS, idempotence des réponses, protection des formules CSV, quota/corruption et séparation formulaire/réponse.

## Preuves et publication

Aperçu localhost4311 maintenu. Vérifier vrais états à 1440/800/390/320, 305 px utile, menus/clavier, vide/erreurs/stockage/conflits. Tests strictTS/lint/build/domaines/Chromium avant nouveau SHA et deux CI vertes. Captures avant/après dans outputs/screenshots. README français naturel, noms et liens actuels.

Déploiement gratuit Vercel Hobby autorisé APRÈS UI finale testée. Application local-first, aucun secret ni DB distante nécessaire, Web Locks disponible en HTTPS. Plan gratuit existant vérifié. Ne pas modifier les projets Vercel hors périmètre. Garder previews et données.

## Vérifications de cette passe

Nouvelle composition relue à1440/800/390/320, sans débordement ; document visible avant les réglages sur mobile dès le premier champ. Barre de commandes fixe pendant le défilement et bouton +Champ vers le libellé. Aperçu réversible ne crée aucune réponse. Les changements de document protègent aussi le titre seul et les réglages non appliqués.

Lint, types stricts, compilation et16tests métier passent. Les18tests Chromium de production passent, dont confirmations annulées/acceptées, sauvegardes simultanées, conflits, types, modèles/copies, validation, idempotence, CSV et clavier jusqu’à305px. Audit complet : aucune alerte connue. Les preuves de cette passe sont dans le dossier de travail principal work/logs/form-refonte-* et outputs/screenshots/refonte-form.

## Prochaine étape

Commit/push sur la PR en brouillon, CI du SHA courant. Projet Vercel atelier-de-formulaires créé dans l’équipe Hobby existante, framework Next.js/Node24 explicite. Déployer la version vérifiée, contrôler HTTPS depuis un navigateur anonyme puis mettre à jour le lien public et la preuve. Aucun autre projet Vercel modifié.
