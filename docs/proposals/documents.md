# SPEC-DOCS-01 — Coffre documentaire local

29 septembre 2026. Proposition Gemini transmise par le fondateur, revue et amendée par l’intégrateur. Statut : proposition en revue, aucun code applicatif livré. Mission : docs/missions/SPEC-DOCS-01.md. Contrats partagés inchangés. Sources de raccordement : activité PR #6 (980f6c2), déclarations PR #7 (f6113ff). Le moteur réglementaire proposé précédemment par Gemini était hors mission et n’est pas intégré.

## 1. Décisions de revue

Le terme « coffre » désigne une collection locale, pas une garantie de chiffrement, de sauvegarde ou d’authenticité fiscale. Aucune extraction automatique de salaire, heures ou cachets. Les fichiers sont copiés dans le stockage du navigateur ; leur original externe reste distinct. Une référence documentId n’est ni une copie du fichier ni une preuve de présence.

Premier lot A : sélection explicite PDF/JPEG/PNG, copie IndexedDB, métadonnées minimales, liste/recherche, ouverture ou export unitaire, suppression définitive confirmée. Un seul stockage binaire ; pas d’OPFS/Capacitor en parallèle. Aucun changement du shell, des contrats Activité ou Déclarations dans ce lot. Lots suivants : sauvegarde/restauration ZIP B, raccordement aux modules C, lecteur PDF avancé/OCR/chiffrement ultérieurs. Aucun package ajouté par cette proposition.

La disponibilité des octets locaux n’assure pas le démarrage de l’application sans réseau. Le mode hors-ligne complet dépend du chargement de l’app et d’une stratégie de cache qui n’est pas livrée ici. Ne pas afficher « accès instantané hors ligne garanti ». Le stockage est propre à l’origine du site et au profil navigateur ; une autre URL de preview, un autre navigateur ou appareil ne retrouve pas automatiquement les documents.

## 2. Import : limites et validation

- Fichiers choisis par l’utilisateur ; `<input type="file" accept="application/pdf,image/jpeg,image/png">`. Drag-and-drop en complément desktop. Caméra via capture comme amélioration facultative, toujours avec retour au sélecteur. Aucun accès continu à l’appareil photo.
- Limite produit exacte : 15 * 1024 * 1024 octets (15 Mio) par fichier ; taille nulle refusée. Import multiple limité à 20 fichiers par sélection, traitement séquentiel pour borner la mémoire. Maximum 1000 documents et 250 Mio d’octets cumulés dans le lot A, indépendamment du quota navigateur. Pas de suppression automatique pour faire de la place.
- Signatures : PDF `%PDF-` en début, PNG signature 8 octets, JPEG marqueur SOI. Concordance extension/MIME déclaré/signature ; MIME déclaré vide accepté si extension et signature concordent. Erreur sinon. Une signature compatible ne prouve ni que le contenu est inoffensif ni qu’il sera affichable : un échec de rendu reste possible et n’autorise pas l’exécution du document.
- SHA-256 des octets complets, calculé avant la transaction. Échec de lecture/hash : aucune écriture. Digest = détection de contenu identique, pas attestation d’origine ou de conformité.
- Lot A : fichier identique déjà présent => résultat `duplicate` avec document existant, aucun second exemplaire et aucune modification des métadonnées de l’existant. Le propriétaire peut ajouter une liaison plus tard. La possibilité de confirmer une deuxième copie est différée plutôt que promise sans méthode.
- `clientRequestId` UUID stable sur retry ; même clé + même empreinte + même métadonnées normalisées => même résultat ; contenu différent => request_conflict. Retry après suppression => request_deleted ; ne pas ressusciter une pièce supprimée. Registre technique sans copie des textes personnels.
- Import multiple : une transaction par document, rapport par fichier (importé/doublon/échec) ; continuer les fichiers suivants sauf stockage indisponible/quota, conserver ceux déjà confirmés. Pas de succès global fictif. Une mutation rejetée n’efface pas la saisie et peut être réessayée.

## 3. Métadonnées minimales et contrat proposé

Types locaux proposés ; pas « types officiels ». Les libellés/categories/notes sont saisis par l’utilisateur. Les montants et unités restent dans Activité/Déclarations : le coffre ne crée pas une seconde vérité. Pas de ocrText dans le premier schéma.

```ts
export type DocumentCategory = 'AEM' | 'PAYSLIP' | 'CONTRACT' |
  'FRANCE_TRAVAIL_NOTICE' | 'EXPENSE_RECEIPT' | 'TAX_DOCUMENT' | 'OTHER';
export type DocumentMime = 'application/pdf' | 'image/jpeg' | 'image/png';
export interface DocumentEditable {
  title: string;
  category: DocumentCategory;
  employerName?: string;
  startDate?: string;
  endDate?: string;
  tags: string[];
  notes?: string;
}
export interface DocumentMetadata extends DocumentEditable {
  id: string;
  version: number;
  originalFileName: string;
  sizeBytes: number;
  mime: DocumentMime;
  sha256: string;
  createdAt: string;
  updatedAt: string;
}
export interface DocumentFileRecord { id: string; blob: Blob; }
export type DocumentLookup =
  | { status: 'present'; document: DocumentMetadata }
  | { status: 'missing' }
  | { status: 'unavailable' };
export type DocumentImportResult =
  | { status: 'imported'; document: DocumentMetadata }
  | { status: 'duplicate'; document: DocumentMetadata };
export interface DocumentQuery {
  text?: string;
  categories?: DocumentCategory[];
  importedOnOrAfter?: string;
  importedOnOrBefore?: string;
  cursor?: string;
}
export interface DocumentPage { items: DocumentMetadata[]; nextCursor?: string; }
export interface VaultCapacity {
  vaultBytes: number; // somme des tailles de copies, pas mesure du disque
  documentCount: number;
  productMaxBytes: number;
  productMaxDocuments: number;
  originUsageEstimate?: number;
  originQuotaEstimate?: number;
  estimateAvailable: boolean;
}
export type DocumentErrorCode = 'validation' | 'invalid_file_type' |
  'file_too_large' | 'product_limit' | 'quota_exceeded' | 'not_found' |
  'storage_unavailable' | 'storage_corrupt' | 'conflict' |
  'request_conflict' | 'request_deleted' | 'unsupported_version';
export interface DocumentService {
  importDocument(file: File, metadata: DocumentEditable,
    clientRequestId: string): Promise<DocumentImportResult>;
  lookup(id: string): Promise<DocumentLookup>;
  readBlob(id: string): Promise<Blob>;
  updateMetadata(id: string, replacement: DocumentEditable,
    expectedVersion: number): Promise<DocumentMetadata>;
  remove(id: string, expectedVersion: number): Promise<void>;
  search(query: DocumentQuery): Promise<DocumentPage>;
  capacity(): Promise<VaultCapacity>;
}
```

Les erreurs opérationnelles sont des Error avec code et issues `{path,message}[]` si validation ; aucune fuite de nom de fichier/notes dans des logs distants. `lookup` rend unavailable si accès indisponible ou paire métadonnées/octets incohérente ; missing uniquement après lecture réussie confirmant l’absence. Les autres méthodes rejettent une erreur codée. readBlob distingue not_found d’une corruption.

Remplacement complet de DocumentEditable : champs optionnels omis effacés. Identité/hash/taille/MIME/horodatages/version non modifiables par ce DTO ; champs inconnus rejetés à l’écriture. Version entière >=1, contrôle atomique expectedVersion ; pas de priorité au timestamp le plus récent. UUID pour ID/clé de requête, timestamps UTC canoniques injectés par l’adaptateur, dates civiles réelles YYYY-MM-DD (2000–2100, borne produit). startDate <= endDate si les deux sont présentes ; une seule borne permise, sans période inventée.

Titre trim 1–160, employeur optionnel trim 1–160, notes <=1000 après trim ; 20 tags maximum, trim 1–40, dédoublonnés après NFC/minuscules FR/espaces normalisés, première graphie gardée. Noms d’origine conservés en texte borné 255, aucun chemin réutilisé ; nom de téléchargement assaini, extension issue du MIME validé. Pas de HTML interprété.

Recherche : texte NFC/minuscules FR/espaces, substring sur titre/nom d’origine/employeur/notes/tags. Catégories en OR, autres filtres combinés en AND. Dates de filtre sur jour UTC d’import, bornes inclusives ; pas sur la période métier sans filtre séparé. Ordre createdAt DESC, id DESC par chaîne ; pages 50, curseur opaque sur paire et filtres normalisés, clé de continuation sans dépendance à la présence de l’ancre. Changement de filtre/curseur mal formé => validation. Pas de garantie snapshot face aux modifications simultanées ; UI dédoublonne les IDs.

## 4. Persistance et cohérence

Base IndexedDB dédiée `intermittent-plus.documents`, version de schéma 1. Object stores metadata, files et requests dans la même base. Fichiers et métadonnées écrits/supprimés dans une seule transaction readwrite ; succès uniquement à transaction complete, pas à la première requête réussie. Contraintes de digest, limites et versions relues dans cette transaction : pas de doublon de course entre deux onglets. Le hash et la lecture binaire se font avant son ouverture, pas de longue attente asynchrone qui ferait expirer la transaction.

En cas d’abort/quota, pas de métadonnées orphelines annoncées comme importées. Aucune bascule silencieuse en mémoire ; adaptateur mémoire séparé réservé aux tests/démo. Une corruption n’entraîne jamais la réinitialisation automatique. Lecture ne transmet ni fichiers ni métadonnées vers un tiers. Service importé côté client uniquement.

`navigator.storage.estimate()` est une estimation de l’ensemble de l’origine, pas des octets du seul coffre ni de l’espace disque de l’appareil [S1]. Somme vaultBytes séparée. Estimation absente/échec => indicateur indisponible, pas zéro. Une alerte à 90 % est indicative ; elle ne bloque pas artificiellement l’import. Refus uniquement sur limite produit ou erreur réelle de transaction. L’application ne peut pas garantir que la prochaine écriture réussira à partir d’une estimation.

Option ultérieure de demander le stockage persistant avec explication et action explicite ; refus non bloquant. Même accordé, ce n’est pas une sauvegarde. Effacement volontaire, éviction, profil privé, panne appareil ou changement d’origine peuvent faire perdre l’accès [S2]. Pas de promesse de récupération par l’équipe.

## 5. Aperçu, export et suppression

Images : URL objet créée depuis le Blob local, texte alternatif, fermeture et retour clavier. Révocation lors du remplacement/fermeture/démontage ; annuler/ignorer une lecture tardive si l’utilisateur change de pièce. Ne pas révoquer avant que la ressource soit utilisable [S4]. Résolutions excessives/échec de décodage => aperçu indisponible, export possible ; limite de décodage à fixer dans la mission UI, aucune rasterisation pleine résolution imposée.

PDF : premier lot propose ouverture/export explicite dans le lecteur disponible. Si aperçu embarqué natif supporté, prévoir repli visible « Télécharger pour ouvrir » ; pas de promesse multi-page/zoom/gestes identiques sur Android. Aucun lecteur distant, aucune injection HTML ; PDF.js exige un lot et une dépendance justifiés séparément. L’app ne garantit pas l’absence de contenu actif dans un lecteur externe ; l’utilisateur choisit d’ouvrir son fichier.

Export unitaire : readBlob puis téléchargement explicite, nom assaini ; l’interface dit « téléchargement demandé », pas « sauvegarde confirmée sur disque ». Révoquer l’URL après usage selon un cycle testé ; proposer Réessayer si navigateur ne démarre pas le téléchargement.

Suppression : confirmation avec titre et avertissement sur les références. remove supprime définitivement copie et métadonnées ensemble, avec contrôle de version. Pas de corbeille 30 jours ni purge différée dans le lot A. L’original sélectionné à l’import n’est jamais supprimé. La disparition logique ne promet pas un effacement sécurisé physique du support.

## 6. Raccordement Activité et Déclarations

Ne pas modifier la spec/DTO Activité dans ce lot. Les modules propriétaires conservent leurs références ; le coffre ne stocke pas en parallèle des listes liées qui se désynchroniseraient. Le raccordement inverse « quelles activités utilisent cette pièce » nécessite un adaptateur explicite futur, pas une promesse du service ci-dessus.

Déclarations possède déjà ReceiptReference `{documentId,linkedAt}`. Le connecteur futur utilise lookup : present/missing/unavailable, sans transformer une référence saisie en justificatif présent. Un document supprimé rend les références manquantes ; prévenir, ne pas effacer une dépense/activité et ne pas réécrire silencieusement les autres stores. Supprimer une activité ne supprime pas le fichier. Le module propriétaire peut enlever sa propre référence ; aucune transaction atomique entre bases différentes n’est promise.

Aucune métadonnée de fichier n’alimente automatiquement salaire, heures, cachets, actualisation, droits ou fiscalité. Lecture manuelle et confirmation utilisateur ; OCR et rapprochement assisté restent hors lot.

## 7. Sauvegarde/restauration : lot B séparé, pas déclaré livré

Le lot A prévient qu’il offre seulement l’export unitaire ; ne pas l’appeler sauvegarde complète. B ajoute une archive ZIP contenant manifest.json versionné et files/<uuid>.<extension>, des copies des octets originaux et les métadonnées nécessaires. Pas de chemins venant directement du nom de fichier. Les liaisons détenues par d’autres modules ne sont pas sauvegardées par une archive documentaire ; indiquer cette limite.

Avant code B, choisir et justifier une bibliothèque ZIP locale, sans CDN. Archive entrante <=300 Mio compressés, <=250 Mio décompressés, <=1000 fichiers ; quotas contrôlés pendant décompression, pas seulement les tailles annoncées. Refuser chemins absolus/traversée/doublons de chemins, liens symboliques, entrées non répertoriées, version inconnue, manifest invalide. Recalculer tailles/MIME/hash, pas de confiance dans le manifest. Aucun code extrait exécuté.

Aperçu sans écriture, comptage admissibles/identiques/conflits/invalides ; confirmation puis revalidation contre l’état courant. Même ID et même contenu/métadonnées => ignoré ; même ID différent => conflit, jamais écrasé. Même digest autre ID => proposer réutilisation avec mapping explicite avant raccordement des références, pas de réécriture invisible. Lot restauré atomiquement ou annulation totale ; préserver le coffre existant lors d’un quota/corruption. Faisabilité mémoire et durée des transactions à valider avant de figer les signatures d’archive. Aucun `importVaultArchive` non défini dans l’interface du lot A.

Migration IndexedDB : changement de version via transaction d’upgrade, pas drop-and-recreate. Onglet ancien reçoit versionchange et ferme sa connexion ; upgrade bloqué => demander fermeture des autres onglets. Échec => conserver les données, signaler indisponibilité. Version de manifest indépendante de version DB. Tests de migration obligatoires à chaque évolution ; pas de conversion implicite des champs vers les droits.

## 8. Parcours et critères d’acceptation

| Parcours | Résultat testable |
|---|---|
| Android : choisir PDF/JPEG/PNG, annuler, photo si offerte | Annulation sans écriture ; sélecteur toujours disponible ; aucun upload |
| Desktop : déposer plusieurs fichiers dont un invalide | Résultat individuel ; fichiers valides conservés, erreurs explicites |
| Import puis rechargement | Même ID, octets et hash ; aucune référence à l’original requise |
| Deux onglets importent le même fichier | Un seul document ; résultat duplicate pour l’autre |
| Retry de création, réponse perdue | Même clé+même contenu => même résultat ; payload changé => conflit |
| Modifier avec version périmée | Rejet conflict ; aucun écrasement |
| Quota ou transaction annulée | Pas de paire partiellement écrite ; saisie conservée |
| Recherche filtre/date/texte + pagination | Ordre stable, titres longs en texte, aucune donnée perdue par filtre |
| Ouverture puis changement rapide de document | Réponse obsolète ignorée ; URL objet précédente révoquée |
| Aperçu PDF indisponible | Export/ouverture explicite disponible sans faux succès |
| Suppression confirmée | Octets et métadonnées absents ; références externes affichables comme missing |
| Stockage inaccessible | unavailable, jamais missing ou faux coffre vide |
| Restauration B corrompue/zip bomb/conflit | Refus borné et rapport, état existant préservé |
| Mise à niveau DB interrompue | Pas de reset ; ancien état préservé ou erreur explicite |

Tests unitaires sur vrais imports pour validation/hash/tri/curseur. Transactions, quotas, upgrades et URL objets : navigateur réel ou adaptateur instrumenté ; un mock ne prouve pas la durabilité. Android Chrome, Safari iOS et desktop Chromium/Firefox à tester à 390/1280 px, clavier et zoom. Mesurer les versions et tailles testées dans la livraison. Pas d’objectif « moins de 100 ms » sans jeu de données/appareil/protocole ; benchmark à 1000 métadonnées distinct du chargement des Blobs.

## 9. Sources et limites de vérification

Documentation lue par l’intégrateur le 29 septembre 2026 ; aucun navigateur applicatif, quota réel, caméra ou fichier personnel testé. Gemini n’a fourni ni preuve d’exécution ni références dans sa livraison ; aucune de ses affirmations de compatibilité n’est tenue pour une vérification terrain.

- [S1] MDN StorageManager.estimate : https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate — estimations de l’origine et imprécision.
- [S2] MDN stockage/éviction : https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria — quota et perte possible ; IndexedDB n’est pas une sauvegarde.
- [S3] MDN attribut capture : https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/capture — support limité ; amélioration mobile facultative, repli sélecteur.
- [S4] MDN URL.revokeObjectURL : https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static — libérer les URLs objet.

Les contraintes de taille, versions, contrats et lots sont des décisions produit proposées, pas des règles réglementaires ni des capacités navigateur garanties. Aucun chiffrement promis ; aucune pièce réelle ou donnée du profil publiée. Le futur CODE-DOCS-01 doit figer les fichiers autorisés, l’adaptateur IndexedDB et les vérifications navigateur avant démarrage.
