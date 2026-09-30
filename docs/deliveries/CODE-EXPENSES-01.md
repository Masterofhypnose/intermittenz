# CODE-EXPENSES-01 — réception et intégration

29 septembre 2026. Contribution DeepSeek transmise par le fondateur, relue et corrigée par l’intégrateur. DeepSeek n’a exécuté aucune commande. Base publique d’intégration : b801707e4e273792590cab8aab9193df9adc36f4 ; proposition PR #7 f6113ffa4cde7e97f23e8b9db42e9d2a78a42a00.

## Périmètre

Six fichiers : lib/expense-journal/{types,validation,summary,index}.ts, tests/expense-journal.test.mjs et cette note. Types locaux, parsers exacts, validation runtime et totaux documentaires annuels uniquement. Aucun stockage, interface, import/export exécutable, barème, connexion Activité ou modification privée. Les DTO d’import restent des types de la proposition, pas une fonction implémentée.

## Écarts corrigés à réception

- Le code reçu utilisait `overflow` avec un type d’erreur qui ne l’autorisait pas. Le noyau accepte désormais ce code sans étendre le contrat partagé.
- Les parsers acceptaient `5,` / `5.` et jetaient Error sans propriété code. Ils rejettent désormais ces formats et retournent une erreur codée avec issues. Accumulation de chiffres entiers, limites exactes de MAX_SAFE_INTEGER.
- Le contrôle des timestamps comparait deux normalisations identiques : il acceptait notamment une date impossible normalisée par Date.parse. Comparaison au texte original UTC canonique exigée.
- revenueYear du résumé n’était pas validé ; références de voitures des brouillons ignorées ; tableaux creux ignorés par forEach : validation explicite ajoutée.
- Tri des voitures par label contrairement au brief : tri par vehicleId. selectedDistanceMeters réellement absent en mode unselected.
- Les agrégations utilisent des maps par voiture plutôt que refiltrer tous les trajets pour chaque voiture. Entrées et champs copiés explicitement ; textes normalisés sans mutation.
- Les filtres de tableaux ne garantissaient pas le rétrécissement du type discriminant pour leurs usages suivants : agrégation après contrôle explicite de state.
- Deux tests reçus étaient incorrects : fixture ignorant createdAt/updatedAt et assertion `200000 + 1000000 != 1200000`. Cas corrigés, couverture renforcée ; aucun résultat « 33 tests » repris sans exécution.

Précision de frontière : dates civiles/revenueYear 2000–2100 ; declarationYear est l’année suivante, donc 2101 autorisée pour revenus 2100. Borne de produit, aucune règle fiscale nouvelle. Les notes sont trim avant contrôle de longueur.

## Validation de l’intégrateur

Exécuté localement avec Node 24.19.0 : npm ci --prefer-offline --no-audit --no-fund, npm run lint, npm run typecheck, npm run build et npm test : succès. 22 tests du journal + 19 tests existants = 41 tests réussis dans l’atelier local combinant les branches de modules. La PR ne contient que les six fichiers de ce lot ; la CI contrôlera séparément leur combinaison avec main. Aucun test visuel ou calcul fiscal dans ce lot pur.

## Suite

Noyau proposé en PR publique, sans merge et sans déploiement. CRUD/persistance nécessitent un brief dédié. Ne pas présenter ce noyau comme un journal utilisable dans la preview privée.
