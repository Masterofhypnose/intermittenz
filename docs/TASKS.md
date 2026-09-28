# Tableau de missions — 28 septembre 2026

| ID | Responsable prévu | Statut | Périmètre |
|---|---|---|---|
| CHAT-01 | Claude puis intégrateur | ZIP reçu, corrigé et testé — [PR #3](https://github.com/Masterofhypnose/intermittenz/pull/3) ouverte ; branché sur la preview privée, ne pas refaire | Conversations démo, pagination, brouillons, envoi local et 7 tests réels |
| MARKET-01 | DeepSeek via le fondateur puis intégrateur | Livré, corrigé et testé | Marketplace présente dans cet atelier |
| MARKET-02 | DeepSeek puis intégrateur | CI atelier verte ; report identique dans la branche privée de preview, 13 tests privés réussis — [PR #2](https://github.com/Masterofhypnose/intermittenz/pull/2) publique ouverte, ne pas refaire | Focus au retour catalogue, pagination conservée et favoris isolés par service |
| JOBS-01 | Grok puis intégrateur | Livré, corrigé et testé — [PR #4](https://github.com/Masterofhypnose/intermittenz/pull/4), CI publique verte au commit 0ce33c8 ; intégré sur la branche privée de preview (7eb3950), 26 tests locaux réussis ; ne pas refaire | Catalogue, dates/rémunération, fiche, favoris et 6 tests réels |
| SPEC-ACTIVITY-01 | Claude puis intégrateur | Reçue et amendée — [PR #6](https://github.com/Masterofhypnose/intermittenz/pull/6), base normative pour CODE-ACTIVITY-01 ; ne pas refaire | Contrat activité/calendrier et persistance locale |
| SPEC-DOCS-01 | Gemini | Prêt à lancer — [brief complet](missions/SPEC-DOCS-01.md) | Coffre local : spécification et contrat proposés |
| QA-DISPLAY-01 | DeepSeek puis intégrateur | Rapport reçu et [trié](reviews/QA-DISPLAY-01.md), correctifs appliqués aux PR #2/#3/#4 et preview privée ; 26 tests privés et 19 tests atelier locaux réussis. Visuel/lecteur d’écran non exécutés ; ne pas refaire cette revue statique | Titres longs, largeur Chat, filtres Jobs accessibles |
| SPEC-SOURCES-01 | Grok puis intégrateur | Reçue, revue et amendée — [PR #5](https://github.com/Masterofhypnose/intermittenz/pull/5) ouverte ; documentation officielle partiellement vérifiée, aucun compte/API activé ; ne pas refaire | Sources et mapping conservateur, cycle de vie sans retrait déduit d’une recherche |

Une mission n'est pas attribuée ou lancée automatiquement par ce tableau. Vérifier les PR ouvertes pour éviter les doublons ; ne pas prendre deux missions qui modifient les mêmes fichiers.

QA-01 historique : [rapport Grok reçu et trié](reviews/QA-01.md). Revue statique de main, sans SHA exact ni exécution. Les points focus/pagination sont déjà corrigés dans MARKET-02 ; ne pas refaire. La mission active est QA-DISPLAY-01, sur ses PR épinglées.

## Sections supplémentaires prêtes à spécifier
- SPEC-DOCS-01 → Gemini : docs/missions/SPEC-DOCS-01.md. Livrable limité à docs/proposals/documents.md. Prêt, non lancé.
- SPEC-JOBS-01 → Grok : docs/missions/SPEC-JOBS-01.md. Livrable reçu via le fondateur, revu et déposé dans [PR #1](https://github.com/Masterofhypnose/intermittenz/pull/1). Revue Grok reçue : aucun blocage restant au commit 763792b. PR non fusionnée ; base validée pour le module isolé JOBS-01. Ne pas refaire la mission.

La couverture des autres sections et leurs dépendances se trouve dans [ROADMAP.md](ROADMAP.md). Les spécifications évitent que chaque contributeur crée sa propre auth, base ou architecture.

## Répartition du 28 septembre
Chaque agent prend uniquement sa ligne ci-dessus. QA-01 générique est remplacée par QA-DISPLAY-01. Le fondateur déclenche les agents dans leurs propres conversations ; le dépôt ne les pilote pas. L’intégrateur garde la jauge 507h et le shell privé. Aucun besoin d’accès au produit privé pour ces quatre missions. Relire ce tableau avant de commencer ; ne pas reprendre CHAT-01, MARKET-02 ou JOBS-01 déjà livrés.

## Développement activité
| ID | Responsable | Statut | Sources |
|---|---|---|---|
| CODE-ACTIVITY-01 | Claude | Prêt à lancer par le fondateur ; aucune exécution encore confirmée | [Mission](missions/CODE-ACTIVITY-01.md), [dossier autonome complet](agent-packs/CODE-ACTIVITY-01.md) |

## Actualités — nouvelle mission préparée
| ID | Responsable prévu | Statut | Livrable |
|---|---|---|---|
| SPEC-NEWS-01 | Grok | Prêt à lancer par le fondateur ; aucune exécution confirmée | [Brief autonome complet](missions/SPEC-NEWS-01.md) ; docs/proposals/news-sources.md |

Objectif : valider un flux officiel réellement accessible pour l’onglet Actualités et son aperçu dashboard. La première version du produit utilise une sélection éditoriale explicitement datée, pas un RSS automatique. Aucun accès privé requis. Claude garde CODE-ACTIVITY-01, Gemini SPEC-DOCS-01 ; ne pas refaire les livraisons déjà intégrées.
