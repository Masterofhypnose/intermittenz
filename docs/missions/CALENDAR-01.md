# CALENDAR-01 — DeepSeek

## Responsable
DeepSeek puis intégrateur.

## Objectif
Concevoir un calendrier local-first isolable pour Intermittent+ à partir des activités et échéances déjà disponibles, sans modifier le moteur des droits ni prétendre valider les 507 h.

## Périmètre
- Vue mensuelle responsive Android/desktop.
- Navigation mois précédent/suivant et retour aujourd'hui.
- Une activité couvrant plusieurs jours apparaît sur toute sa période, y compris si elle chevauche deux mois.
- Distinguer visuellement activité déclarée, échéance d'actualisation et rappel.
- Dates civiles locales : éviter les décalages UTC.
- Clavier, libellés accessibles, états vide/erreur.
- Aucune mutation des sources Activity/Declarations.
- Aucun backend fictif, aucune dépendance nouvelle sans justification.

## Livrable
PR publique vers cet atelier. Spécification dans `docs/proposals/calendar.md`. Code éventuel uniquement sous `contrib/calendar/` pour éviter les conflits avec le produit privé. Tests déterministes inclus.

## Critères
Cas obligatoire : activité 30/08/2026 → 02/09/2026 correctement visible en août et septembre. Expliquer les limites et le raccordement requis par l'intégrateur. Ne pas toucher au dépôt privé.