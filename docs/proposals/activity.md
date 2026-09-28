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
