const MovieSite = (() => {
    const ready = (callback) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    };

    const initMenu = () => {
        const button = document.querySelector('[data-menu-button]');
        const nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
    };

    const initHero = () => {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        let current = 0;
        const activate = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => activate(index));
        });
        window.setInterval(() => activate(current + 1), 5200);
    };

    const initFilters = () => {
        document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
            const container = panel.parentElement;
            if (!container) {
                return;
            }
            const scope = container.querySelector('[data-filter-scope]');
            if (!scope) {
                return;
            }
            const cards = Array.from(scope.querySelectorAll('.movie-card, .rank-item'));
            const input = panel.querySelector('[data-search-input]');
            const buttons = Array.from(panel.querySelectorAll('[data-filter-category]'));
            let activeCategory = 'all';
            const apply = () => {
                const keyword = input ? input.value.trim().toLowerCase() : '';
                cards.forEach((card) => {
                    const text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.dataset.year
                    ].join(' ').toLowerCase();
                    const matchText = !keyword || text.includes(keyword);
                    const matchCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
                    card.classList.toggle('is-filter-hidden', !(matchText && matchCategory));
                });
            };
            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach((button) => {
                button.addEventListener('click', () => {
                    activeCategory = button.dataset.filterCategory || 'all';
                    buttons.forEach((item) => item.classList.toggle('is-active', item === button));
                    apply();
                });
            });
        });
    };

    const initPlayer = (source) => {
        ready(() => {
            const video = document.querySelector('[data-player-video]');
            const overlay = document.querySelector('[data-player-overlay]');
            if (!video || !source) {
                return;
            }
            let attached = false;
            const attach = () => {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            };
            const start = () => {
                attach();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                }
            };
            if (overlay) {
                overlay.addEventListener('click', start);
            }
            video.addEventListener('click', () => {
                if (!attached || video.paused) {
                    start();
                }
            });
        });
    };

    ready(() => {
        initMenu();
        initHero();
        initFilters();
    });

    return {
        initPlayer
    };
})();

window.MovieSite = MovieSite;
