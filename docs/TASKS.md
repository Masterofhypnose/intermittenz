# Tableau de missions — 26 septembre 2026

| ID | Responsable prévu | Statut | Périmètre |
|---|---|---|---|
| CHAT-01 | Claude, lancé par le fondateur | Brief transmis, code pas encore reçu | components/chat, lib/chat, tests/chat*.test.mjs |
| MARKET-01 | DeepSeek via le fondateur puis intégrateur | Livré, corrigé et testé | Marketplace présente dans cet atelier |
| MARKET-02 | DeepSeek puis intégrateur | Livré, corrigé et testé — [PR #2](https://github.com/Masterofhypnose/intermittenz/pull/2) ouverte, ne pas refaire | Focus au retour catalogue, pagination conservée et favoris isolés par service |
| QA-01 | Gemini ou Grok | Disponible, non lancé | Rapport docs/reviews/QA-01.md, pas de modifications applicatives |

Une mission n'est pas attribuée ou lancée automatiquement par ce tableau. Vérifier les PR ouvertes pour éviter les doublons ; ne pas prendre deux missions qui modifient les mêmes fichiers.

QA-01 : lancer l'atelier, lire les contrats, tester mobile 390px/desktop 1280px, clavier, recherche sans résultat, erreurs favoris, création et retour catalogue. Rapport avec étapes reproductibles, attendu/observé, gravité et captures si possible. Pas de calcul réglementaire à auditer ici. Dire explicitement si aucun navigateur ou exécuteur n'est disponible.

## Sections supplémentaires prêtes à spécifier
- SPEC-DOCS-01 → Gemini : docs/missions/SPEC-DOCS-01.md. Livrable limité à docs/proposals/documents.md. Prêt, non lancé.
- SPEC-JOBS-01 → Grok : docs/missions/SPEC-JOBS-01.md. Livrable reçu via le fondateur, revu et déposé dans [PR #1](https://github.com/Masterofhypnose/intermittenz/pull/1). Proposition en revue, pas encore fusionnée ; ne pas refaire la mission.

La couverture des autres sections et leurs dépendances se trouve dans [ROADMAP.md](ROADMAP.md). Les spécifications évitent que chaque contributeur crée sa propre auth, base ou architecture.
