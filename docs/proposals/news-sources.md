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
