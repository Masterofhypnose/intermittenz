# QA-DISPLAY-01 — réception et triage

28 septembre 2026. Rapport DeepSeek transmis par le fondateur ; synthèse et décisions de l’intégrateur. Revue statique uniquement, aucun rendu ou lecteur d’écran exécuté par DeepSeek.
Bases revues : Marketplace d01bfa6540b4e4aaf5c40887ffbfcea3d03246e9 (PR #2), Chat 7dfe699f2faa12a44119e5df22a900b6222a67cb (PR #3), Jobs 0ce33c87f269d2a71f860aaac3d921c49b4eef92 (PR #4).

## Décisions
| Point transmis | Vérification / suite |
|---|---|
| MKT-D1 : titres sans espaces | Absence de règle de coupure confirmée sur h1. overflow-wrap:anywhere ajouté aux titres Marketplace et Jobs. Risque CSS traité, pas de reproduction visuelle revendiquée. |
| CHT-D1 : headerInfo sans min-width | Faux : min-width:0 existe déjà dans le fichier épinglé. Gravité majeure non retenue. Protection complémentaire min-width:0 sur racine du fil et textarea, sans prétendre reproduire un débordement. |
| JOB-D2 : lien panneau avancé | aria-controls ajouté avec useId par instance ; panneau conservé caché au repli pour référence valide et absence de tabulation. Ce lien est une amélioration, pas un blocage initial. |
| JOB-D3 : erreur minimum distante | Même validation existante affichée près du champ, avec aria-invalid/aria-describedby. L’alerte catalogue reste disponible si filtres repliés. Validation conservée pendant la saisie, pas seulement onBlur. |
| MKT-D2 | Annulé par DeepSeek, aucun correctif. |
| CHT-D2 / TX-D2 : annonces lecteurs d’écran | Risques non reproduits, pas bugs démontrés. Supprimer aria-live redondant d’un log ne supprime pas son comportement implicite. Remplacer status par aria-live ne réduit pas les régions actives. Aucun changement automatique. |
| CHT-D3 : focus temporisé | Fragilité potentielle, aucune panne prouvée ; refonte différée. |
| MKT-D3 : détail des URL fautives | Amélioration facultative, différée. |
| JOB-D4 : backend non conforme | Aucun backend réel branché, fixtures validées. À traiter à la frontière du futur adaptateur, pas en inventant un état métier dans cette revue. |
| TX-D1 : espacement/focus différent | Cosmétique, pas de refonte globale. |

## Couverture restante
Rendu réel 320/390/768/1280, zoom, images cassées, widget date Safari, clavier virtuel et TalkBack/VoiceOver/NVDA non testés. Ne pas demander un focus enfermé dans les modules : ce ne sont pas des dialogues modaux.
Tests Jobs enrichis sur relation bouton/panneau, repli et erreur liée au champ ; vrais imports React/jsdom. Les modifications seront reprises à l’identique dans la preview privée et les PR sources séparées. Aucun merge automatique.
Le dossier agent-packs/QA-DISPLAY-01.md reste un instantané des commits relus, pas les futures versions corrigées.

## Livraison intégrateur
Lint/typecheck/build/test réussis : 19 tests atelier local combiné, 26 privés. PR sources : Marketplace 630ff4f6740c7ee9d44fbf953da2cc53e7706686, Chat df18be6b167d89ad8439e504da16cdf9d5d614c8, Jobs f3f592304d45bf933a030faf3de3ad03890d466f. Preview privée : 72d25469eebace5e78587126a978f4fddc430c63. Statuts distants vérifiés après publication ; aucune fusion.
