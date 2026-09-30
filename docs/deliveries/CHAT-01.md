# CHAT-01 — intégration du module Claude, 27 septembre 2026
Contribution reçue dans chat-module.zip, corrigée par l’intégrateur.

Interface Claude conservée : liste/fil responsive, profils fictifs, texte rendu sans HTML, thème sombre. Corrections : exports compatibles avec le shell existant ; vrais tests TypeScript/React ; pagination des messages récents puis anciens ; brouillons par conversation ; verrou immédiat contre double envoi ; idempotence atomique de l’adaptateur, clé immuable liée au contenu ; isolation des réponses tardives et changement de service ; erreurs et réessais ; copie des données retournées ; refus des conversations inconnues.

Contrats partagés inchangés. createDemoChatService fournit le service en mémoire par instance. Aucun backend ni message externe, destinataires fictifs sans réponse automatique. Messages perdus au rechargement ; brouillons conservés pendant la navigation interne au chat mais pas après démontage du module. La future connexion vendeur→conversation exige un contrat de création/recherche de conversation ; elle n’est pas simulée ici.

Validation : lint, typecheck, build et 13 tests atelier réussis ; 20 tests privés après raccordement Communauté. Sept tests chat sur vrais imports et composants, incluant erreurs, réessai après réponse perdue, clés différentes après modification, doubles clics, XSS et réponses obsolètes.

Vérification visuelle non exécutée : Chromium absent. Vérification DOM via jsdom ; pas d’affirmation de validation visuelle Android ou lecteur d’écran.

Le module expose ChatModule (ChatModuleProps) et createDemoChatService({viewer?,pageSize?}). Viewer par défaut demo-viewer. Le premier lot contient les messages les plus récents dans l’ordre chronologique ; nextCursor charge les plus anciens. Chaque instance de service est isolée ; aucune donnée du profil privé n’est transmise.
