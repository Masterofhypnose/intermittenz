# Gemini — SPEC-DOCS-01 : coffre documentaire local-first

Livrer docs/proposals/documents.md uniquement, sans code global. Lire CONTEXT.md et les contrats existants. But : une spécification prête à implémenter, pas une nouvelle application.

Périmètre fonctionnel : importer un fichier choisi par l'utilisateur ; métadonnées (type, nom, taille, date, association éventuelle à un contrat), consulter, rechercher, supprimer et exporter. Originaux conservés localement ; expliquer les limites de stockage navigateur et la différence entre fichier local, copie IndexedDB et simple référence. Ne pas prétendre que le navigateur peut toujours conserver l'accès à un fichier externe sur Android.

Attendus : parcours Android et desktop ; modèle de données minimal ; interface TypeScript DocumentService proposée ; consentements ; erreurs/quota ; doublons ; import partiel ; suppression/export ; séparation des métadonnées et octets ; critères de tests et stratégie migration. OCR = lot suivant avec extraction à confirmer par l'utilisateur, pas de modification automatique des droits.

Pas de documents réels, clés API ni service cloud activé. Si tu consultes des capacités navigateur, fournis liens vers docs officielles et date de vérification ; sinon marque les hypothèses à vérifier. Recommander un premier lot limité, puis extensions. Aucune dépendance à des fichiers privés.
