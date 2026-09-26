# Mission déléguée : messagerie

Objectif : module de messagerie professionnel réutilisable par communauté, marketplace et PRO. Ce lot livre l'interface et l'adaptateur de démonstration isolé, pas une vraie messagerie entre utilisateurs sans Auth/DB.

Fichiers autorisés : components/chat/**, lib/chat/**, tests/chat*.test.mjs. Styles CSS Modules. Export `ChatModule` avec `ChatModuleProps` depuis lib/contracts/modules.ts. Ne pas modifier le contrat partagé ; proposer une évolution séparément si nécessaire.

Parcours : liste paginée de conversations → ouvrir → charger messages → saisir → envoyer → confirmation. Liste puis détail sur mobile, deux colonnes sur desktop. Bouton retour, état vide, chargement, échec récupérable et nouvel essai. Préserver le brouillon si l'envoi échoue. Utiliser clientRequestId pour éviter les doublons au retry. Afficher le texte comme texte, jamais HTML brut. Les réponses de démonstration restent explicitement identifiées ; ne pas inventer un humain connecté.

Fournir un adaptateur en mémoire injectable et des tests : changement de conversation, résultats asynchrones arrivant dans le désordre, échec/retry sans doublon, messages vides refusés, texte malveillant inoffensif. Compte connecté et membres fournis par le service, pas de secrets ou identités du profil local envoyés au cloud.

Backend futur : accès contrôlé par appartenance côté serveur/RLS. L'organizationId du contexte ne constitue jamais une preuve d'autorisation. Pas de socket, notifications externes ou envoi réel dans cette mission.

Livrer une PR/patch et un petit exemple d'utilisation, tests exécutés, limites et dépendances proposées. Ne pas toucher AppShell/globals.css/package.json ni déployer. Lire docs/WORKFLOW.md.

## Raccordement déjà disponible
Ce dépôt public est autonome : main est la base. Remplacer les slots components/chat/ChatModule.tsx et lib/chat/demoService.ts. Conserver les exports nommés ChatModule et createDemoChatService : app/page.tsx les monte déjà via le bouton Chat. L'adaptateur doit être créé par instance et sans données personnelles.

Pagination : le premier lot contient les messages les plus récents, présentés chronologiquement. nextCursor permet de charger les messages plus anciens ; documenter cet ordre. Une clé clientRequestId correspond à un envoi immuable ; conserver la clé après erreur pour retenter le même contenu, en créer une autre pour un message différent. Ne pas perdre un brouillon si l'utilisateur change de conversation. Désactiver les doubles envois immédiats. Requêtes obsolètes ignorées et erreurs visibles.

Les profils de démonstration sont fictifs ; les destinataires ne répondent pas automatiquement comme de vrais utilisateurs. Aucun message externe. Pour les tests DOM sans nouvelle dépendance, voir tests/marketplace.test.mjs : transpilation du vrai TS via TypeScript et React/jsdom.
