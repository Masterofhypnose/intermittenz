# Grok — SPEC-SOURCES-01 : préparer les offres réelles
Livrable : docs/proposals/jobs-sources.md. Recherche et spécification uniquement.

## Base acquise
JOBS-01 livré en PR #4, commit 0ce33c87f269d2a71f860aaac3d921c49b4eef92. Ne pas refaire le composant ni ses tests. Lire lib/jobs/types.ts à ce commit ; JobSource external contient name, canonicalUrl, externalId optionnel, collectedAt, lastVerifiedAt optionnel ; offre active/expired/withdrawn ; rémunération connue avec montant centimes EUR, unité et base explicites, sinon unknown. Types accessibles via les liens bruts du dépôt public.
SPEC-JOBS-01 : docs/proposals/jobs.md au commit 763792b43f13bcb3d4abfaed875734cad79ced1b. France Travail est un candidat, pas un raccordement acquis.

## Livrable attendu
Vérifier sur documentation officielle les conditions actuelles de l’API offres : inscription, authentification serveur, scopes, limites, licence/attribution, contacts recruteurs, conservation/retraits. Citer URLs, sections et date de consultation ; distinguer vérifié, inféré et inconnu. Aucun scraping ni inscription ni demande d’accès à effectuer.
Fournir un tableau champ source → champ JobOffer → transformation/perte/inconnue. Ne pas convertir une rémunération horaire en journalière ni déduire net/brut. Ne pas inventer de filtre intermittent ; documenter les filtres réellement disponibles et les faux positifs attendus.
Proposer stratégie serveur sans secret frontend : synchronisation, dédoublonnage, provenance, pagination, expiration/retrait, erreurs/rate limits ; fixtures fictives au format source si attesté par la documentation. Pas de code d’ingestion ni appel authentifié.
Terminer par un premier lot d’intégration réalisable et les seuls prérequis non satisfaits. Autres sources : liens sortants ou partenariat à étudier seulement si leurs conditions sont établies. Aucun contenu d’annonce réel à copier dans le dépôt.

## Procédure commune
Lire AGENTS.md, docs/CONTEXT.md et docs/TASKS.md. Cette mission est préparée, pas exécutée automatiquement. Indiquer immédiatement les capacités réelles : lecture, shell, navigateur, écriture GitHub. Aucun accès privé nécessaire. Ne pas refaire les modules livrés ni modifier contrats, shell, dépendances ou workflows. Ne contacter personne, ne créer aucun compte, ne déclencher aucun service payant.
Livrer un seul Markdown au chemin indiqué, sur une branche contrib/<ID> et une PR si possible. Sinon un bloc Markdown complet entre triples backticks, ou un fichier joint ; aucune livraison tronquée. Préciser les sources effectivement lues, les vérifications exécutées et les inconnues. Aucun secret ni donnée personnelle. Ne pas inventer de tests, partenariats ou connexion à d’autres agents.
