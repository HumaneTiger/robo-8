import configSpaceInvaders from './config-space-invaders.js'
import configStriker from './config-striker.js'

let highscore = 0;

let projectileObjects = {
  player: new Array(),
  enemy: new Array()
};

let registeredGameConfigs = [];
let loadedConfigName;

export default {

  register(gameConfig) {
    registeredGameConfigs[gameConfig.header.name] = JSON.parse(JSON.stringify(gameConfig));
  },

  load(gameConfigName) {
    loadedConfigName = gameConfigName;
    if (gameConfigName === 'Space Invaders') {
      configSpaceInvaders.register();
    } else if (gameConfigName === 'Striker') {
      configStriker.register();
    }
  },

  getDimensions() {
    return {
      x: registeredGameConfigs[loadedConfigName].header.world.x,
      y: registeredGameConfigs[loadedConfigName].header.world.y
    };    
  },

  getHeader() {
    return registeredGameConfigs[loadedConfigName].header;
  },

  getDecoLayer() {
    return registeredGameConfigs[loadedConfigName].decoLayer;
  },

  getGroundLayer() {
    return registeredGameConfigs[loadedConfigName].groundLayer;
  },

  getEnemies() {
    return registeredGameConfigs[loadedConfigName].enemyObjects;
  },

  getProjectiles() {
    return projectileObjects;
  },

  addPlayerProjectile(projectile) {
    projectileObjects.player.push(projectile);
  },

  removePlayerProjectiles() {
    projectileObjects.player = [];
  },

  addEnemyProjectile(projectile) {
    projectileObjects.enemy.push(projectile);
  },

  removeEnemyProjectiles() {
    projectileObjects.enemy = [];
  },

  getAdditionalStyles() {
    return registeredGameConfigs[loadedConfigName].additionalStyles;
  },

  getPlayer() {
    return registeredGameConfigs[loadedConfigName].player;
  },

  getHighscore() {
    return highscore;
  },

  resetMetrics() {
    highscore = 0;
    window.currentMilliSec = 0;
  },

  getProjectileConfig() {
    return registeredGameConfigs[loadedConfigName].projectileConfig;
  },

  getTime() {
    return 0;
  },

  raiseHighscore(amount) {
    highscore += amount;
  }

}
