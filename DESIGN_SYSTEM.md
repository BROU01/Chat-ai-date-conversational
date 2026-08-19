# Direction UI/UX — VIRELIA Space

## Intention

VIRELIA adopte une direction **spatiale éditoriale** construite autour du visuel fourni du Surfer d’argent : noir stellaire, bleu nuit, chrome froid, blanc lunaire et une pointe de cyan orbital. L’image porte l’émotion ; l’interface reste précise, silencieuse et lisible.

La landing n’est plus une page marketing à deux colonnes. Elle commence par un **hero full-screen** où la photographie occupe toute la fenêtre. Le texte s’installe dans la zone sombre de gauche, protégée par un vignettage contrôlé, tandis que le personnage reste le point de tension visuel. La barre de navigation devient un objet glass translucide flottant au-dessus de la scène, avec un flou modéré et une bordure fine.

## Palette

| Token | Valeur | Usage |
|---|---:|---|
| `--space-black` | `#05080c` | Fond profond, footer, zones de transition. |
| `--space-night` | `#09131c` | Canvas landing et admin. |
| `--space-deep` | `#0d2434` | Profondeur bleue et états actifs. |
| `--space-silver` | `#d9e4ea` | Titres secondaires et contenu premium. |
| `--space-silver-bright` | `#ffffff` | Texte principal sur l’image et actions critiques. |
| `--space-cyan` | `#91d7e6` | Eyebrows, indicateurs actifs, focus et détails orbitaux. |
| `--space-gold` | `#d99b52` | Alertes opérationnelles et facturation, jamais comme décoration. |

La section claire conserve un fond minéral bleu-gris pour créer une respiration après le hero. Les titres utilisent un bleu ardoise et non le blanc argent afin de préserver le contraste.

## Logo et iconographie

Le monogramme VIRELIA est un **V** éditorial contenu dans un cercle chrome, traversé par un anneau orbital elliptique. Il reste lisible à 30 px et ne dépend pas d’un logo généré par image. Les icônes du CMS sont des glyphes courts placés dans des boîtes de 20 px, avec une bordure chrome et un accent cyan lorsque la section est active. Elles servent à repérer rapidement les domaines du CMS, pas à décorer la navigation.

## Motion

Le système motion est volontairement limité à deux comportements. Les éléments `data-reveal` apparaissent une seule fois lorsqu’ils entrent dans le viewport via `IntersectionObserver`, avec un déplacement vertical court et un délai en cascade pour les cartes. L’image hero reçoit une parallaxe légère via `requestAnimationFrame`, limitée à un facteur faible afin de préserver la netteté et les performances.

`prefers-reduced-motion: reduce` désactive la parallaxe, supprime les transitions et rend les éléments immédiatement visibles. Aucun mouvement n’est indispensable à la compréhension ou à l’action.

## CMS

Le CMS reprend la même palette mais dans une forme utilitaire : sidebar presque noire, surfaces glass bleu graphite, séparateurs fins, actions blanches, statuts cyan et alertes dorées. Le glass est ici une **profondeur fonctionnelle**, pas une esthétique dominante. Les tableaux, formulaires et états vides restent plus importants que les effets d’atmosphère.

## Contraintes maintenues

Le chat reste texte uniquement. Aucun audio, vidéo, upload ou drag-and-drop n’est introduit. Les données admin absentes sont affichées comme non disponibles ou non configurées ; aucune métrique fictive n’est ajoutée pour rendre l’écran plus spectaculaire.
