# SPEC-SOURCES-01 — offres réelles, proposition revue

28 septembre 2026. Contribution Grok transmise par le fondateur, synthétisée et amendée par l’intégrateur.
Base code : JOBS-01 0ce33c87f269d2a71f860aaac3d921c49b4eef92.
Spec : 763792b43f13bcb3d4abfaed875734cad79ced1b.
Statut : préparation uniquement. Aucun compte créé, API authentifiée appelée, secret fourni, scraping, code d’ingestion ou déploiement.

## 1. Évidence et inconnues

V = confirmé par l’intégrateur sur source officielle lisible ; P = proposition technique ; U = non confirmé.
Grok déclare une lecture web seulement, sans Node/navigateur interactif/écriture GitHub. Ses mentions « vérifié » ne sont pas reprises sans preuve exploitable.

| Source | Vérification du 28 septembre | Conclusion |
|---|---|---|
| https://www.data.gouv.fr/dataservices/api-offres-demploi | V : présentation, ressources, filtres, conditions d’accès, caractéristiques | Offres actives FT et partenaires ayant consenti ; recherche paginée, détail, référentiels ; métiers/communes/départements/contrats. Accès indiqué ouvert avec lien de demande. Limite publiée : 10 appels/seconde ; conditions propres à l’application à confirmer. |
| https://francetravail.io/produits-partages/catalogue/offres-emploi | Page atteinte, sans texte exploitable par l’outil | U : licence intégrale, OpenAPI, endpoints, scopes, inscription et modalités d’authentification exactes. Ne pas affirmer que ces documents sont nécessairement derrière un compte. |
| https://www.cnd.fr/fr/auditions-offres-emploi | V : page publique et présentation | Annonces du secteur chorégraphique avec catégories, types de contrat, lieu et échéance. Aucun droit de republication ni API établi par cette lecture. |

L’URL employeur fournie par Grok contient « ... » : référence non exploitable, non retenue comme preuve.
Les endpoints OAuth/API et champs JSON cités par l’écosystème restent des pistes non vérifiées ; aucune implémentation à partir de ces seules indications.
L’absence d’un filtre intermittent ou d’une API CND ne peut pas être prouvée par cette seule consultation. Aucun de ces mécanismes n’est établi ici.
Conditions de republication, attribution, durée de conservation, contacts et suppression : à documenter avant ingestion. « Accès ouvert » ne remplace pas cette lecture.

## 2. Mapping proposé, à confirmer avec le schéma officiel

Les noms source ci-dessous sont ceux avancés par Grok ; non validés ici contre une OpenAPI. Aucune fixture n’est déclarée conforme tant que le schéma manque.

| Source candidate | JobOffer | Règle de mapping proposée |
|---|---|---|
| id | id, source.externalId | Identifiant stable préfixé par source ; ne pas fusionner deux sources sans preuve. |
| URL officielle documentée | source.canonicalUrl, application external | URL fournie/documentée, HTTPS sans identifiants ; ne pas fabriquer une URL depuis un gabarit supposé. Sans URL exploitable, ne pas publier via ce contrat. |
| intitule / description | title / description | Texte brut, jamais HTML interprété. |
| dateCreation | createdAt | Valider fuseau et instant ; ne pas remplacer silencieusement une date absente par la collecte. |
| typeContrat | contractType, kind | Mapping explicite après référentiel ; ne pas déduire casting du titre. |
| métier / appellation | category | Libellé source ; pertinence spectacle à mesurer, pas de matching opaque. |
| lieuTravail | location | Champs structurés prioritairement ; pas de pays FR systématique, pas de département déduit naïvement du code postal. Cas étrangers et distants à traiter. |
| entreprise | publisher | Identité d’affichage sans compte produit créé ; ne pas fusionner des recruteurs uniquement par nom. Identifiant de source documenté ou identité propre à l’offre. |
| salaire | remuneration | known seulement si un montant unique, EUR, unité supportée et interprétation non ambiguë sont explicitement établis. Base unspecified si absente. Fourchette, annuel, devise autre ou parsing ambigu : unknown, préserver la formulation source si droits établis. Aucune conversion horaire/jour, annuel/mois, brut/net. |
| échéance documentée | expiresAt | Ne pas confondre fin de candidature, période de travail et fin de diffusion. |
| dates de mission documentées | dates.start/end | Dates civiles facultatives ; absence = undefined, sans extraction devinée du texte. |
| contacts | aucun par défaut | Pas de copie automatique email/téléphone. Candidature par lien officiel uniquement. |

JobSource external : name, canonicalUrl, externalId, collectedAt (première collecte), lastVerifiedAt (dernier contrôle source réussi). Pas d’actualisation lastVerifiedAt en cas d’erreur.
Le schéma actuel ne représente ni fourchette salariale ni fraîcheur opérationnelle : les garder dans le stockage d’ingestion interne et proposer toute extension du contrat séparément.

## 3. Synchronisation et cycle de vie (proposition P)

- Backend seul : secrets/tokens jamais dans le navigateur. Adaptateur source distinct du JobsService et du composant déjà livré.
- Fréquence, volume et budgets d’appels décidés après droits/quotas ; une synchronisation horaire n’est pas un engagement.
- Limiteur configurable, respect des réponses documentées (dont Retry-After si applicable), backoff avec jitter, tentatives bornées. 401/403 : diagnostic de configuration ; pas de boucle infinie.
- Dédoublonnage par source + identifiant externe ; URL canonique secondaire seulement avec normalisation conservatrice. Ne pas supprimer arbitrairement les paramètres signifiants.
- Ne jamais conclure withdrawn parce qu’une offre manque dans une recherche, même après N cycles : filtres, pagination incomplète, limites de résultats et erreurs peuvent l’expliquer.
- Pour une offre absente, lancer une revalidation de détail selon la sémantique officielle. Un signal explicite de retrait, ou un statut documenté équivalent, permet withdrawn. Réseau/429/5xx : état opérationnel inconnu, pas de suppression.
- Si fraîcheur trop ancienne, masquer provisoirement du catalogue connecté selon une politique explicite distincte du statut métier ; conserver l’incertitude en interne. Contrat/UI de fraîcheur à valider avant usage réel.
- Expiration uniquement selon une échéance fiable et sa sémantique ; conservation/purge selon les conditions applicables, pas selon une durée inventée.
- Pagination interne par clé (instant, id), filtres liés au curseur ; ne pas exposer le mécanisme de pagination FT comme celui du contrat produit.
- Candidature : action utilisateur ouvrant le lien officiel. Aucun dossier envoyé, aucun compte recruteur interne supposé.

## 4. Sources supplémentaires
CND : liens vers le site officiel envisageables ; ingestion/republication non autorisée par cette seule page.
ProfilCulture, Cast Prod, Spectable et autres : conditions non vérifiées ; pas de collecte planifiée. Un partenariat est une piste, pas une obligation juridique établie dans cette note.
Ne pas multiplier les sources avant un premier raccordement documenté.

## 5. Premier lot et critères d’acceptation

1. Obtenir documentation officielle d’accès, licence/conditions et OpenAPI ; consigner URLs/version/date et modalités exactes. Ne pas demander de secrets dans le chat ou GitHub.
2. Après validation, écrire un mapping pur sur fixtures fictives conformes au schéma : champs absents, fourchettes, devises/unités, fuseaux, recruteurs anonymes, URL absente.
3. Construire l’adaptateur serveur avec tests de quota, pagination partielle, absence puis revalidation, retrait explicite, erreur temporaire et données périmées.
4. Brancher le catalogue connecté derrière activation contrôlée ; afficher provenance, lien et fraîcheur honnêtes.
5. Comptes produit requis pour favoris synchronisés et fonctions privées ; ne pas affirmer que toute lecture publique d’offres exige à elle seule une auth utilisateur.

Prérequis non levés : droits d’usage complets, schéma officiel, auth/scopes/endpoints, limites applicatives, politique de fraîcheur/conservation, mesure de pertinence spectacle.
Aucun changement de lib/jobs, du contrat, du shell ou des dépendances dans ce lot. Pas de tests applicatifs exécutés pour cette proposition documentaire.
