# Roadmap coordonnée — toutes les sections

Objectif : plusieurs contributions indépendantes, intégrées progressivement au produit. Un responsable par mission, une branche par livraison. Les agents vérifient TASKS.md avant de commencer ; ils ne reprennent pas un lot déjà livré.

| Section | Prochain résultat concret | Dépendances / pilote |
|---|---|---|
| Infrastructure / navigation | Maintenir build, CI, mobile et contrats de modules | Intégrateur |
| Profil / dashboard | Données cohérentes et export ; éviter les doubles saisies | Intégrateur, profil privé existant |
| Activité / employeurs | Contrat persistant, édition et historique | Intégrateur, stockage local versionné |
| Calendrier | Événements issus de l'activité, mois et filtres | Activité |
| Simulations / droits | Cas sourcés et limites explicites, réglementation datée | Intégrateur ; ne pas publier le moteur privé |
| Auth / DB / organisations | Sessions, identités, memberships et tests d'isolation | Avant tout service multi-utilisateur |
| Documents / coffre | Import local, métadonnées, suppression/export | SPEC-DOCS-01, puis adaptateur local |
| OCR | Extraction proposée puis validée, provenance conservée | Coffre ; consentement cloud séparé |
| IA | Appels d'outils déterministes et explications | Contrats de services, sources et permissions |
| Jobs / castings | Sources autorisées, filtres et favoris | SPEC-JOBS-01 puis contrat partagé |
| Communauté / chat | Conversations et messages testés | CHAT-01 ; backend réel ensuite |
| Marketplace | Catalogue et création démo existants, revue ciblée | MARKET-02 ; chat/auth pour usage réel |
| PRO | Organisations, production, équipes, disponibilité | Auth/memberships + calendrier |
| Fiscalité / dépenses | Saisie et justificatifs avant moteur fiscal | Coffre ; barèmes sourcés séparément |
| Site public / médias | Contenus utiles et description fidèle aux fonctions livrées | Pas de promesse de produit non construit |

## Missions prêtes maintenant
Claude : CHAT-01. DeepSeek : MARKET-02. Gemini : SPEC-DOCS-01. Grok : SPEC-JOBS-01. QA-01 reste disponible pour une revue indépendante après livraison, sans concurrent sur les mêmes dossiers.
Les noms indiquent une répartition proposée au fondateur, pas une exécution en cours. Rien ne se lance sans son signal dans l'outil concerné.

## Règle d'intégration
Ne pas créer un backend, une auth ou un nouveau design par section. Les services partagés sont conçus une seule fois par l'intégrateur. Les propositions de contrats arrivent avant les implémentations qui en dépendent. Chaque lot doit avoir critères vérifiables et limites indiquées.
