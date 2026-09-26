# Livraison sans échange manuel de blocs de code

1. L'agent lit ce repo public et sa mission. Il clone le repo dans son environnement ou le fork s'il n'a pas de droit d'écriture.
2. Il crée une branche contrib/<mission>, enregistre le commit de base et travaille uniquement dans son périmètre.
3. Il teste le module réel, puis propose une PR vers main de ce dépôt public.
4. L'intégrateur lit la PR ici, corrige/valide les changements puis porte seulement les fichiers retenus dans le dépôt privé.
5. Les tests complets du produit et la preview privée sont vérifiés avant validation finale. Aucun accès privé n'est nécessaire au contributeur.

Le fondateur n'a plus à recopier les sources si l'agent peut lire GitHub et livrer une PR. Un agent limité à un chat peut lire le contexte si son navigateur le permet, mais devra toujours remettre ses fichiers ; GitHub ne lui ajoute pas d'outils d'écriture.

## Automatisation ultérieure, non configurée
Pour lancer des modèles externes automatiquement : choisir un fournisseur/agent compatible et lui donner des autorisations minimales sur CE dépôt public, ainsi qu'un budget explicite. Les clés restent dans un gestionnaire de secrets, jamais dans les fichiers ou prompts. Pas d'abonnements/API configurés par ce kit, pas de dépense ni de webhook actif.
La CI teste le code ; elle ne sollicite aucune IA. Elle n'utilise pas pull_request_target et ne reçoit pas de secrets pour les contributions externes.

## Livraison demandée
Résumé, commit de base, fichiers changés, critères couverts, commandes et résultats réels, limites, captures si disponibles, instructions d'intégration. Pas de PR vers le dépôt privé. Pas de message à un tiers ni de merge automatique.
