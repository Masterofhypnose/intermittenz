# Claude — SPEC-ACTIVITY-01 : activité et calendrier
Livrable : docs/proposals/activity.md. Spécification uniquement ; pas de code.

## Contexte autonome
Le produit possède profil local (nom, annexe 8/10, anniversaire, AJ nette, net/cachet, total manuel d’heures), simulateurs AJ/mois/507h, historique et export. Les contrats et le calendrier réel restent à construire. Stockages existants à préserver : intermittent-plus.profile.v1 et intermittent-plus.simulations.v1. Tu n’as pas à lire ni modifier leur code privé.
Le mois utilise l’AJ nette ; CDD et micro-entreprise sont optionnels. Le total d’activité enregistré ne doit jamais être assimilé automatiquement aux heures admises réglementairement. Aucune formule réglementaire à inventer.

## Décisions à livrer
Premier lot individuel local : ajouter/modifier/supprimer une activité, employeur libre, date ou période, nature cachet/heures/CDD/autre, montants explicitement brut/net, note ; liste et calendrier mensuel dérivés des mêmes données. Proposer un formulaire court avec détails optionnels et unités sans ambiguïté.
Proposer types TypeScript et ActivityService, identifiants stables, montants en centimes, dates civiles, règles de validation purement structurelles, tri, doublons signalés sans suppression silencieuse, export/import versionné, traitement quota et erreurs. Définir précisément suppression et confirmation, changement de mois/fuseau, cachets et heures renseignés simultanément. Aucune conversion cachet→droits dans ce module.
Persistance via adaptateur séparé, données fictives et tests avec horloge fixée. Préparer le raccordement futur au profil sans écraser son total manuel : provenance et choix utilisateur explicites.
Inclure tableau des parcours Android, cas limites, critères d’acceptation testables et proposition de lot CODE-ACTIVITY-01 avec fichiers autorisés. Auth/cloud/OCR hors périmètre. Ne pas lancer l’implémentation avant validation du contrat.

## Procédure commune
Lire AGENTS.md, docs/CONTEXT.md et docs/TASKS.md. Cette mission est préparée, pas exécutée automatiquement. Indiquer immédiatement les capacités réelles : lecture, shell, navigateur, écriture GitHub. Aucun accès privé nécessaire. Ne pas refaire les modules livrés ni modifier contrats, shell, dépendances ou workflows. Ne contacter personne, ne créer aucun compte, ne déclencher aucun service payant.
Livrer un seul Markdown au chemin indiqué, sur une branche contrib/<ID> et une PR si possible. Sinon un bloc Markdown complet entre triples backticks, ou un fichier joint ; aucune livraison tronquée. Préciser les sources effectivement lues, les vérifications exécutées et les inconnues. Aucun secret ni donnée personnelle. Ne pas inventer de tests, partenariats ou connexion à d’autres agents.
