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
