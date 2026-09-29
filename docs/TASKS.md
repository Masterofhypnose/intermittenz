# Tableau de missions — 28 septembre 2026

| ID | Responsable prévu | Statut | Périmètre |
|---|---|---|---|
| CHAT-01 | Claude puis intégrateur | ZIP reçu, corrigé et testé — [PR #3](https://github.com/Masterofhypnose/intermittenz/pull/3) ouverte ; branché sur la preview privée, ne pas refaire | Conversations démo, pagination, brouillons, envoi local et 7 tests réels |
| MARKET-01 | DeepSeek via le fondateur puis intégrateur | Livré, corrigé et testé | Marketplace présente dans cet atelier |
| MARKET-02 | DeepSeek puis intégrateur | CI atelier verte ; report identique dans la branche privée de preview, 13 tests privés réussis — [PR #2](https://github.com/Masterofhypnose/intermittenz/pull/2) publique ouverte, ne pas refaire | Focus au retour catalogue, pagination conservée et favoris isolés par service |
| JOBS-01 | Grok puis intégrateur | Livré, corrigé et testé — [PR #4](https://github.com/Masterofhypnose/intermittenz/pull/4), CI publique verte au commit 0ce33c8 ; intégré sur la branche privée de preview (7eb3950), 26 tests locaux réussis ; ne pas refaire | Catalogue, dates/rémunération, fiche, favoris et 6 tests réels |
| SPEC-ACTIVITY-01 | Claude puis intégrateur | Reçue et amendée — [PR #6](https://github.com/Masterofhypnose/intermittenz/pull/6), base normative pour CODE-ACTIVITY-01 ; ne pas refaire | Contrat activité/calendrier et persistance locale |
| SPEC-DOCS-01 | Gemini | Accès GitHub indisponible ; dossier autonome préparé — [pack](agent-packs/SPEC-DOCS-01.md) | Coffre local : spécification et contrat proposés |
| QA-DISPLAY-01 | DeepSeek puis intégrateur | Rapport reçu et [trié](reviews/QA-DISPLAY-01.md), correctifs appliqués aux PR #2/#3/#4 et preview privée ; 26 tests privés et 19 tests atelier locaux réussis. Visuel/lecteur d’écran non exécutés ; ne pas refaire cette revue statique | Titres longs, largeur Chat, filtres Jobs accessibles |
| SPEC-SOURCES-01 | Grok puis intégrateur | Reçue, revue et amendée — [PR #5](https://github.com/Masterofhypnose/intermittenz/pull/5) ouverte ; documentation officielle partiellement vérifiée, aucun compte/API activé ; ne pas refaire | Sources et mapping conservateur, cycle de vie sans retrait déduit d’une recherche |

Une mission n'est pas attribuée ou lancée automatiquement par ce tableau. Vérifier les PR ouvertes pour éviter les doublons ; ne pas prendre deux missions qui modifient les mêmes fichiers.

QA-01 historique : [rapport Grok reçu et trié](reviews/QA-01.md). Revue statique de main, sans SHA exact ni exécution. Les points focus/pagination sont déjà corrigés dans MARKET-02 ; ne pas refaire. QA-DISPLAY-01 est également clôturée côté revue statique ; ne pas la relancer.

## Sections supplémentaires prêtes à spécifier
- SPEC-DOCS-01 → Gemini : docs/missions/SPEC-DOCS-01.md. Livrable limité à docs/proposals/documents.md. Dossier autonome préparé ; démarrage non confirmé.
- SPEC-JOBS-01 → Grok : docs/missions/SPEC-JOBS-01.md. Livrable reçu via le fondateur, revu et déposé dans [PR #1](https://github.com/Masterofhypnose/intermittenz/pull/1). Revue Grok reçue : aucun blocage restant au commit 763792b. PR non fusionnée ; base validée pour le module isolé JOBS-01. Ne pas refaire la mission.

La couverture des autres sections et leurs dépendances se trouve dans [ROADMAP.md](ROADMAP.md). Les spécifications évitent que chaque contributeur crée sa propre auth, base ou architecture.

## Répartition du 28 septembre
Chaque agent prend uniquement sa ligne ci-dessus. QA-01 générique est remplacée par QA-DISPLAY-01. Le fondateur déclenche les agents dans leurs propres conversations ; le dépôt ne les pilote pas. L’intégrateur garde la jauge 507h et le shell privé. Aucun besoin d’accès au produit privé pour ces quatre missions. Relire ce tableau avant de commencer ; ne pas reprendre CHAT-01, MARKET-02 ou JOBS-01 déjà livrés.

## Développement activité
| ID | Responsable | Statut | Sources |
|---|---|---|---|
| CODE-ACTIVITY-01 | Claude | En pause : quota Claude à nouveau atteint. Avancement du code à récupérer ; mission conservée chez Claude, pas de réattribution | [Mission](missions/CODE-ACTIVITY-01.md), [dossier autonome complet](agent-packs/CODE-ACTIVITY-01.md) |

## Actualités — nouvelle mission préparée
| ID | Responsable prévu | Statut | Livrable |
|---|---|---|---|
| SPEC-NEWS-01 | Grok puis intégrateur | Reçue et amendée — [PR #8](https://github.com/Masterofhypnose/intermittenz/pull/8), flux Service Public vérifié par GET/XML ; pas de code ni déploiement. Ne pas refaire | docs/proposals/news-sources.md |

Objectif : valider un flux officiel réellement accessible pour l’onglet Actualités et son aperçu dashboard. La première version du produit utilise une sélection éditoriale explicitement datée, pas un RSS automatique. Aucun accès privé requis. Claude garde CODE-ACTIVITY-01 ; DeepSeek a livré SPEC-DECLARATIONS-01 ; Gemini garde SPEC-DOCS-01 ; ne pas refaire les livraisons déjà intégrées.

## Priorités actives — mise à jour après retour des agents
1. Claude : CODE-ACTIVITY-01 en pause quota ; conserver son travail et récupérer l’avancement avant tout relais.
2. DeepSeek : **CODE-EXPENSES-01**, reçu, corrigé et testé — [PR #9](https://github.com/Masterofhypnose/intermittenz/pull/9) ouverte, commit b390e3bd57c7672aa98168a8eb0f05a29928c52d. 22 tests du noyau et 19 tests existants locaux réussis ; lint/typecheck/build réussis. CI GitHub en cours au dépôt. Aucun écran ou stockage raccordé au privé ; ne pas refaire. Sa SPEC-DECLARATIONS-01 est reçue en PR #7, ne pas refaire.
3. Grok : **CODE-NEWS-CORE-01**, prêt à lancer avec le [dossier autonome](agent-packs/CODE-NEWS-CORE-01.md). SPEC-NEWS-01 reçue en PR #8, ne pas refaire. Transport XML/cache/raccordement restent distincts.
4. Gemini : **SPEC-DOCS-01**, accès dépôt indisponible ; [dossier autonome à joindre](agent-packs/SPEC-DOCS-01.md), sans navigation GitHub obligatoire.
5. Intégrateur : réception, tests et raccordement privé. Le produit conserve actuellement ses actualités éditoriales.

Chaque dossier contient les consignes, le statut et les sources nécessaires. Ne pas demander au fondateur de recopier TASKS à nouveau. Missions préparées, exécution non confirmée ; le fondateur transmet les dossiers dans chaque conversation. Aucune fusion ni activation de flux n’est réalisée par cette mise à jour.

## Déclarations — réception du 28 septembre
SPEC-DECLARATIONS-01 : contribution DeepSeek amendée ; choix tranchés, rapprochement avec la spec Activité et correction des fonctions déjà présentes. Types proposés contrôlés par tsc ; aucun test applicatif ou nouvelle lecture fiscale dans ce lot documentaire. Le développement du journal nécessite une mission de code séparée avec méthodes de service figées. Les agents n’ont pas à demander les sources privées pour reprendre cette proposition publique.

## Actualités — réception du 28 septembre
Grok : proposition reçue. Intégrateur : documentation Service Public relue, GET HTTP200 et XML RSS2.0/10 éléments/ttl60 vérifiés. Spécification revue : hôtes distincts récupération/liens, normalisation des identités, dates et cache non durable. Types proposés contrôlés par tsc ; aucun connecteur applicatif ou test UI de ce flux exécuté. Le produit conserve la sélection éditoriale jusqu’à intégration du futur lot code.

## Réception CODE-EXPENSES-01 — 29 septembre
Contribution DeepSeek intégrée après correction des parsers, horodatages, références et tests. Note dans docs/deliveries/CODE-EXPENSES-01.md sur la branche de PR #9. DeepSeek n’a pas exécuté de commande ; les résultats locaux ci-dessus sont ceux de l’intégrateur. Pas de nouvelle mission CRUD attribuée par cette réception.
