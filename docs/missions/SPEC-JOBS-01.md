# Grok — SPEC-JOBS-01 : emploi et castings

Livrer docs/proposals/jobs.md uniquement. Objectif : périmètre et sources réellement exploitables, avant implémentation. Lire CONTEXT.md et ROADMAP.md. Pas de code global ni scraping automatique.

Parcours : catalogue → métier/lieu/dates/rémunération → détail → favori → candidature choisie par l'utilisateur. Modèle d'offre avec source, URL canonique, date de collecte, échéance, catégorie, rémunération connue/inconnue et localisation. Distinguer casting, offre salariée, prestation et bénévolat. Pas de taux de matching opaque ou promesse d'obtenir un contrat.

Proposer un JobsService compatible avec Page<T>/PublicProfile, sans modifier le contrat existant. Décrire chargement/erreurs/offre expirée/suppression/dédoublonnage et tests.

Recherche de sources : uniquement si accès web réel. Tableau source, API/feed/publication manuelle, autorisation explicite trouvée ou inconnue, conditions/licence, fraîcheur et lien officiel. Public ne signifie pas librement réutilisable. Ne pas inventer d'API ni de partenariat. Si accès web indisponible, livrer la spec et la liste de vérifications ; ne pas présenter des sources comme validées.

Premier lot recommandé : offres fictives explicites ou saisies par leurs auteurs ; ingestion externe seulement après validation des droits. Pas de candidature, email ou message réel envoyé. Aucun accès privé nécessaire.
