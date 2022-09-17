import Logic from './logic.js'
import Ui from './ui.js'
import Move from './move.js'

let tickInterval = 50;
window.currentMilliSec = 0;

window.onload = function() { init(); };

function init() {
  
    window.paused = true;

    Logic.init();
    Ui.init();
    Move.init();
    
    Ui.resizeWindow();
    //Ui.bootUpConsole("Space Invaders");

    idleLoop();

}

function initiateMainGameLoop() {

    window.setTimeout(function() {

        /* TICKY TASKS */

        Logic.calculateProjectilePositions();
        Ui.recalcViewport();
        Logic.checkForCollision();
        Ui.repaintViewport();
        Ui.updateMetrics();
        Logic.checkForWinLoseCondition();
        Logic.triggerEnemyProjectile(0);
        Logic.triggerEnemyProjectile(1);

        if (!Ui.isPaused()) {
            initiateMainGameLoop();
        } else {
            idleLoop();
        }

        window.currentMilliSec += tickInterval;

    }, tickInterval);

}

function idleLoop() {
    window.setTimeout(function() {
        if (!Ui.isPaused()) {
            initiateMainGameLoop();
        } else {
            idleLoop();
        }
    }, 50);
}
