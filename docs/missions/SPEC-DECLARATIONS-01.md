# DeepSeek — SPEC-DECLARATIONS-01

Mission prête à lancer. Spécification produit uniquement, aucun code. Livrable unique : docs/proposals/declarations.md. Branche contrib/SPEC-DECLARATIONS-01 et PR si possible.
Lire AGENTS.md et docs/TASKS.md. Ce brief est autonome : aucun accès au produit privé n’est nécessaire.

## Références demandées par le fondateur
- https://declaart.fr/ : présente le suivi des dépenses, kilomètres et justificatifs, des catégories de frais, une comparaison des modes de déduction et un récapitulatif annuel. La page publique consultée le 28/09/2026 annonce encore une disponibilité prochaine sur les boutiques mobiles : ne pas prétendre avoir testé l’application.
- https://artdecla.fr/ : présente le suivi des contrats et cachets, un dashboard, des rappels et des exports. Fonctions annoncées sur une vitrine, pas parcours connectés vérifiés.

S’inspirer de la simplicité des parcours, sans reproduire textes, images ou identité graphique. Aucune règle fiscale ou de droits ne devient vraie parce qu’un concurrent l’affiche. Ne pas inscrire le fondateur, contacter les éditeurs ni souscrire un service.

## Produit existant, ne pas refaire
Intermittent+ dispose maintenant d’un accès Déclarations séparé de Simulations :
- actualisation mensuelle : calendrier France Travail 2026, rappel dashboard, checklist indicative et confirmation personnelle « faite », stockage local ; aucun envoi à France Travail ;
- impôts : préparation automobile déclaration 2026/revenus 2025, kilomètres annuels par voiture, puissance fiscale, motorisation électrique, montants complémentaires saisis, brouillon local et CSV ;
- ni calcul complet d’impôt, ni pièces jointes, ni OCR, ni connexion cloud.
Les profils et historiques existants doivent être préservés. Ne pas demander les sources privées pour cette mission de spécification ; aucun audit de code n’est attendu.

Sources officielles déjà identifiées, à consulter si une affirmation réglementaire est proposée :
https://www.francetravail.fr/candidat/vos-droits-et-demarches/vos-demarches-aupres-de-pole-emp/le-calendrier-des-paiements.html
https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/frais.htm
Compléter avec DGFiP/BOFiP/France Travail, URLs exactes, millésime et consultation. Si lecture impossible : indiquer inconnu, ne pas remplir de mémoire.

## Parcours à spécifier
1. Ajouter une dépense en quelques champs : date, libellé, montant, catégorie, usage professionnel et éventuel remboursement. Brouillon possible ; distinguer donnée saisie et dépense fiscalement retenue.
2. Journal de trajets : date, motif, origine/destination en texte, distance et voiture. Aucune API de cartes ou géolocalisation imposée. Regroupement annuel par véhicule ; éviter le double compte avec un total annuel saisi manuellement. Ne pas appliquer le barème séparément à chaque trajet.
3. Justificatifs : lien logique vers un futur coffre, statut manquant/présent ; pas de stockage de pièces inventé. Prévoir suppression, export, confidentialité et erreurs de stockage. Interface à proposer, pas modifier la mission Documents.
4. Vue annuelle : dépenses par catégorie, kilomètres, éléments à compléter et récapitulatif exportable. Séparer salaires, allocations et dépenses ; ne pas utiliser le net bancaire comme net imposable.
5. Comparaison entre forfait et frais réels : données nécessaires, cas non calculables et règles de cumul/exclusion à vérifier. Les éventuelles spécificités artistiques sont des règles à documenter selon la profession et l’année, pas des pourcentages universels. Pas de promesse d’économie exacte sans calcul fiscal complet.
6. Actualisation mensuelle : préparer un récapitulatif d’activités et des pièces à contrôler à partir du futur module Activité, puis faire confirmer par l’utilisateur. Pas d’envoi automatique, de preuve fictive de réception, ni de conversion réglementaire implicite.

## Contrats proposés et raccordement
Proposer des types TypeScript locaux complets pour Expense, Trip, Vehicle, ReceiptReference et AnnualPreparation, avec identifiants, montants en centimes, dates civiles et année des revenus distincte de l’année de déclaration. Définir création, édition, suppression confirmée, validation, import/export et erreurs. Distinguer valeurs dérivées et saisies ; pas de stockage des mêmes totaux à plusieurs endroits sans règle de priorité.

Claude travaille sur CODE-ACTIVITY-01 ; sa spec de référence :
https://github.com/Masterofhypnose/intermittenz/blob/980f6c290869a066d01c4709e7534ca20acff16b/docs/proposals/activity.md
Elle conserve heures et cachets séparés. Ne pas modifier son contrat ou ses fichiers : proposer une lecture/adaptation future avec provenance et arbitrage des corrections.
Gemini garde SPEC-DOCS-01. Ne pas écrire son coffre ; lister seulement les besoins de référencement des justificatifs.

## Livrable attendu
- Court tableau : fonction annoncée par les références / besoin utilisateur / présent dans Intermittent+ / ajout proposé.
- Parcours mobile courts et états vide, erreur, brouillon, sauvegarde impossible, pièce manquante.
- Types et règles de validation structurelle ; aucun « Promise> » ou générique tronqué.
- Tableau des questions fiscales nécessitant une source officielle et statut vérifié/inconnu. Aucun barème inventé.
- Cas tests déterministes proposés : trajets et total annuel, véhicules distincts, doublon, remboursement, changement de millésime, dépenses hors année, import invalide, arrondis, justificatif supprimé.
- Premier lot réalisable et différé explicite. Priorité au journal dépenses/trajets, pas à une réécriture des simulations ni une promesse d’optimisation universelle.

## Limites et livraison
Déclarer les moyens réellement disponibles. Si pas de web, exploiter le contexte ci-dessus et signaler les sources non relues. Ne pas refaire QA-DISPLAY-01. Aucun code applicatif, contrat partagé, dépendance, workflow ou calcul de droits modifié. Aucune donnée privée ni compte réel.
Fournir un Markdown complet joint ou un bloc unique entre triples backticks. Ne pas annoncer de tests, navigation connectée ou PR non réalisés. Le document est une proposition à relire par l’intégrateur avant implémentation.
