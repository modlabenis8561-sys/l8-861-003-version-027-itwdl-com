(function () {
    function closestForm(node) {
        return node.closest("[data-global-search-form]");
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function createResultItem(item) {
        var link = document.createElement("a");
        link.href = "./" + item.href;
        var title = document.createElement("strong");
        title.textContent = item.title;
        var meta = document.createElement("span");
        meta.textContent = [item.category, item.year, item.genre].filter(Boolean).join(" · ");
        link.appendChild(title);
        link.appendChild(meta);
        return link;
    }

    function bindGlobalSearch() {
        var forms = document.querySelectorAll("[data-global-search-form]");
        forms.forEach(function (form) {
            var input = form.querySelector("[data-global-search-input]");
            var results = form.querySelector("[data-global-search-results]");
            if (!input || !results) {
                return;
            }

            function render() {
                var query = normalize(input.value);
                results.innerHTML = "";
                if (!query) {
                    results.classList.remove("open");
                    return;
                }
                var matches = (window.SITE_SEARCH || []).filter(function (item) {
                    return normalize(item.title + " " + item.genre + " " + item.year + " " + item.region + " " + item.category + " " + item.tags).indexOf(query) !== -1;
                }).slice(0, 12);
                if (matches.length === 0) {
                    var empty = document.createElement("span");
                    empty.className = "search-empty";
                    empty.textContent = "未找到相关影片";
                    results.appendChild(empty);
                } else {
                    matches.forEach(function (item) {
                        results.appendChild(createResultItem(item));
                    });
                }
                results.classList.add("open");
            }

            input.addEventListener("input", render);
            input.addEventListener("focus", render);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = normalize(input.value);
                if (!query) {
                    return;
                }
                var first = (window.SITE_SEARCH || []).find(function (item) {
                    return normalize(item.title + " " + item.genre + " " + item.year + " " + item.region + " " + item.category + " " + item.tags).indexOf(query) !== -1;
                });
                if (first) {
                    window.location.href = "./" + first.href;
                }
            });
        });

        document.addEventListener("click", function (event) {
            if (!closestForm(event.target)) {
                document.querySelectorAll("[data-global-search-results]").forEach(function (box) {
                    box.classList.remove("open");
                });
            }
        });
    }

    function bindMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function bindPageFilters() {
        document.querySelectorAll("[data-filter-input]").forEach(function (input) {
            var target = document.querySelector(input.getAttribute("data-filter-target"));
            if (!target) {
                return;
            }
            var items = Array.prototype.slice.call(target.querySelectorAll("[data-search-text]"));
            input.addEventListener("input", function () {
                var query = normalize(input.value);
                items.forEach(function (item) {
                    var text = normalize(item.getAttribute("data-search-text"));
                    item.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
                });
            });
        });
    }

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        bindGlobalSearch();
        bindMobileMenu();
        bindHero();
        bindPageFilters();
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-video");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-play-button]");
    var hlsInstance = null;
    var loaded = false;

    if (!video || !streamUrl) {
        return;
    }

    function startPlayback() {
        if (cover) {
            cover.classList.add("hidden");
        }
        if (!loaded) {
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = streamUrl;
        }
        video.play().catch(function () {});
    }

    if (cover) {
        cover.addEventListener("click", startPlayback);
    }
    if (button) {
        button.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
