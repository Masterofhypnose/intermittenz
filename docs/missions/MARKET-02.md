# MARKET-02 — Améliorations ciblées de la marketplace existante

Ne pas régénérer MARKET-01 : le code livré a déjà été revu et intégré. Lire les fichiers existants et tests/marketplace.test.mjs.

Scope : components/marketplace/**, lib/marketplace/**, tests/marketplace*.test.mjs. Contrats et shell inchangés.

Objectif : améliorer la navigation clavier et le focus après retour de fiche/création, puis vérifier les transitions de service et réponses obsolètes des favoris. Ajouter uniquement les corrections justifiées par des tests reproductibles. Préserver la pagination et le retry idempotent ; ne pas ajouter de stockage global ni de dépendance.

Acceptation : recherche, prix zéro et prix invalide, création/retry, filtre sans résultat, favori en erreur, retour catalogue et focus, réponse tardive après changement de service. Tests sur les vrais imports, pas copies de fonctions. Rapporter les tests exécutés. Données toujours en mémoire, labels démo visibles.

Ne pas implémenter le contact vendeur : il reste un callback vers la messagerie. Ne pas prétendre exposer tous les favoris avec un contrat qui ne renvoie que les identifiants.
