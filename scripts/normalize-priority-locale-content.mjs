import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = '/Users/theg/crochet';

const priorityLocales = ['de', 'fr', 'es', 'nl', 'pt-BR'];
const lessonSlugs = [
  'treble-crochet',
  'front-post-and-back-post',
  'shell-stitch',
  'reading-pattern-abbreviations',
  'gauge-basics',
  'blocking-basics',
];
const patternSlugs = [
  'bucket-hat',
  'crochet-bunny',
  'shell-stitch-scarf',
  'simple-market-bag',
  'tunisian-potholder',
  'crochet-mouse',
  'flower-granny-square',
  'simple-beanie',
  'wave-stitch-blanket',
  'mesh-beach-bag',
];

const replacements = {
  de: [
    ['5 mm Haken', 'Häkelnadel 5 mm'],
    ['3,5 bis 4 mm Haken', 'Häkelnadel 3,5 bis 4 mm'],
    ['6 mm tunesischer Haken', 'Tunesische Häkelnadel 6 mm'],
    ['4,5-mm-Haken', 'Häkelnadel 4,5 mm'],
    ['Kammgarngarn', 'Kammgarn'],
    ['Zauberring', 'Magischer Ring'],
    ['nur Rippen an der hinteren Schlaufe', 'Rippen in das hintere Maschenglied'],
    ['Die Seiten stricken', 'Die Seiten arbeiten'],
    ['Verketten Sie die Basis', 'Die Grundkette anschlagen'],
    ['Verketten Sie die Höhe.', 'Luftmaschenkette für die Höhe'],
    ['Doppelhäkelstichen', 'Dreifachstäbchen'],
    ['großen Stich', 'hohen Stich'],
    ['Musterlehre', 'Maschenprobe'],
    ['Farbfelds', 'Probeläppchens'],
    ['Schalenabstände', 'Abstände der Muscheln'],
  ],
  fr: [
    ['crochet 5 mm', 'crochet de 5 mm'],
    ['boucle arrière uniquement côtes', 'côtes en brin arrière'],
    ['fil peigné', 'fil worsted'],
  ],
  es: [
    ['gancho de 5 mm', 'ganchillo de 5 mm'],
    ['Gancho de 3,5 a 4 mm', 'ganchillo de 3,5 a 4 mm'],
    ['Gancho de 3,5 mm', 'ganchillo de 3,5 mm'],
    ['Gancho tunecino de 6 mm', 'ganchillo tunecino de 6 mm'],
    ['Gancho de 5,5 mm', 'ganchillo de 5,5 mm'],
    ['hilo aguja', 'aguja lanera'],
    ['trabajando en rondas', 'trabajo en redondo'],
    ['correas', 'asas'],
    ['bucle posterior solo nervaduras', 'canalé en hebra trasera'],
    ['puntada de concha', 'punto concha'],
    ['hilo peinado', 'hilo worsted'],
  ],
  nl: [
    ['veters', 'kantwerk'],
    ['hartkleur van de bloem', 'kleur van het bloemhart'],
    ['kettingsteken', 'lossen'],
    ['in rondes werken', 'in toeren werken'],
  ],
  'pt-BR': [
    ['agulha de 5 mm', 'agulha de crochê de 5 mm'],
    ['Medidor é', 'A amostra de tensão é'],
    ['medidor de linha', 'amostra de carreiras'],
    ['ponto alto duplo', 'ponto alto'],
    ['aumentando', 'aumentos'],
    ['diminuindo', 'diminuições'],
  ],
};

const titleOverrides = {
  de: {
    lessons: {
      'treble-crochet': 'Dreifaches Stäbchen',
      'front-post-and-back-post': 'Vorderes und hinteres Reliefstäbchen',
      'shell-stitch': 'Muschelmuster',
      'gauge-basics': 'Grundlagen der Maschenprobe',
      'blocking-basics': 'Grundlagen des Blockens',
    },
    patterns: {
      'bucket-hat': 'Fischerhut',
      'simple-market-bag': 'Einfache Markttasche',
      'flower-granny-square': 'Blumen-Granny-Square',
      'wave-stitch-blanket': 'Decke im Wellenmuster',
      'mesh-beach-bag': 'Netz-Strandtasche',
    },
  },
  fr: {
    lessons: {
      'treble-crochet': 'Bride triple',
      'front-post-and-back-post': 'Bride relief avant et arrière',
      'shell-stitch': 'Point coquille',
      'reading-pattern-abbreviations': 'Lire les abréviations de patron',
      'gauge-basics': 'Notions d’échantillon',
      'blocking-basics': 'Bases du blocage',
    },
    patterns: {
      'bucket-hat': 'Chapeau bob',
      'crochet-bunny': 'Lapin au crochet',
      'shell-stitch-scarf': 'Écharpe au point coquille',
      'simple-market-bag': 'Sac de marché simple',
      'tunisian-potholder': 'Manique tunisienne',
      'crochet-mouse': 'Souris au crochet',
      'flower-granny-square': 'Granny square fleur',
      'simple-beanie': 'Bonnet simple',
      'wave-stitch-blanket': 'Couverture au point vague',
      'mesh-beach-bag': 'Sac de plage en résille',
    },
  },
  es: {
    lessons: {
      'treble-crochet': 'Punto alto triple',
      'front-post-and-back-post': 'Puntos en relieve por delante y por detrás',
      'shell-stitch': 'Punto concha',
      'reading-pattern-abbreviations': 'Leer abreviaturas de patrones',
      'gauge-basics': 'Conceptos básicos de la muestra',
      'blocking-basics': 'Conceptos básicos del bloqueo',
    },
    patterns: {
      'bucket-hat': 'Sombrero bucket',
      'crochet-bunny': 'Conejo de crochet',
      'shell-stitch-scarf': 'Bufanda en punto concha',
      'simple-market-bag': 'Bolsa de mercado sencilla',
      'tunisian-potholder': 'Agarradera tunecina',
      'crochet-mouse': 'Ratón de crochet',
      'flower-granny-square': 'Granny square floral',
      'simple-beanie': 'Gorro sencillo',
      'wave-stitch-blanket': 'Manta en punto onda',
      'mesh-beach-bag': 'Bolsa de playa de malla',
    },
  },
  nl: {
    lessons: {
      'treble-crochet': 'Dubbel stokje',
      'front-post-and-back-post': 'Voor- en achterreliëfstokjes',
      'shell-stitch': 'Schelpensteek',
      'reading-pattern-abbreviations': 'Patroonafkortingen lezen',
      'gauge-basics': 'Basis van proeflap en stekenverhouding',
      'blocking-basics': 'Basis van blocken',
    },
    patterns: {
      'crochet-bunny': 'Gehaakt konijn',
      'shell-stitch-scarf': 'Sjaal in schelpensteek',
      'simple-market-bag': 'Eenvoudige markttas',
      'tunisian-potholder': 'Tunische pannenlap',
      'crochet-mouse': 'Gehaakte muis',
      'simple-beanie': 'Eenvoudige muts',
      'wave-stitch-blanket': 'Deken in golfsteek',
    },
  },
  'pt-BR': {
    lessons: {
      'treble-crochet': 'Ponto alto triplo',
      'front-post-and-back-post': 'Ponto relevo pela frente e por trás',
      'shell-stitch': 'Ponto concha',
      'reading-pattern-abbreviations': 'Lendo abreviações de receitas',
      'gauge-basics': 'Noções básicas de amostra de tensão',
      'blocking-basics': 'Noções básicas de bloqueio',
    },
    patterns: {
      'bucket-hat': 'Chapéu bucket',
      'crochet-bunny': 'Coelho de crochê',
      'shell-stitch-scarf': 'Cachecol em ponto concha',
      'simple-market-bag': 'Bolsa de feira simples',
      'tunisian-potholder': 'Descanso de panela tunisiano',
      'crochet-mouse': 'Ratinho de crochê',
      'simple-beanie': 'Gorro simples',
      'wave-stitch-blanket': 'Manta em ponto ondulado',
      'mesh-beach-bag': 'Bolsa de praia em tela',
    },
  },
};

const deepOverrides = {
  de: {
    lessons: {
      'front-post-and-back-post': {
        description:
          'Nutze Reliefstäbchen, um Rippen, Struktur und erhabene Säulen in dein Häkelstück zu bringen.',
        content: {
          summary:
            'Statt in die oberen Maschenglieder zu arbeiten, führst du die Masche von vorn oder hinten um den Stäbchenpfosten herum.',
          steps: [
            'Mache einen Umschlag wie für ein Stäbchen.',
            'Für ein vorderes Reliefstäbchen führst du die Nadel von vorn nach hinten und wieder nach vorn um den Pfosten.',
            'Für ein hinteres Reliefstäbchen führst du die Nadel von hinten nach vorn und wieder nach hinten um den Pfosten.',
            'Hol den Faden durch und beende die Masche wie ein normales Stäbchen.',
            'Wechsle vordere und hintere Reliefstäbchen ab, um Rippen zu erzeugen.',
          ],
          practice:
            'Häkle eine Reihe vordere Reliefstäbchen und danach eine Reihe im Wechsel aus vorderen und hinteren Reliefstäbchen.',
        },
      },
      'reading-pattern-abbreviations': {
        content: {
          steps: [
            'Lerne zuerst die wichtigsten Abkürzungen: Lm, fM, hStb, Stb, dStb, Kettm.',
            'Achte auf Aktionswörter wie zun, abn, wdh und überspr.',
            'Prüfe vor dem Start, ob die Anleitung US- oder UK-Begriffe verwendet.',
            'Lies eine ganze Zeile langsam und formuliere jede Abkürzung in Klartext aus.',
            'Markiere Wiederholungen und Maschenzahlen, bevor du die Reihe häkelst.',
          ],
        },
      },
      'treble-crochet': {
        description:
          'Lerne eine hohe Masche, mit der du offene Schals, Tücher und Spitzenmuster schnell aufbauen kannst.',
        content: {
          summary:
            'Mache zwei Umschläge, bevor du die Häkelnadel einführst, und arbeite dann immer zwei Schlaufen auf einmal ab, bis nur noch eine Schlaufe übrig ist.',
        },
      },
      'shell-stitch': {
        description:
          'Erzeuge eine weiche Fächerform, indem du mehrere Maschen in dieselbe Stelle arbeitest.',
        content: {
          whyItMatters:
            'Das Muschelmuster führt in gruppierte Maschenfolgen ein und hilft dir, wiederkehrende dekorative Formen zu lesen.',
          steps: [
            'Bestimme die Masche oder den Luftmaschenbogen, in den die Muschel gearbeitet wird.',
            'Arbeite die geforderte Anzahl hoher Maschen in genau dieselbe Stelle.',
            'Zähle die ganze Muschel vollständig, bevor du weitergehst.',
            'Überspringe oder verankere Maschen genau so, wie es die Anleitung vorgibt.',
            'Wiederhole diesen Rhythmus aus Muschel und Abstand über die ganze Reihe.',
          ],
          practice:
            'Arbeite ein kurzes Probestück mit Muschel-Wiederholungen, damit du sehen kannst, wie sich die Fächerform öffnet.',
          commonMistakes: [
            'Innerhalb der Muschel falsch zu zählen, sodass die Gruppen ungleichmäßig werden.',
            'Zwischen den Muscheln die falsche Anzahl an Maschen zu überspringen.',
          ],
        },
      },
      'gauge-basics': {
        description:
          'Verstehe, wie sich Maschen- und Reihenzahl auf Passform, Größe und das Endergebnis eines Projekts auswirken.',
        content: {
          summary:
            'Die Maschenprobe beschreibt, wie viele Maschen und Reihen du mit einem bestimmten Garn, einer bestimmten Nadelstärke und deiner üblichen Spannung auf einer gemessenen Fläche erhältst.',
          whyItMatters:
            'Eine passende Maschenprobe sorgt dafür, dass eine Mütze sitzt, ein Pullover die richtige Größe bekommt und eine Decke nah an den Maßen der Anleitung bleibt.',
          steps: [
            'Lies vor dem Start die Angaben zur Maschenprobe in der Anleitung.',
            'Häkle ein Probestück, das groß genug ist, damit du die Mitte sauber messen kannst.',
            'Zähle Maschen und Reihen über genau den Bereich, den die Anleitung vorgibt.',
            'Wenn deine Werte nicht passen, ändere zuerst die Nadelstärke und miss erneut.',
            'Prüfe die Maschenprobe nach dem Waschen oder Blocken noch einmal, wenn das Projekt größenempfindlich ist.',
          ],
          practice:
            'Häkle zwei kleine Probestücke mit unterschiedlicher Nadelstärke und vergleiche direkt, wie sich Maß und Griff verändern.',
          commonMistakes: [
            'Am Rand des Probestücks zu messen statt in der Mitte.',
            'Nur die Maschenzahl zu prüfen und die Reihenhöhe zu ignorieren.',
          ],
        },
      },
      'blocking-basics': {
        description:
          'Gib deinem Häkelstück ein sauberes Finish, indem du den Stoff formst, glättest und fixierst.',
        content: {
          summary:
            'Beim Blocken werden Feuchtigkeit und Formgebung genutzt, damit sich die Maschen entspannen, der Fall schöner wird und die Kanten sauberer liegen.',
          steps: [
            'Prüfe den Fasergehalt, damit du weißt, ob Nass-, Dampf- oder Sprühblocken geeignet ist.',
            'Befeuchte das Projekt gleichmäßig, ohne es stärker als nötig einzuweichen.',
            'Forme das Stück auf einer ebenen Fläche auf die gewünschten Maße.',
            'Stecke Kanten oder Ecken fest, wenn du klarere Linien oder Spitzen herausarbeiten willst.',
            'Lass das Projekt vollständig trocknen, bevor du die Nadeln entfernst.',
          ],
          practice:
            'Blocke ein kleines Probestück oder Granny Square, damit du den Unterschied vor und nach dem Trocknen direkt siehst.',
          commonMistakes: [
            'Den Stoff beim Feststecken zu stark zu dehnen.',
            'Das Stück zu früh zu bewegen, bevor es vollständig getrocknet ist.',
          ],
        },
      },
    },
    patterns: {
      'simple-beanie': {
        skills: ['Grundkette', 'feste Maschen', 'Rippen in das hintere Maschenglied', 'Zusammennähen'],
      },
      'simple-market-bag': {
        steps: [
          {
            type: 'instruction',
            title: 'Den Boden arbeiten',
            instruction:
              'Arbeite einen ovalen oder rechteckigen Boden mit Luftmaschen und Zunahmen aus festen Maschen an den Enden.',
          },
          {
            type: 'round',
            title: 'Runde 1',
            instruction:
              'Arbeite die erste Runde gleichmäßig um den Boden und setze am Anfang einen Maschenmarkierer.',
            counterLabel: 'round',
            targetCount: 1,
          },
          {
            type: 'round',
            title: 'Den Bodenrand verstärken',
            instruction:
              'Häkle ein bis zwei Runden feste Maschen ohne Zunahmen, damit der Boden stabiler wird.',
            counterLabel: 'round',
            targetCount: 3,
          },
          {
            type: 'round',
            title: 'Mit dem Netzmuster beginnen',
            instruction:
              'Wechsle Luftmaschenräume und Verankerungsmaschen ab, um ein offenes Netzmuster zu bilden.',
            counterLabel: 'round',
            targetCount: 8,
          },
          {
            type: 'round',
            title: 'Henkel hinzufügen',
            instruction:
              'Arbeite Luftmaschenketten für die Henkelöffnungen und verstärke sie mit einer weiteren Runde.',
            counterLabel: 'round',
            targetCount: 10,
          },
          {
            type: 'instruction',
            title: 'Fertigstellen',
            instruction:
              'Nach der Henkelrunde abketten und die Fäden sicher vernähen.',
          },
        ],
      },
    },
  },
  fr: {
    lessons: {
      'front-post-and-back-post': {
        description:
          'Utilisez les brides relief pour créer des côtes, de la texture et des colonnes en relief dans votre ouvrage.',
        content: {
          summary:
            'Au lieu de piquer dans les brins du haut, on travaille la maille autour du corps de la bride, par l’avant ou par l’arrière.',
          steps: [
            'Faites un jeté comme pour une bride.',
            'Pour une bride relief avant, passez le crochet de l’avant vers l’arrière puis revenez vers l’avant autour de la bride.',
            'Pour une bride relief arrière, passez le crochet de l’arrière vers l’avant puis revenez vers l’arrière autour de la bride.',
            'Ramenez une boucle et terminez la maille comme une bride classique.',
            'Alternez brides relief avant et arrière pour former des côtes.',
          ],
          practice:
            'Crochetez un rang de brides relief avant puis un rang en alternant brides relief avant et arrière.',
        },
      },
    },
    patterns: {
      'simple-beanie': {
        skills: ['chaînette de base', 'maille serrée', 'côtes en brin arrière', 'couture'],
        description:
          'Un modèle de bonnet simple qui met l’accent sur l’ajustement, les côtes et une finition nette.',
        expectationText:
          'Un premier bonnet fiable pour apprendre à ajuster la taille, garder des rangs réguliers et assembler proprement un accessoire portable.',
        steps: [
          {
            type: 'instruction',
            title: 'Monter la hauteur',
            instruction:
              'Faites une chaînette correspondant à la hauteur du bonnet, et non au tour de tête.',
          },
          {
            type: 'row',
            title: 'Rang 1',
            instruction:
              'Travaillez dans la chaînette pour poser le premier bord du panneau en côtes.',
            counterLabel: 'row',
            targetCount: 1,
          },
          {
            type: 'row',
            title: 'Former les côtes',
            instruction:
              'Travaillez en brin arrière sur chaque rang jusqu’à ce que le panneau fasse confortablement le tour de la tête.',
            counterLabel: 'row',
            targetCount: 24,
          },
          {
            type: 'instruction',
            title: 'Assembler la couture',
            instruction:
              'Joignez les petits côtés pour transformer le panneau en tube.',
          },
          {
            type: 'instruction',
            title: 'Fermer le sommet',
            instruction:
              'Resserrez le bord du haut avec le fil, tirez fermement puis sécurisez.',
          },
          {
            type: 'instruction',
            title: 'Finitions',
            instruction:
              'Retournez le bonnet sur l’endroit puis rentrez soigneusement les fils.',
          },
        ],
      },
    },
  },
  es: {
    lessons: {
      'reading-pattern-abbreviations': {
        content: {
          steps: [
            'Aprende primero las abreviaturas básicas: cad, pb, mpa, pa, pat, pe.',
            'Fíjate en acciones como aum, dism, rep y saltar.',
            'Comprueba si la diseñadora usa términos de EE. UU. o del Reino Unido antes de empezar.',
            'Lee una línea completa despacio y desarrolla cada abreviatura en lenguaje claro.',
            'Marca las repeticiones y los conteos antes de trabajar la fila.',
          ],
        },
      },
      'gauge-basics': {
        title: 'Conceptos básicos de la muestra',
      },
    },
    patterns: {
      'simple-beanie': {
        skills: ['cadena base', 'punto bajo', 'canalé en hebra trasera', 'costura'],
        expectationText:
          'Un primer gorro fiable para practicar el ajuste a la cabeza, mantener filas parejas y montar con limpieza un proyecto pequeño y portátil.',
        steps: [
          {
            type: 'instruction',
            title: 'Haz la cadena de altura',
            instruction:
              'Haz una cadena con la altura del gorro, no con la circunferencia de la cabeza.',
          },
          {
            type: 'row',
            title: 'Fila 1',
            instruction:
              'Trabaja sobre la cadena para formar el primer borde del panel acanalado.',
            counterLabel: 'row',
            targetCount: 1,
          },
          {
            type: 'row',
            title: 'Forma el canalé',
            instruction:
              'Trabaja en hebra trasera fila tras fila hasta que el panel rodee la cabeza con comodidad.',
            counterLabel: 'row',
            targetCount: 24,
          },
          {
            type: 'instruction',
            title: 'Cierra la costura',
            instruction:
              'Une los lados cortos para convertir el panel en un tubo.',
          },
          {
            type: 'instruction',
            title: 'Cierra la corona',
            instruction:
              'Frunce el borde superior con la hebra, tira con firmeza y asegura bien.',
          },
          {
            type: 'instruction',
            title: 'Remata',
            instruction:
              'Da la vuelta al gorro al derecho y esconde las hebras finales.',
          },
        ],
      },
      'shell-stitch-scarf': {
        skills: ['cadena base', 'punto alto', 'punto concha', 'contar repeticiones'],
      },
      'wave-stitch-blanket': {
        skills: ['punto alto', 'aumentos', 'disminuciones', 'contar repeticiones'],
      },
    },
  },
  nl: {
    lessons: {
      'blocking-basics': {
        content: {
          whyItMatters:
            'Blocken helpt kantwerk open te vallen, zorgt dat granny squares beter op maat komen en laat afgewerkte stukken verzorgder ogen.',
        },
      },
    },
  },
  'pt-BR': {
    lessons: {
      'gauge-basics': {
        content: {
          summary:
            'A amostra de tensão é a quantidade de pontos e carreiras que você obtém em uma área medida com um fio, agulha e tensão específicos.',
          whyItMatters:
            'É a amostra que faz um gorro vestir bem, um suéter sair no tamanho certo e uma manta ficar próxima das medidas da receita.',
        },
      },
    },
    patterns: {
      'wave-stitch-blanket': {
        skills: ['ponto alto', 'aumentos', 'diminuições', 'contagem de repetições'],
      },
    },
  },
};

function applyReplacements(value, list) {
  if (typeof value === 'string') {
    return list.reduce((out, [from, to]) => out.split(from).join(to), value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => applyReplacements(item, list));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, applyReplacements(child, list)]),
    );
  }
  return value;
}

function mergeDeep(target, source) {
  if (Array.isArray(source)) return source;
  if (!source || typeof source !== 'object') return source;
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    out[key] =
      value && typeof value === 'object' && !Array.isArray(value)
        ? mergeDeep(target?.[key] ?? {}, value)
        : value;
  }
  return out;
}

for (const locale of priorityLocales) {
  for (const slug of lessonSlugs) {
    const path = resolve(root, 'content', 'lessons', locale, `${slug}.json`);
    let json = JSON.parse(readFileSync(path, 'utf8'));
    json = applyReplacements(json, replacements[locale] ?? []);
    if (titleOverrides[locale]?.lessons?.[slug]) json.title = titleOverrides[locale].lessons[slug];
    if (deepOverrides[locale]?.lessons?.[slug]) {
      json = mergeDeep(json, deepOverrides[locale].lessons[slug]);
    }
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
  }

  for (const slug of patternSlugs) {
    const path = resolve(root, 'content', 'patterns', locale, `${slug}.json`);
    let json = JSON.parse(readFileSync(path, 'utf8'));
    json = applyReplacements(json, replacements[locale] ?? []);
    if (titleOverrides[locale]?.patterns?.[slug]) json.title = titleOverrides[locale].patterns[slug];
    if (deepOverrides[locale]?.patterns?.[slug]) {
      json = mergeDeep(json, deepOverrides[locale].patterns[slug]);
    }
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
  }
}

console.log('normalized priority locales');
