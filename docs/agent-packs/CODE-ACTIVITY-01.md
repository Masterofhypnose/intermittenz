# CODE-ACTIVITY-01 — dossier autonome DeepSeek

28 septembre 2026. Sources publiques, aucune donnée privée. Ce dossier contient le nécessaire pour implémenter sans nouveau copier-coller. Les décisions de la version revue priment sur la proposition initiale.

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

# Spécification complète

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

# AGENTS.md

````md
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

````

# package.json

````json
{"name":"intermittent-plus","version":"0.1.0","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start","lint":"eslint .","typecheck":"tsc --noEmit","test":"node --test tests/*.test.mjs"},"dependencies":{"@heroicons/react":"2.2.0","next":"16.3.6","react":"19.1.1","react-dom":"19.1.1","recharts":"3.2.1"},"devDependencies":{"@types/node":"24.5.2","@types/react":"19.1.13","@types/react-dom":"19.1.9","eslint":"9.36.0","eslint-config-next":"16.3.6","jsdom":"26.1.0","typescript":"5.9.2"}}
````

# lib/contracts/modules.ts

````ts
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

````
