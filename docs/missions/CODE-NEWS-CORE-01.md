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
