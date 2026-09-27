# JOBS-01 — dossier autonome pour Grok

Préparé le 27 septembre 2026. Aucun accès au produit privé nécessaire.
La mission et la spécification ci-dessous font foi. Les fichiers communs proviennent de main 75c3497d05961503314a00fc8f34cd5af3c7d831 ; le test Marketplace est la version corrigée de la PR #2, commit d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9. Il sert d'exemple de harness, pas de fichier à modifier. La spec Jobs provient de 763792b43f13bcb3d4abfaed875734cad79ced1b (PR #1, non fusionnée).

## docs/missions/JOBS-01.md

````markdown
# JOBS-01 — Grok : module Emploi & Castings de démonstration

## Départ et état
La revue SPEC-JOBS-01 est terminée : Grok a indiqué, dans un retour transmis par le fondateur le 27 septembre 2026, ne plus trouver de blocage au commit 763792b43f13bcb3d4abfaed875734cad79ced1b.
La PR #1 reste ouverte : cela n'autorise pas sa fusion. Pour ce lot isolé, la spécification épinglée fait foi :
https://github.com/Masterofhypnose/intermittenz/blob/763792b43f13bcb3d4abfaed875734cad79ced1b/docs/proposals/jobs.md
Ne pas refaire la spécification ni la recherche de sources.

Lire AGENTS.md, CONTEXT.md, WORKFLOW.md et cette mission. Le pack docs/agent-packs/JOBS-01.md contient les sources nécessaires pour un agent limité à la lecture Markdown.
Base de préparation : 75c3497d05961503314a00fc8f34cd5af3c7d831. Créer contrib/JOBS-01 depuis main actuel et indiquer son SHA exact. Examiner les PR ouvertes pour éviter une contribution en doublon.

## Livrables autorisés
- lib/jobs/types.ts : reproduire exactement le bloc TypeScript de la spécification (types Jobs et service), avec import de Page/PublicProfile/ModuleContext depuis ../contracts/modules. Ces types restent locaux au module jusqu'à leur promotion par l'intégrateur ; ne pas ajouter une seconde définition des types communs.
- lib/jobs/demoService.ts : export createDemoJobsService(options), instance indépendante en mémoire. Options now?: () => Date, seed?: JobOffer[], pageSize?: number ; horloge injectée et données clonées, aucune mutation de l'appelant.
- Autres helpers dans lib/jobs/** uniquement si nécessaires.
- components/jobs/JobsModule.tsx : export nommé JobsModule, props JobsModuleProps.
- components/jobs/Jobs.module.css et components/jobs/index.ts.
- tests/jobs*.test.mjs : vrais imports et rendu React/jsdom.
- docs/deliveries/JOBS-01.md : résultats et raccordement proposé, sans modifier le shell.

Ne modifier ni contrats partagés, ni shell, ni marketplace/chat, ni dépendances/lockfile/workflows. Imports relatifs, pas d'alias @/. Aucune auth, API, collecte, calcul de droits, paiement ou candidature réelle.

## Comportement attendu
Catalogue → filtres → fiche via getById → retour, favoris. Filtres texte, métier, ville, type, dates et rémunération : présenter les dates/rémunération dans une zone « Filtres avancés » pour garder une interface simple.
Même design navy et CSS Modules isolés. Mobile 390 px et desktop 1280 px, contrôles accessibles au clavier, labels français, focus de fiche puis retour au bouton remounté, filtres et pages chargées conservés.
Chargement, zéro résultat, échec récupérable et retry explicites. Réponses obsolètes ignorées après recherche, sélection, changement de service ou démontage.
Pas de liste complète de favoris prétendue à partir des seuls IDs sans getById.
Le détail affiche les états expired/withdrawn/not_found conformément à la spec, sans réafficher le contenu retiré. Les favoris ont un verrou par annonce et par génération de service, rollback et erreur visible.

Appliquer exactement les tables de la spec : statut effectif, dates partielles/flexibles, rémunération, favoris et pagination. Pas d'offset ni de base/unités converties.
Pour compléter uniquement les choix laissés ouverts : recherche textuelle par sous-chaîne insensible à la casse sur titre/description/category/city ; filtres category et city par sous-chaîne insensible à la casse après trim. Le curseur opaque lie tous les filtres normalisés et sa dernière paire de tri ; encodage n'est pas chiffrement ni autorisation.
Les fonctions de recherche ne modifient pas les offres sources ; calculer le statut effectif à chaque appel.

## Démonstration
Au moins huit offres fictives variées, marquées source.type='demo', application.mode='none'. Ajouter des cas dates partielles, flexible, rémunération inconnue, brut/net, bénévolat, expiration et retrait. Les échéances du jeu par défaut sont relatives à now pour que la démo ne devienne pas vide après quelques jours.
Indiquer clairement « Offres fictives — aucun envoi de candidature ». Pas de lien vers une fausse offre ni de recruteur réel. Les tests fixent l'horloge.
Dans les seuls cas connectés fournis par un service futur, un contact interne reste le callback prévu ; URLs externes HTTPS sans identifiants, ouvertes uniquement sur action explicite. Aucune automatisation de contact.

## Tests exigés
- Vrais imports : réutiliser le mécanisme TypeScript et jsdom des tests fournis, jamais recopier les fonctions.
- Filtres et quatre cas de dates ; bornes inclusives, flexible, invalide/inversé.
- Pay : base/unité identiques et seuil, exclusion unknown/not_applicable/unspecified.
- Statut juste avant/à/après échéance, priorités, cohérence search/getById/favoris.
- Pagination avec égalités de dates, curseur invalide ou filtres incompatibles. Tester l'insertion via une fixture/helper local de test si nécessaire, sans ajouter de méthode au JobsService.
- Favoris : ajout actif, rejets invalides/expirés/retirés, retrait idempotent, réponses tardives de l'ancien service et verrou du nouveau service.
- React : navigation/retour/focus, filtres sans résultat, erreurs/réessai, texte malveillant rendu littéralement, absence d'action réelle en démo.
- Vérifications responsive réelles seulement si navigateur disponible ; ne pas faire passer jsdom pour une vérification visuelle.

## Livraison
Exécuter npm run lint, npm run typecheck, npm run build puis npm test si l'environnement le permet. Sinon écrire « non exécuté ».
PR vers l'atelier public si accès d'écriture réel ; sinon fournir des fichiers complets avec chemins, dans une pièce jointe si possible. Ne pas inventer de lien de PR ou de test réussi.
Rendre un module intégrable complet, pas une nouvelle liste de suggestions. L'intégrateur branche le shell et le produit privé après validation.

````

## docs/proposals/jobs.md

````markdown
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
  startsOnOrAfter?: string; // YYYY-MM-DD inclusif
  endsOnOrBefore?: string; // YYYY-MM-DD inclusif
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
- Si `pay` est présent, inclure seulement une rémunération `known`, de même `unit` et même `basis`, dont `amountCents >= minimumCents`. Exclure `unknown`, `not_applicable`, `unspecified` et les autres bases/unités ; aucune conversion. `minimumCents` est un entier sûr positif ou nul. Tous les filtres se cumulent par ET, y compris `remunerationStatus`.
- `not_applicable` est réservé aux offres explicitement bénévoles ; réciproquement une offre `volunteer` utilise `not_applicable`. Rejeter les combinaisons incohérentes à la validation des données. Un casting peut conduire à un emploi salarié : le type de contrat et la rémunération doivent rester distincts du format de recrutement. Dans un lot ultérieur, envisager deux axes de catégorisation si les offres le nécessitent.
- `canonicalUrl` obligatoire pour les sources externes, pas de faux lien pour les fixtures ou annonces internes. URLs externes HTTPS sans identifiants dans l'URL.
- Une source externe ne crée pas automatiquement un compte recruteur Intermittent+. Son publisher est une référence d'affichage. Le contact interne n'est proposé que pour une identité interne vérifiée ; `application.publisherId` doit alors être égal à `publisher.id`. Cette égalité ne remplace pas l'autorisation serveur.
- `expiresAt` correspond à la candidature, pas à la date de fin de travail. Convertir une date sans heure uniquement avec une politique de fuseau documentée ; ne pas inventer une précision venant de la source.
- Dates de travail et filtres : dates calendaires valides au format strict `YYYY-MM-DD`, comparées sans conversion de fuseau. Les bornes sont inclusives. Rejeter une période complète inversée, un filtre inversé ou une date invalide.

### Filtres de dates : décision explicite
Ces filtres portent sur les bornes de travail, pas sur un chevauchement de disponibilités.

| Filtres présents | Condition nécessaire |
|---|---|
| Aucun | Dates absentes ou partielles acceptées |
| `startsOnOrAfter` seul | `dates.start` existe et est supérieur ou égal au filtre ; `end` peut manquer |
| `endsOnOrBefore` seul | `dates.end` existe et est inférieur ou égal au filtre ; `start` peut manquer |
| Les deux | Les deux bornes existent et satisfont chacune leur filtre |

`flexible: true` est informatif : il ne dispense d'aucune comparaison et ne permet pas d'inventer une borne manquante. Une offre sans la borne requise est exclue du résultat filtré. L'UI précise que les dates non renseignées ne sont pas incluses. Exemple : début au 2026-11-01, flexible, filtre début à partir du 2026-12-01 → exclue.

## 3. Service et comportements
### Statut effectif : calcul unique côté service
À chaque appel, le service capture une seule valeur `now` (horloge injectable en tests). Priorité :
1. Statut enregistré `withdrawn` → retirée, quelle que soit la date.
2. Statut enregistré `expired` → expirée, même sans échéance ou avec une échéance future ; une réouverture demande une mise à jour explicite.
3. Sinon, `expiresAt <= now` → expirée, y compris à l'instant exact d'échéance.
4. Sinon → active.

`expiresAt` et `createdAt` sont des timestamps ISO valides avec fuseau, comparés comme instants UTC à la milliseconde ; rejeter les valeurs invalides à l'entrée. `expiresAt` absent n'expire pas automatiquement l'offre. Le service applique cette même règle à `search`, `getById` et à l'ajout d'un favori. Il renvoie un `offer.status` normalisé, cohérent avec `JobLookup.status`. Le client n'invente pas une autre priorité.

### Recherche et pagination
Recherche : uniquement offres effectivement actives. Une nouvelle recherche réinitialise le curseur ; ignorer les réponses obsolètes. Aucun résultat = items vide, pas erreur.
- Ordre total : instant `createdAt` décroissant, puis `id` décroissant par comparaison lexicographique des unités UTF-16, sans tri dépendant de la langue. IDs uniques ; `createdAt` et `id` immuables.
- Curseur opaque fondé sur la dernière paire `(createdAt, id)` retournée et les filtres normalisés ; jamais un offset. La page suivante contient uniquement des clés strictement inférieures à cette paire.
- Normalisation des filtres pour le curseur : retirer les espaces aux extrémités des champs texte, traiter une chaîne vide comme absente, sérialiser les champs dans un ordre fixe en excluant `cursor`. Les autres valeurs sont conservées après validation. Un curseur malformé ou lié à des filtres différents est rejeté, sans retour silencieux à la première page.
- Une insertion placée avant le curseur apparaît après actualisation du catalogue ; une insertion après le curseur peut apparaître dans les pages suivantes. Les suppressions, expirations ou modifications de contenu ne garantissent pas un instantané figé. Aucun doublon d'ID dû au décalage d'un index n'est permis.
Détail : une offre expirée reste consultable si conservée, avec candidature désactivée. Une offre retirée n'expose plus son ancien contenu. Une erreur réseau est un rejet distinct des états métier de JobLookup et affiche Réessayer.
### Favoris
Chargement initial explicite, mutation protégée contre les doubles clics, rollback et erreur visible.

| Opération | Comportement |
|---|---|
| `setFavorite(id, true)`, offre active | Ajout ; succès sans doublon si déjà favorite |
| `setFavorite(id, true)`, offre expirée, retirée ou introuvable | Rejet, aucun ajout, même si l'ID était déjà favori |
| `setFavorite(id, false)`, tout ID | Retrait idempotent : succès sans effet si absent ou déjà retiré, indépendamment de l'état de l'offre |

Ces succès restent soumis aux éventuels contrôles d'autorisation et erreurs techniques du service connecté.
Les favoris acquis avant expiration restent listés par `listFavoriteIds` ; aucun nettoyage automatique à la lecture. Pour `withdrawn` ou `not_found`, l'UI montre « Offre indisponible » sans ancien contenu, avec action explicite de retrait. Une offre expirée reste identifiée comme telle, sans candidature. Le contrat ne permet pas de promettre une liste complète de fiches favorites sans lectures `getById` correspondantes.
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
- Dates : chacune des quatre lignes du tableau, bornes égales, partielles/absentes, flexible vrai/faux, dates invalides et plages inversées.
- Pagination : égalité de createdAt départagée par ID, insertion avant/après curseur, retrait entre pages, curseur invalide/incompatible, remise à zéro après filtre, réponses hors ordre.
- Horloge fixe : juste avant/à/après expiresAt, active avec échéance passée, expired avec échéance future, priorité withdrawn, absence d'échéance ; cohérence search/getById/favoris.
- Détail actif/expiré/retiré/introuvable et vraie erreur réseau.
- Favori : initialisation, clic concurrent, échec visible, retry ; toutes les lignes du tableau, retrait répété d'un ID inconnu, conservation d'un favori expiré et affichage sans contenu d'une offre retirée.
- Validation : cohérence bénévolat/rémunération et identité du contact interne ; exclusion explicite de basis unspecified sous filtre pay.
- Mise à jour d'une même source sans doublon et provenance préservée.
- HTML malveillant affiché comme texte, URL dangereuse refusée.
- Aucun envoi réel en mode démo ; aucune action de candidature sur offre expirée.
- Mobile 390 px/desktop 1280 px : retour, focus clavier, scroll et filtres conservés.
Tester les vrais imports et composants ; pas de copie de logique dans les tests.

## 7. Livraison et suite
Ce fichier est une spécification revue, pas des contrats approuvés ni du code exécutable déployé. Les signatures tronquées de la réponse Grok ont été réparées ; les filtres dates/rémunération, bases salariales, provenance conditionnelle et états métier ont été ajoutés.
Prochain lot proposé : JOBS-01, validation du contrat par l'intégrateur puis adaptateur fictif et UI isolés. Aucun scraping, auth/DB, moteur des droits, nouveau package ou vrai envoi dans ce lot.
Grok n'a pas exécuté Node, créé de branche ou ouvert de PR. L'intégrateur porte cette proposition dans une branche publique avec PR. Aucune affirmation que Grok avait un accès en écriture.

### Revue Grok prise en compte — 26 septembre 2026
Les quatre ambiguïtés signalées (statut/échéance, dates flexibles ou partielles, favoris invalides, tri/curseur) sont tranchées ci-dessus. Les cinq précisions complémentaires sont intégrées. Ces décisions spécifient le futur module ; elles ne constituent pas une implémentation ni une validation de sources externes.

````

## AGENTS.md

````markdown
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

## docs/CONTEXT.md

````markdown
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

````

## docs/WORKFLOW.md

````markdown
# Livraison sans échange manuel de blocs de code

1. L'agent lit ce repo public et sa mission. Il clone le repo dans son environnement ou le fork s'il n'a pas de droit d'écriture.
2. Il crée une branche contrib/<mission>, enregistre le commit de base et travaille uniquement dans son périmètre.
3. Il teste le module réel, puis propose une PR vers main de ce dépôt public.
4. L'intégrateur lit la PR ici, corrige/valide les changements puis porte seulement les fichiers retenus dans le dépôt privé.
5. Les tests complets du produit et la preview privée sont vérifiés avant validation finale. Aucun accès privé n'est nécessaire au contributeur.

Le fondateur n'a plus à recopier les sources si l'agent peut lire GitHub et livrer une PR. Un agent limité à un chat peut lire le contexte si son navigateur le permet, mais devra toujours remettre ses fichiers ; GitHub ne lui ajoute pas d'outils d'écriture.

## Automatisation ultérieure, non configurée
Pour lancer des modèles externes automatiquement : choisir un fournisseur/agent compatible et lui donner des autorisations minimales sur CE dépôt public, ainsi qu'un budget explicite. Les clés restent dans un gestionnaire de secrets, jamais dans les fichiers ou prompts. Pas d'abonnements/API configurés par ce kit, pas de dépense ni de webhook actif.
La CI teste le code ; elle ne sollicite aucune IA. Elle n'utilise pas pull_request_target et ne reçoit pas de secrets pour les contributions externes.

## Livraison demandée
Résumé, commit de base, fichiers changés, critères couverts, commandes et résultats réels, limites, captures si disponibles, instructions d'intégration. Pas de PR vers le dépôt privé. Pas de message à un tiers ni de merge automatique.

````

## lib/contracts/modules.ts

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

## package.json

````json
{"name":"intermittent-plus","version":"0.1.0","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start","lint":"eslint .","typecheck":"tsc --noEmit","test":"node --test tests/*.test.mjs"},"dependencies":{"@heroicons/react":"2.2.0","next":"16.3.6","react":"19.1.1","react-dom":"19.1.1","recharts":"3.2.1"},"devDependencies":{"@types/node":"24.5.2","@types/react":"19.1.13","@types/react-dom":"19.1.9","eslint":"9.36.0","eslint-config-next":"16.3.6","jsdom":"26.1.0","typescript":"5.9.2"}}
````

## tsconfig.json

````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

````

## tests/marketplace.test.mjs

````js
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {JSDOM} from 'jsdom';
const require=createRequire(import.meta.url);
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,path)=>mod._compile(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,path);
require.extensions['.css']=mod=>{mod.exports={};};
const {parsePriceToCents,validateDraft,isHttpsUrl}=require('../lib/marketplace/validation.ts');
const {createDemoMarketplaceService}=require('../lib/marketplace/demoService.ts');
const draft={title:'Console',description:'Description',category:'Son',city:'Paris',kind:'sale',priceCents:1210,imageUrls:[]};
test('marketplace actual validator: cents, unsafe integers, fields and HTTPS',()=>{
 for(const [value,cents] of [['0',0],['12,10',1210],['0.29',29],['12.1',1210]])assert.deepEqual(parsePriceToCents(value),{cents});
 for(const value of ['-1','1.234','NaN','','9007199254740992'])assert.ok('error'in parsePriceToCents(value));
 assert.equal(isHttpsUrl('https://example.com/image.png'),true);assert.equal(isHttpsUrl('https://user:pass@example.com'),false);assert.equal(isHttpsUrl('javascript:alert(1)'),false);
 assert.ok(validateDraft({...draft,title:'',priceEuros:'12.10',imageUrls:''}).errors.title);
 assert.ok(validateDraft({...draft,priceEuros:'12.10',imageUrls:'http://example.com/a'}).errors.imageUrls);
});
test('marketplace actual adapter: filters, cursor, idempotency, rollback and isolated state',async()=>{
 const service=createDemoMarketplaceService();const first=await service.search({text:''});const second=await service.search({text:'',cursor:first.nextCursor});assert.equal(new Set([...first.items,...second.items].map(x=>x.id)).size,5);
 assert.equal((await service.search({text:'console',category:'son',city:'par'})).items.length,1);
 const [a,b]=await Promise.all([service.create(draft,'same'),service.create(draft,'same')]);assert.equal(a.id,b.id);assert.equal(service.__all().length,6);
 await assert.rejects(()=>service.create({...draft,title:'Other'},'same'));
 await service.setFavorite(a.id,true);service.__setFailNext({setFavorite:true});await assert.rejects(()=>service.setFavorite(a.id,false));assert.deepEqual(await service.listFavoriteIds(),[a.id]);
 assert.equal(createDemoMarketplaceService().__all().length,5);
 a.title='Tampered';assert.notEqual(service.__all()[0].title,'Tampered');
});
test('marketplace real React flow: create validation, ambiguous retry, favorites errors, contact, XSS and stale searches',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://test.example'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
 const React=require('react');const {createRoot}=require('react-dom/client');const {MarketplaceModule}=require('../components/marketplace');
 const root=createRoot(document.getElementById('root'));const adapter=createDemoMarketplaceService();let loseResponse=true;let creates=0;const requests=[];const searchPending=[];
 const service={...adapter,async create(payload,id){creates++;requests.push(id);const result=await adapter.create(payload,id);if(loseResponse){loseResponse=false;throw new Error('Réponse perdue');}return result;},search(query){if(query.text==='old'||query.text==='new')return new Promise(resolve=>searchPending.push({query,resolve}));return adapter.search(query);}};
 let contact;const props={context:{viewer:{id:'demo',displayName:'Démo'},mode:'demo'},service,onContactSeller:(...args)=>{contact=args;}};
 const click=async(el)=>{assert.ok(el);await React.act(async()=>el.click());};
 const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent===text);
 const input=(name,value)=>{document.querySelector(`[name="${name}"]`).value=value;};
 const submit=async()=>React.act(async()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
 try{
  adapter.__setFailNext({listFavoriteIds:true});await React.act(async()=>root.render(React.createElement(MarketplaceModule,props)));
  assert.match(document.querySelector('[role="alert"]').textContent,/Favoris/);await click(button('Recharger les favoris'));
  adapter.__setFailNext({setFavorite:true});await click(document.querySelector('[aria-pressed]'));assert.equal(document.querySelector('[aria-pressed]').getAttribute('aria-pressed'),'false');assert.match(document.querySelector('[role="alert"]').textContent,/Réessayez/);
  await click(document.querySelector('[aria-pressed]'));assert.equal(document.querySelector('[aria-pressed]').getAttribute('aria-pressed'),'true');
  await click(button('Charger plus'));assert.equal(document.querySelectorAll('article').length,5);
  await click(button('Créer une annonce'));await submit();assert.equal(creates,0);assert.ok(document.querySelector('[aria-invalid="true"]'));
  input('title','Mon annonce');input('description','<img src=x onerror=alert(1)>');input('category','Son');input('city','Paris');input('priceEuros','12,10');
  await submit();assert.match(document.querySelector('form [role="alert"]').textContent,/Réponse perdue/);assert.equal(document.querySelector('[name="title"]').value,'Mon annonce');
  await React.act(async()=>{const form=document.querySelector('form');form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));});
  assert.equal(creates,2);assert.equal(requests[0],requests[1]);assert.equal(adapter.__all().length,6);assert.equal(document.querySelector('h1').textContent,'Mon annonce');assert.match(document.body.textContent,/<img src=x onerror=alert\(1\)>/);assert.equal(document.querySelector('img[src="x"]'),null);
  await click(button('Contacter le vendeur'));assert.deepEqual(contact,[adapter.__all()[0].seller.id,adapter.__all()[0].id]);
  await click(button('← Retour au catalogue'));
  const search=document.querySelector('[type="search"]');const setter=Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set;
  async function change(value){await React.act(async()=>{setter.call(search,value);search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});}
  await change('old');await change('new');assert.equal(searchPending.length,2);
  const base=adapter.__all()[0];await React.act(async()=>searchPending[1].resolve({items:[{...base,id:'new',title:'Newest'}]}));await React.act(async()=>searchPending[0].resolve({items:[{...base,id:'old',title:'Obsolete'}]}));
  assert.match(document.querySelector('[aria-label="Résultats"]').textContent,/Newest/);assert.doesNotMatch(document.querySelector('[aria-label="Résultats"]').textContent,/Obsolete/);
 }finally{await React.act(async()=>root.unmount());dom.window.close();}
});

test('MARKET-02: return focus survives remount, preserves loaded pages, and creation return',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://test.example'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
 const React=require('react');const {createRoot}=require('react-dom/client');const {MarketplaceModule}=require('../components/marketplace');
 const root=createRoot(document.getElementById('root'));
 const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent===text);
 const click=async el=>{assert.ok(el);await React.act(async()=>el.click());};
 try{
  await React.act(async()=>root.render(React.createElement(MarketplaceModule,{context:{mode:'demo',viewer:{id:'me',displayName:'Demo'}},service:createDemoMarketplaceService(),onContactSeller:()=>{}})));
  assert.notEqual(document.activeElement,document.querySelector('h1'),'initial render must not steal focus');
  await click(button('Charger plus'));
  const original=[...document.querySelectorAll('button[aria-label^="Voir "]')].at(-1);const label=original.getAttribute('aria-label');original.focus();
  await click(original);assert.equal(document.activeElement,document.querySelector('h1'));assert.equal(original.isConnected,false);
  await click(button('← Retour au catalogue'));
  assert.equal(document.querySelectorAll('article').length,5);
  assert.equal(document.activeElement.getAttribute('aria-label'),label);
  await click(button('Créer une annonce'));assert.equal(document.activeElement,document.querySelector('h1'));
  await click(button('← Retour au catalogue'));assert.equal(document.activeElement,button('Créer une annonce'));
 }finally{await React.act(async()=>root.unmount());dom.window.close();}
});

test('MARKET-02: obsolete success/rejection cannot unlock current favorite or alter new service state',async()=>{
 for(const outcome of ['resolve','reject']){
  const dom=new JSDOM('<div id="root"></div>',{url:'https://test.example'});
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
  const React=require('react');const {createRoot}=require('react-dom/client');const {MarketplaceModule}=require('../components/marketplace');
  const root=createRoot(document.getElementById('root'));
  const a=createDemoMarketplaceService();const b=createDemoMarketplaceService();const page=await b.search({text:''});const first=page.items[0],second=page.items[1];
  await b.setFavorite(second.id,true);
  let finishA,finishB;let callsB=0;
  const serviceA={...a,setFavorite:()=>new Promise((resolve,reject)=>{finishA=()=>outcome==='resolve'?resolve():reject(new Error('obsolete failure'));})};
  const serviceB={...b,setFavorite:()=>{callsB++;return new Promise(resolve=>{finishB=resolve;});}};
  const props={context:{mode:'demo',viewer:{id:'me',displayName:'Demo'}},onContactSeller:()=>{}};
  const fav=title=>[...document.querySelectorAll('button[aria-pressed]')].find(el=>el.getAttribute('aria-label').includes(title));
  const click=async el=>React.act(async()=>el.click());
  try{
   await React.act(async()=>root.render(React.createElement(MarketplaceModule,{...props,service:serviceA})));
   await click(fav(first.title));assert.equal(fav(first.title).disabled,true);
   await React.act(async()=>root.render(React.createElement(MarketplaceModule,{...props,service:serviceB})));
   assert.equal(fav(first.title).disabled,false,'new service must not inherit old locks');
   assert.equal(fav(first.title).getAttribute('aria-pressed'),'false');assert.equal(fav(second.title).getAttribute('aria-pressed'),'true');
   await click(fav(first.title));assert.equal(callsB,1);
   await React.act(async()=>finishA());
   assert.equal(fav(first.title).disabled,true,'old finally must not release the new service lock');
   assert.equal(fav(first.title).getAttribute('aria-pressed'),'true');assert.equal(fav(second.title).getAttribute('aria-pressed'),'true');
   assert.equal(document.querySelector('[role="alert"]'),null);
   await click(fav(first.title));assert.equal(callsB,1);
   await React.act(async()=>finishB());assert.equal(fav(first.title).disabled,false);
  }finally{await React.act(async()=>root.unmount());dom.window.close();}
 }
});

````

