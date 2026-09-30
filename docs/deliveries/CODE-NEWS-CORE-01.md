# CODE-NEWS-CORE-01 — livraison Grok revue

29 septembre 2026. Contribution Grok transmise intégralement par le fondateur, revue et corrigée par l’intégrateur. Base pack b801707 ; spec PR #8 ee9c1ffcc2107f6948800bc585fc5fc9368d014e ; base de PR c30b2ef237c796f3ef6e19cbea55807648b1da41.

## Fichiers et exports

Cinq fichiers : lib/news-core/{types,normalize,index}.ts, tests/news-core.test.mjs, cette note. Exports : NewsCategory, NewsPublisher, NewsBase, NewsItem, RawNewsEntry, NormalizeResult ; normalizeNewsEntries, normalizeArticleUrl, classifyNewsTitle, NewsCoreError.

## Comportement

Fonctions pures : titre NFC/trim/espaces, HTTPS et hôtes exacts Service Public, identité par URL canonique, suppression de xtor/fragment, dates avec fuseau, catégories déterministes, doublons et tri. Aucune description distante, aucun HTML interprété. Liste vide valide ; entrées toutes invalides : invalid_feed ; paramètres invalides : validation. Dates inconnues omises sans utiliser fetchedAt comme publication.

## Corrections de l’intégrateur

- Copie initiale abîmée remplacée par les cinq fichiers complets transmis séparément. Aucun morceau tronqué n’a été validé comme code exploitable.
- RFC : le contrôle reçu comparait un ISO déjà normalisé et ne pouvait pas refuser un 30 février. Parsing explicite des composants et validation calendaire avant application du fuseau, vérification du jour de semaine s’il est présent. Formats acceptés : jour de semaine optionnel, jour/mois anglais/année quatre chiffres, heure:minute[:seconde], GMT/UT ou offset numérique ±HHMM/±HH:MM. Formats ambigus omis.
- ISO : même validation calendaire, y compris années 00–99 sans le décalage implicite de Date.UTC ; offsets invalides refusés. Fractions de seconde normalisées à la précision milliseconde de toISOString.
- URL : limite sur la chaîne reçue avant trim, puis sur la forme canonique encodée.
- Catégories : liste exacte de la spec ; variantes sans accents ajoutées par Grok retirées pour ne pas modifier silencieusement la liste de motifs.
- Test titre vide : remplacé l’assertion sur un retour inexistant par une assertion de rejet invalid_feed. Tests renforcés : dates RFC impossibles, fuseaux, limites, égalités, non-mutation, compteurs, texte hostile littéral.

## Vérifications

Grok : aucune commande exécutée, aucun accès écriture GitHub.
Intégrateur : lint, typecheck, build et npm test réussis sous Node 24.19.0. 56 tests réussis dans l’atelier local combiné, dont 15 pour ce noyau. Dépendances installées par npm ci lors du lot précédent le même jour ; aucun changement de package/lockfile depuis. La CI de la PR vérifie séparément ces cinq fichiers sur main.

## Limites

HTTP, parseur XML, cache, UI, déploiement et contrats partagés hors lot. Ce code reçoit des entrées déjà extraites du XML : il ne récupère pas le flux et n’est pas une protection XXE. Aucun branchement automatique dans le produit privé. La sélection éditoriale actuelle reste en place. Fixtures synthétiques seulement, aucun article réel recopié.
