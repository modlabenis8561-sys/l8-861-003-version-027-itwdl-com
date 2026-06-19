(function () {
    function initPlayer(container) {
        var video = container.querySelector('video');
        var button = container.querySelector('[data-player-button]');
        var source = container.getAttribute('data-stream');
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button || !source) {
            return;
        }

        function playVideo() {
            var attempt = video.play();

            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        function start() {
            button.classList.add('is-hidden');

            if (!loaded) {
                loaded = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.load();
                    playVideo();
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                        hlsInstance.loadSource(source);
                    });
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    playVideo();
                } else {
                    video.src = source;
                    video.load();
                    playVideo();
                }
            } else {
                playVideo();
            }
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
