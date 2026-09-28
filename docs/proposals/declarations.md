# SPEC-DECLARATIONS-01 — Dépenses, trajets et préparation annuelle

28 septembre 2026. Proposition DeepSeek transmise par le fondateur, revue et amendée par l’intégrateur. Spécification seulement : aucun code applicatif, contrat partagé, dépendance ou moteur de droits modifié. PR à relire avant lancement d’un lot de code.

## 1. Provenance et corrections de la proposition

DeepSeek n’a consulté ni les sites externes ni la spec Activité ; il a travaillé sur le brief et n’a exécuté aucun test. L’intégrateur a lu la spec Activité revue au commit `980f6c290869a066d01c4709e7534ca20acff16b` et rapproché cette proposition du produit existant. Les lectures web effectuées plus tôt le 28/09 par l’intégrateur ne sont pas attribuées à DeepSeek.

Décisions qui remplacent les questions ouvertes :
- Usage professionnel : montant explicite en centimes, pas pourcentage dans ce premier lot.
- Année d’une dépense : dérivée de sa date de paiement, pas un second champ modifiable contradictoire.
- Activité : lecture avec provenance ; aucune priorité à la dernière modification et aucune copie automatique vers un montant déclarable.
- JSON pour sauvegarde/import avec aperçu et confirmation ; CSV pour lecture/export uniquement.
- Comparateur fiscal : différé, pas un écran qui prétend comparer sans pouvoir calculer.
- Justificatif : référence non résolue par défaut ; absence de coffre ne permet pas d’afficher « document présent ».
- Kilomètres annuels : choix exclusif entre journal et total manuel par voiture/année ; jamais la somme des deux.

## 2. Existant et références

| Sujet | État réel du produit avant ce lot | Extension proposée |
|---|---|---|
| Actualisation | Calendrier 2026, rappel dashboard, checklist et confirmation personnelle locales | Récapitulatif documentaire après raccordement Activité |
| Automobile | Total annuel manuel par voiture, barème déclaration 2026/revenus 2025, compléments, brouillon et CSV | Journal de trajets, choix de source annuel explicite |
| Frais réels | Préparation annuelle automobile partielle déjà présente | Dépenses détaillées par catégorie |
| Contrats/cachets | Simulations existantes ; module Activité en développement, pas livré | Consommation du futur service, sans réécriture |
| Justificatifs | Aucun coffre relié | Contrat de référence seulement, raccordement ultérieur |
| Comparateur fiscal complet | Non construit | Différé jusqu’à règles et données vérifiées |

Références fonctionnelles lues par l’intégrateur le 28/09/2026 :
- https://declaart.fr/ : présente dépenses, kilomètres, justificatifs, comparaison de déductions et récapitulatif annuel. Application mobile encore annoncée comme prochainement disponible sur la page lue.
- https://artdecla.fr/ : présente contrats, tableau de bord, rappels et exports.

Ces annonces ne prouvent ni le fonctionnement connecté ni la conformité des calculs des concurrents. Aucun compte créé, application mobile testée, contenu graphique ou code copié. Leur intérêt pour le parcours : saisir au fil de l’année, classer, préparer un récapitulatif vérifiable.

## 3. Premier lot produit

Journal de dépenses et journal de trajets locaux, voitures réutilisables, brouillons, édition, suppression confirmée, vue annuelle, JSON/CSV. Aucune application de barème dans ce nouveau journal tant que son raccordement au calculateur existant n’est pas validé séparément.

Formulaire dépense court : date de paiement, libellé, montant TTC, catégorie. Détails dépliables : montant professionnel revendiqué, remboursement reçu, note, référence à une pièce si un vrai coffre est raccordé. Montant professionnel inconnu par défaut ; bouton explicite « Tout professionnel » possible, sans validation fiscale implicite.

Formulaire trajet court : date, motif, origine/destination en texte, distance réellement parcourue, voiture. L’aller-retour n’est jamais doublé automatiquement. Pas de cartes, géolocalisation ou calcul de distance supposé. Nature du déplacement explicite ; distance retenue fiscalement encore inconnue.

Une dépense enregistrée est une donnée documentaire, pas une déduction acceptée. Un trajet enregistré est une distance documentée, pas une distance automatiquement admissible au barème.

## 4. Types locaux proposés

Types propres au futur module : ne pas ajouter à lib/contracts/modules.ts ni importer le code privé. Les DTO ci-dessous sont la source unique ; toute évolution passe par revue. Un brouillon a réellement des champs facultatifs ; « Enregistrer » exige un enregistrement complet.

```ts
export type CivilDate = string; // YYYY-MM-DD calendaire réel
export type ExpenseCategory = 'materiel' | 'logiciels' | 'transport' | 'repas' |
  'hebergement' | 'formation' | 'local' | 'telecom' | 'assurance' | 'autre';
export type Reimbursement =
  | { kind: 'unknown' }
  | { kind: 'none' }
  | { kind: 'received'; amountCents: number };
export interface ReceiptReference {
  documentId: string;
  linkedAt: string;
}
export type ReceiptLookup =
  | { status: 'unavailable' } // coffre non connecté ou échec d'accès
  | { status: 'missing' }     // absence confirmée par le coffre
  | { status: 'present' };    // présence uniquement, pas authenticité fiscale
export interface ExpenseInput {
  paidOn: CivilDate;
  label: string;
  amountCents: number;
  category: ExpenseCategory;
  professionalCents?: number; // revendiqué par l'utilisateur, inconnu si absent
  reimbursement: Reimbursement;
  receipt?: ReceiptReference;
  note?: string;
}
export interface TripInput {
  date: CivilDate;
  reason: string;
  origin: string;
  destination: string;
  distanceMeters: number;
  vehicleId: string;
  purpose: 'commute' | 'professional' | 'unspecified';
  receipt?: ReceiptReference;
  note?: string;
}
export interface VehicleInput {
  label: string;
  kind: 'car'; // autres véhicules hors premier lot
  fiscalHorsepower: number;
  motorization: 'thermal' | 'electric' | 'hybrid' | 'other';
}
export interface RecordMeta {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export type Expense = RecordMeta & (
  | { state: 'draft'; data: Partial<ExpenseInput> }
  | { state: 'recorded'; data: ExpenseInput }
);
export type Trip = RecordMeta & (
  | { state: 'draft'; data: Partial<TripInput> }
  | { state: 'recorded'; data: TripInput }
);
export type Vehicle = RecordMeta & { data: VehicleInput };
export type MileageSelection = {
  vehicleId: string;
  mode: 'unselected' | 'journal' | 'manual';
  manualDistanceMeters?: number; // conservé si on change de mode, jamais additionné
};
export type AnnualPreparation = RecordMeta & {
  revenueYear: number;
  declarationYear: number;
  mileage: MileageSelection[];
};
export type Entity = Expense | Trip | Vehicle | AnnualPreparation;
export interface JournalExport {
  format: 'intermittent-plus-declaration-journal';
  formatVersion: 1;
  exportedAt: string;
  expenses: Expense[];
  trips: Trip[];
  vehicles: Vehicle[];
  annualPreparations: AnnualPreparation[];
}
export interface ImportReport {
  admissible: number;
  skipped: number;
  conflicts: Array<{ collection: string; id: string; reason: string }>;
  invalid: Array<{ collection: string; index: number; reason: string }>;
}
export type JournalErrorCode = 'validation' | 'conflict' | 'not_found' |
  'request_conflict' | 'request_deleted' | 'storage_unavailable' |
  'storage_corrupt' | 'quota_exceeded' | 'unsupported_version';
```

Pas de champ montant fiscalement retenu, de total annuel cache, de revenu net imposable ou de manualAdjustments générique : cela contournerait la provenance des entrées. Pas de pièces binaires, URL de téléchargement, token ou identifiant personnel dans une ReceiptReference. Même une référence opaque constitue une donnée locale à protéger ; elle n’est pas déclarée « sans données privées ».

## 5. Validation et totaux déterministes

- Argent : centimes entiers sûrs >=0. Virgule/point en saisie, deux décimales maximum, sans arrondi silencieux. 0 est valide, absent est inconnu. Sommes doivent rester entiers sûrs, sinon erreur.
- professionalCents entre 0 et amountCents inclus. Aucune déduction implicite du remboursement : total TTC, part professionnelle revendiquée et remboursements reçus affichés séparément. Si utile, un reste payé = TTC moins remboursement est un indicateur de trésorerie, jamais un montant fiscal.
- received.amountCents >0 et <=amountCents ; aucun remboursement futur supposé. Les cas d’avances/remboursements dépassant la dépense sont hors lot, signalés plutôt que tronqués.
- Distance : mètres entiers sûrs >0. Entrée km avec au plus trois décimales ; convertir exactement, sans arrondir chaque trajet. Unité explicitement affichée. Total annuel en mètres ; le raccordement futur définit l’arrondi final au barème, pas ce journal.
- Dates civiles réelles ; années 2000–2100 dans l’UI et les données, limite produit explicite. Pas de conversion de fuseau. paidOn détermine l’année documentaire de dépense ; Trip.date celle des trajets. Pas de rattachement arbitraire à une année de revenus différente. Une correction de date déplace l’entrée, après avertissement ; une dépense payée après l’année d’un contrat n’est pas réattribuée au contrat.
- AnnualPreparation : unique par revenueYear, declarationYear = revenueYear+1 dans ce premier parcours standard. Ce n’est pas une règle universelle de toutes les déclarations ; les cas rectificatifs conservent l’année concernée et sont hors premier lot.
- Texte trim : libellé/motif/origine/destination 1–160 caractères ; note <=1000. Texte brut uniquement.
- fiscalHorsepower entier 1–50, borne de saisie produit, pas plafond fiscal. Voitures uniquement. Pas de catégories de barème présumées pour une autre motorisation.
- UUID, timestamps UTC ISO et version entier sûr >=1. Version de concurrence, pas « modification la plus récente ». Même horodatage possible sur opérations rapides.
- Pour un brouillon, valider les champs présents, permettre les champs absents et exclure intégralement des totaux. Brouillon sans date visible dans « À compléter », jamais perdu à cause du filtre annuel.
- Une seule référence de voiture dans chaque sélection annuelle. manual exige manualDistanceMeters entier sûr >=0 ; journal utilise tous les trajets enregistrés correspondants ; unselected ne produit pas de distance choisie.

Totaux dérivés en lecture : dépenses enregistrées dont paidOn appartient à l’année, regroupées par catégorie ; parts pro connues avec compteur des parts inconnues ; remboursements connus avec compteur des inconnus ; trajets enregistrés par voiture et année. Aucun remplissage d’une inconnue avec zéro sans mention. Les pièces manquantes n’effacent pas la dépense documentaire, mais apparaissent dans « À compléter ».

Tri des listes/export : date civile DESC (brouillons non datés en premier), createdAt DESC par instant, id DESC. Préparations annuelles triées par année ; voitures par label puis ID. Lire tous les enregistrements pour les totaux, pas la seule page affichée.

## 6. Compatibilité avec les kilomètres manuels existants

Le calculateur actuel conserve ses brouillons dans intermittent-plus.declarations.v1. Le journal utilise une nouvelle clé indépendante ; il ne lit ni ne modifie l’ancienne clé. Le raccordement et sa migration appartiennent à l’intégrateur.

Pour une voiture et une année, afficher côte à côte « total manuel actuel » et « trajets documentés », jamais leur somme. Proposer un choix explicite de source. Avant de passer au journal, avertir que les trajets peuvent ne couvrir qu’une partie de l’année. Conserver le manuel comme donnée de provenance, sans le compter lorsqu’il n’est pas sélectionné.

Pas de rapprochement automatique de voitures par nom. L’intégrateur doit demander un lien explicite entre la voiture du brouillon historique et celle du journal. Si les deux sources ont évolué, présenter les différences ; ne pas écraser par le plus récent. Distance documentaire sélectionnée ne veut pas dire distance fiscalement admise.

## 7. Opérations, doublons et concurrence

Service proposé à définir dans un futur lot de contrat local : listes filtrées, get, create, update complet avec expectedVersion, delete avec expectedVersion, exportAll, previewImport et importConfirmed. Tous asynchrones, erreurs codées ci-dessus, champs en erreur identifiables. Pas de pseudo-signature générique ambiguë : les méthodes et DTO exacts seront figés dans la mission de code avant implémentation.

Create : clientRequestId stable au retry ; même clé+même saisie normalisée renvoie le même ID ; même clé+autre saisie rejette request_conflict. Après suppression, ancien retry rejette request_deleted. Le registre technique conserve une empreinte et l’ID, pas le texte supprimé.

Doublon potentiel : même date/libellé/montant pour dépense, ou même date/voiture/origine/destination/distance pour trajet, textes normalisés trim/espaces/minuscules. Avertir avant écriture ; confirmation explicite permet deux entrées distinctes. Ne pas fusionner automatiquement des achats ou trajets répétés légitimes.

Update remplace le DTO complet ; champs facultatifs omis effacés, version vérifiée. Delete confirmé, version vérifiée ; ne supprime aucun document lié du coffre. Voiture référencée par trajet ou sélection annuelle : suppression refusée avec références à résoudre, pas de cascade. Correction de caractéristiques d’une voiture : avertir qu’elle change les données historiques de cette voiture ; ne pas recalculer silencieusement un résultat fiscal ancien.

Clé proposée intermittent-plus.declaration-journal.v1. Adapter local sous Web Lock exclusif de même nom, relecture/validation/contrôle de version puis unique setItem. Verrou ou stockage indisponible : erreur explicite, jamais bascule silencieuse en mémoire. Adaptateur mémoire séparé pour fixtures. Données corrompues conservées avec export brut possible, pas de réinitialisation. Limites produit : 5000 dépenses, 10000 trajets, 100 voitures ; erreurs explicites, pas purge des anciennes années. Profils/simulations/déclarations actuels intacts.

## 8. Import et export

JSON seul réimportable. Enveloppe versionnée ci-dessus ; unknown validé avant usage. Taille maximale 10 Mio et limites de collections précédentes, limites de ressources produit. Propriétés normalisées explicitement ; pas de copie aveugle.

Aperçu sans écriture : comptages par collection, nouveaux admissibles, identiques ignorés, conflits, invalides. Confirmation obligatoire ; l’import revalide sous verrou contre l’état courant. Seuls nouveaux valides ajoutés ; aucune modification automatique d’un existant même avec version entrante plus grande. Rapport effectif retourné. Même ID+contenu normalisé+version+timestamps identiques => skipped ; sinon conflit. IDs dupliqués dans une collection du fichier => toutes leurs lignes invalides.

Une référence de voiture doit se résoudre vers une voiture locale ou admissible importée. En cas de conflit sur sa définition importée, les trajets/préparations qui en dépendent sont exclus du lot admissible avec raison explicite ; ne pas les rattacher silencieusement à une voiture locale différente. Références de justificatifs peuvent rester unresolved, ne prouvent pas une présence. Une préparation annuelle déjà existante pour la même année mais autre ID est un conflit.

Ajout des nouveaux valides en une écriture atomique, après confirmation du bilan y compris exclusions. Quota/échec setItem => aucun ajout ; conserver le fichier et permettre réessai. Réimport identique => rien dupliqué. CSV n’est pas importable : corrige la proposition initiale « import CSV partiel ».

CSV UTF-8, colonnes stables, IDs/date/année/statut/provenance ; montants cents et euros lisibles, distances mètres et km. Guillemets/retours échappés, neutralisation des formules textuelles. Export signale l’inclusion des brouillons et inconnues. JSON sans registre de requêtes ni octets des justificatifs ; exporter une référence n’exporte pas la pièce. PDF différé.

## 9. Raccordement Activité et coffre

Spec Activité lue :
https://github.com/Masterofhypnose/intermittenz/blob/980f6c290869a066d01c4709e7534ca20acff16b/docs/proposals/activity.md

Activity a startDate/endDate, nature, employeur, cachets, hours, amount brut/net, id/version. monthlySummary attribue les activités au mois de début, sans prorata ; list(month) inclut aussi les périodes chevauchantes. Ni résumé ni amount net ne représentent automatiquement un revenu encaissé, un net imposable ou les données exactes à actualiser.

Raccordement futur par lecture d’ActivityService : conserver source activity-module, ID/version/date de lecture ; montrer les périodes et les champs bruts séparés. Pour l’actualisation, afficher toutes les activités recouvrant le mois (pagination complète), et signaler les périodes chevauchantes à détailler par l’utilisateur. Ne pas recopier monthlySummary comme déclaration France Travail. Données futures ne prouvent pas un travail réalisé. Salaires et allocations demeurent distincts, allocations absentes non inventées.

Correction d’une activité : lien vers son module, pas de seconde activité éditable dans Déclarations. Si l’utilisateur prépare une valeur déclarative différente, garder une correction explicite avec raison/provenance, soumise à revue du futur contrat ; aucune priorité basée uniquement sur un timestamp. Aucun envoi ni accusé France Travail fabriqué.

Coffre : service futur de résolution ReceiptReference -> ReceiptLookup ; pas d’hypothèse de stockage/chiffrement. Non connecté ou erreur => unavailable ; fichier explicitement introuvable => missing. present ne certifie pas la qualité fiscale. Bouton pièce jointes indisponible expliqué tant que le coffre ne fonctionne pas, jamais succès simulé. Supprimer le lien ne supprime pas le document. Ne pas modifier SPEC-DOCS-01.

## 10. Registre des sources fiscales

La limite de lecture de DeepSeek ne remet pas à « inconnu dans tout le projet » les paramètres déjà vérifiés par l’intégrateur et testés dans le produit. Garder auteur, date, URL, millésime, portée et incertitudes distincts. Aucun nom de relecteur ne remplace la preuve documentaire.

| Sujet | État au 28/09/2026 | Source / suite |
|---|---|---|
| Calendrier FT 2026 | Lu auparavant par l’intégrateur, rappel existant ; non relu par DeepSeek | https://www.francetravail.fr/candidat/vos-droits-et-demarches/vos-demarches-aupres-de-pole-emp/le-calendrier-des-paiements.html |
| Automobile déclaration 2026/revenus 2025 | Paramètres existants lus auparavant par l’intégrateur ; nouveau journal ne les redéfinit pas | https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/frais.htm |
| Autres millésimes, véhicules, arrondi fiscal du journal | Non validés pour ce raccordement | DGFiP/BOFiP, revue séparée nécessaire |
| Forfaits propres à certaines professions artistiques, cumul/exclusions | À vérifier par profession/année/catégorie, pas taux universels | BOFiP exact à identifier et lire |
| Remboursements, dépenses mixtes, amortissement et justificatifs | Pas de calcul d’éligibilité complet | Sources officielles à documenter avant automatisation |
| Conservation des pièces et cas particuliers d’actualisation | Non tranchés dans ce lot | DGFiP/France Travail selon sujet |

Pas de comparateur descriptif trompeur : le premier lot affiche des données et ce qui manque. Futur comparateur chiffré seulement si périmètre de règles et données suffisant ; sinon résultat « non calculable ». Un lien sortant vers un simulateur officiel ne constitue pas un préremplissage de ce simulateur. Aucune promesse d’économie d’impôt sans calcul approprié.

## 11. Acceptation à convertir en tests réels lors du lot de code

1. Dépense 33+33+33 cents =99 ; zéro distinct d’inconnu ; invalides/calendrier/bissextile rejetés.
2. Brouillon incomplet conservé, non totalisé ; passage recorded exige les champs ; erreurs près des champs, focus première erreur.
3. Part pro 6000 sur dépense10000 avec remboursement4000 : trois chiffres distincts, aucune déduction fiscale produite.
4. Deux trajets100km même voiture/année =>200000m ; deux voitures =>100000m chacune ; deux années séparées.
5. Total manuel1000km et journal200km : mode manual=>1000, journal=>200, jamais1200 ; changement confirmé et réversible.
6. Dépense payée2026 liée à un contrat2024 reste dans vue2026 ; année active2025 ne la réaffecte pas ; aucune perte de l’entrée.
7. Doublon averti sans écriture puis confirmation ; retry même clé sans double ; suppression puis retry ne recrée rien.
8. Deux éditions même version : un succès, un conflit, saisie préservée. Verrou absent/quota/corruption =>pas de succès fictif.
9. Aperçu import sans écriture ; part admissible confirmée atomique ; conflits, IDs doublons et références voitures non résolues exclus ; réimport identique ignoré.
10. Coffre indisponible, référence supprimée, document présent : trois états distincts sans crash ni faux justificatif.
11. Activité chevauchant deux mois visible comme période à vérifier ; brut/net séparés ; aucun résumé traité comme net imposable.
12. Export CSV texte hostile/formule/guillemets ; JSON réimportable sans pièces ; clés existantes intactes.
13. UI mobile320/390 et desktop1280 : ajout/édition/suppression/annulation, changement d’année, focus, contenu littéral, brouillon conservé sur erreur. Visuel seulement si réellement exécuté.

Aucun de ces tests n’a été exécuté dans cette mission de spécification.

## 12. Livraison et prochaine décision

Document seul dans docs/proposals/declarations.md, contribution DeepSeek amendée. Pas de fusion ni développement déclenchés par cette PR. Avant code : figer les méthodes de service et les fichiers autorisés dans une mission dédiée ; fournir un agent-pack contenant cette version revue et l’extrait Activité, afin de ne pas demander à l’agent de deviner le raccordement inaccessible.

Premier lot : journal documentaire local autonome, sans raccordement aux anciennes clés. L’intégrateur garde migration, shell et connexion ultérieure au calculateur. Différés : PDF, coffre/OCR, fiscalité complète, comparateur, raccordement effectif Activité et toute transmission externe.
