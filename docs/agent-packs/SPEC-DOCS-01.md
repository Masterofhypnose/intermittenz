# Dossier autonome — SPEC-DOCS-01

Instruction : exécute uniquement cette mission à partir des fichiers ci-dessous. Si GitHub est inaccessible, le contenu embarqué suffit. Déclare les commandes non exécutées. Les spécifications jointes peuvent couvrir un périmètre plus large : le brief de ce lot borne le travail. Aucune donnée privée.


---

## Fichier : docs/missions/SPEC-DOCS-01.md

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


---

## Fichier : AGENTS.md

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


---

## Fichier : README.md

# Intermittent+ — atelier public de collaboration

**Commencez ici.** Ce dépôt fournit tout le nécessaire pour développer et tester les modules délégués sans accès au dépôt privé : application Next.js exécutable, contrats TypeScript, dépendances verrouillées, fixtures fictives, tests réels et missions.

Ce n'est pas le produit complet. Le moteur des droits, les profils personnels, les données et l'historique privés ne sont pas publiés. Aucun secret requis.

## Une seule instruction à donner à un agent

> Lis https://github.com/Masterofhypnose/intermittenz, puis AGENTS.md et docs/TASKS.md. Prends uniquement la mission qui t'est affectée. Clone/fork ce dépôt si ton outil le permet, travaille sur une branche séparée et rends une pull request vers ce dépôt public. Teste le code réel. Ne reconstruis pas le produit. Si tu ne peux pas lire le lien, exécuter des commandes ou envoyer une PR, annonce cette limite avant de commencer.

## Mise en route
Node.js 22, npm. Aucune variable d'environnement.
```sh
git clone https://github.com/Masterofhypnose/intermittenz.git
cd intermittenz
npm ci
npm run dev
```
Ouvrir http://localhost:3000. Le menu permet de tester Marketplace et le point de montage Chat.
```sh
npm run lint
npm run typecheck
npm run build
npm test
```
Les tests utilisent node:test, TypeScript, React et jsdom déjà installés. Voir tests/marketplace.test.mjs pour tester les vrais modules sans recopier leur logique. La CI exécute ces commandes sur les PR ; les PR provenant de forks peuvent nécessiter l'autorisation d'exécution du propriétaire.

## Lire selon sa mission
- [Contexte, architecture et état produit](docs/CONTEXT.md)
- [Missions et responsables](docs/TASKS.md)
- [Roadmap de toutes les sections](docs/ROADMAP.md)
- [Chat : critères complets](docs/missions/CHAT-01.md)
- [Marketplace : état et suite](docs/missions/MARKET-02.md)
- [Contrats communs](lib/contracts/modules.ts)
- [Livraison et orchestration](docs/WORKFLOW.md)

## Ce que le lien permet réellement
Un agent qui sait lire GitHub peut récupérer le contexte. Un agent avec environnement Node peut tester l'atelier. Un agent authentifié avec GitHub peut proposer une PR depuis une branche autorisée ou un fork. Rendre le dépôt public ne donne pas les droits d'écriture et ne déclenche pas un modèle automatiquement.

Aucun compte Claude/DeepSeek/Gemini/Grok n'est piloté par ce dépôt. Un chat sans outils ne peut ni se lancer tout seul, ni pousser son code. Le dépôt évite de recopier les fichiers ; l'exécution autonome demande une connexion agent/API distincte.

Pas d'URL web publique de cet atelier encore provisionnée. La preview du produit reste séparée et peut exiger une connexion Vercel. Le clone local est autonome et n'en dépend pas.


---

## Fichier : docs/CONTEXT.md

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


---

## Fichier : docs/TASKS.md

# Tableau de missions — 28 septembre 2026

| ID | Responsable prévu | Statut | Périmètre |
|---|---|---|---|
| CHAT-01 | Claude puis intégrateur | ZIP reçu, corrigé et testé — [PR #3](https://github.com/Masterofhypnose/intermittenz/pull/3) ouverte ; branché sur la preview privée, ne pas refaire | Conversations démo, pagination, brouillons, envoi local et 7 tests réels |
| MARKET-01 | DeepSeek via le fondateur puis intégrateur | Livré, corrigé et testé | Marketplace présente dans cet atelier |
| MARKET-02 | DeepSeek puis intégrateur | CI atelier verte ; report identique dans la branche privée de preview, 13 tests privés réussis — [PR #2](https://github.com/Masterofhypnose/intermittenz/pull/2) publique ouverte, ne pas refaire | Focus au retour catalogue, pagination conservée et favoris isolés par service |
| JOBS-01 | Grok puis intégrateur | Livré, corrigé et testé — [PR #4](https://github.com/Masterofhypnose/intermittenz/pull/4), CI publique verte au commit 0ce33c8 ; intégré sur la branche privée de preview (7eb3950), 26 tests locaux réussis ; ne pas refaire | Catalogue, dates/rémunération, fiche, favoris et 6 tests réels |
| SPEC-ACTIVITY-01 | Claude puis intégrateur | Reçue et amendée — [PR #6](https://github.com/Masterofhypnose/intermittenz/pull/6), base normative pour CODE-ACTIVITY-01 ; ne pas refaire | Contrat activité/calendrier et persistance locale |
| SPEC-DOCS-01 | Gemini | Accès GitHub indisponible ; dossier autonome préparé — [pack](agent-packs/SPEC-DOCS-01.md) | Coffre local : spécification et contrat proposés |
| QA-DISPLAY-01 | DeepSeek puis intégrateur | Rapport reçu et [trié](reviews/QA-DISPLAY-01.md), correctifs appliqués aux PR #2/#3/#4 et preview privée ; 26 tests privés et 19 tests atelier locaux réussis. Visuel/lecteur d’écran non exécutés ; ne pas refaire cette revue statique | Titres longs, largeur Chat, filtres Jobs accessibles |
| SPEC-SOURCES-01 | Grok puis intégrateur | Reçue, revue et amendée — [PR #5](https://github.com/Masterofhypnose/intermittenz/pull/5) ouverte ; documentation officielle partiellement vérifiée, aucun compte/API activé ; ne pas refaire | Sources et mapping conservateur, cycle de vie sans retrait déduit d’une recherche |

Une mission n'est pas attribuée ou lancée automatiquement par ce tableau. Vérifier les PR ouvertes pour éviter les doublons ; ne pas prendre deux missions qui modifient les mêmes fichiers.

QA-01 historique : [rapport Grok reçu et trié](reviews/QA-01.md). Revue statique de main, sans SHA exact ni exécution. Les points focus/pagination sont déjà corrigés dans MARKET-02 ; ne pas refaire. QA-DISPLAY-01 est également clôturée côté revue statique ; ne pas la relancer.

## Sections supplémentaires prêtes à spécifier
- SPEC-DOCS-01 → Gemini : docs/missions/SPEC-DOCS-01.md. Livrable limité à docs/proposals/documents.md. Dossier autonome préparé ; démarrage non confirmé.
- SPEC-JOBS-01 → Grok : docs/missions/SPEC-JOBS-01.md. Livrable reçu via le fondateur, revu et déposé dans [PR #1](https://github.com/Masterofhypnose/intermittenz/pull/1). Revue Grok reçue : aucun blocage restant au commit 763792b. PR non fusionnée ; base validée pour le module isolé JOBS-01. Ne pas refaire la mission.

La couverture des autres sections et leurs dépendances se trouve dans [ROADMAP.md](ROADMAP.md). Les spécifications évitent que chaque contributeur crée sa propre auth, base ou architecture.

## Répartition du 28 septembre
Chaque agent prend uniquement sa ligne ci-dessus. QA-01 générique est remplacée par QA-DISPLAY-01. Le fondateur déclenche les agents dans leurs propres conversations ; le dépôt ne les pilote pas. L’intégrateur garde la jauge 507h et le shell privé. Aucun besoin d’accès au produit privé pour ces quatre missions. Relire ce tableau avant de commencer ; ne pas reprendre CHAT-01, MARKET-02 ou JOBS-01 déjà livrés.

## Développement activité
| ID | Responsable | Statut | Sources |
|---|---|---|---|
| CODE-ACTIVITY-01 | Claude | En pause : quota Claude à nouveau atteint. Avancement du code à récupérer ; mission conservée chez Claude, pas de réattribution | [Mission](missions/CODE-ACTIVITY-01.md), [dossier autonome complet](agent-packs/CODE-ACTIVITY-01.md) |

## Actualités — nouvelle mission préparée
| ID | Responsable prévu | Statut | Livrable |
|---|---|---|---|
| SPEC-NEWS-01 | Grok puis intégrateur | Reçue et amendée — [PR #8](https://github.com/Masterofhypnose/intermittenz/pull/8), flux Service Public vérifié par GET/XML ; pas de code ni déploiement. Ne pas refaire | docs/proposals/news-sources.md |

Objectif : valider un flux officiel réellement accessible pour l’onglet Actualités et son aperçu dashboard. La première version du produit utilise une sélection éditoriale explicitement datée, pas un RSS automatique. Aucun accès privé requis. Claude garde CODE-ACTIVITY-01 ; DeepSeek a livré SPEC-DECLARATIONS-01 ; Gemini garde SPEC-DOCS-01 ; ne pas refaire les livraisons déjà intégrées.

## Priorités actives — mise à jour après retour des agents
1. Claude : CODE-ACTIVITY-01 en pause quota ; conserver son travail et récupérer l’avancement avant tout relais.
2. DeepSeek : **CODE-EXPENSES-01**, prêt à lancer avec le [dossier autonome](agent-packs/CODE-EXPENSES-01.md). Sa SPEC-DECLARATIONS-01 est reçue en PR #7, ne pas refaire.
3. Grok : **CODE-NEWS-CORE-01**, prêt à lancer avec le [dossier autonome](agent-packs/CODE-NEWS-CORE-01.md). SPEC-NEWS-01 reçue en PR #8, ne pas refaire. Transport XML/cache/raccordement restent distincts.
4. Gemini : **SPEC-DOCS-01**, accès dépôt indisponible ; [dossier autonome à joindre](agent-packs/SPEC-DOCS-01.md), sans navigation GitHub obligatoire.
5. Intégrateur : réception, tests et raccordement privé. Le produit conserve actuellement ses actualités éditoriales.

Chaque dossier contient les consignes, le statut et les sources nécessaires. Ne pas demander au fondateur de recopier TASKS à nouveau. Missions préparées, exécution non confirmée ; le fondateur transmet les dossiers dans chaque conversation. Aucune fusion ni activation de flux n’est réalisée par cette mise à jour.

## Déclarations — réception du 28 septembre
SPEC-DECLARATIONS-01 : contribution DeepSeek amendée ; choix tranchés, rapprochement avec la spec Activité et correction des fonctions déjà présentes. Types proposés contrôlés par tsc ; aucun test applicatif ou nouvelle lecture fiscale dans ce lot documentaire. Le développement du journal nécessite une mission de code séparée avec méthodes de service figées. Les agents n’ont pas à demander les sources privées pour reprendre cette proposition publique.

## Actualités — réception du 28 septembre
Grok : proposition reçue. Intégrateur : documentation Service Public relue, GET HTTP200 et XML RSS2.0/10 éléments/ttl60 vérifiés. Spécification revue : hôtes distincts récupération/liens, normalisation des identités, dates et cache non durable. Types proposés contrôlés par tsc ; aucun connecteur applicatif ou test UI de ce flux exécuté. Le produit conserve la sélection éditoriale jusqu’à intégration du futur lot code.


---

## Fichier : lib/contracts/modules.ts

/** Contracts for isolated contributions. Not an authentication or authorization layer. */
export type PublicProfile = { id: string; displayName: string; avatarUrl?: string };
export type Page<T> = { items: T[]; nextCursor?: string };
export type ModuleContext = { viewer: PublicProfile; organizationId?: string; mode: 'demo' | 'connected' };
export type Conversation = { id: string; members: PublicProfile[]; title: string; unreadCount: number };
export type Message = { id: string; conversationId: string; senderId: string; text: string; sentAt: string };
/** Connected adapters must authorize membership on the server for every operation. */
export interface ChatService {
  listConversations(cursor?: string): Promise<Page<Conversation>>;
  listMessages(conversationId: string, cursor?: string): Promise<Page<Message>>;
  sendMessage(conversationId: string, text: string, clientRequestId: string): Promise<Message>;
}
export type ChatModuleProps = { context: ModuleContext; service: ChatService };
export type Listing = { id: string; seller: PublicProfile; title: string; description: string; category: string; kind: 'sale' | 'rental' | 'service'; priceCents: number; currency: 'EUR'; city: string; imageUrls: string[]; createdAt: string };
export type ListingDraft = Omit<Listing, 'id' | 'seller' | 'createdAt' | 'currency'>;
export interface MarketplaceService {
  search(query: { text: string; category?: string; city?: string; cursor?: string }): Promise<Page<Listing>>;
  create(draft: ListingDraft, clientRequestId: string): Promise<Listing>;
  listFavoriteIds(): Promise<string[]>;
  setFavorite(id: string, favorite: boolean): Promise<void>;
}
export type MarketplaceModuleProps = { context: ModuleContext; service: MarketplaceService; onContactSeller: (sellerId: string, listingId: string) => void };


---

## Fichier : docs/proposals/activity.md

# SPEC-ACTIVITY-01 — Activité et calendrier, version revue

28 septembre 2026. Contribution Claude fournie par le fondateur dans activity.md ; version amendée par l’intégrateur. La contribution initiale était une spécification, sans code ni tests exécutés. Cette version tranche les contradictions avant CODE-ACTIVITY-01.

## 1. Périmètre

Ajouter/modifier/supprimer des activités, liste et calendrier mensuels, stockage individuel local, export/import JSON et CSV. Formulaire court avec détails optionnels. Adaptateur mémoire isolé pour démo/tests et adaptateur local séparé. Aucun compte cloud, OCR, paie, calcul ARE/507h ou conversion cachet/heures.
Les clés intermittent-plus.profile.v1 et intermittent-plus.simulations.v1 ne sont jamais lues ou modifiées par ce module. Le total manuel du profil reste inchangé. Les activités futures sont des saisies de planning, pas des heures acquises. Aucun résumé mensuel ne doit alimenter automatiquement une jauge annuelle.

## 2. Contrat local au module

Tous les types ci-dessous sont exportés par lib/activity/types.ts. ModuleContext est importé de ../contracts/modules. Aucun ajout au contrat partagé dans ce lot.

```ts
import type { ModuleContext } from '../contracts/modules';
export type ActivityNature = 'cachet' | 'heures' | 'cdd' | 'autre';
export type AmountKind = 'brut' | 'net';
export interface ActivityAmount { cents: number; kind: AmountKind }
export interface ActivityDraft {
  nature: ActivityNature;
  employer: string;
  startDate: string;
  endDate?: string;
  cachets?: number;
  hours?: number;
  amount?: ActivityAmount;
  note?: string;
}
export interface Activity extends ActivityDraft {
  readonly id: string;
  readonly createdAt: string;
  updatedAt: string;
  version: number;
}
export interface ActivityFilter {
  month?: string;
  nature?: ActivityNature[];
  cursor?: string;
}
export interface ActivityPage { items: Activity[]; total: number; nextCursor?: string }
export interface DuplicateWarning {
  existingId: string;
  reason: 'same-employer-date-nature' | 'overlapping-period';
}
export type CreateResult =
  | { status: 'confirmation_required'; warnings: DuplicateWarning[] }
  | { status: 'created'; activity: Activity; warnings: DuplicateWarning[] };
export interface ActivityExport {
  format: 'intermittent-plus-activities';
  formatVersion: 1;
  exportedAt: string;
  activities: Activity[];
}
export interface ActivityImportResult {
  imported: number;
  skipped: number;
  conflicts: Array<{ id: string; reason: string }>;
  invalid: Array<{ index: number; reason: string }>;
}
export interface ActivityMonthlySummary {
  month: string;
  totalCachets: number;
  totalHoursDeclared: number;
  totalAmountBrutCents: number;
  totalAmountNetCents: number;
  activityCount: number;
  source: 'activity-module';
  allocation: 'start-date';
}
export type ActivityErrorCode = 'validation' | 'conflict' | 'not_found' |
  'request_conflict' | 'request_deleted' | 'quota_exceeded' |
  'storage_unavailable' | 'storage_corrupt' | 'unsupported_version' |
  'invalid_cursor';
export interface ActivityService {
  list(filter: ActivityFilter): Promise<ActivityPage>;
  get(id: string): Promise<Activity | null>;
  create(draft: ActivityDraft, clientRequestId: string,
    confirmDuplicates?: boolean): Promise<CreateResult>;
  update(id: string, replacement: ActivityDraft, version: number): Promise<Activity>;
  delete(id: string, version: number): Promise<void>;
  exportAll(): Promise<ActivityExport>;
  previewImport(data: unknown): Promise<ActivityImportResult>;
  importAll(data: unknown): Promise<ActivityImportResult>;
  monthlySummary(month: string): Promise<ActivityMonthlySummary>;
}
export type ActivityModuleProps = {
  context: ModuleContext;
  service: ActivityService;
  persistence: 'memory' | 'local';
};
```

Erreurs : instances Error portant code: ActivityErrorCode, message français et éventuellement fields: Record<string,string>. Les promesses rejettent, sauf confirmation_required qui est un résultat sans écriture. Aucune forme libre de « patch » : update remplace tout le brouillon validé, de sorte qu’omettre endDate/hours/amount/note les efface sans ambiguïté.

## 3. Validation structurelle

- Nature dans l’union, employeur trim de 1–120 caractères, note trim au plus 500 caractères ; textes affichés littéralement.
- Dates civiles réelles YYYY-MM-DD, années 0001–9999, mois YYYY-MM ; fin absente équivaut au début, fin >= début. Pas de conversion de fuseau des dates civiles. Pas de limite arbitraire « aujourd’hui + un an » ou de période 365 jours.
- createdAt/updatedAt : timestamps UTC ISO produits avec Date.toISOString(). now injectable : () => Date. updatedAt peut égaler createdAt lors d’opérations rapides ; la version est le marqueur de concurrence, pas l’horloge.
- cachets : entier sûr de 1 à 999, requis et autorisé uniquement pour nature cachet. hours : 0 à 9999, au plus deux décimales, sans arrondi silencieux ; requis >0 pour nature heures, optionnel autrement, y compris avec cachets documentaires. Changer de nature doit avertir avant suppression d’un champ incompatible.
- Montant facultatif : centimes entiers sûrs >=0, kind brut/net explicite. Aucune devise autre qu’EUR, aucune conversion brut/net. Parsing décimal exact depuis chaîne en UI, deux décimales maximum. 0 n’est pas « absent ». Sommes et versions doivent rester des entiers sûrs ; rejeter le dépassement au lieu de perdre de la précision.
- UUIDv4 généré par crypto.randomUUID ou factory injectée en tests ; id, dates et version validés à l’import. version entier sûr >=1. Aucune propriété inattendue à recopier aveuglément ; normaliser vers les champs connus.
- Maximum 2000 activités actives : limite produit, sans équivalence inventée en années ou heures. Import : fichier JSON <=5 Mio, <=2000 entrées, chaînes bornées ; ces plafonds sont des limites de ressources, pas des règles métier.

## 4. Mois, périodes et totaux

list({month}) inclut toute activité dont la période [startDate,endDate ou startDate] intersecte le mois. Le calendrier la montre chaque jour concerné, mais la liste une seule fois. Pagination complète requise pour afficher tous les marqueurs : ne pas confondre première page et mois entier. Annuler/ignorer les pages tardives quand le mois change.
Tri total : startDate DESC, createdAt par instant DESC, id DESC. Curseur opaque lié aux filtres normalisés, basé sur cette clé, pas un offset ni la présence obligatoire de l’ancre. total = nombre filtré avant pagination. nature absente ou [] signifie toutes ; doublons des filtres supprimés, ordre normalisé. Curseur réutilisé avec d’autres filtres : invalid_cursor. Pas de promesse d’instantané face aux modifications.

monthlySummary attribue l’intégralité d’une activité au mois de son startDate, une seule fois. Aucun prorata de montant/heures sur les jours. Cachets et heures sont additionnés séparément ; sommes d’heures calculées en centièmes pour éviter les erreurs flottantes ; brut et net séparés. Le bandeau indique : « Totaux des activités débutant ce mois — montants de période, pas revenus encaissés ; données saisies non validées réglementairement ». Une activité chevauchante peut donc apparaître au calendrier sans entrer dans le total du mois suivant : afficher cette règle près du résumé.
La fiche indique les dates et montants de période. Aucune prétention à connaître les dates réelles de paiement ou de réalisation à partir des seuls champs saisis.

## 5. Doublons et idempotence

Employeur normalisé pour comparaison : trim, espaces internes ramenés à un, minuscules FR ; ne pas retirer les accents. Comparer aux activités actives. Une seule alerte par existingId : priorité même employeur/début/nature, sinon chevauchement inclusif avec même employeur. Trier les alertes par ID.
create(..., false) sans doublon crée ; avec doublon retourne confirmation_required et ne persiste rien. L’UI propose Créer quand même / Annuler. Après confirmation, rappeler avec même brouillon et même clientRequestId, confirmDuplicates=true. En cas d’annulation rien n’a été créé.
Après création réussie, même requestId + même brouillon normalisé retourne le même résultat de création, sans seconde écriture. Même ID + autre brouillon rejette request_conflict. Après suppression de l’activité correspondante, un ancien retry rejette request_deleted et ne recrée rien. La confirmation n’est pas un changement de brouillon. Désactiver les doubles clics ; après résultat réseau/stockage ambigu conserver la clé jusqu’au retry ou changement de saisie.
update n’invente pas d’idempotence : version incorrecte -> conflict. Toute suppression vérifie la version ; id absent -> not_found. Suppression des octets d’activité immédiate, pas de purge déclenchée par export. Le registre technique de requêtes conserve la clé/empreinte et l’ID pour éviter la recréation ; ne pas y conserver le contenu supprimé. Ce registre n’est pas un journal métier.

## 6. Persistance locale et concurrence

Clé exclusive : intermittent-plus.activities.v1. Enveloppe interne versionnée séparée du format d’export : activités, révision et registre d’idempotence technique. Brouillon uniquement en mémoire ; pas de fausse promesse de purger localStorage « à la fermeture » du navigateur.
Adaptateur localStorage : chaque mutation lit, valide et modifie sous un verrou exclusif commun via Web Locks nommé intermittent-plus.activities.v1. L’état sérialisé entier est écrit par un unique setItem après validation ; aucune mutation en mémoire annoncée comme sauvegardée avant succès. Relecture sous verrou avant contrôle de version/import pour les onglets concurrents. Les écritures extérieures ignorant ce verrou ne sont pas couvertes.
Si Web Locks ou localStorage indisponible : lecture/export si possible, mutation rejetée avec storage_unavailable. Ne pas simuler une sauvegarde réussie en mémoire. Le composant garde la saisie et explique l’échec. Quota navigateur réel -> quota_exceeded, export des données existantes disponible. JSON corrompu/version interne inconnue : erreur explicite, jamais réinitialisation automatique. Le mécanisme de reprise devra permettre de télécharger le contenu brut existant sans le publier.
Événement storage : rafraîchissement explicite/relecture, versions protégeant les modifications concurrentes. Aucune isolation de comptes garantie : données attachées à l’origine et au navigateur, pas à context.viewer. Ne pas utiliser ce mode pour comptes multi-utilisateurs.
Adaptateur mémoire séparé : instance autonome avec now et idFactory injectables, données copiées, fixtures fictives couvrant 3 mois. Aucun accès localStorage dans la démo. Possibilité seed:[] pour tests.

## 7. Import et export

JSON uniquement à l’import, données reçues en unknown puis validées. Enveloppe format et formatVersion exactement attendus, array obligatoire ; enveloppe incorrecte -> rejet sans mutation. Chaque ligne incorrecte produit invalid avec index et motif. IDs dupliqués dans le fichier : toutes les lignes portant cet ID sont invalides (pas de choix silencieux).
Même ID déjà présent : version ET champs normalisés ET timestamps identiques -> skipped ; toute différence -> conflicts, quelle que soit la version entrante. Jamais d’écrasement automatique par une version « plus grande » issue d’un autre appareil.
previewImport ne modifie rien, imported y signifie « nouveaux éléments admissibles ». Afficher le bilan puis demander confirmation. importAll revalide contre l’état courant sous verrou ; son bilan effectif fait foi si les données ont changé depuis l’aperçu. Il ajoute uniquement les nouveaux valides, conserve les conflits sans les appliquer, et persiste l’ensemble des ajouts en une fois. Dépassement quota ou erreur de stockage : aucun ajout. Un ID supprimé puis réimporté depuis une sauvegarde peut être restauré seulement par cet import explicitement confirmé ; cela ne réactive pas un ancien clientRequestId supprimé.
exportAll est en lecture seule, activités triées comme list sans pagination, copies défensives, aucun registre technique. Réimport du même export dans le même état : tout skipped. Version inconnue (y compris 0) refusée.
CSV export uniquement : toutes les colonnes nécessaires (id,nature,employer,startDate,endDate,cachets,hours,amountCents,amountKind,note), encodage UTF-8, échappement guillemets/retours, neutralisation des cellules textuelles interprétables comme formules. Ne pas annoncer un export CSV comme sauvegarde réimportable.
Téléchargement standard avec révocation des URL objet ; partage natif optionnel seulement si supporté. Aucun envoi de fichier à un tiers.

## 8. UI et Android

Champs de base : nature, employeur, début, cachets OU heures, montant facultatif avec choix brut/net requis si montant. Détails repliés : fin, note, heures documentaires additionnelles pour cachet. Date de fin facultative toujours accessible, sans condition ambiguë « si un seul jour ».
Enregistrer est bloqué pendant l’opération ; soumettre un formulaire invalide montre les erreurs liées aux champs et place le focus sur la première, plutôt qu’un bouton muet désactivé. Saisie conservée sur échec. Conflit d’édition : garder la saisie, proposer recharger explicitement, ne pas l’effacer automatiquement.
Abandon : confirmation si brouillon modifié. Suppression : bouton explicite et dialogue avec résumé/Annuler/Confirmer ; pas de geste obligatoire. Si dialogue : focus initial, Escape/Annuler, focus contenu puis rendu au déclencheur. Pas de focus trap dans les listes ordinaires.
Calendrier lundi-dimanche, dates civiles ; chevrons mois accessibles (swipe facultatif), retour aujourd’hui. Chaque jour sélectionnable par bouton nommé avec date/nombre ; couleur complétée par texte. À 320px, liste des activités du jour sous la grille ou panneau accessible, pas sept formulaires écrasés. Chargement, vide, erreur/réessai, import en cours, suppression en cours explicites. Focus restauré après édition/retour, aucune réponse obsolète au changement de service/mois/démontage.
Bannière : mémoire = démonstration fictive perdue au rechargement ; local = données sur ce navigateur, exporter pour sauvegarder. Persistance prop déclare le mode réellement branché, pas une identité authentifiée.

## 9. Tests d’acceptation

Vrais imports, node:test et React/jsdom disponibles ; pas de copie de fonctions. Adapter localStorage avec doubles injectés de stockage et verrous, sans nouvelle dépendance. Tests navigateur réels séparés si disponibles.

1. Validation dates bissextiles/inversées, employer, nature, cachets/heures mixtes, montant exact/absent/0, bornes et erreurs de champs.
2. Création simple, doublon sans écriture, annulation, confirmation, idempotence même clé, clé+contenu différent, retry après suppression.
3. Update complet efface champs omis, version incorrecte, timestamp égal permis, suppression/version/not_found.
4. Concurrence deux instances locales : relecture sous verrou, un seul succès pour même version, aucun état perdu.
5. Mois chevauchants au calendrier et attribution start-date aux totaux ; fin inclusive, changement de fuseau sans glissement, cachets non convertis, brut/net séparés.
6. Pagination clés identiques, ancre absente, filtres modifiés, chargement complet calendrier et réponses tardives ignorées.
7. Import aperçu sans écriture, valide/invalides/conflits, IDs dupliqués, réimport identique, différence même version, version supérieure non écrasante.
8. Quota, JSON corrompu, stockage/verrou indisponible, échec setItem : aucun succès fictif, export/reprise possibles.
9. React ajouter/modifier/supprimer/annuler, bascule liste/calendrier, erreurs, focus, texte hostile littéral, export/import confirmé.
10. Clés profil/simulations strictement intactes ; instance mémoire ne touche jamais au stockage.
11. CSV formules/retours/guillemets ; URLs de téléchargement révoquées.
12. Visuel 320/390/768/1280, clavier et calendrier : annoncer honnêtement non exécuté si navigateur absent.

## 10. CODE-ACTIVITY-01

Lot autorisé dans components/activity/**, lib/activity/**, tests/activity*.test.mjs, docs/deliveries/CODE-ACTIVITY-01.md. Service et types ont une seule définition dans types.ts ; pas de doublon service.ts contradictoire. Props locales importent ModuleContext ; contrats partagés inchangés.
Formulaire, liste, calendrier, adaptateurs mémoire/local, validation, JSON/CSV et tests selon cette version. L’intégrateur branchera ensuite le shell privé et comparera le stockage existant ; le contributeur ne touche ni AppShell, globals.css, profil, simulation, chat, jobs, marketplace, dépendances ou workflows.
Raccordement dashboard/507h hors lot : il exigera une période de référence explicite et distinction prévu/réalisé/admis. Une sélection utilisateur ne rend pas des heures réglementairement admissibles.


---

## Fichier : docs/proposals/declarations.md

# SPEC-DECLARATIONS-01 — Dépenses, trajets et préparation annuelle

28 septembre 2026. Proposition DeepSeek transmise par le fondateur, revue et amendée par l’intégrateur. Spécification seulement : aucun code applicatif, contrat partagé, dépendance ou moteur de droits modifié. PR à relire avant lancement d’un lot de code.

## 1. Provenance et corrections de la proposition

DeepSeek n’a consulté ni les sites externes ni la spec Activité ; il a travaillé sur le brief et n’a exécuté aucun test. L’intégrateur a lu la spec Activité revue au commit `980f6c290869a066d01c4709e7534ca20acff16b` et rapproché cette proposition du produit existant. Les lectures web effectuées plus tôt le 28/09 par l’intégrateur ne sont pas attribuées à DeepSeek.

Décisions qui remplacent les questions ouvertes :
- Usage professionnel : montant explicite en centimes, pas pourcentage dans ce premier lot.
- Année d’une dépense : dérivée de sa date de paiement, pas un second champ modifiable contradictoire.
- Activité : lecture avec provenance ; aucune priorité à la dernière modification et aucune copie automatique vers un montant déclarable.
- JSON pour sauvegarde/import avec aperçu et confirmation ; CSV pour lecture/export uniquement.
- Comparateur fiscal : différé, pas un écran qui prétend comparer sans pouvoir calculer.
- Justificatif : référence non résolue par défaut ; absence de coffre ne permet pas d’afficher « document présent ».
- Kilomètres annuels : choix exclusif entre journal et total manuel par voiture/année ; jamais la somme des deux.

## 2. Existant et références

| Sujet | État réel du produit avant ce lot | Extension proposée |
|---|---|---|
| Actualisation | Calendrier 2026, rappel dashboard, checklist et confirmation personnelle locales | Récapitulatif documentaire après raccordement Activité |
| Automobile | Total annuel manuel par voiture, barème déclaration 2026/revenus 2025, compléments, brouillon et CSV | Journal de trajets, choix de source annuel explicite |
| Frais réels | Préparation annuelle automobile partielle déjà présente | Dépenses détaillées par catégorie |
| Contrats/cachets | Simulations existantes ; module Activité en développement, pas livré | Consommation du futur service, sans réécriture |
| Justificatifs | Aucun coffre relié | Contrat de référence seulement, raccordement ultérieur |
| Comparateur fiscal complet | Non construit | Différé jusqu’à règles et données vérifiées |

Références fonctionnelles lues par l’intégrateur le 28/09/2026 :
- https://declaart.fr/ : présente dépenses, kilomètres, justificatifs, comparaison de déductions et récapitulatif annuel. Application mobile encore annoncée comme prochainement disponible sur la page lue.
- https://artdecla.fr/ : présente contrats, tableau de bord, rappels et exports.

Ces annonces ne prouvent ni le fonctionnement connecté ni la conformité des calculs des concurrents. Aucun compte créé, application mobile testée, contenu graphique ou code copié. Leur intérêt pour le parcours : saisir au fil de l’année, classer, préparer un récapitulatif vérifiable.

## 3. Premier lot produit

Journal de dépenses et journal de trajets locaux, voitures réutilisables, brouillons, édition, suppression confirmée, vue annuelle, JSON/CSV. Aucune application de barème dans ce nouveau journal tant que son raccordement au calculateur existant n’est pas validé séparément.

Formulaire dépense court : date de paiement, libellé, montant TTC, catégorie. Détails dépliables : montant professionnel revendiqué, remboursement reçu, note, référence à une pièce si un vrai coffre est raccordé. Montant professionnel inconnu par défaut ; bouton explicite « Tout professionnel » possible, sans validation fiscale implicite.

Formulaire trajet court : date, motif, origine/destination en texte, distance réellement parcourue, voiture. L’aller-retour n’est jamais doublé automatiquement. Pas de cartes, géolocalisation ou calcul de distance supposé. Nature du déplacement explicite ; distance retenue fiscalement encore inconnue.

Une dépense enregistrée est une donnée documentaire, pas une déduction acceptée. Un trajet enregistré est une distance documentée, pas une distance automatiquement admissible au barème.

## 4. Types locaux proposés

Types propres au futur module : ne pas ajouter à lib/contracts/modules.ts ni importer le code privé. Les DTO ci-dessous sont la source unique ; toute évolution passe par revue. Un brouillon a réellement des champs facultatifs ; « Enregistrer » exige un enregistrement complet.

```ts
export type CivilDate = string; // YYYY-MM-DD calendaire réel
export type ExpenseCategory = 'materiel' | 'logiciels' | 'transport' | 'repas' |
  'hebergement' | 'formation' | 'local' | 'telecom' | 'assurance' | 'autre';
export type Reimbursement =
  | { kind: 'unknown' }
  | { kind: 'none' }
  | { kind: 'received'; amountCents: number };
export interface ReceiptReference {
  documentId: string;
  linkedAt: string;
}
export type ReceiptLookup =
  | { status: 'unavailable' } // coffre non connecté ou échec d'accès
  | { status: 'missing' }     // absence confirmée par le coffre
  | { status: 'present' };    // présence uniquement, pas authenticité fiscale
export interface ExpenseInput {
  paidOn: CivilDate;
  label: string;
  amountCents: number;
  category: ExpenseCategory;
  professionalCents?: number; // revendiqué par l'utilisateur, inconnu si absent
  reimbursement: Reimbursement;
  receipt?: ReceiptReference;
  note?: string;
}
export interface TripInput {
  date: CivilDate;
  reason: string;
  origin: string;
  destination: string;
  distanceMeters: number;
  vehicleId: string;
  purpose: 'commute' | 'professional' | 'unspecified';
  receipt?: ReceiptReference;
  note?: string;
}
export interface VehicleInput {
  label: string;
  kind: 'car'; // autres véhicules hors premier lot
  fiscalHorsepower: number;
  motorization: 'thermal' | 'electric' | 'hybrid' | 'other';
}
export interface RecordMeta {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export type Expense = RecordMeta & (
  | { state: 'draft'; data: Partial<ExpenseInput> }
  | { state: 'recorded'; data: ExpenseInput }
);
export type Trip = RecordMeta & (
  | { state: 'draft'; data: Partial<TripInput> }
  | { state: 'recorded'; data: TripInput }
);
export type Vehicle = RecordMeta & { data: VehicleInput };
export type MileageSelection = {
  vehicleId: string;
  mode: 'unselected' | 'journal' | 'manual';
  manualDistanceMeters?: number; // conservé si on change de mode, jamais additionné
};
export type AnnualPreparation = RecordMeta & {
  revenueYear: number;
  declarationYear: number;
  mileage: MileageSelection[];
};
export type Entity = Expense | Trip | Vehicle | AnnualPreparation;
export interface JournalExport {
  format: 'intermittent-plus-declaration-journal';
  formatVersion: 1;
  exportedAt: string;
  expenses: Expense[];
  trips: Trip[];
  vehicles: Vehicle[];
  annualPreparations: AnnualPreparation[];
}
export interface ImportReport {
  admissible: number;
  skipped: number;
  conflicts: Array<{ collection: string; id: string; reason: string }>;
  invalid: Array<{ collection: string; index: number; reason: string }>;
}
export type JournalErrorCode = 'validation' | 'conflict' | 'not_found' |
  'request_conflict' | 'request_deleted' | 'storage_unavailable' |
  'storage_corrupt' | 'quota_exceeded' | 'unsupported_version';
```

Pas de champ montant fiscalement retenu, de total annuel cache, de revenu net imposable ou de manualAdjustments générique : cela contournerait la provenance des entrées. Pas de pièces binaires, URL de téléchargement, token ou identifiant personnel dans une ReceiptReference. Même une référence opaque constitue une donnée locale à protéger ; elle n’est pas déclarée « sans données privées ».

## 5. Validation et totaux déterministes

- Argent : centimes entiers sûrs >=0. Virgule/point en saisie, deux décimales maximum, sans arrondi silencieux. 0 est valide, absent est inconnu. Sommes doivent rester entiers sûrs, sinon erreur.
- professionalCents entre 0 et amountCents inclus. Aucune déduction implicite du remboursement : total TTC, part professionnelle revendiquée et remboursements reçus affichés séparément. Si utile, un reste payé = TTC moins remboursement est un indicateur de trésorerie, jamais un montant fiscal.
- received.amountCents >0 et <=amountCents ; aucun remboursement futur supposé. Les cas d’avances/remboursements dépassant la dépense sont hors lot, signalés plutôt que tronqués.
- Distance : mètres entiers sûrs >0. Entrée km avec au plus trois décimales ; convertir exactement, sans arrondir chaque trajet. Unité explicitement affichée. Total annuel en mètres ; le raccordement futur définit l’arrondi final au barème, pas ce journal.
- Dates civiles réelles ; années 2000–2100 dans l’UI et les données, limite produit explicite. Pas de conversion de fuseau. paidOn détermine l’année documentaire de dépense ; Trip.date celle des trajets. Pas de rattachement arbitraire à une année de revenus différente. Une correction de date déplace l’entrée, après avertissement ; une dépense payée après l’année d’un contrat n’est pas réattribuée au contrat.
- AnnualPreparation : unique par revenueYear, declarationYear = revenueYear+1 dans ce premier parcours standard. Ce n’est pas une règle universelle de toutes les déclarations ; les cas rectificatifs conservent l’année concernée et sont hors premier lot.
- Texte trim : libellé/motif/origine/destination 1–160 caractères ; note <=1000. Texte brut uniquement.
- fiscalHorsepower entier 1–50, borne de saisie produit, pas plafond fiscal. Voitures uniquement. Pas de catégories de barème présumées pour une autre motorisation.
- UUID, timestamps UTC ISO et version entier sûr >=1. Version de concurrence, pas « modification la plus récente ». Même horodatage possible sur opérations rapides.
- Pour un brouillon, valider les champs présents, permettre les champs absents et exclure intégralement des totaux. Brouillon sans date visible dans « À compléter », jamais perdu à cause du filtre annuel.
- Une seule référence de voiture dans chaque sélection annuelle. manual exige manualDistanceMeters entier sûr >=0 ; journal utilise tous les trajets enregistrés correspondants ; unselected ne produit pas de distance choisie.

Totaux dérivés en lecture : dépenses enregistrées dont paidOn appartient à l’année, regroupées par catégorie ; parts pro connues avec compteur des parts inconnues ; remboursements connus avec compteur des inconnus ; trajets enregistrés par voiture et année. Aucun remplissage d’une inconnue avec zéro sans mention. Les pièces manquantes n’effacent pas la dépense documentaire, mais apparaissent dans « À compléter ».

Tri des listes/export : date civile DESC (brouillons non datés en premier), createdAt DESC par instant, id DESC. Préparations annuelles triées par année ; voitures par label puis ID. Lire tous les enregistrements pour les totaux, pas la seule page affichée.

## 6. Compatibilité avec les kilomètres manuels existants

Le calculateur actuel conserve ses brouillons dans intermittent-plus.declarations.v1. Le journal utilise une nouvelle clé indépendante ; il ne lit ni ne modifie l’ancienne clé. Le raccordement et sa migration appartiennent à l’intégrateur.

Pour une voiture et une année, afficher côte à côte « total manuel actuel » et « trajets documentés », jamais leur somme. Proposer un choix explicite de source. Avant de passer au journal, avertir que les trajets peuvent ne couvrir qu’une partie de l’année. Conserver le manuel comme donnée de provenance, sans le compter lorsqu’il n’est pas sélectionné.

Pas de rapprochement automatique de voitures par nom. L’intégrateur doit demander un lien explicite entre la voiture du brouillon historique et celle du journal. Si les deux sources ont évolué, présenter les différences ; ne pas écraser par le plus récent. Distance documentaire sélectionnée ne veut pas dire distance fiscalement admise.

## 7. Opérations, doublons et concurrence

Service proposé à définir dans un futur lot de contrat local : listes filtrées, get, create, update complet avec expectedVersion, delete avec expectedVersion, exportAll, previewImport et importConfirmed. Tous asynchrones, erreurs codées ci-dessus, champs en erreur identifiables. Pas de pseudo-signature générique ambiguë : les méthodes et DTO exacts seront figés dans la mission de code avant implémentation.

Create : clientRequestId stable au retry ; même clé+même saisie normalisée renvoie le même ID ; même clé+autre saisie rejette request_conflict. Après suppression, ancien retry rejette request_deleted. Le registre technique conserve une empreinte et l’ID, pas le texte supprimé.

Doublon potentiel : même date/libellé/montant pour dépense, ou même date/voiture/origine/destination/distance pour trajet, textes normalisés trim/espaces/minuscules. Avertir avant écriture ; confirmation explicite permet deux entrées distinctes. Ne pas fusionner automatiquement des achats ou trajets répétés légitimes.

Update remplace le DTO complet ; champs facultatifs omis effacés, version vérifiée. Delete confirmé, version vérifiée ; ne supprime aucun document lié du coffre. Voiture référencée par trajet ou sélection annuelle : suppression refusée avec références à résoudre, pas de cascade. Correction de caractéristiques d’une voiture : avertir qu’elle change les données historiques de cette voiture ; ne pas recalculer silencieusement un résultat fiscal ancien.

Clé proposée intermittent-plus.declaration-journal.v1. Adapter local sous Web Lock exclusif de même nom, relecture/validation/contrôle de version puis unique setItem. Verrou ou stockage indisponible : erreur explicite, jamais bascule silencieuse en mémoire. Adaptateur mémoire séparé pour fixtures. Données corrompues conservées avec export brut possible, pas de réinitialisation. Limites produit : 5000 dépenses, 10000 trajets, 100 voitures ; erreurs explicites, pas purge des anciennes années. Profils/simulations/déclarations actuels intacts.

## 8. Import et export

JSON seul réimportable. Enveloppe versionnée ci-dessus ; unknown validé avant usage. Taille maximale 10 Mio et limites de collections précédentes, limites de ressources produit. Propriétés normalisées explicitement ; pas de copie aveugle.

Aperçu sans écriture : comptages par collection, nouveaux admissibles, identiques ignorés, conflits, invalides. Confirmation obligatoire ; l’import revalide sous verrou contre l’état courant. Seuls nouveaux valides ajoutés ; aucune modification automatique d’un existant même avec version entrante plus grande. Rapport effectif retourné. Même ID+contenu normalisé+version+timestamps identiques => skipped ; sinon conflit. IDs dupliqués dans une collection du fichier => toutes leurs lignes invalides.

Une référence de voiture doit se résoudre vers une voiture locale ou admissible importée. En cas de conflit sur sa définition importée, les trajets/préparations qui en dépendent sont exclus du lot admissible avec raison explicite ; ne pas les rattacher silencieusement à une voiture locale différente. Références de justificatifs peuvent rester unresolved, ne prouvent pas une présence. Une préparation annuelle déjà existante pour la même année mais autre ID est un conflit.

Ajout des nouveaux valides en une écriture atomique, après confirmation du bilan y compris exclusions. Quota/échec setItem => aucun ajout ; conserver le fichier et permettre réessai. Réimport identique => rien dupliqué. CSV n’est pas importable : corrige la proposition initiale « import CSV partiel ».

CSV UTF-8, colonnes stables, IDs/date/année/statut/provenance ; montants cents et euros lisibles, distances mètres et km. Guillemets/retours échappés, neutralisation des formules textuelles. Export signale l’inclusion des brouillons et inconnues. JSON sans registre de requêtes ni octets des justificatifs ; exporter une référence n’exporte pas la pièce. PDF différé.

## 9. Raccordement Activité et coffre

Spec Activité lue :
https://github.com/Masterofhypnose/intermittenz/blob/980f6c290869a066d01c4709e7534ca20acff16b/docs/proposals/activity.md

Activity a startDate/endDate, nature, employeur, cachets, hours, amount brut/net, id/version. monthlySummary attribue les activités au mois de début, sans prorata ; list(month) inclut aussi les périodes chevauchantes. Ni résumé ni amount net ne représentent automatiquement un revenu encaissé, un net imposable ou les données exactes à actualiser.

Raccordement futur par lecture d’ActivityService : conserver source activity-module, ID/version/date de lecture ; montrer les périodes et les champs bruts séparés. Pour l’actualisation, afficher toutes les activités recouvrant le mois (pagination complète), et signaler les périodes chevauchantes à détailler par l’utilisateur. Ne pas recopier monthlySummary comme déclaration France Travail. Données futures ne prouvent pas un travail réalisé. Salaires et allocations demeurent distincts, allocations absentes non inventées.

Correction d’une activité : lien vers son module, pas de seconde activité éditable dans Déclarations. Si l’utilisateur prépare une valeur déclarative différente, garder une correction explicite avec raison/provenance, soumise à revue du futur contrat ; aucune priorité basée uniquement sur un timestamp. Aucun envoi ni accusé France Travail fabriqué.

Coffre : service futur de résolution ReceiptReference -> ReceiptLookup ; pas d’hypothèse de stockage/chiffrement. Non connecté ou erreur => unavailable ; fichier explicitement introuvable => missing. present ne certifie pas la qualité fiscale. Bouton pièce jointes indisponible expliqué tant que le coffre ne fonctionne pas, jamais succès simulé. Supprimer le lien ne supprime pas le document. Ne pas modifier SPEC-DOCS-01.

## 10. Registre des sources fiscales

La limite de lecture de DeepSeek ne remet pas à « inconnu dans tout le projet » les paramètres déjà vérifiés par l’intégrateur et testés dans le produit. Garder auteur, date, URL, millésime, portée et incertitudes distincts. Aucun nom de relecteur ne remplace la preuve documentaire.

| Sujet | État au 28/09/2026 | Source / suite |
|---|---|---|
| Calendrier FT 2026 | Lu auparavant par l’intégrateur, rappel existant ; non relu par DeepSeek | https://www.francetravail.fr/candidat/vos-droits-et-demarches/vos-demarches-aupres-de-pole-emp/le-calendrier-des-paiements.html |
| Automobile déclaration 2026/revenus 2025 | Paramètres existants lus auparavant par l’intégrateur ; nouveau journal ne les redéfinit pas | https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/frais.htm |
| Autres millésimes, véhicules, arrondi fiscal du journal | Non validés pour ce raccordement | DGFiP/BOFiP, revue séparée nécessaire |
| Forfaits propres à certaines professions artistiques, cumul/exclusions | À vérifier par profession/année/catégorie, pas taux universels | BOFiP exact à identifier et lire |
| Remboursements, dépenses mixtes, amortissement et justificatifs | Pas de calcul d’éligibilité complet | Sources officielles à documenter avant automatisation |
| Conservation des pièces et cas particuliers d’actualisation | Non tranchés dans ce lot | DGFiP/France Travail selon sujet |

Pas de comparateur descriptif trompeur : le premier lot affiche des données et ce qui manque. Futur comparateur chiffré seulement si périmètre de règles et données suffisant ; sinon résultat « non calculable ». Un lien sortant vers un simulateur officiel ne constitue pas un préremplissage de ce simulateur. Aucune promesse d’économie d’impôt sans calcul approprié.

## 11. Acceptation à convertir en tests réels lors du lot de code

1. Dépense 33+33+33 cents =99 ; zéro distinct d’inconnu ; invalides/calendrier/bissextile rejetés.
2. Brouillon incomplet conservé, non totalisé ; passage recorded exige les champs ; erreurs près des champs, focus première erreur.
3. Part pro 6000 sur dépense10000 avec remboursement4000 : trois chiffres distincts, aucune déduction fiscale produite.
4. Deux trajets100km même voiture/année =>200000m ; deux voitures =>100000m chacune ; deux années séparées.
5. Total manuel1000km et journal200km : mode manual=>1000, journal=>200, jamais1200 ; changement confirmé et réversible.
6. Dépense payée2026 liée à un contrat2024 reste dans vue2026 ; année active2025 ne la réaffecte pas ; aucune perte de l’entrée.
7. Doublon averti sans écriture puis confirmation ; retry même clé sans double ; suppression puis retry ne recrée rien.
8. Deux éditions même version : un succès, un conflit, saisie préservée. Verrou absent/quota/corruption =>pas de succès fictif.
9. Aperçu import sans écriture ; part admissible confirmée atomique ; conflits, IDs doublons et références voitures non résolues exclus ; réimport identique ignoré.
10. Coffre indisponible, référence supprimée, document présent : trois états distincts sans crash ni faux justificatif.
11. Activité chevauchant deux mois visible comme période à vérifier ; brut/net séparés ; aucun résumé traité comme net imposable.
12. Export CSV texte hostile/formule/guillemets ; JSON réimportable sans pièces ; clés existantes intactes.
13. UI mobile320/390 et desktop1280 : ajout/édition/suppression/annulation, changement d’année, focus, contenu littéral, brouillon conservé sur erreur. Visuel seulement si réellement exécuté.

Aucun de ces tests n’a été exécuté dans cette mission de spécification.

## 12. Livraison et prochaine décision

Document seul dans docs/proposals/declarations.md, contribution DeepSeek amendée. Pas de fusion ni développement déclenchés par cette PR. Avant code : figer les méthodes de service et les fichiers autorisés dans une mission dédiée ; fournir un agent-pack contenant cette version revue et l’extrait Activité, afin de ne pas demander à l’agent de deviner le raccordement inaccessible.

Premier lot : journal documentaire local autonome, sans raccordement aux anciennes clés. L’intégrateur garde migration, shell et connexion ultérieure au calculateur. Différés : PDF, coffre/OCR, fiscalité complète, comparateur, raccordement effectif Activité et toute transmission externe.
