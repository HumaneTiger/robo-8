import Config from "./config.js";
import Logic from './logic.js'
import Ui from './ui.js'
import { viewportScrollCounter } from './ui.js';

let command = {
  right: false,
  left: false,
  top: false,
  bottom: false,
  shoot: false
};

let player;
let enemies;
let projectileConfig;

let shootInterval;
let watchKeysInterval;

export default {
  
  init() {

    document.body.addEventListener('keydown', this.keyDown.bind(this));
    document.body.addEventListener('keyup', this.keyUp.bind(this));

    window.setInterval(() => {
      if (!Ui.isPaused()) {
        for (var i = 0; i < enemies.length; i += 1) {
          enemies[i].movementPosition += enemies[i].velocity;
          enemies[i].velocity += enemies[i].acceleration;
          if (enemies[i].movementPosition >= 1) {
            if (enemies[i].movementCopy === '') enemies[i].movementCopy = enemies[i].movement;
            let move = enemies[i].movementCopy.charAt(0);
            enemies[i].movementCopy = enemies[i].movementCopy.substring(1);
            if (move === 'r') {
              enemies[i].x += Math.round(enemies[i].movementPosition);
            } else if (move === 'l') {
              enemies[i].x -= Math.round(enemies[i].movementPosition);
            } else if (move === 'd') {
              enemies[i].y += Math.round(enemies[i].movementPosition);
            } else if (move === 'u') {
              enemies[i].y -= Math.round(enemies[i].movementPosition);
            }
            enemies[i].movementPosition = 0;
          }
        }
      }
    }, 100);
  },

  reloadConfig() {
    player = Config.getPlayer();
    enemies = Config.getEnemies();
    projectileConfig = Config.getProjectileConfig();

    clearInterval(watchKeysInterval);
    watchKeysInterval = window.setInterval(() => {
      this.watchKeys();
    }, 100 / (player.velocity));
  },

  watchKeys() {

    let moveHorizontal = 0, moveVertical = 0;

    if (command.right && player.x < player.maxX + viewportScrollCounter.x) moveHorizontal = player.moveHorizontal;
    if (command.left && player.x > player.minX + viewportScrollCounter.x) moveHorizontal = -1 * player.moveHorizontal;
    if (command.down && player.y < player.maxY + viewportScrollCounter.y) moveVertical = player.moveVertical;
    if (command.up && player.y > player.minY + viewportScrollCounter.y) moveVertical = -1 * player.moveVertical;

    if (moveHorizontal !== 0 || moveVertical !== 0) {

      player.x = player.x + moveHorizontal;
      player.y = player.y + moveVertical;

    }

  },

  watchShoot() {

    if (command.shoot) {
      Logic.triggerPlayerProjectile();
    }
    
  },

  keyDown(e) {

    let move;

    if (!Ui.isPaused()) {
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        move = "up";
      } else if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {
        move = "down";
      } else if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        move = "left";
      } else if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
        move = "right";
      }

      if (e.key === projectileConfig.player.key && !command.shoot) {

        command.shoot = true;
        Logic.triggerPlayerProjectile();

        clearInterval(shootInterval);
        shootInterval = window.setInterval(() => {
          this.watchShoot();
        }, 200);  
      }

      if (move === 'up' && !command.up) {
        command.up = true;
      } else if (move === 'down' && !command.down) {
        command.down = true;
      }

      if (move === 'right' && !command.right) {
        command.right = true;
      } else if (move === 'left' && !command.left) {
        command.left = true;
      }
    }

  },

  keyUp(e) {

    let stop;
    
    if (!Ui.isPaused()) {
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        stop = "up";
      } else if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {
        stop = "down";
      } else if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        stop = "left";
      } else if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
        stop = "right";
      }
      
      if (e.key === projectileConfig.player.key) {
        command.shoot = false;
      }

      if (stop === 'up' && command.up) {
        command.up = false;
        this.watchKeys();
      } else if (stop === 'down' && command.down) {
        command.down = false;
        this.watchKeys();
      }

      if (stop === 'right' && command.right) {
        command.right = false;
        this.watchKeys();
      } else if (stop === 'left' && command.left) {
        command.left = false;
        this.watchKeys();
      }
    }
  }
}