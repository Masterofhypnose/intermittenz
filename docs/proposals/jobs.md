# Proposition Emploi & Castings — SPEC-JOBS-01

Date : 26 septembre 2026. Contribution de Grok transmise par le fondateur, revue et amendée par l'intégrateur. Statut : proposition, pas module livré.
Base vérifiée par l'intégrateur : bf16af9bae7767b40c58cbfe987b3b9e9b5e7977 (main public). Grok a indiqué avoir consulté main, sans fournir le SHA exact : cette précision n'est pas reconstituée rétroactivement.
Aucun changement de lib/contracts/modules.ts, aucune collecte, API appelée avec identifiants, candidature, inscription ou prise de contact dans ce lot.

## 1. Objectif et parcours
Catalogue paginé → filtres métier/lieu/dates/rémunération/type → détail → favori → choix de candidature. L'utilisateur décide de chaque démarche ; pas de matching opaque ni promesse de contrat.
Mobile 390 px : liste puis détail, retour avec conservation des filtres et du défilement. Desktop 1280 px : liste et panneau éventuel. États : chargement, vide, erreur avec retry, favori en cours/en échec, offre expirée/retirée/introuvable.

Le premier lot utilise uniquement des offres fictives explicitement marquées. Les annonces d'auteurs réels attendent auth et organisations. L'ingestion externe attend licence/autorisation et validation de l'adaptateur. Un contenu accessible publiquement n'est pas considéré comme librement réutilisable.

## 2. Modèle proposé — à valider avant implémentation
Les imports ci-dessous font référence aux types existants. Ce bloc n'est pas ajouté aux contrats actifs.

```ts
import type { Page, PublicProfile, ModuleContext } from '../../lib/contracts/modules';

export type JobKind = 'casting' | 'salaried' | 'service' | 'volunteer';
export type PayUnit = 'day' | 'hour' | 'cachet' | 'month' | 'total';
export type Remuneration =
  | { status: 'known'; amountCents: number; currency: 'EUR'; unit: PayUnit;
      basis: 'gross' | 'net' | 'invoice_excl_tax' | 'invoice_incl_tax' | 'unspecified' }
  | { status: 'unknown' }
  | { status: 'not_applicable' };
export type JobSource =
  | { type: 'demo'; name: string; collectedAt: string }
  | { type: 'author'; name: string; collectedAt: string }
  | { type: 'external'; name: string; canonicalUrl: string; externalId?: string;
      collectedAt: string; lastVerifiedAt?: string };
export type JobOffer = {
  id: string;
  source: JobSource;
  status: 'active' | 'expired' | 'withdrawn';
  expiresAt?: string; // ISO timestamp avec fuseau : échéance de candidature
  title: string;
  description: string; // texte brut
  kind: JobKind;
  contractType?: string; // casting n'indique pas à lui seul la nature du contrat
  category: string;
  location: { city?: string; department?: string; region?: string;
    country: string; remote?: boolean };
  dates?: { start?: string; end?: string; flexible?: boolean }; // YYYY-MM-DD, période de travail
  remuneration: Remuneration;
  publisher: PublicProfile; // référence d'affichage, pas compte interne authentifié garanti
  application:
    | { mode: 'none' }
    | { mode: 'external'; url: string }
    | { mode: 'internal'; publisherId: string };
  createdAt: string;
};
export type JobSearchQuery = {
  text?: string;
  category?: string;
  city?: string;
  kind?: JobKind;
  startsOnOrAfter?: string;
  endsOnOrBefore?: string;
  remunerationStatus?: Remuneration['status'];
  pay?: { minimumCents: number; unit: PayUnit;
    basis: 'gross' | 'net' | 'invoice_excl_tax' | 'invoice_incl_tax' };
  cursor?: string;
};
export type JobLookup =
  | { status: 'active'; offer: JobOffer }
  | { status: 'expired'; offer: JobOffer }
  | { status: 'withdrawn' }
  | { status: 'not_found' };
export interface JobsService {
  search(query: JobSearchQuery): Promise<Page<JobOffer>>;
  getById(id: string): Promise<JobLookup>;
  listFavoriteIds(): Promise<string[]>;
  setFavorite(id: string, favorite: boolean): Promise<void>;
}
export type JobsModuleProps = {
  context: ModuleContext;
  service: JobsService;
  onContactPublisher?: (publisherId: string, offerId: string) => void;
};
```

### Règles de données
- Montants en centimes entiers sûrs, positifs ou nuls. Un montant inconnu n'est pas zéro. Ne pas convertir automatiquement salaire brut/net ou facture/salaire.
- Filtre de montant : comparer uniquement les mêmes unité et base. Un cachet ne se compare pas à un salaire mensuel. Ne pas convertir les bases inconnues.
- `not_applicable` est réservé aux offres explicitement bénévoles. Un casting peut conduire à un emploi salarié : le type de contrat et la rémunération doivent rester distincts du format de recrutement. Dans un lot ultérieur, envisager deux axes de catégorisation si les offres le nécessitent.
- `canonicalUrl` obligatoire pour les sources externes, pas de faux lien pour les fixtures ou annonces internes. URLs externes HTTPS sans identifiants dans l'URL.
- Une source externe ne crée pas automatiquement un compte recruteur Intermittent+. Son publisher est une référence d'affichage. Le contact interne n'est proposé que pour une identité interne vérifiée.
- `expiresAt` correspond à la candidature, pas à la date de fin de travail. Convertir une date sans heure uniquement avec une politique de fuseau documentée ; ne pas inventer une précision venant de la source.
- Dates de travail manquantes : ne pas les supposer compatibles avec un filtre daté ; annoncer que les offres à dates inconnues sont exclues de ce filtre. Les fixtures comportent cas connus, flexibles et inconnus.

## 3. Service et comportements
Recherche : seulement offres actives par défaut, curseur stable lié aux filtres. Une nouvelle recherche réinitialise le curseur ; ignorer les réponses obsolètes. Aucun résultat = items vide, pas erreur.
Détail : une offre expirée reste consultable si conservée, avec candidature désactivée. Une offre retirée n'expose plus son ancien contenu. Une erreur réseau est un rejet distinct des états métier de JobLookup et affiche Réessayer.
Favoris : chargement initial explicite, mutation protégée contre les doubles clics, rollback et erreur visible. Un favori devenu introuvable peut être supprimé. Le contrat ne permet pas de promettre une liste complète de fiches favorites sans lectures getById correspondantes.
Dédoublonnage : privilégier (source.name, externalId), sinon (source.name, canonicalUrl normalisée). Ne pas supprimer des paramètres de query qui identifient l'annonce. La mise à jour d'une offre conserve son identité et l'état favori.
Conservation : durée selon source/licence, à définir avant ingestion ; suppression des copies de contenu après retrait selon conditions applicables. Métadonnées minimales seulement si leur conservation est justifiée.
`viewer` et `organizationId` ne sont jamais une preuve d'autorisation ; les services connectés appliqueront les contrôles côté serveur.

## 4. Candidature
Premier lot : aucune candidature réelle envoyée, aucun email ni message réel. Les fixtures utilisent application.mode='none'.
Lot connecté : lien HTTPS officiel ouvert uniquement après clic explicite, avec indication du site externe ; ou callback de contact interne lorsqu'il est disponible et autorisé. Un callback n'est ni un envoi de candidature ni une création automatique de conversation. Aucun écran de succès trompeur.

## 5. Sources candidates et vérification
Les affirmations de recherche de Grok sont des pistes, pas des droits d'exploitation acquis. L'intégrateur n'a pas confirmé les licences ni appelé une API authentifiée.

| Source | Éléments observés / statut | Conditions avant usage |
|---|---|---|
| [France Travail, catalogue Offres d'emploi](https://francetravail.io/produits-partages/catalogue/offres-emploi) | URL fournie par Grok ; ouverture par l'intégrateur le 26/09/2026 sans contenu textuel exploitable. OAuth, version exacte, licence, filtrage et fraîcheur non vérifiés ici. | Lire documentation et licence actuelles ; vérifier accès, champs, attribution, contacts, limites, conservation et couverture spectacle. Pas d'engagement « accès libre » ou « temps réel » dans ce document. |
| [CN D, auditions et offres](https://www.cnd.fr/fr/auditions-offres-emploi) | Page officielle lue le 26/09/2026 : offres du secteur chorégraphique et diffusion annoncée d'emplois salariés. Pas de droit de republication identifié par cette lecture. | Examiner conditions et obtenir autorisation si nécessaire. La possibilité de déposer une offre au CN D n'autorise pas sa recopie ailleurs. Aucune fréquence hebdomadaire garantie ici. |
| [ProfilCulture](https://www.profilculture.com/) | Piste de Grok, conditions/API non vérifiées par l'intégrateur. | Analyse des droits et accord éventuel avant import. |
| Cast Prod, Tony Comédie, Spectable | Liste de veille fournie par Grok, non vérifiée. | Identifier sites officiels et leurs conditions ; aucun collecteur à construire sur cette seule liste. |
| Agrégateurs généralistes | Aucun fournisseur ni contrat évalué dans ce lot. | Hors première intégration. |

Aucune ingestion « manuelle » de contenus externes n'est exemptée de la validation des droits. Les sources externes peuvent être utilisées comme liens de consultation sans annoncer une intégration ; la republication de leurs données est un chantier distinct.

## 6. Tests attendus du futur module
- Filtres texte/métier/lieu/type, dates absentes, rémunération inconnue et bases/unités incompatibles.
- Pagination stable, remise à zéro après filtre, résultats hors ordre.
- Détail actif/expiré/retiré/introuvable et vraie erreur réseau.
- Favori : initialisation, clic concurrent, échec visible, retry et retrait d'un favori supprimé.
- Mise à jour d'une même source sans doublon et provenance préservée.
- HTML malveillant affiché comme texte, URL dangereuse refusée.
- Aucun envoi réel en mode démo ; aucune action de candidature sur offre expirée.
- Mobile 390 px/desktop 1280 px : retour, focus clavier, scroll et filtres conservés.
Tester les vrais imports et composants ; pas de copie de logique dans les tests.

## 7. Livraison et suite
Ce fichier est une spécification revue, pas des contrats approuvés ni du code exécutable déployé. Les signatures tronquées de la réponse Grok ont été réparées ; les filtres dates/rémunération, bases salariales, provenance conditionnelle et états métier ont été ajoutés.
Prochain lot proposé : JOBS-01, validation du contrat par l'intégrateur puis adaptateur fictif et UI isolés. Aucun scraping, auth/DB, moteur des droits, nouveau package ou vrai envoi dans ce lot.
Grok n'a pas exécuté Node, créé de branche ou ouvert de PR. L'intégrateur porte cette proposition dans une branche publique avec PR. Aucune affirmation que Grok avait un accès en écriture.
