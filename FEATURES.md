# Parcours métier

| Parcours attendu | Point de départ | Manque ou défaut identifié | Critère de livraison |
| --- | --- | --- | --- |
| Créer et personnaliser | Dix types, modèles, réglages et copie de champ présents | Interface rejetée ; inspecteur et document peu hiérarchisés | Commandes lisibles, aperçu et réglages distincts, usage clavier/mobile |
| Retrouver ses formulaires | Bibliothèque, recherche, import/export, modifier/copier/supprimer présents | Nouvelle composition nécessaire | Tous les documents consultables avec nombre de champs/réponses et actions claires |
| Répondre et analyser | Validation, réponse idempotente, filtres, synthèse, CSV/JSON présents | Séparer visuellement réponse/édition ; prévenir pertes | Une réponse ne modifie pas le schéma ; erreurs compréhensibles et exports corrects |
| Changer de document | Modèle demande confirmation seulement si champs présents | Nouveau formulaire, ouverture/copie peuvent écraser une saisie ; nom seul non protégé | Annuler un changement conserve saisie ; document non modifié sans confirmation superflue |
| Persister entre onglets | Web Locks + CAS et brouillon conservé sur conflit | À conserver pendant refonte | Ancienne édition n’écrase pas version récente, double soumission unique |
| Exporter ses données | Formulaires, réponses, CSV et sauvegarde brute | Fichiers réels et synchronisation distante hors périmètre | Limites explicites ; export fonctionnel et protégé contre formules |
| Accès public | Aucun compte ni API | Pas encore d’URL publique | HTTPS gratuit, stockage propre à l’origine, parcours navigateur public réel |

Les imports de réponses, fichiers complets et collecte distante sont optionnels : ils ne sont pas annoncés comme livrés. Aucun compte artificiel n’est ajouté.

