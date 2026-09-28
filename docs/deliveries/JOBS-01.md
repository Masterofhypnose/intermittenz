# JOBS-01 — livraison revue et intégrée

28 septembre 2026. Contribution Grok transmise par le fondateur ; corrections et validation par l’intégrateur.
Base publique vérifiée : e5b2588df251b24868f122115bff87e7f04cf5dd.
Spécification : 763792b43f13bcb3d4abfaed875734cad79ced1b, docs/proposals/jobs.md (PR #1, non fusionnée).

## Périmètre
lib/jobs/types.ts, lib/jobs/demoService.ts, components/jobs/JobsModule.tsx, components/jobs/Jobs.module.css, components/jobs/index.ts, tests/jobs.test.mjs. Raccordement app/page.tsx effectué par l’intégrateur.
Contrats partagés, dépendances, autres modules et calculs privés inchangés.

## Corrections de la contribution
Syntaxe TSX réparée ; filtres rémunération ajoutés dans les options avancées ; focus rendu au bouton de fiche remonté ; pages conservées au retour ; requêtes catalogue/détail séparées ; changement de service isolant les favoris et leurs verrous. Liens HTTPS sans identifiants uniquement en mode connecté, aucune candidature en démo.
Validation des dates réelles et seuils avant filtrage, même sur catalogue vide. Horloge unique par opération. Tri par instant et ID ; curseur lié aux filtres, poursuivi même si son offre a expiré ou disparu. Copies défensives et instances indépendantes.

## Vérification exécutée
Lint, typecheck, build de production et npm test réussis localement.
6 tests Jobs sur vrais imports et React/jsdom ; 19 tests au total dans l’atelier local comprenant les contributions Chat/Marketplace encore en PR séparées. La branche Jobs part de main et ne republie pas ces contributions : la CI vérifie son ensemble exact.
Application privée : 26 tests réussis, y compris raccordement Castings, simulations et profil.

## Limites
Aucune vérification visuelle navigateur : Chromium absent. jsdom ne valide pas le rendu Android.
Offres fictives, favoris en mémoire perdus au rechargement, aucun backend ni collecte ni candidature réelle. Pagination sans instantané des données. Pas de fusion automatique des PR.
