# Contexte complet pour les missions publiques

## Produit
Intermittent+ relie le quotidien des artistes/techniciens et celui des productions : cockpit, activité, droits, documents, emploi/castings, communauté, marketplace et PRO. Une donnée saisie une fois sert aux usages autorisés. Les utilisateurs peuvent avoir plusieurs rôles dans plusieurs organisations.

## Ce qui fonctionne dans l'application principale
Profil local nom/photo/annexe/date anniversaire, simulations AJ/mois/507 h, CDD et AE optionnels, historique et export ; sidebar repliable et navigation mobile. Ces modules sont privés et ne sont pas nécessaires pour implémenter chat/marketplace : ils fournissent le contexte via les props.

## Ce qui ne fonctionne pas encore en multi-utilisateur
Pas d'auth/DB cloud ni de permissions serveur. Chat attendu. Marketplace démo en mémoire. Documents/OCR, emploi réel et PRO non opérationnels. Ne pas présenter ces services comme acquis.

## Atelier public
- Même stack et versions verrouillées que le produit : package.json + package-lock.json.
- Contrat public synchronisé depuis le commit produit 51f6625ce252aa9c87e124be52f58b0131ab507c.
- Marketplace revue avec fixtures : catalogue, recherche, création, favoris et tests DOM réels.
- Chat : slot compilable à remplacer ; ce n'est pas une messagerie livrée.
- Le shell app/page.tsx fournit des services par instance et un utilisateur fictif. Pas de données du profil privé.
- Aucune auth ni variable d'environnement à installer. Aucun appel vers le dépôt privé.

## Direction graphique
Fond navy #071329, cartes #111a2e, textes #e8eefc, secondaire #a4b2cd, bleu #87a2ff et violet. Formulaires lisibles, contrôles ≥44px, saisie ≥16px sur mobile, colonnes adaptatives. Ne pas imposer une largeur desktop. CSS Modules isolés ; styles globaux minimaux du shell.

## Contrat
Les structures TypeScript font foi. ChatService liste les conversations/messages et envoie un message avec identifiant de requête. MarketplaceService recherche avec curseur, crée, liste les identifiants favoris et modifie un favori. Prix en centimes entiers, devise EUR, dates ISO. Erreurs = promesses rejetées. L'UI gère aussi les erreurs non-Error.
Le callback onContactSeller(sellerId,listingId) est le futur raccordement avec le chat. Il ne crée pas encore de conversation. Proposer un contrat supplémentaire si nécessaire ; ne pas l'inventer silencieusement.

## Confidentialité et limites
Pas de paiements, notifications externes ou upload cloud. HTTPS seulement pour les images distantes ; HTML utilisateur rendu en texte. Pas de vrais utilisateurs connectés inventés. L'abonnement commercial, les données de santé/droits et les documents ne sont pas des fixtures publiques.
