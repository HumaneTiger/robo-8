import Config from "./config.js";

const config = {

  header: {
    name: "2D Game Jammers",
    world: { x: 48, y: 23 },
    autoscroll: false,
    ground: {
      destructable: true
    },
    conditions: {
      win: "zero-enemies"
    }
  },

  decoLayer: [
    "          ∙                                     ",
    "     ∙        .            ∙       ᐧ     ᐧ     ⋆ ",
    "                                                ",
    "         ⋆           ∙          ⋆               ",
    "   ∙           .            .             ∙     ",
    "           ⋆                    ⋆               ",
    "         ∙           ⋆                 ∙        ",
    "    ᐧ                       ∙                   ",
    "        ⋆     ∙      ᐧ                     ∙    ",
    "   ⋆                   .            ⋆           ",
    "          ∙     ᐧ                          ᐧ      ",
    "                   ⋆          ⋆                 ",
    "     ⋆           .                      ∙       ",
    "             ⋆          ∙                       ",
    "     ᐧ                                 ⋆         ",
    "          ∙                      ∙         ᐧ     ",
    "     ⋆        .        ⋆               .        ",
    "                    ∙                           ",
    "      ⋆      ᐧ              ⋆               ⋆    ",
    "    ∙                ∙                ∙         ",
    "         ᐧ       .   ∙            ⋆              ",
    "                                                ",
    "                                                "
  ],

  groundLayer: [
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "   ▀█ █▀▄   █▀▀ ▄▀█ █▀▄▀█ █▀▀     █ ▄▀█ █▀▄▀█   ",
    "   █▄ █▄▀   █▄█ █▀█ █ ▀ █ ██▄   █▄█ █▀█ █ ▀ █   ",
    "                                                ",
    "                                                ",
    "                                                ",
    "                                                ",
    "▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣"
  ],

  player:  {
    x: 20,
    y: 19,
    moveHorizontal: 1,
    moveVertical: 0,
    minX: 2,
    maxX: 46,
    velocity: 2,
    letter: '🛦',
    health: 3
  },

  enemyObjects: createEnemyObjects(),

  additionalStyles: [
    { letter: '⋆', effect: 'twinkle' },
    { letter: '∙', effect: 'twinkle' },
    { letter: 'ᐧ', effect: 'twinkle' },
    { letter: '.', effect: 'twinkle' },
    { letter: '🛦', style: 'transform: translateX(-4px) scale(1.3)' },
    { letter: '▛', style: 'transform: translateY(-3px);' },
    { letter: '▜', style: 'transform: translateY(-3px);' },
    { letter: '▃', style: 'transform: scaleY(-1) translateY(-2px);' }
  ],
  
  projectileConfig: {
    player: {
      key: ' ',
      x: 0,
      y: 0,
      velocity: 1, // max 1
      movement: 'u+',
      damage: 1,
      letter: '❘',
      limitation: 2
    },
    enemy: [{
      trigger: 'random',
      enemyLetters: '☬ↂ♅🉁',
      x: 0,
      y: 1,
      velocity: 0.75,
      movement: 'd+',
      damage: 1,
      letter: '⌇',
      limitation: 1
    }]
  }

};

function createEnemyObjects() {

  let enemyObjects = [];

  for (var i = 0; i < 12; i += 1) {
    enemyObjects.push({
      x: 7 + i * 2,
      y: 3,
      gravity: false,
      velocity: 0.1,
      acceleration: 0.0002,
      movement: 'rrrrrrrrrrdlllllllllld',
      movementCopy: '',
      movementPosition: 0,
      damage: 1,
      health: 1,
      letter: '☬'
    });
    
    enemyObjects.push({
      x: 7 + i * 2,
      y: 5,
      gravity: false,
      velocity: 0.1,
      acceleration: 0.0002,
      movement: 'rrrrrrrrrrdlllllllllld',
      movementCopy: '',
      movementPosition: 0,
      damage: 1,
      health: 1,
      letter: 'ↂ'
    });

    enemyObjects.push({
      x: 7 + i * 2,
      y: 7,
      gravity: false,
      velocity: 0.1,
      acceleration: 0.0002,
      movement: 'rrrrrrrrrrdlllllllllld',
      movementCopy: '',
      movementPosition: 0,
      damage: 1,
      health: 1,
      letter: '♅'
    });
    
    enemyObjects.push({
      x: 7 + i * 2,
      y: 9,
      gravity: false,
      velocity: 0.1,
      acceleration: 0.0002,
      movement: 'rrrrrrrrrrdlllllllllld',
      movementCopy: '',
      movementPosition: 0,
      damage: 1,
      health: 1,
      letter: '🉁'
    });
  }

  return enemyObjects;

}

export default {
  register() {
    Config.register(config);
  }
}

