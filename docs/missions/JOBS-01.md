# JOBS-01 — Grok : module Emploi & Castings de démonstration

## Départ et état
La revue SPEC-JOBS-01 est terminée : Grok a indiqué, dans un retour transmis par le fondateur le 27 septembre 2026, ne plus trouver de blocage au commit 763792b43f13bcb3d4abfaed875734cad79ced1b.
La PR #1 reste ouverte : cela n'autorise pas sa fusion. Pour ce lot isolé, la spécification épinglée fait foi :
https://github.com/Masterofhypnose/intermittenz/blob/763792b43f13bcb3d4abfaed875734cad79ced1b/docs/proposals/jobs.md
Ne pas refaire la spécification ni la recherche de sources.

Lire AGENTS.md, CONTEXT.md, WORKFLOW.md et cette mission. Le pack docs/agent-packs/JOBS-01.md contient les sources nécessaires pour un agent limité à la lecture Markdown.
Base de préparation : 75c3497d05961503314a00fc8f34cd5af3c7d831. Créer contrib/JOBS-01 depuis main actuel et indiquer son SHA exact. Examiner les PR ouvertes pour éviter une contribution en doublon.

## Livrables autorisés
- lib/jobs/types.ts : reproduire exactement le bloc TypeScript de la spécification (types Jobs et service), avec import de Page/PublicProfile/ModuleContext depuis ../contracts/modules. Ces types restent locaux au module jusqu'à leur promotion par l'intégrateur ; ne pas ajouter une seconde définition des types communs.
- lib/jobs/demoService.ts : export createDemoJobsService(options), instance indépendante en mémoire. Options now?: () => Date, seed?: JobOffer[], pageSize?: number ; horloge injectée et données clonées, aucune mutation de l'appelant.
- Autres helpers dans lib/jobs/** uniquement si nécessaires.
- components/jobs/JobsModule.tsx : export nommé JobsModule, props JobsModuleProps.
- components/jobs/Jobs.module.css et components/jobs/index.ts.
- tests/jobs*.test.mjs : vrais imports et rendu React/jsdom.
- docs/deliveries/JOBS-01.md : résultats et raccordement proposé, sans modifier le shell.

Ne modifier ni contrats partagés, ni shell, ni marketplace/chat, ni dépendances/lockfile/workflows. Imports relatifs, pas d'alias @/. Aucune auth, API, collecte, calcul de droits, paiement ou candidature réelle.

## Comportement attendu
Catalogue → filtres → fiche via getById → retour, favoris. Filtres texte, métier, ville, type, dates et rémunération : présenter les dates/rémunération dans une zone « Filtres avancés » pour garder une interface simple.
Même design navy et CSS Modules isolés. Mobile 390 px et desktop 1280 px, contrôles accessibles au clavier, labels français, focus de fiche puis retour au bouton remounté, filtres et pages chargées conservés.
Chargement, zéro résultat, échec récupérable et retry explicites. Réponses obsolètes ignorées après recherche, sélection, changement de service ou démontage.
Pas de liste complète de favoris prétendue à partir des seuls IDs sans getById.
Le détail affiche les états expired/withdrawn/not_found conformément à la spec, sans réafficher le contenu retiré. Les favoris ont un verrou par annonce et par génération de service, rollback et erreur visible.

Appliquer exactement les tables de la spec : statut effectif, dates partielles/flexibles, rémunération, favoris et pagination. Pas d'offset ni de base/unités converties.
Pour compléter uniquement les choix laissés ouverts : recherche textuelle par sous-chaîne insensible à la casse sur titre/description/category/city ; filtres category et city par sous-chaîne insensible à la casse après trim. Le curseur opaque lie tous les filtres normalisés et sa dernière paire de tri ; encodage n'est pas chiffrement ni autorisation.
Les fonctions de recherche ne modifient pas les offres sources ; calculer le statut effectif à chaque appel.

## Démonstration
Au moins huit offres fictives variées, marquées source.type='demo', application.mode='none'. Ajouter des cas dates partielles, flexible, rémunération inconnue, brut/net, bénévolat, expiration et retrait. Les échéances du jeu par défaut sont relatives à now pour que la démo ne devienne pas vide après quelques jours.
Indiquer clairement « Offres fictives — aucun envoi de candidature ». Pas de lien vers une fausse offre ni de recruteur réel. Les tests fixent l'horloge.
Dans les seuls cas connectés fournis par un service futur, un contact interne reste le callback prévu ; URLs externes HTTPS sans identifiants, ouvertes uniquement sur action explicite. Aucune automatisation de contact.

## Tests exigés
- Vrais imports : réutiliser le mécanisme TypeScript et jsdom des tests fournis, jamais recopier les fonctions.
- Filtres et quatre cas de dates ; bornes inclusives, flexible, invalide/inversé.
- Pay : base/unité identiques et seuil, exclusion unknown/not_applicable/unspecified.
- Statut juste avant/à/après échéance, priorités, cohérence search/getById/favoris.
- Pagination avec égalités de dates, curseur invalide ou filtres incompatibles. Tester l'insertion via une fixture/helper local de test si nécessaire, sans ajouter de méthode au JobsService.
- Favoris : ajout actif, rejets invalides/expirés/retirés, retrait idempotent, réponses tardives de l'ancien service et verrou du nouveau service.
- React : navigation/retour/focus, filtres sans résultat, erreurs/réessai, texte malveillant rendu littéralement, absence d'action réelle en démo.
- Vérifications responsive réelles seulement si navigateur disponible ; ne pas faire passer jsdom pour une vérification visuelle.

## Livraison
Exécuter npm run lint, npm run typecheck, npm run build puis npm test si l'environnement le permet. Sinon écrire « non exécuté ».
PR vers l'atelier public si accès d'écriture réel ; sinon fournir des fichiers complets avec chemins, dans une pièce jointe si possible. Ne pas inventer de lien de PR ou de test réussi.
Rendre un module intégrable complet, pas une nouvelle liste de suggestions. L'intégrateur branche le shell et le produit privé après validation.
