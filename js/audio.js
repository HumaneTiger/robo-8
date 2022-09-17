let allAudio = document.getElementById("all-audio");

export default {

    init() {
    },

    music(name, delay, vol) {

        window.setTimeout(function() {

            let audio = allAudio.querySelector('.music-' + name);
            let volume = vol || 0.5;

            audio.volume = volume;
            
            audio.play();

        }, delay || 0);

    },

    sfx(name, delay, vol) {

        window.setTimeout(function() {

            let audio = allAudio.querySelector('.sfx-' + name);
            let volume = vol || 0.5;

            audio.pause();
            audio.currentTime = 0;
            audio.volume = volume;
            
            audio.play();

        }, delay || 0);

    },

    stop(name, delay) {

        window.setTimeout(function() {

            let audio = allAudio.querySelector('.music-' + name);
            
            audio.volume = 0;
            audio.pause();
            audio.currentTime = 0;
            
        }, delay || 0);

    }

}