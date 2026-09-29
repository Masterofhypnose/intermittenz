# DeepSeek — CODE-EXPENSES-01 : validation et totaux du journal

SPEC-DECLARATIONS-01 est reçue et amendée en PR #7, f6113ffa4cde7e97f23e8b9db42e9d2a78a42a00. Ne pas la refaire. Base de coordination main 83f5841c230f907de742106a694a528a4f818952. La spec amendée complète est incluse ; elle tranche le montant professionnel explicite et les années dérivées des dates.

## Résultat attendu
Code TypeScript pur pour valider les saisies et calculer les totaux documentaires annuels. Aucun service CRUD, stockage, import/export, React, barème ni raccordement Activité dans ce lot. Aucun accès au code privé requis. Ce noyau ne constitue pas encore l’onglet Déclarations complet.

## Fichiers autorisés
- lib/expense-journal/types.ts
- lib/expense-journal/validation.ts
- lib/expense-journal/summary.ts
- lib/expense-journal/index.ts
- tests/expense-journal.test.mjs
- docs/deliveries/CODE-EXPENSES-01.md
Branche suggérée : contrib/CODE-EXPENSES-01.

## Contrat local exact
Copier les types du §4 de la spec amendée dans types.ts. Ajouter et exporter :
```ts
export type FieldIssue = { path: string; message: string };
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; issues: FieldIssue[] };
export function parseEuroCents(value: string): number;
export function parseKilometersMeters(value: string): number;
export function validateExpense(value: unknown): ValidationResult<Expense>;
export function validateTrip(value: unknown): ValidationResult<Trip>;
export function validateVehicle(value: unknown): ValidationResult<Vehicle>;
export function validateAnnualPreparation(value: unknown): ValidationResult<AnnualPreparation>;
export type AnnualSummary = {
  revenueYear: number;
  expenseCount: number;
  totalAmountCents: number;
  professionalKnownCents: number;
  professionalUnknownCount: number;
  reimbursementReceivedCents: number;
  reimbursementUnknownCount: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  tripsByVehicle: Array<{ vehicleId: string; tripCount: number; distanceMeters: number; selectedDistanceMeters?: number; mode: MileageSelection['mode'] }>;
  undatedExpenseDraftIds: string[];
  undatedTripDraftIds: string[];
};
export function summarizeYear(input: {
 revenueYear: number; expenses: readonly Expense[]; trips: readonly Trip[];
 vehicles: readonly Vehicle[]; preparation?: AnnualPreparation;
}): AnnualSummary;
```

## Règles déterministes
Fonctions synchrones sans effets ni mutation. Validation runtime de toutes les entrées, pas de simple cast. Copier explicitement les champs autorisés ; ignorer les propriétés inconnues. Dates civiles réelles, années 2000–2100. UUID syntaxique 8-4-4-4-12 hexadécimal ; timestamps UTC canoniques réels ; version entier sûr >=1 ; updatedAt >= createdAt. Chemins d’erreur utilisables par formulaire (ex. data.amountCents).

Appliquer §5 de la spec. Brouillons : absence permise, champs présents validés ; les contraintes croisées pro/remboursement vs montant ne s’appliquent qu’une fois montant présent. Sous-objets présents (reimbursement/receipt) complets selon leur variante. La validation d’un trajet vérifie vehicleId UUID ; résolution de référence dans summarizeYear. Aucun statut de justificatif inventé.

Parsers : trim extérieur, chiffres ASCII non signés, séparateur virgule OU point facultatif, au moins un chiffre de chaque côté du séparateur ; euros <=2 décimales, km <=3. Pas d’exposant, regroupement de milliers ni arrondi implicite. Conversion par chiffres entiers, contrôle MAX_SAFE_INTEGER. Euros zéro accepté ; kilomètres strictement positifs. Erreur avec code='validation' si refus.

summarizeYear valide tout son input via les validateurs (y compris enregistrements hors année), rejette IDs dupliqués dans une même collection et références voitures absentes des trajets/sélections. preparation si présente doit concerner l’année demandée ; sélections par voiture uniques, manual exige distance entière >=0. Erreur avec code='validation' et issues ; débordement d’une somme : code='overflow'.

Totaux : uniquement recorded dans l’année civile demandée. Toutes catégories présentes dans expensesByCategory, zéro si vide. pro absent augmente unknown ; pro zéro est connu. Remboursement none est connu zéro ; unknown augmente compteur ; received additionné séparément, jamais soustrait du pro. Brouillons toujours exclus des sommes ; sans date retournés via listes IDs triées croissantes, quelle que soit l’année consultée.

Une ligne tripsByVehicle pour chaque voiture (tri vehicleId croissant). Journal = total des trajets recorded de cette voiture dans l’année ; manual = valeur manuelle seule ; unselected = selectedDistanceMeters omis. Absence de sélection équivaut à unselected. Conserver distanceMeters documentaire même quand manual est choisi, sans l’additionner au manuel. Une voiture sans trajet a distanceMeters=0. Les sommes restent entiers sûrs ; aucune conversion fiscale.

## Tests exigés
0/absent ; virgule/point/arrondis refusés ; limites entiers ; dates bissextiles/30 février ; champs et variantes invalides ; brouillons partiels ; normalisation sans mutation ; 0,33+0,33+0,33 ; années séparées ; remboursements séparés ; pro inconnu ; deux voitures ; références absentes ; doublons ; manual/journal/unselected sans cumul ; drafts sans date ; somme overflow ; ordre stable. Tests réels sur exports, pas de copie des fonctions.

## Livraison et limites
Mission préparée pour votre conversation, pas lancée automatiquement. Lire les consignes incluses dans le dossier autonome : elles remplacent la navigation GitHub si inaccessible. Ne pas redemander TASKS.md : son instantané est inclus. Déclarer lecture/shell/Node/écriture disponibles. Sans Node, livrer le code et ses tests, marqués non exécutés ; l’intégrateur les exécutera. Sans écriture GitHub, joindre les fichiers ou fournir chaque fichier intégral entre triples backticks avec son chemin. Aucun extrait, pseudo-code, fonction à compléter ou test annoncé mais absent.
Imports relatifs, aucune dépendance nouvelle. Aucun changement aux contrats partagés, shell, autres modules, package.json, lockfile, workflows. Aucun déploiement, merge, compte ni communication externe. Tests node:test sur vrais imports TypeScript, selon le mécanisme inclus dans le pack. Fixtures inventées uniquement. Note de livraison : base, fichiers, exports, cas couverts, commandes réellement exécutées et limites. Si accès complet : npm ci puis lint, typecheck, build et test ; ne jamais annoncer des résultats supposés.
