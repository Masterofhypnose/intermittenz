# DOCS-REVIEW-02 — Audit IndexedDB / concurrence de SPEC-DOCS-01

Date : 30 septembre 2026  
Source : PR #11, commit `6b780032c849028890fcc2f26992f127827aaec0` (`docs/proposals/documents.md`)  
Périmètre : atomicité, transactions, multi-onglets, idempotence, doublons, limites, quota, curseur, versions.  
Hors périmètre : OCR, cloud, chiffrement, extraction réglementaire, CODE-DOCS-01.

Revue statique uniquement. Aucun navigateur, IndexedDB réel ni harness exécuté.

## Synthèse
La spec pose déjà les bons principes (hash hors transaction, une transaction readwrite pour metadata+files, version optimiste, clientRequestId, pas de reset auto). Plusieurs points restent sous-spécifiés pour un adaptateur : schéma exact du store requests, ordre d’opérations dans la transaction, fenêtre de course multi-onglets sur les limites produit, et sémantique fine de duplicate vs request_conflict.

## Blocages — sévérité haute

### B1 — Store requests : schéma et cycle de vie non figés
Figer un RequestRecord persistant : clientRequestId PK, contentSha256, metadataFingerprint, outcome imported|duplicate|deleted, documentId optionnel, completedAt. La suppression doit conserver une tombstone et un retry identique après suppression doit renvoyer request_deleted.

### B2 — Atomicité metadata/files/requests non ordonnée
Hash, validation et lecture File avant `db.transaction(...)`. Dans la transaction, enchaîner uniquement les requêtes IndexedDB nécessaires et attendre le succès via `tx.oncomplete`; éviter tout travail asynchrone externe qui laisse la transaction inactive. Import : request → digest → limites → file → metadata → request. Suppression : metadata/version → file delete → metadata delete → tombstone request.

### B3 — Course multi-onglets sur 1000 documents / 250 MiB
Les plafonds doivent être recalculés dans la transaction readwrite d'import ; aucun cache mémoire inter-onglets ne doit décider de l'admissibilité. `capacity()` reste informatif et peut être stale.

### B4 — Priorité duplicate SHA-256 vs clientRequestId
Ordre normatif : request existante d'abord (deleted → request_deleted ; même fingerprint → rejouer le résultat ; différente → request_conflict), puis digest (trouvé → duplicate + enregistrer la request), sinon nouvel import.

## Améliorations
- M1 : index unique `by_sha256` recommandé sur metadata.
- M2 : `conflict` = version optimiste update/remove ; `request_conflict` = idempotence import.
- M3 : curseur de recherche basé sur `createdAt DESC, id DESC` et lié aux filtres ; pas de snapshot garanti.
- M4 : distinguer `product_limit` des erreurs navigateur/quota.
- M5 : définir `storage_corrupt` lorsque metadata et blob divergent.

## Matrice de tests prioritaire
1. retry même request + même payload → même résultat, aucun nouvel objet ;
2. même request + metadata différente → request_conflict ;
3. import → remove → retry même request → request_deleted ;
4. deux request IDs + même SHA → un document ;
5. quota/abort → aucune metadata ni blob orphelin ;
6. plafond 1000 et plafond 250 MiB testés dans la transaction ;
7. deux connexions concurrentes → plafond jamais dépassé ;
8. lookup missing vs stockage bloqué ;
9. metadata sans fichier → storage_corrupt ;
10. pagination stable createdAt DESC/id DESC.

## Conclusion
Aucun blocage conceptuel qui invalide SPEC-DOCS-01. B1–B4 doivent être précisés et couverts avant de considérer CODE-DOCS-01 robuste.

Limites : revue statique transmise par Grok ; pas d'exécution IndexedDB ni harness dans ce lot.
