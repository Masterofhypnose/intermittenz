# Gemini — SPEC-DOCS-01 : coffre documentaire local-first

Livrer docs/proposals/documents.md uniquement, sans code global. Lire CONTEXT.md et les contrats existants. But : une spécification prête à implémenter, pas une nouvelle application.

Périmètre fonctionnel : importer un fichier choisi par l'utilisateur ; métadonnées (type, nom, taille, date, association éventuelle à un contrat), consulter, rechercher, supprimer et exporter. Originaux conservés localement ; expliquer les limites de stockage navigateur et la différence entre fichier local, copie IndexedDB et simple référence. Ne pas prétendre que le navigateur peut toujours conserver l'accès à un fichier externe sur Android.

Attendus : parcours Android et desktop ; modèle de données minimal ; interface TypeScript DocumentService proposée ; consentements ; erreurs/quota ; doublons ; import partiel ; suppression/export ; séparation des métadonnées et octets ; critères de tests et stratégie migration. OCR = lot suivant avec extraction à confirmer par l'utilisateur, pas de modification automatique des droits.

Pas de documents réels, clés API ni service cloud activé. Si tu consultes des capacités navigateur, fournis liens vers docs officielles et date de vérification ; sinon marque les hypothèses à vérifier. Recommander un premier lot limité, puis extensions. Aucune dépendance à des fichiers privés.

## Compléments pour une livraison autonome
Livrable docs/proposals/documents.md, branche contrib/SPEC-DOCS-01. Conserver cette mission chez Gemini ; ne pas prendre QA-DISPLAY-01. Aucun type DocumentService n’existe encore : proposer un contrat, ne pas modifier modules.ts. Premier lot sans OCR : PDF/JPEG/PNG choisis explicitement, copie locale, liste/aperçu/export/suppression. Définir types/taille, erreurs/quota, absence d’accès durable au fichier original, URLs objet et leur révocation, restauration/import, données effacées par le navigateur, et suppression des octets avec les métadonnées. Ne jamais affirmer qu’IndexedDB constitue une sauvegarde. Aucune promesse de chiffrement sans gestion de clés définie. Tests uniquement sur fixtures fictives ; proposer une méthode de test Android et support navigateur vérifié avec documentation officielle.

## Procédure commune
Lire AGENTS.md, docs/CONTEXT.md et docs/TASKS.md. Cette mission est préparée, pas exécutée automatiquement. Indiquer immédiatement les capacités réelles : lecture, shell, navigateur, écriture GitHub. Aucun accès privé nécessaire. Ne pas refaire les modules livrés ni modifier contrats, shell, dépendances ou workflows. Ne contacter personne, ne créer aucun compte, ne déclencher aucun service payant.
Livrer un seul Markdown au chemin indiqué, sur une branche contrib/<ID> et une PR si possible. Sinon un bloc Markdown complet entre triples backticks, ou un fichier joint ; aucune livraison tronquée. Préciser les sources effectivement lues, les vérifications exécutées et les inconnues. Aucun secret ni donnée personnelle. Ne pas inventer de tests, partenariats ou connexion à d’autres agents.
