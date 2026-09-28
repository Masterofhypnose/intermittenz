# DeepSeek — QA-DISPLAY-01 : contrôle visuel des modules publics
Livrable : docs/reviews/QA-DISPLAY-01.md. Rapport seulement, aucun code.

## Sources précises
Les corrections ne sont pas toutes fusionnées dans main. Examiner séparément :
- Marketplace PR #2 : https://github.com/Masterofhypnose/intermittenz/pull/2 — commit d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9.
- Chat PR #3 : https://github.com/Masterofhypnose/intermittenz/pull/3 — relever son SHA réel avant revue.
- Jobs PR #4 : https://github.com/Masterofhypnose/intermittenz/pull/4 — commit 0ce33c87f269d2a71f860aaac3d921c49b4eef92.
Chaque branche est un atelier exécutable autonome : package.json/lock et shell publics. Ne pas utiliser main comme si les PR y étaient fusionnées. Les contrats sont dans lib/contracts/modules.ts, Jobs dans lib/jobs/types.ts. Pour lecture brute : https://raw.githubusercontent.com/Masterofhypnose/intermittenz/<SHA>/<chemin>. Si lecture impossible, nommer seulement les fichiers indisponibles, ne pas inventer leur contenu.

## Vérifications
Avec shell : npm ci, npm run dev. Avec navigateur : largeurs 320, 390, 768 et 1280 px, zoom 200%, portrait/paysage ; défilement horizontal, titres longs, formulaires, boutons, focus clavier, retours fiche/catalogue et conservation des pages, chargement/erreur/vide. Captures datées et viewport pour chaque défaut, attendu/observé, étapes, gravité et fichier suspect. Vérifier les vrais scénarios, pas seulement la page initiale.
Sans navigateur, livrer une revue CSS/DOM statique explicitement marquée comme telle ; aucune affirmation de rendu testé. Ne pas refaire une revue générique ni les bugs déjà corrigés dans les commits épinglés.
Le dashboard privé et la jauge 507h sont réservés à l’intégrateur : exclus de cette mission. Aucune donnée privée ou accès Vercel requis.

## Procédure commune
Lire AGENTS.md, docs/CONTEXT.md et docs/TASKS.md. Cette mission est préparée, pas exécutée automatiquement. Indiquer immédiatement les capacités réelles : lecture, shell, navigateur, écriture GitHub. Aucun accès privé nécessaire. Ne pas refaire les modules livrés ni modifier contrats, shell, dépendances ou workflows. Ne contacter personne, ne créer aucun compte, ne déclencher aucun service payant.
Livrer un seul Markdown au chemin indiqué, sur une branche contrib/<ID> et une PR si possible. Sinon un bloc Markdown complet entre triples backticks, ou un fichier joint ; aucune livraison tronquée. Préciser les sources effectivement lues, les vérifications exécutées et les inconnues. Aucun secret ni donnée personnelle. Ne pas inventer de tests, partenariats ou connexion à d’autres agents.
