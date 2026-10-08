# Atelier de formulaires

Dépôt : [atelier-de-formulaires](https://github.com/daoudasidibe224/atelier-de-formulaires).

Créez des formulaires et recueillez leurs réponses dans votre navigateur. L’éditeur permet d’ajouter des champs, de les réordonner et de tester le résultat avant de l’enregistrer.

## Fonctionnalités

- Dix types de champs : texte, texte long multiligne, email, nombre, date, liste déroulante, choix unique, cases à cocher, curseur et fichier.
- Trois modèles vierges : contact, inscription à un événement et retour d’expérience. Ils sont modifiables avant leur enregistrement.
- Réédition du libellé, du type, des options et des bornes d’un champ ; duplication indépendante des champs et des formulaires, sans copier les réponses.
- Champs obligatoires, options configurables et bornes numériques, y compris les nombres négatifs.
- Réorganisation par glisser-déposer, au clavier avec la poignée, ou avec les boutons de déplacement.
- Enregistrement, modification, recherche et suppression de formulaires.
- Aperçu réversible : le test valide les champs sans enregistrer de réponse et le retour à l’édition conserve le document.
- Réponses indépendantes avec validation des champs et conservation de la casse des textes.
- Confirmation avant de remplacer une saisie non enregistrée, y compris un titre seul ou les réglages en cours d’un champ.
- Export JSON des formulaires et des réponses, import de formulaires sans écraser ceux qui existent déjà.
- Recherche dans les réponses, filtre par formulaire et synthèse des nombres et notes. Les exports JSON et CSV suivent les filtres affichés.
- Sauvegarde des données brutes pour récupérer le contenu du stockage local.
- Export du brouillon si une modification concurrente empêche son enregistrement.
- Interface adaptée aux petits écrans et aux préférences de réduction des animations.

## Installation

Utilisez Node.js 24.15 ou plus récent. Les vérifications locales et automatiques utilisent Node.js 24.

```sh
npm ci
npm run dev
```

Ouvrez [localhost:3000](http://localhost:3000). Vous n’avez besoin ni de compte, ni de base de données, ni de variable d’environnement.

Pour lancer la version de production :

```sh
npm run build
npm start
```

## Scripts

| Script              | Usage                                          |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Développement avec Next.js                     |
| `npm run build`     | Compilation de production                      |
| `npm start`         | Serveur de production                          |
| `npm run lint`      | Analyse du code avec ESLint                    |
| `npm run typecheck` | Vérification TypeScript                        |
| `npm test`          | Tests de validation et d’intégrité des données |
| `npm run check`     | Lint, types, tests et compilation              |

Pour les tests navigateur, installez Chromium une première fois avec `npx playwright install chromium`, puis lancez `npm run check:all`. Playwright démarre un serveur de production isolé sur le port 4318 (modifiable avec `E2E_PORT`) ; la compilation doit donc précéder `npm run test:e2e`.

La CI lance `npm run check:all`. Les tests couvrent notamment zéro, les bornes numériques, les cases obligatoires, les emails facultatifs, l’isolation des réponses, les modèles et leurs copies, les schémas successifs du CSV, la protection contre les formules, les moyennes, les données malformées et les erreurs de stockage. Les parcours navigateur vérifient les types de champs, les réglages invalides, les copies persistées, les filtres et téléchargements, la suppression d’une réponse filtrée, le clavier, les écrans de 1440, 800, 390 et 320 pixels, les sauvegardes simultanées entre deux onglets, la conservation d’un brouillon périmé et les doubles soumissions.

## Stack et organisation

Next.js 16, React 19, TypeScript 6 et Tailwind CSS 4. Le glisser-déposer utilise `@hello-pangea/dnd`. Les boutons et les champs reprennent les composants shadcn/ui ; les champs sont regroupés dans une palette de réglages.

L’interface associe une navigation horizontale, une barre de commandes visible pendant l’édition, un document clair et une palette de réglages à droite. Sur mobile, le document passe en premier dès qu’il contient un champ. Le bouton « + Champ » donne accès aux réglages, et la barre de commandes reste visible pendant le défilement. La bibliothèque de modèles s’ouvre depuis cette barre. Aucun compte n’est nécessaire. IBM Plex Sans et IBM Plex Mono sont servies localement ; leurs licences sont dans `licenses/`.

- `app/page.tsx` : navigation et composition des vues.
- `components/forms/` : éditeur, listes et affichage des champs.
- `lib/use-form-generator.ts` : état du formulaire et actions de l’utilisateur.
- `lib/storage.ts` : lecture, écriture et export du stockage local.
- `lib/forms.ts` : types, validation, création des champs et lecture des données.
- `lib/productivity.ts` : modèles, copies indépendantes, filtrage, synthèse et CSV.
- `components/ui/` : boutons et champs de saisie.
- `tests/` : tests métier.

TypeScript 6 est conservé car le parseur typescript-eslint ne prend pas encore en charge TypeScript 7. Les versions exactes installées sont enregistrées dans `package-lock.json`.

## Stockage et limites

Les données restent dans `localStorage`, sous les clés `allForms` et `allAnswers`. Un verrou Web Locks sérialise les sauvegardes de l’application entre les onglets du même navigateur. Chaque écriture compare ensuite la collection enregistrée à la version attendue ; en cas de conflit, le brouillon est conservé et l’utilisateur peut réessayer ou l’exporter. Une édition ouverte avant une modification ou une suppression ne peut pas remplacer la nouvelle version. Une double soumission de la même réponse n’ajoute qu’un enregistrement ; une nouvelle réponse volontaire reste possible.

L’enregistrement requiert Web Locks dans un navigateur récent, sur HTTPS ou localhost. Sans ce mécanisme, la lecture et l’export restent disponibles. Les données ne sont pas synchronisées entre appareils. Effacer les données du navigateur les supprime ; exportez régulièrement une copie. Le JSON exporté peut contenir les informations saisies dans les réponses.

Pour un champ fichier, l’application enregistre uniquement le nom du fichier. Elle ne téléverse et ne conserve pas son contenu.

Les réponses conservent le schéma du formulaire au moment de la saisie. Renommer ou supprimer un champ ensuite ne change pas les anciennes réponses. Le CSV réunit ces schémas en colonnes, avec un séparateur point-virgule et une marque UTF-8 pour les tableurs. Une cellule ressemblant à une formule est précédée d’une apostrophe pour rester du texte ; son contenu brut reste disponible dans le JSON. Les moyennes portent sur les nombres et curseurs des réponses filtrées, en excluant les champs vides, par formulaire et version du libellé. Un fichier CSV peut contenir des données personnelles saisies dans les réponses.

Les modèles et les copies sont d’abord des brouillons : ils ne modifient pas les formulaires enregistrés et doivent être sauvegardés. Les réglages d’un champ doivent être appliqués ou annulés avant de sauvegarder le formulaire. Un changement de document demande confirmation si une saisie reste non enregistrée. Le navigateur prévient aussi avant de quitter la page. Les brouillons ne survivent pas à un rechargement confirmé ; leur export reste disponible.

L’import accepte les exports de formulaires conformes au schéma actuel et les fichiers de moins de 1 Mo. Les réponses et la sauvegarde brute ne sont pas importées par cet outil. Des anciennes données malformées, notamment les objets fichier de l’ancienne version, bloquent les écritures pour éviter d’écraser leur contenu. La sauvegarde brute permet de les récupérer avant une réinitialisation manuelle du stockage.

L’application ne publie pas de lien de formulaire partagé et ne propose pas de collecte distante. Chaque réponse est remplie et enregistrée dans le navigateur qui ouvre le projet.
