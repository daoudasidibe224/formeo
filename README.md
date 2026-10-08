# Atelier de formulaires

Dépôt : `FormGenerator`.

Créez des formulaires et recueillez leurs réponses dans votre navigateur. L’éditeur permet d’ajouter des champs, de les réordonner et de tester le résultat avant de l’enregistrer.

## Fonctionnalités

- Neuf types de champs : texte, email, nombre, date, liste déroulante, choix unique, cases à cocher, curseur et fichier.
- Champs obligatoires, options configurables et bornes numériques, y compris les nombres négatifs.
- Réorganisation par glisser-déposer, au clavier avec la poignée, ou avec les boutons de déplacement.
- Enregistrement, modification, recherche et suppression de formulaires.
- Réponses indépendantes avec validation des champs et conservation de la casse des textes.
- Export JSON des formulaires et des réponses, import de formulaires sans écraser ceux qui existent déjà.
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

La CI lance `npm run check:all`. Les tests couvrent notamment zéro, les bornes numériques, les cases obligatoires, les emails facultatifs, l’isolation des réponses, les données malformées et les erreurs de stockage. Les parcours navigateur vérifient les neuf types de champs, les imports et exports, le clavier, les écrans de 1440, 390 et 320 pixels, les sauvegardes simultanées entre deux onglets, la conservation d’un brouillon périmé et les doubles soumissions.

## Stack et organisation

Next.js 16, React 19, TypeScript 6 et Tailwind CSS 4. Le glisser-déposer utilise `@hello-pangea/dnd`. Les boutons et les champs reprennent les composants shadcn/ui ; la carte interactive vient de [React Bits](https://reactbits.dev/components/spotlight-card). Sa licence est conservée dans `licenses/react-bits.md`.

L’interface prend la forme d’un bureau de conception : palette sombre, document sur quadrillage et registre des formulaires. IBM Plex Sans et IBM Plex Mono sont servies localement ; leurs licences sont dans `licenses/`.

- `app/page.tsx` : navigation et composition des vues.
- `components/forms/` : éditeur, listes et affichage des champs.
- `lib/use-form-generator.ts` : état du formulaire et actions de l’utilisateur.
- `lib/storage.ts` : lecture, écriture et export du stockage local.
- `lib/forms.ts` : types, validation, création des champs et lecture des données.
- `components/ui/` : boutons et champs de saisie.
- `components/react-bits/` : carte interactive.
- `tests/` : tests métier.

TypeScript 6 est conservé car le parseur typescript-eslint ne prend pas encore en charge TypeScript 7. Les versions exactes installées sont enregistrées dans `package-lock.json`.

## Stockage et limites

Les données restent dans `localStorage`, sous les clés `allForms` et `allAnswers`. Un verrou Web Locks sérialise les sauvegardes de l’application entre les onglets du même navigateur. Chaque écriture compare ensuite la collection enregistrée à la version attendue ; en cas de conflit, le brouillon est conservé et l’utilisateur peut réessayer ou l’exporter. Une édition ouverte avant une modification ou une suppression ne peut pas remplacer la nouvelle version. Une double soumission de la même réponse n’ajoute qu’un enregistrement ; une nouvelle réponse volontaire reste possible.

L’enregistrement requiert Web Locks dans un navigateur récent, sur HTTPS ou localhost. Sans ce mécanisme, la lecture et l’export restent disponibles. Les données ne sont pas synchronisées entre appareils. Effacer les données du navigateur les supprime ; exportez régulièrement une copie. Le JSON exporté peut contenir les informations saisies dans les réponses.

Pour un champ fichier, l’application enregistre uniquement le nom du fichier. Elle ne téléverse et ne conserve pas son contenu.

L’import accepte les exports de formulaires conformes au schéma actuel et les fichiers de moins de 1 Mo. Les réponses et la sauvegarde brute ne sont pas importées par cet outil. Des anciennes données malformées, notamment les objets fichier de l’ancienne version, bloquent les écritures pour éviter d’écraser leur contenu. La sauvegarde brute permet de les récupérer avant une réinitialisation manuelle du stockage.

L’application ne publie pas de lien de formulaire partagé et ne propose pas de collecte distante. Chaque réponse est remplie et enregistrée dans le navigateur qui ouvre le projet.
