import Audio from './audio.js'
import Config from "./config.js";
import Logic from "./logic.js";
import Move from "./move.js";

let newPosX = 0, newPosY = 0, startPosX = 0, startPosY = 0, initialStyleLeft = 0, initialStyleTop = 0;
let dragMode = false;
let dragEl = null;

let viewportRaster = document.querySelector("#viewport-raster tbody");

let header;
let dimensions;
let decoLayer;
let groundLayer;
let enemies;
let projectiles;
let player;
let additionalStyles;

export let viewportScrollCounter = {
  x: 0,
  y: 0
};

export let viewportDimensions = {
  x: 48,
  y: 23
};

let viewport;
export let newViewport;

export default {
  
  init() {

    window.addEventListener('resize', this.resizeWindow);

    document.addEventListener('click', this.mouseClick.bind(this));

    document.addEventListener('mousedown', this.mouseDown.bind(this));
    document.addEventListener('mousemove', this.mouseMove.bind(this));
    document.addEventListener('mouseup', this.mouseUp.bind(this));

  },

  reloadConfig() {
    header = Config.getHeader();
    dimensions = Config.getDimensions();
    decoLayer = Config.getDecoLayer();
    groundLayer = Config.getGroundLayer();
    enemies = Config.getEnemies();
    projectiles = Config.getProjectiles();
    player = Config.getPlayer();
    additionalStyles = Config.getAdditionalStyles();
  },
  
  resizeWindow() {

    let scale = window.innerHeight / 1600;
    let translate = 50 / scale;

    document.getElementById('viewport').style.transform = 'scale(' + scale + ') translate(-' + translate + '%, -' + translate + '%)';

  },

  bootUpConsole(gameConfigName) {

    Config.load(gameConfigName);
    Logic.reloadConfig();
    Move.reloadConfig();

    this.reloadConfig();

    viewport = new Array(dimensions.y);
    newViewport = new Array(dimensions.y);
    
    for (var i = 0; i < dimensions.y; i += 1) {
      viewport[i] = new Array(dimensions.x);
      newViewport[i] = new Array(dimensions.x);
    }
    
    this.buildViewport();
    this.recalcViewport();
    this.repaintViewport();

    document.getElementById('viewport').classList.remove('off');
    document.getElementById('viewport').classList.add('boot');

    window.setTimeout(function() {
      this.finishBootUpConsole();
    }.bind(this), 600);

  },

  finishBootUpConsole() {
    window.paused = false;
    if (header.autoscroll && header.autoscroll === "scroll-x") {
      window.setInterval(() => {
        if (!this.isPaused()) {
          viewportScrollCounter.x += 1;
          player.x += 1;
          Logic.calculateProjectilePositions();
          this.recalcViewport();
          this.repaintViewport();
          viewportRaster.style.transform = "translate(" + (-1 * 30 * viewportScrollCounter.x) + "px, 0)";  
        }
      }, 300);
    } else if (header.autoscroll && header.autoscroll === "scroll-y") {
      window.setInterval(() => {
        if (!this.isPaused()) {
          viewportScrollCounter.y += 1;
          player.y += 1;
          Logic.calculateProjectilePositions();
          this.recalcViewport();
          this.repaintViewport();
          viewportRaster.style.transform = "translate(0, " + (-1 * 30 * viewportScrollCounter.x) + "px)";  
        }
      }, 300);
    }
  },

  setNewViewport(viewport) {
    newViewport = viewport;
  },

  mouseClick(e) {

    let target = e.target;

    if (target && target.closest('div.knob')) {

      let switchContainer = document.querySelector('main .switch');

      Audio.sfx('knob-click');

      if (switchContainer.classList.contains('amber')) {
        switchContainer.classList.remove('amber');
        switchContainer.classList.add('green');
        document.body.classList.remove("amber-theme");
        document.body.classList.add("green-theme");
      } else if (switchContainer.classList.contains('green')) {
        switchContainer.classList.remove('green');
        switchContainer.classList.add('white');
        document.body.classList.remove("green-theme");
        document.body.classList.add("bw-theme");
      } else if (switchContainer.classList.contains('white')) {
        switchContainer.classList.remove('white');
        switchContainer.classList.add('amber');
        document.body.classList.remove("bw-theme");
        document.body.classList.add("amber-theme");
      }

    } else if (target && target.closest('div.pause')) {

        let pauseContainer = document.querySelector('main .pause');
  
        Audio.sfx('knob-click');

        if (pauseContainer.classList.contains('inactive')) {
          pauseContainer.classList.remove('inactive');
          pauseContainer.classList.add('active');
          this.pause(true);
        } else {
          pauseContainer.classList.remove('active');
          pauseContainer.classList.add('inactive');
          this.pause(false);
        }

    }

  },

  mouseDown(e) {

    let target = e.target;

    if (target) {

      if (dragMode === false && target.closest('div.cartridge')) {
  
        dragMode = true;
  
        dragEl = target.closest('div.cartridge');
  
        dragEl.style.zIndex = 2;
        dragEl.classList.add('grabbed');
        
        startPosX = dragEl.clientX;
        startPosY = dragEl.clientY;

        initialStyleLeft = dragEl.style.left;
        initialStyleTop = dragEl.style.top;

      }
    }
  },

  mouseMove(e) {

    e.preventDefault;
    e.stopPropagation();
    
    if (dragMode) {

      let scale = window.innerHeight / 1600;

      // calculate the new position
      newPosX = (startPosX - e.clientX) / scale;
      newPosY = (startPosY - e.clientY) / scale;
  
      // with each move we also want to update the start X and Y
      startPosX = e.clientX;
      startPosY = e.clientY;

      // set the element's new position:
      if (dragEl) {
        if (this.checkForDragTarget(e)) {
          dragEl.style.top = (document.getElementById("cartridge-target").offsetTop + document.getElementById("cartridge-target").offsetHeight / 2 ) + "px";
          dragEl.style.left = (document.getElementById("cartridge-target").offsetLeft - document.getElementById("cartridge-target").offsetWidth / 2) + "px";  
        } else {
          dragEl.style.top = (dragEl.offsetTop - newPosY) + "px";
          dragEl.style.left = (dragEl.offsetLeft - newPosX) + "px";  
        }
      }


    }
  
  },

  mouseUp(e) {

    if (dragMode) {
      
      if (dragEl) {
        if (this.checkForDragTarget(e)) {
          dragEl.classList.add('docked');
          if (dragEl.dataset.gameConfigName) {
            Audio.sfx('turn-on');
            window.setTimeout(function(dragEl) {
              this.bootUpConsole(dragEl.dataset.gameConfigName);
            }.bind(this, dragEl), 250);
          }
        } else {
          this.resetDraggedElement(dragEl);
        }
      }

    }

    dragMode = false;
    dragEl = null;

  },

  checkForDragTarget(e) {

    let mouseX = e.clientX;
    let mouseY = e.clientY;

    let viewportOffset = document.getElementById("cartridge-target").getBoundingClientRect();

    if (mouseX >= viewportOffset.left &&
        mouseX <= viewportOffset.right &&
        mouseY >= viewportOffset.top &&
        mouseY <= viewportOffset.bottom) {
        
        return true;

    } else {

      return false;

    }

  },

  resetDraggedElement(el) {
    el.classList.remove('grabbed');
  },

  buildViewport() {
    let viewportRasterMarkup = "";
    viewportRaster.innerHTML = "";

    for (var y = 0; y < dimensions.y; y += 1) {

      let decoLayerRow = Array.from(decoLayer[y]);
      let groundLayerRow = Array.from(groundLayer[y]);

      viewportRasterMarkup += "<tr>";

      for (var x = 0; x < dimensions.x; x += 1) {
        if (groundLayerRow[x + viewportScrollCounter.x] !== " ") {
          newViewport[y][x] = groundLayerRow[x + viewportScrollCounter.x];
        } else if (decoLayerRow[x + viewportScrollCounter.x] && decoLayerRow[x + viewportScrollCounter.x] !== " ") {
          newViewport[y][x] = decoLayerRow[x + viewportScrollCounter.x];
        } else {
          newViewport[y][x] = " ";
        }
        if (newViewport[y][x] !== " ") {
          viewportRasterMarkup = viewportRasterMarkup + '<td style="' + this.addCustomStyle(newViewport[y][x]) + '"><span>' + newViewport[y][x] + '</span></td>';
        } else {
          viewportRasterMarkup = viewportRasterMarkup + "<td><span>&#160;</span></td>";
        }
      }

      viewportRasterMarkup += "</tr>";
    }

    viewportRaster.innerHTML = viewportRasterMarkup;
    /*
    for (var x = 0; x < dimensions.x; x += 1) {
      viewportRasterRow += "<td><span>&#160;</span></td>";
    }
    for (let y = 0; y < dimensions.y; y += 1) {
      viewportRaster.innerHTML = viewportRaster.innerHTML + "<tr>" + viewportRasterRow + "</tr>";
    }*/
  },

  recalcViewport() {

    let enemy, projectile;

    this.updateViewport();

    for (let y = viewportScrollCounter.y; y < viewportScrollCounter.y + viewportDimensions.y; y += 1) {

      let decoLayerRow = Array.from(decoLayer[y]);
      let groundLayerRow = Array.from(groundLayer[y]);

      for (var x = viewportScrollCounter.x; x < viewportScrollCounter.x + viewportDimensions.x; x += 1) {

        enemy = false, projectile = false;
        
        for (var i = 0; i < enemies.length; i += 1) {
          if (enemies[i].x === x && enemies[i].y === y) {
            enemy = true;
            newViewport[y][x] = enemies[i].letter;
          }
        }

        for (var i = 0; i < projectiles.player.length; i += 1) {
          if (projectiles.player[i].x === x && projectiles.player[i].y === y) {
            projectile = true;
            newViewport[y][x] = projectiles.player[i].letter;
          }
        }  

        for (var i = 0; i < projectiles.enemy.length; i += 1) {
          if (projectiles.enemy[i].x === x && projectiles.enemy[i].y === y) {
            projectile = true;
            newViewport[y][x] = projectiles.enemy[i].letter;
          }
        }  

        if (!enemy && !projectile) {
          if (player.x === x && player.y === y) {
            newViewport[y][x] = player.letter;
          } else if (groundLayerRow[x] !== " ") {
            newViewport[y][x] = groundLayerRow[x];
          } else if (decoLayerRow[x] && decoLayerRow[x] !== " ") {
            newViewport[y][x] = decoLayerRow[x];
          } else {
            newViewport[y][x] = " ";
          }
        }
      }
    }
  },

  repaintViewport() {
    for (let y = viewportScrollCounter.y; y < viewportScrollCounter.y + viewportDimensions.y; y += 1) {
      let rasterRow = viewportRaster.querySelector("tr:nth-child(" + (y + 1) + ")");
      for (var x = viewportScrollCounter.x; x < viewportScrollCounter.x + viewportDimensions.x; x += 1) {
        if (viewport[y][x] !== newViewport[y][x]) {
          let rasterCell = rasterRow.querySelector("td:nth-child(" + (x + 1) + ")");
          if (rasterCell !== null) {
            rasterCell.style = this.addCustomStyle(newViewport[y][x]);
            if (newViewport[y][x] === "COLL") {
              rasterCell.querySelector("span").classList.add('enemy-collision');
              rasterCell.querySelector("span").innerHTML = "&#160;";
              window.setTimeout(function() {
                rasterCell.querySelector("span").classList.remove('enemy-collision');
              }.bind(rasterCell), 1000);
            } else if (newViewport[y][x] !== " ") {
              rasterCell.querySelector("span").textContent = newViewport[y][x];
            } else {
              rasterCell.querySelector("span").innerHTML = "&#160;";
            }  
          }
        }
      }
    }
  },

  updateViewport() {
    viewport = JSON.parse(JSON.stringify(newViewport));
  },

  addCustomStyle(letter) {

    let customStyle = "";

    for (var i = 0; i < additionalStyles.length; i += 1) {
      if (letter === additionalStyles[i].letter) {
        if (additionalStyles[i].effect) {
          customStyle = 'animation: ' + additionalStyles[i].effect + ' ' + Math.floor(5 + Math.random() * 3) + 's infinite linear;';
        } else if (additionalStyles[i].style) {
          customStyle = additionalStyles[i].style;
        }
      }
    }

    return customStyle;

  },

  updateMetrics() {
    let metricsContainer = document.getElementById('viewport-ui');
    let highscore = Config.getHighscore().toString();
    let currentSec = Math.floor(window.currentMilliSec / 1000).toString();

    highscore = "0".repeat(5 - highscore.length) + highscore;
    currentSec = "0".repeat(4 - currentSec.length) + currentSec;

    for (var i = 1; i <= 5; i += 1) {
        metricsContainer.querySelector('.score-' + i + ' span').textContent = highscore[i - 1];
    }
    for (var i = 1; i <= 6; i += 1) {
      if (player.health >= i) {
        metricsContainer.querySelector('.health-' + i + ' span').textContent = "🛦";
      } else {
        metricsContainer.querySelector('.health-' + i + ' span').innerHTML = "&#160;";
      }
    }    
    for (var i = 1; i <= 4; i += 1) {
      metricsContainer.querySelector('.time-' + i + ' span').textContent = currentSec[i - 1];
    }
  },

  pause(mode) {
    window.paused = mode;
  },

  isPaused() {
    return window.paused;
  }

}

