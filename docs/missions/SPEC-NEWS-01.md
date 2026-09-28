# Grok — SPEC-NEWS-01 : fil d’actualités officiel et automatique

## Mission prête, non lancée
Responsable prévu : Grok. Recherche et spécification seulement.
Livrable unique : `docs/proposals/news-sources.md`.
Branche : `contrib/SPEC-NEWS-01`. PR vers main si l’outil le permet.
Lire AGENTS.md puis docs/TASKS.md. Ce brief contient tout le contexte nécessaire : aucun fichier privé ni accès Node requis pour la recherche.

## Décision produit du 28 septembre 2026
Le fondateur demande un onglet Actualités, avec un aperçu sur le dashboard, à la manière d’un flux RSS. La première version du produit présente une sélection éditoriale datée, sans actualisation automatique. Elle filtre Démarches / Fiscalité / Spectacle et ouvre la source officielle. La mission prépare son remplacement par un vrai fil maintenable.

Navigation décidée : un seul accès Simulations (AJ, mensuel, heures/renouvellement, historique à l’intérieur) ; Déclarations (actualisation et préparation des frais réels) ; Actualités. Le calendrier d’actualisation ne doit jamais être déduit d’un titre de news ou devenir une source réglementaire automatique.

## Sources de départ, pas des flux RSS déjà validés
- Ministère de la Culture : https://www.culture.gouv.fr/actualites
- Service Public : https://www.service-public.gouv.fr/particuliers/actualites
- France Travail : https://www.francetravail.fr/
- DGFiP : https://www.impots.gouv.fr/
- Unédic : https://www.unedic.org/

La sélection actuelle contient deux liens du ministère de la Culture, consultés le 28/09/2026 :
https://www.culture.gouv.fr/actualites/saison-cabaret-trois-mois-d-evenements-partout-en-france
https://www.culture.gouv.fr/actualites/culture-et-handicap-17-recommandations-pour-l-acces-a-l-emploi

Elle comprend aussi les fiches calendrier 2026 France Travail et frais professionnels de la déclaration 2026 DGFiP. Ne pas présenter ces fiches pratiques comme des nouvelles publiées aujourd’hui.

## Recherche attendue
1. Identifier les URLs exactes de flux RSS/Atom ou APIs officiellement proposés, effectivement ouverts. Ne pas construire une URL supposée /rss.xml.
2. Pour chaque candidat : organisme, URL de documentation, URL du flux, date de consultation, statut HTTP si accessible, type réel du contenu, date d’un élément récent, cadence observée ou inconnue.
3. Conditions de réutilisation : ce que la source autorise réellement pour titre/date/lien, résumé, image. Distinguer lien vers l’article et reproduction. Pas de texte intégral ni d’image réutilisés par défaut.
4. Pertinence pour artistes/techniciens du spectacle : filtrage transparent par rubrique/mots-clés, risques de faux positifs. Aucun score personnalisé opaque, aucune donnée de profil transmise au fournisseur.
5. Distinguer vérifié / inconnu / non testé. Si l’accès web ne permet pas de récupérer un XML, le dire. Une page actualités visible n’est pas une API.

## Proposition technique bornée, sans code
Modèle minimal proposé : identifiant stable, source, URL canonique HTTPS, titre en texte, date de publication facultative, date de récupération, catégorie, bref résumé facultatif. Une date de récupération ne remplace jamais une date de publication inconnue.

Décrire un adaptateur serveur (pas d’appels tiers depuis le navigateur), cache, durée de fraîcheur, timeout, taille maximale de réponse, dédoublonnage, liens autorisés et parsing sans HTML exécuté ni résolution d’entités externes. Indiquer comment refuser les redirections vers des destinations non autorisées.

États utilisateur : chargement, résultat vide, fournisseur indisponible, contenu conservé mais ancien avec sa date, réessai. Ne pas retirer une ancienne publication parce qu’elle est sortie de la fenêtre d’un flux RSS. Pas de promesse « temps réel » si mise à jour périodique.

Proposer le premier connecteur réellement faisable sans compte ni abonnement, OU conclure qu’aucun n’est validé. Dans ce dernier cas conserver les liens éditoriaux, sans prétendre avoir un flux.

## Tests à spécifier
Fixtures synthétiques RSS/Atom documentées : données absentes, dates invalides, doublons, titre hostile, URL javascript, entités XML, réponse HTML au lieu de XML, panne, timeout, contenu trop volumineux, cache ancien. Pas de test annoncé exécuté sans exécution.

## Hors périmètre
Aucun code applicatif, scraping d’articles, inscription, message à un organisme, achat, collecte de profil, secret ou modification de contrats/shell/workflows. Ne pas reprendre SPEC-SOURCES-01 (offres d’emploi), JOBS-01, QA-DISPLAY-01 ou CODE-ACTIVITY-01.

## Livraison
Rapport français exploitable : matrice des sources, preuves et liens exacts, choix du premier connecteur, modèle et états, risques/inconnues et critères d’acceptation. Déclarer ses capacités avant de commencer. Si aucune écriture GitHub, fournir le fichier Markdown joint ou un unique bloc complet entre triples backticks ; ne pas annoncer une PR inexistante.
