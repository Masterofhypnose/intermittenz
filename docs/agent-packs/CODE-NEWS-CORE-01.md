# Dossier autonome — CODE-NEWS-CORE-01

Instruction : exécute uniquement cette mission à partir des fichiers ci-dessous. Si GitHub est inaccessible, le contenu embarqué suffit. Déclare les commandes non exécutées. Les spécifications jointes peuvent couvrir un périmètre plus large : le brief de ce lot borne le travail. Aucune donnée privée.


---

## Fichier : docs/missions/CODE-NEWS-CORE-01.md

# Grok — CODE-NEWS-CORE-01 : normalisation des actualités

Base de coordination : main 83f5841c230f907de742106a694a528a4f818952. Spécification normative : PR #8, ee9c1ffcc2107f6948800bc585fc5fc9368d014e (incluse dans le pack).

## Résultat attendu
Un noyau TypeScript pur transformant des entrées déjà extraites du RSS en actualités sûres, dédoublonnées et triées. Le transport HTTP, le parseur XML, le cache et le raccordement UI restent un lot intégrateur séparé. Ce lot ne doit pas être présenté comme un flux connecté. Ne pas refaire SPEC-NEWS-01.

## Fichiers autorisés
- lib/news-core/types.ts
- lib/news-core/normalize.ts
- lib/news-core/index.ts
- tests/news-core.test.mjs
- docs/deliveries/CODE-NEWS-CORE-01.md
Branche suggérée : contrib/CODE-NEWS-CORE-01.

## Interface à implémenter
Reprendre NewsCategory, NewsBase et NewsItem de la spec, sans modifier leurs champs. Ajouter :
```ts
export type RawNewsEntry = { title?: unknown; link?: unknown; guid?: unknown; dcDate?: unknown; pubDate?: unknown };
export type NormalizeResult = { items: NewsItem[]; rejectedCount: number; duplicateCount: number };
export function normalizeNewsEntries(entries: readonly RawNewsEntry[], fetchedAt: string): NormalizeResult;
export function normalizeArticleUrl(value: unknown): string | undefined;
export function classifyNewsTitle(title: string): NewsCategory;
```
Exporter ces symboles depuis index.ts. Pas de dépendance React, navigateur, filesystem, fetch ou horloge globale. fetchedAt est injecté, doit être un timestamp UTC canonique réel (toISOString), sinon erreur. Plus de 100 entrées : erreur. Chaque entrée invalide est rejetée individuellement, y compris null/array à l’exécution. Liste vide valide ; liste non vide dont toutes les entrées sont rejetées : erreur `invalid_feed` via Error avec propriété code. Erreurs de paramètre : code `validation`.

URL : appliquer exactement la spec (HTTPS, deux hôtes exacts, port standard, sans identifiants, supprimer fragment et paramètre xtor seulement). Pas de sous-domaines supplémentaires ni de suffix matching. URL entrée <=2048 caractères ; longueur canonique <=2048. Titre chaîne trim non vide <=1000, NFC, espaces regroupés ; conserver littéralement les caractères HTML comme texte, ne pas interpréter/stripper à coups de regex. L’adaptateur XML futur décodera les entités une seule fois. Aucune description distante.

Identité déterministe et sans collision de concaténation : `service-public:` + URL canonique entière. Ce choix remplace le hash indicatif de la proposition pour ce noyau ; guid ne sert jamais d’identité. publisher='service-public', sourceLabel='Service Public', origin='rss'.

Dates : priorité dcDate ISO avec fuseau explicite, puis pubDate RFC 2822 avec zone explicite (GMT/UT ou offset numérique). Validation calendaire réelle, ne pas laisser Date.parse normaliser le 30 février ; normaliser en UTC. Champ invalide/absent : essayer le suivant puis omettre publishedAt. fetchedAt n’est pas une date de publication. Catégorisation selon l’ordre exact du §3 de la spec ; pas de score.

Doublons d’URL : conserver la date de publication valide la plus récente ; date connue avant absente ; égalité garder la première entrée. duplicateCount = nombre d’entrées valides éliminées, rejectedCount = entrées invalides, sans compter un doublon comme rejet. Tri final : date connue décroissante, inconnue ensuite, puis id croissant par comparaison de chaînes (pas localeCompare). Ne pas muter les entrées.

## Tests exigés
Entrée vide ; titre absent/long/hostile ; domaines permis/interdits et fausses ressemblances ; credentials/port/protocoles ; xtor vs autres paramètres ; GUID change mais URL identique ; priorités/erreurs calendaires/fuseaux des dates ; égalités et tri déterministes ; chaque catégorie et chevauchement ; compteurs ; tous invalides ; limite 100 ; fetchedAt invalide ; absence de mutation. Utiliser des articles fictifs, aucune copie de flux réel. Un test doit vérifier les résultats attendus, pas seulement leur type.

## Livraison et limites
Mission préparée pour votre conversation, pas lancée automatiquement. Lire les consignes incluses dans le dossier autonome : elles remplacent la navigation GitHub si inaccessible. Ne pas redemander TASKS.md : son instantané est inclus. Déclarer lecture/shell/Node/écriture disponibles. Sans Node, livrer le code et ses tests, marqués non exécutés ; l’intégrateur les exécutera. Sans écriture GitHub, joindre les fichiers ou fournir chaque fichier intégral entre triples backticks avec son chemin. Aucun extrait, pseudo-code, fonction à compléter ou test annoncé mais absent.
Imports relatifs, aucune dépendance nouvelle. Aucun changement aux contrats partagés, shell, autres modules, package.json, lockfile, workflows. Aucun déploiement, merge, compte ni communication externe. Tests node:test sur vrais imports TypeScript, selon le mécanisme inclus dans le pack. Fixtures inventées uniquement. Note de livraison : base, fichiers, exports, cas couverts, commandes réellement exécutées et limites. Si accès complet : npm ci puis lint, typecheck, build et test ; ne jamais annoncer des résultats supposés.


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

## Fichier : docs/proposals/news-sources.md

# SPEC-NEWS-01 — Fil d’actualités officiel, version revue

28 septembre 2026. Contribution Grok transmise par le fondateur ; revue et précisions de l’intégrateur. Recherche et spécification seulement. Aucun connecteur applicatif livré, compte créé, abonnement ou scraping d’articles.

## 1. Vérifications et provenance

Grok déclare avoir lu les pages et obtenu le flux Service Public. L’intégrateur a vérifié indépendamment :
- documentation officielle https://www.service-public.gouv.fr/P10008 ;
- GET de https://www.service-public.gouv.fr/abonnements/rss/actu-actualites-particuliers.rss : HTTP 200, Content-Type application/rss+xml;charset=UTF-8 ;
- corps de 10397 octets reçu, XML parsé sans DTD/entités externes : racine rss version 2.0, 10 items, ttl 60 ;
- dates dc:date présentes, exemples du 28/09/2026 ; pubDate absent sur les deux premiers éléments inspectés ;
- liens observés vers www.service-public.gouv.fr ET entreprendre.service-public.gouv.fr, avec paramètre xtor=RSS-111 ; guid présent.

Le lecteur web a refusé le type application/rss+xml ; ce refus était celui de l’outil, pas une panne du flux. Un GET séparé et le parsing local ont permis la vérification. Aucun titre, article intégral, description ou image du flux n’est recopié comme fixture publique.

La documentation P10008 indique RSS 2.0, dix actualités pour le fil particuliers, et permet la rediffusion avec citation visible de la source par URL ou logo. Premier lot : attribution textuelle et lien, sans logo/image. L’autorisation du flux ne prouve rien pour les autres sites.

Ces constats valent pour cette récupération, pas pour une disponibilité permanente, une cadence contractuelle ou des droits de republication illimités de toutes les pages liées. Aucun parcours connecté sur la preview privée n’a été vérifié par Grok dans les preuves fournies ; sa mention de preview est traitée comme contexte produit communiqué.

## 2. Matrice des sources

| Organisme | Source / documentation | État vérifié ou limite | Décision |
|---|---|---|---|
| Service Public particuliers | https://www.service-public.gouv.fr/P10008 et flux ci-dessus | Doc lue et GET XML réussis par l’intégrateur ; ttl60 observé | Premier connecteur automatique |
| Service Public professionnels | https://www.service-public.gouv.fr/abonnements/rss/actu-actu-pro.rss | URL documentée dans P10008, non récupérée dans ce lot | Différé |
| Ministère de la Culture | https://www.culture.gouv.fr/actualites | Page déjà lue par l’intégrateur ; pas de flux officiel identifié dans cette recherche | Sélection éditoriale datée |
| France Travail | https://www.francetravail.fr/ | Pas de flux officiel identifié par Grok ; absence non prouvée | Liens pratiques / éditorial |
| DGFiP grand public | https://www.impots.gouv.fr/ | Pas de flux grand public identifié par Grok | Liens pratiques / éditorial |
| Unédic | https://www.unedic.org/ | Lecture déclarée par Grok, flux non identifié, pas revérifié ici | Liens éditoriaux |
| Audiens | https://www.audiens.org/ | Lecture déclarée par Grok, aucun flux ni droit de reproduction validé ici | Liens éditoriaux, pas ingestion |
| BOFiP | https://bofip.impots.gouv.fr/flux-rss | Candidat signalé par Grok, flux paramétré non récupéré par l’intégrateur | Lot ultérieur après preuve |
| Économie | https://www.economie.gouv.fr/rss | Page candidate signalée par Grok, pas de GET de flux validé ici | Lot ultérieur |

« Non identifié » ne signifie jamais « n’existe pas ». Pas d’URL /rss.xml inventée. Les dates d’articles citées par Grok pour les autres sources ne prouvent pas une cadence régulière.

## 3. Choix produit

Un connecteur sans authentification : Service Public particuliers, URL fixe ci-dessus. Aucun profil utilisateur envoyé. La fenêtre source est limitée : pas de promesse de couvrir toute l’actualité du spectacle.

Séparer trois blocs dans le produit :
1. Flux Service Public : articles récupérés, source et date de publication si connue.
2. Sélection éditoriale : Culture/Audiens/autres liens choisis, date de vérification explicite, aucune prétention au rafraîchissement automatique.
3. Liens pratiques : calendrier France Travail et aide DGFiP, sans classement comme « nouvelles du jour ».

Conserver la sélection actuelle comme complément et repli : les deux articles Culture annoncés dans le brief restent éditoriaux. Une panne du flux ne doit pas masquer les autres rubriques ni transformer leurs dates en dates de récupération RSS.

Filtrage transparent et option « Toutes les actualités de cette source ». Catégories déterministes, ne jamais masquer définitivement les non classés :
- Fiscalité si titre normalisé contient impôt, fiscal ou déclaration de revenus ;
- sinon Spectacle si spectacle, artiste, culture ou audiovisuel ;
- sinon Démarches si chômage, emploi, allocation ou démarche ;
- sinon Autre.
Normalisation Unicode NFC, minuscules françaises, espaces normalisés ; recherche sur le titre uniquement dans le premier lot. Les motifs sont heuristiques visibles, pas des décisions réglementaires. Liste versionnée et testée, pas de score personnalisé. Un titre contenant plusieurs catégories suit cet ordre ; l’article reste trouvable dans Toutes.

## 4. Types locaux proposés

Ne pas modifier le contrat partagé. Publisher identifie l’éditeur réel, origin le mode d’entrée : « editorial » n’est pas un organisme. Union fermée, pas de union|string qui annule le contrôle TypeScript.

```ts
export type NewsCategory = 'demarches' | 'fiscalite' | 'spectacle' | 'autre';
export type NewsPublisher = 'service-public' | 'culture' | 'france-travail' |
  'dgfip' | 'unedic' | 'audiens';
export interface NewsBase {
  id: string;
  publisher: NewsPublisher;
  sourceLabel: string;
  canonicalUrl: string;
  title: string;
  publishedAt?: string;
  category: NewsCategory;
}
export type NewsItem = NewsBase & (
  | { origin: 'rss'; publisher: 'service-public'; fetchedAt: string }
  | { origin: 'editorial'; reviewedOn: string; summary?: string }
);
export interface NewsFeedSnapshot {
  items: NewsItem[];
  source: 'service-public';
  lastSuccessAt?: string;
  nextRefreshAt?: string;
  state: 'fresh' | 'stale' | 'unavailable';
  error?: 'timeout' | 'http' | 'invalid_feed' | 'too_large';
}
```

Pas de résumé distant dans le premier connecteur : title/date/link suffisent, pas de strip HTML par regex. Le résumé éditorial existant demeure un texte rédigé localement. Pas d’image distante. HTML/XML décodé devient du texte React, jamais dangerouslySetInnerHTML.

ID stable : préfixe source + SHA-256 de l’URL canonique normalisée validée ; guid conservé éventuellement en métadonnée interne, pas préféré aveuglément. Le guid observé inclut une date et peut changer lors d’une mise à jour d’une même URL : l’URL évite un doublon d’article à chaque nouvelle édition. Si un guid est partagé par deux URLs différentes, les URLs restent deux identités distinctes.

Normalisation URL : HTTPS, hostname exact autorisé, pas d’identifiants ni de port autre que443 ; retirer fragment et seulement xtor, conserver les autres paramètres. URL normalisée utilisée pour ID et clic. Aucun retrait arbitraire de paramètres pouvant changer l’article.

Dates : dc:date ISO avec fuseau explicite d’abord ; pubDate RFC compatible avec zone explicite en repli ; valeur invalide/absente => publishedAt absent. Ne pas parser de date locale ambiguë. fetchedAt est le dernier GET200 ayant effectivement fourni cet item ; une panne, une absence du nouvel extrait ou un GET304 ne réécrit pas cette date. lastSuccessAt porte la dernière validation réussie du flux, y compris304. Éditorial : reviewedOn date civile, pas faux fetchedAt.

## 5. Réseau et parsing serveur

- URL initiale fixe, jamais une URL libre fournie par l’utilisateur. Pas de requête vers les pages d’articles pour enrichir les résultats.
- Hôte de récupération exact : www.service-public.gouv.fr. HTTPS uniquement, pas credentials, port standard. Chemin de flux fixé dans la configuration ; pas de redirect vers une URL d’article ou de login.
- Redirections manuelles, au plus3 : résoudre Location, valider protocole/hôte/port/chemin avant de suivre. Toute destination hors configuration refusée. Une future redirection officielle vers un autre hôte nécessite une validation et une modification explicite de la liste, pas un suffixe *.gouv.fr.
- Hôtes de clic des items : www.service-public.gouv.fr et entreprendre.service-public.gouv.fr, tous deux observés dans le flux. Cette liste n’autorise pas à y télécharger des contenus arbitraires.
- Budget total requête+redirections+lecture : 8 secondes. Corps décompressé limité à1 Mio, compté pendant lecture, pas uniquement Content-Length. Nombre maximal d’items parsés100 ; longueur titre1000 caractères et URL2048, limites produit. Rejeter l’item sur dépassement plutôt que tronquer un identifiant.
- Accepter application/rss+xml, application/xml ou text/xml ; XML doit réellement contenir rss2.0/channel. Réponse HTML, XML mal formé, DTD ou déclaration ENTITY => invalid_feed. Parser choisi sans résolution externe, expansion récursive, scripts ou récupération réseau ; dépendance runtime à justifier avant lot code. jsdom de dev n’est pas un parser serveur à importer en production.
- Item sans titre non vide ou lien valide : exclu, diagnostic compté. Date absente n’exclut pas. Flux contenant des items mais aucun admissible => invalid_feed, conserver cache ; vrai canal sans item => succès vide.
- Doublon d’URL dans une réponse : date valide la plus récente, puis première occurrence en cas d’égalité/inconnue. Trier items par date connue DESC, sans date ensuite, ID en départage.
- Pas d’authentification, cookie utilisateur, secret frontend ou données de profil dans la requête. Réponse UI minimale, pas de XML brut ni de logs contenant des données utilisateur.

## 6. Cache et disponibilité

Premier lot sans nouvelle base ni service payant : cache serveur borné par instance de processus, explicitement non durable. Il peut être perdu au redémarrage, au déploiement ou sur une autre instance serverless. Aucune promesse de récupération horaire en arrière-plan : rafraîchissement à la demande lorsque le cache arrive à échéance. Un cron et une archive persistante sont hors lot.

- Intervalle produit minimum60 minutes. Si ttl est un entier valide de1 à10080 minutes, intervalle=max(60,ttl) ; sinon60. Le ttl60 effectivement observé ne garantit pas sa valeur future.
- Requête concurrente sur une même instance : une seule récupération en vol. Pas de garantie de verrou global entre instances.
- ETag/Last-Modified transmis si présents. GET304 avec cache valide prolonge lastSuccessAt/nextRefreshAt, conserve items et leurs fetchedAt. GET304 sans cache => erreur, pas état frais vide.
- Erreur réseau/HTTP/parsing/taille : pas de remplacement de la dernière copie valide. state stale si cache présent, unavailable sinon. Afficher dernière réussite et une alerte. Échec ne modifie pas lastSuccessAt.
- Nouvelle tentative après échec : au moins5 minutes entre appels serveur par instance, même si bouton Réessayer pressé plusieurs fois. Le bouton relit l’état et indique la prochaine tentative ; pas de tempête de requêtes externes.
- Fusionner les nouveaux items avec ceux du cache tant qu’il existe ; l’absence dans une fenêtre de10 items n’est pas un retrait de l’article.
- Rétention technique en mémoire : au plus200 items, au plus90 jours depuis firstSeenAt interne. Suppression par ancienneté puis plafond explicitement documentée, pas statut withdrawn déduit. Une réponse vide ne purge pas ce cache. Sans cache initial, elle donne une liste vide fraîche.
- Cache de plus de24h sans succès : badge « données anciennes », pas promesse de dernières nouvelles ; sélection éditoriale et liens pratiques toujours accessibles.

Pas de date « mis à jour maintenant » générée uniquement par le navigateur. Le cache du navigateur ne masque pas l’état de fraîcheur serveur. Le futur lot code doit préciser les en-têtes HTTP du point d’entrée pour que le retry lise bien cet état.

## 7. Interface

Chargement initial avec texte accessible ; liste source/date/titre/lien ; vrai état vide avec possibilité d’élargir le thème ; échec sans cache avec Réessayer ; cache ancien avec sa date. Les annonces de statut ne doivent pas lire tout le fil à chaque rafraîchissement.

Attribution visible « Source : service-public.gouv.fr » liée au site officiel, y compris sur l’aperçu dashboard. Date publication absente => mention « date de publication non fournie » ou aucune date, jamais fetchedAt à sa place. Les liens ouvrent une nouvelle fenêtre avec noopener noreferrer et indication externe. Titres longs repliables, cibles44px, pas de défilement horizontal à320px.

Les calendriers, barèmes et compteurs existants demeurent alimentés par leurs propres sources versionnées. Aucun titre RSS ne modifie une règle ou une échéance automatiquement.

## 8. Tests d’acceptation à exécuter au lot code

Fixtures synthétiques seulement, now/fetch/cache injectables ; vrais imports, aucun réseau nécessaire à la CI.
1. RSS2.0 minimal, namespaces, dc:date avec fuseau ; pubDate repli ; dates absentes/invalides.
2. URL avec xtor/fragment normalisée ; deux guid datés pour une URL =>un article ; guid partagé entre URLs distinctes =>deux.
3. Hôtes exacts, sous-domaine trompeur, javascript/data/http, credentials/port refusés ; liens Entreprendre autorisés ; redirection hors liste non suivie.
4. XML hostile/DTD/ENTITY, réponse HTML, titre HTML affiché en texte ; pas d’exécution ni requête externe issue du parser.
5. Timeout global, corps compressé démesuré, Content-Length mensonger, nombre d’items, champs trop longs ; taille arrêtée en streaming.
6. Cache frais =>aucun appel ; expiré =>une récupération ; concurrence =>une promesse ; erreur =>ancienne copie inchangée ; cache absent=>unavailable.
7. GET304 avec/sans cache ; lastSuccessAt distinct de fetchedAt ; panne ne rajeunit jamais un article.
8. Canal vide versus tous items invalides ; items sortis de la fenêtre retenus ; purge technique90j/200 selon règles seulement ; redémarrage sans archive prétendue.
9. Filtrage ordre explicite/Autre/Toutes ; aucune donnée personnelle transmise ; liens pratiques hors nouvelles.
10. DOM états source/date/erreur/retry ; rendu320/390/768/1280 et clavier si navigateur réel disponible, sinon limite déclarée.

Aucun de ces tests applicatifs n’a été exécuté pour cette PR de spécification. Le GET XML et son parsing de vérification ont été exécutés par l’intégrateur, sans constituer un test de connecteur Intermittent+.

## 9. Livraison

Un fichier docs/proposals/news-sources.md sur contrib/SPEC-NEWS-01. Contribution Grok amendée ; aucune PR n’avait été créée par Grok. Le premier connecteur est désormais documenté et son flux accessible vérifié, mais pas encore développé ni branché à la preview. Le produit reste sur sa sélection éditoriale tant qu’un lot code n’est pas testé et intégré.


---

## Fichier : package.json

{"name":"intermittent-plus","version":"0.1.0","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start","lint":"eslint .","typecheck":"tsc --noEmit","test":"node --test tests/*.test.mjs"},"dependencies":{"@heroicons/react":"2.2.0","next":"16.3.6","react":"19.1.1","react-dom":"19.1.1","recharts":"3.2.1"},"devDependencies":{"@types/node":"24.5.2","@types/react":"19.1.13","@types/react-dom":"19.1.9","eslint":"9.36.0","eslint-config-next":"16.3.6","jsdom":"26.1.0","typescript":"5.9.2"}}

## Mécanisme de tests du dépôt
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const require = createRequire(import.meta.url);
require.extensions['.ts'] = (mod, path) => mod._compile(ts.transpileModule(readFileSync(path, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true}}).outputText, path);
// Importer ensuite le vrai index.ts du lot. Aucun code de production recopié ici.
```
