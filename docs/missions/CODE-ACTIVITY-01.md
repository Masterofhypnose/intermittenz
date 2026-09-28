# DeepSeek — CODE-ACTIVITY-01 (relais de Claude)

Mission de développement prête à lancer par le fondateur, sans nouveau brainstorming. La spécification revue est acceptée comme base de ce lot isolé par l’intégrateur ; sa PR #6 reste ouverte, aucune fusion autorisée.

Référence normative : https://github.com/Masterofhypnose/intermittenz/blob/980f6c290869a066d01c4709e7534ca20acff16b/docs/proposals/activity.md
Lire AGENTS.md et docs/TASKS.md. Le dossier docs/agent-packs/CODE-ACTIVITY-01.md fournit en un fichier cette mission, toute la spec, les contrats communs et package.json, sans accès privé requis.

## Relais du 28 septembre au soir
Claude est en pause de quota, information transmise par le fondateur. Sa spécification reste créditée à Claude ; aucun code CODE-ACTIVITY-01 n’est reçu dans les PR ouvertes vérifiées à cette date. DeepSeek devient le responsable prévu du développement de ce lot. Exécution à déclencher par le fondateur ; ce changement ne lance aucun modèle automatiquement.

Ne pas reprendre QA-DISPLAY-01, déjà clôturée. Claude ne doit pas reprendre ce même code sans relire TASKS et vérifier la livraison de DeepSeek. Si un travail Claude non publié apparaît, le signaler à l’intégrateur avant de créer une seconde implémentation.

Le périmètre, le contrat revu et les critères restent inchangés. L’intégrateur exécute les tests et effectue le raccordement privé après réception. Sans shell : fournir les tests sur les vrais imports et indiquer « non exécutés ». Sans écriture GitHub : joindre les fichiers ou, à défaut, un bloc de code complet par chemin (tsx/ts/css/js/markdown), avec génériques et JSX intacts. Ne pas livrer une simple description à la place d’un fichier. Terminer par un inventaire de tous les fichiers réellement fournis et des limites restantes.

## Travail
Implémenter le module complet décrit : saisie courte, détails facultatifs, édition/suppression confirmées, liste/calendrier, adaptateur mémoire et localStorage avec Web Locks, JSON/CSV et tests sur vrais imports. Types locaux uniquement. Dates civiles, pas de conversion cachets/heures, aucun raccordement automatique aux 507h. Respecter les décisions d’import, doublons et concurrence du document revu plutôt que la première version de Claude.
Fichiers : components/activity/**, lib/activity/**, tests/activity*.test.mjs, docs/deliveries/CODE-ACTIVITY-01.md. Aucun shell, globals.css, contrat partagé, package/lock, workflow ou autre module modifié. Le raccordement privé appartient à l’intégrateur.
Exports : ActivityModule nommé, createDemoActivityAdapter({now?,idFactory?,seed?}), createLocalStorageActivityAdapter avec dépendances injectables pour tests. Aucun accès window/localStorage au chargement du module : instancier seulement côté client. Pas de données fictives injectées dans le stockage réel. Mode mémoire/local indiqué honnêtement.
Adaptateur stockage : sérialisation atomique, validation avant écriture, absence de Web Locks = erreur explicite de mutation. Les tests peuvent injecter un gestionnaire de verrous séquentiel et un stockage simulé ; ne pas faire passer cela pour un vrai test multi-onglets navigateur.

## Livraison
Branche contrib/CODE-ACTIVITY-01 depuis main actuel (relever SHA). Lire les PR pour éviter les doublons. Lint, typecheck, build, npm test si shell ; signaler sinon non exécuté. Tests node:test avec TypeScript transpile et React/jsdom déjà disponibles, pas nouvelle dépendance. Vérification visuelle uniquement si exécutée réellement.
Fournir une PR si capacité réelle, sinon un ZIP ou des fichiers complets en pièce jointe. Ne pas tronquer JSX ou génériques ; ne pas livrer seulement une structure de tests. Ne pas prétendre qu’un fichier est testé quand il ne l’est pas. Inclure limites et raccordement proposé sans toucher au shell.
