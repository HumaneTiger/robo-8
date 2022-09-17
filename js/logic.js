import Audio from './audio.js'
import Config from "./config.js";
import Ui from "./ui.js";
import { viewportScrollCounter, newViewport, viewportDimensions } from './ui.js';

let groundLayer;
let header;
let player;
let enemies;
let projectiles;
let projectileConfig;

export default {
  
  init() {
  },

  reloadConfig() {
    groundLayer = Config.getGroundLayer();
    header = Config.getHeader();
    player = Config.getPlayer();
    enemies = Config.getEnemies();
    projectiles = Config.getProjectiles();
    projectileConfig = Config.getProjectileConfig();
  },

  checkForCollision() {
    for (let y = viewportScrollCounter.y; y < viewportScrollCounter.y + viewportDimensions.y; y += 1) {
      for (var x = viewportScrollCounter.x; x < viewportScrollCounter.x + viewportDimensions.x; x += 1) {

        // enemies -- player -- player projectile
        for (var i = 0; i < enemies.length; i += 1) {
            if (enemies[i].x === x && enemies[i].y === y) {
                if (enemies[i].x === player.x && enemies[i].y === player.y) {
                  enemies.splice(i, 1);
                  newViewport[y][x] = 'COLL';
                  Audio.sfx('explosion');
                  player.health = 0;
                }
                for (var j = 0; j < projectiles.player.length; j += 1) {
                    if (projectiles.player[j].x === x && projectiles.player[j].y === y) {
                        newViewport[y][x] = 'COLL';
                        enemies[i].health -= projectiles.player[j].damage;
                        if (enemies[i].health <= 0) {
                            // remove destroyed objects
                            enemies.splice(i, 1);
                            projectiles.player.splice(j, 1);
                            Config.raiseHighscore(100);
                            Audio.sfx('explosion');
                        }
                    }
                }
            }
        }

        // ground -- player 
        if (groundLayer[player.y][player.x] !== " ") {
          newViewport[player.y][player.x] = 'COLL';
          Audio.sfx('explosion');
          player.health = 0;
        }
        
        // ground -- player projectiles
        for (var i = 0; i < projectiles.player.length; i += 1) {
            if (projectiles.player[i].x === x && projectiles.player[i].y === y) {
                if (groundLayer[projectiles.player[i].y][projectiles.player[i].x] !== " ") {
                    newViewport[y][x] = 'COLL';
                    let index = projectiles.player[i].x;
                    if (header.ground.destructable) {
                      groundLayer[projectiles.player[i].y] = groundLayer[projectiles.player[i].y].substring(0, index) + ' ' + groundLayer[projectiles.player[i].y].substring(index + 1);
                    }
                    projectiles.player.splice(i, 1);
                }
            }
        }

        // ground -- enemy projectiles
        for (var i = 0; i < projectiles.enemy.length; i += 1) {
            if (projectiles.enemy[i].x === x && projectiles.enemy[i].y === y) {
                if (groundLayer[projectiles.enemy[i].y][projectiles.enemy[i].x] !== " ") {
                    newViewport[y][x] = 'COLL';
                    let index = projectiles.enemy[i].x;
                    groundLayer[projectiles.enemy[i].y] = groundLayer[projectiles.enemy[i].y].substring(0, index) + ' ' + groundLayer[projectiles.enemy[i].y].substring(index + 1);
                    projectiles.enemy.splice(i, 1);
                }
            }
        }

        // player -- enemy projectiles
        for (var i = 0; i < projectiles.enemy.length; i += 1) {
            if (projectiles.enemy[i].x === x && projectiles.enemy[i].y === y) {
                if (player.x === x && player.y === y) {
                    newViewport[y][x] = 'COLL';
                    player.health -= projectiles.enemy[i].damage;
                    projectiles.enemy.splice(i, 1);
                    Audio.sfx('player-damage-2');
                }
            }
        }
      }
    }
  },

  triggerPlayerProjectile() {
    if (projectiles.player.length < projectileConfig.player.limitation) {
      Config.addPlayerProjectile({
        x: player.x + projectileConfig.player.x,
        y: player.y + projectileConfig.player.y,
        velocity: projectileConfig.player.velocity,
        movement: projectileConfig.player.movement,
        damage: projectileConfig.player.damage,
        letter: projectileConfig.player.letter
      });      
      Audio.sfx('laser-shoot');
    }
  },

  triggerEnemyProjectile(index) {
    if (projectileConfig.enemy[index]) {
      let count = 0;
      for (var i = 0; i < projectiles.enemy.length; i += 1) {
        if (projectiles.enemy[i].letter === projectileConfig.enemy[index].letter) {
          count++;
        }
      }
      if (enemies.length && projectileConfig.enemy[index].trigger === 'random') {
        if (count < projectileConfig.enemy[index].limitation) {
          let randomEnemy =  Math.floor(Math.random() * enemies.length);
          if (projectileConfig.enemy[index].enemyLetters.includes(enemies[randomEnemy].letter)) {
            if (enemies[randomEnemy].x > viewportScrollCounter.x &&
                enemies[randomEnemy].x < viewportScrollCounter.x + viewportDimensions.x &&
              !this.bulletNearby(enemies[randomEnemy].x, enemies[randomEnemy].y, projectileConfig.enemy[index].letter)) {
              Config.addEnemyProjectile({
                x: enemies[randomEnemy].x + projectileConfig.enemy[index].x,
                y: enemies[randomEnemy].y + projectileConfig.enemy[index].y,
                velocity: projectileConfig.enemy[index].velocity,
                movement: projectileConfig.enemy[index].movement,
                movementPosition: 0,
                damage: projectileConfig.enemy[index].damage,
                letter: projectileConfig.enemy[index].letter
              });
            }
          }
        }        
      } else if (enemies.length && projectileConfig.enemy[index].trigger === 'near-x') {
        for (var i = 0; i < enemies.length; i += 1) {
          if (enemies[i].x <= player.x + 4 && enemies[i].x >= player.x - 4) {
            if (count < projectileConfig.enemy[index].limitation) {
              if (projectileConfig.enemy[index].enemyLetters.includes(enemies[i].letter)) {
                if (!this.bulletNearby(enemies[i].x, enemies[i].y, projectileConfig.enemy[index].letter)) {
                  Config.addEnemyProjectile({
                    x: enemies[i].x + projectileConfig.enemy[index].x,
                    y: enemies[i].y + projectileConfig.enemy[index].y,
                    velocity: projectileConfig.enemy[index].velocity,
                    movement: projectileConfig.enemy[index].movement,
                    movementPosition: 0,
                    damage: projectileConfig.enemy[index].damage,
                    letter: projectileConfig.enemy[index].letter
                  });
                }
              }
            }
          }        
        }
      } else if (enemies.length && projectileConfig.enemy[index].trigger === 'near-y') {
        for (var i = 0; i < enemies.length; i += 1) {
          if (enemies[i].y <= player.y + 2 && enemies[i].y >= player.y - 2) {
            if (count < projectileConfig.enemy[index].limitation) {
              if (projectileConfig.enemy[index].enemyLetters.includes(enemies[i].letter)) {
                if (enemies[i].x > viewportScrollCounter.x &&
                  enemies[i].x < viewportScrollCounter.x + viewportDimensions.x &&
                  !this.bulletNearby(enemies[i].x, enemies[i].y, projectileConfig.enemy[index].letter)) {
                  Config.addEnemyProjectile({
                    x: enemies[i].x + projectileConfig.enemy[index].x,
                    y: enemies[i].y + projectileConfig.enemy[index].y,
                    velocity: projectileConfig.enemy[index].velocity,
                    movement: projectileConfig.enemy[index].movement,
                    movementPosition: 0,
                    damage: projectileConfig.enemy[index].damage,
                    letter: projectileConfig.enemy[index].letter
                  });
                }
              }
            }
          }        
        }
      }
    }
  },

  bulletNearby(x, y, letter) {
    if (newViewport[y-1][x] !== letter &&
        newViewport[y+1][x] !== letter &&
        newViewport[y][x-1] !== letter &&
        newViewport[y][x+1] !== letter) {
          return false;
        }
    return true;
  },

  calculateProjectilePositions() {
    /* PLAYER */
    for (var i = 0; i < projectiles.player.length; i += 1) {
      if (projectiles.player[i].movement === 'u+') { 
        if (projectiles.player[i].y >= 0) {
          projectiles.player[i].y -= projectileConfig.player.velocity;
        } else {
          projectiles.player.splice(i, 1);
        }
      } else {
        if (projectiles.player[i].movement === 'r+') { 
          if (projectiles.player[i].x <= viewportDimensions.x + viewportScrollCounter.x) {
            projectiles.player[i].x += projectileConfig.player.velocity;
          } else {
            projectiles.player.splice(i, 1);
          }  
        }
      }
    }
    /* ENEMY */
    for (var i = 0; i < projectiles.enemy.length; i += 1) {
      if (projectiles.enemy[i].movement === 'd+') { 
        if (projectiles.enemy[i].y <= viewportDimensions.y) {
          projectiles.enemy[i].movementPosition += projectiles.enemy[i].velocity;
          if (projectiles.enemy[i].movementPosition >= 1) {
              projectiles.enemy[i].y += 1;
              projectiles.enemy[i].movementPosition = 0;
          }
        } else {
          projectiles.enemy.splice(i, 1);
        }
      } else if (projectiles.enemy[i].movement === 'u+') { 
        if (projectiles.enemy[i].y >= 0) {
          projectiles.enemy[i].movementPosition += projectiles.enemy[i].velocity;
          if (projectiles.enemy[i].movementPosition >= 1) {
              projectiles.enemy[i].y -= 1;
              projectiles.enemy[i].movementPosition = 0;
          }
        } else {
          projectiles.enemy.splice(i, 1);
        }
      } else if (projectiles.enemy[i].movement === 'l+') { 
        if (projectiles.enemy[i].x >= viewportScrollCounter.x) {
          projectiles.enemy[i].movementPosition += projectiles.enemy[i].velocity;
          if (projectiles.enemy[i].movementPosition >= 1) {
              projectiles.enemy[i].x -= 1;
              projectiles.enemy[i].movementPosition = 0;
          }
        } else {
          projectiles.enemy.splice(i, 1);
        }
      }
    }
  },

  checkForWinLoseCondition() {
    let win = false,
        lose = false;

    if (player.health <= 0) {
      lose = true;
    }

    for (var i = 0; i < enemies.length; i += 1) {
      if (enemies[i].y > 19) {
        lose = true;
      }
    }

    if (header.conditions.win === "zero-enemies" && enemies.length === 0) {
      win = true;
    }

    if (header.conditions.win === "end" && viewportDimensions.x + viewportScrollCounter.x >= header.world.x - 1) {
      win = true;
    }

    if (win) {
      Audio.sfx('win', 500);
      Ui.pause(true);
    } else if (lose) {
      Audio.sfx('lose', 500);
      Ui.pause(true);
    }
  }

}

