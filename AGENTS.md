# Instructions communes

1. Lire README.md, docs/CONTEXT.md, docs/TASKS.md puis sa mission.
2. Travailler par modifications ciblées, avec branche propre à la mission. Ne pas recréer le projet.
3. Contrats dans lib/contracts/modules.ts : imports relatifs (pas d'alias @/). Ne pas les modifier sans proposition d'intégration distincte.
4. Chaque mission possède son dossier. Ne pas modifier le module d'un autre agent ni le shell, package.json, le lockfile ou les workflows. Fournir une note si un raccordement est nécessaire.
5. Pas de nouvelle dépendance sans justification. CSS Modules, responsive Android, français, focus clavier, états vides/chargement/erreur.
6. Données fictives uniquement. Aucun token, secret, document utilisateur, clé API ou variable d'environnement à publier. Les adaptateurs démo sont explicitement marqués, en mémoire par instance.
7. Ne pas toucher au moteur des droits ou inventer de réglementation : il est hors de ce dépôt.
8. Tester les vrais imports et composants ; jamais une copie de leur implémentation dans les tests. Ne pas prétendre avoir exécuté un test non exécuté.
9. Avant livraison : lint, typecheck, build, tests. Proposer PR/patch avec commit de base, scope, tests et limites. Ne pas fusionner ni déployer.
10. Les champs organizationId/viewer sont un contexte UI, pas une preuve d'autorisation. Le futur backend autorisera chaque accès côté serveur.
11. Ne pas créer de boucle de commentaires entre bots ou déclencher des services payants. Les contributeurs sont lancés depuis leur propre environnement autorisé.
