# DOCS-REVIEW-02 — Grok

## Responsable
Grok puis intégrateur.

## Objectif
Auditer SPEC-DOCS-01 sous l'angle IndexedDB et concurrence avant durcissement du coffre privé.

## Chercher en priorité
- atomicité réelle metadata/files/requests ;
- transaction IndexedDB qui s'auto-ferme après await ;
- concurrence multi-onglets ;
- idempotence clientRequestId ;
- même requête/même payload vs request_conflict ;
- request_deleted après suppression ;
- doublon SHA-256 ;
- limites 15 MiB, 20 fichiers, 1000 documents, 250 MiB ;
- quota, corruption, pagination/cursor et version conflicts.

## Contraintes
Pas d'OCR, cloud, chiffrement promis, extraction réglementaire ou modification automatique des heures/salaires/507 h. PDF/JPEG/PNG seulement. Les stockages restent propres à l'origine/profil navigateur/appareil.

## Livrable
PR publique avec `docs/reviews/docs-review-02.md`; harness éventuel uniquement sous `contrib/documents/`. Anomalies classées par sévérité, scénario reproductible, correctif minimal et tests proposés. Ne pas toucher au dépôt privé.