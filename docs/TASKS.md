# Tableau de missions — 28 septembre 2026

| ID | Responsable prévu | Statut | Périmètre |
|---|---|---|---|
| CHAT-01 | Claude puis intégrateur | ZIP reçu, corrigé et testé — [PR #3](https://github.com/Masterofhypnose/intermittenz/pull/3) ouverte ; branché sur la preview privée, ne pas refaire | Conversations démo, pagination, brouillons, envoi local et 7 tests réels |
| MARKET-01 | DeepSeek via le fondateur puis intégrateur | Livré, corrigé et testé | Marketplace présente dans cet atelier |
| MARKET-02 | DeepSeek puis intégrateur | CI atelier verte ; report identique dans la branche privée de preview, 13 tests privés réussis — [PR #2](https://github.com/Masterofhypnose/intermittenz/pull/2) publique ouverte, ne pas refaire | Focus au retour catalogue, pagination conservée et favoris isolés par service |
| JOBS-01 | Grok puis intégrateur | Livré, corrigé et testé — [PR #4](https://github.com/Masterofhypnose/intermittenz/pull/4), CI publique verte au commit 0ce33c8 ; intégré sur la branche privée de preview (7eb3950), 26 tests locaux réussis ; ne pas refaire | Catalogue, dates/rémunération, fiche, favoris et 6 tests réels |
| SPEC-ACTIVITY-01 | Claude | Prêt à lancer — [brief complet](missions/SPEC-ACTIVITY-01.md) | Activité/calendrier : spécification et contrat proposés |
| SPEC-DOCS-01 | Gemini | Prêt à lancer — [brief complet](missions/SPEC-DOCS-01.md) | Coffre local : spécification et contrat proposés |
| QA-DISPLAY-01 | DeepSeek | Prêt à lancer — [brief complet](missions/QA-DISPLAY-01.md) | Revue visuelle ou statique explicite des PR publiques |
| SPEC-SOURCES-01 | Grok | Prochaine mission après réception de QA-01 — prêt à lancer — [brief complet](missions/SPEC-SOURCES-01.md) | Sources officielles et mapping des offres réelles |

Une mission n'est pas attribuée ou lancée automatiquement par ce tableau. Vérifier les PR ouvertes pour éviter les doublons ; ne pas prendre deux missions qui modifient les mêmes fichiers.

QA-01 historique : [rapport Grok reçu et trié](reviews/QA-01.md). Revue statique de main, sans SHA exact ni exécution. Les points focus/pagination sont déjà corrigés dans MARKET-02 ; ne pas refaire. La mission active est QA-DISPLAY-01, sur ses PR épinglées.

## Sections supplémentaires prêtes à spécifier
- SPEC-DOCS-01 → Gemini : docs/missions/SPEC-DOCS-01.md. Livrable limité à docs/proposals/documents.md. Prêt, non lancé.
- SPEC-JOBS-01 → Grok : docs/missions/SPEC-JOBS-01.md. Livrable reçu via le fondateur, revu et déposé dans [PR #1](https://github.com/Masterofhypnose/intermittenz/pull/1). Revue Grok reçue : aucun blocage restant au commit 763792b. PR non fusionnée ; base validée pour le module isolé JOBS-01. Ne pas refaire la mission.

La couverture des autres sections et leurs dépendances se trouve dans [ROADMAP.md](ROADMAP.md). Les spécifications évitent que chaque contributeur crée sa propre auth, base ou architecture.

## Répartition du 28 septembre
Chaque agent prend uniquement sa ligne ci-dessus. QA-01 générique est remplacée par QA-DISPLAY-01. Le fondateur déclenche les agents dans leurs propres conversations ; le dépôt ne les pilote pas. L’intégrateur garde la jauge 507h et le shell privé. Aucun besoin d’accès au produit privé pour ces quatre missions. Relire ce tableau avant de commencer ; ne pas reprendre CHAT-01, MARKET-02 ou JOBS-01 déjà livrés.
