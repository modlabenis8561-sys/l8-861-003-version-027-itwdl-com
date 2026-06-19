(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === heroIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === heroIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
        });
    });

    if (slides.length > 1) {
        showHero(0);
        window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    filterPanels.forEach(function (panel) {
        var scope = panel.getAttribute('data-filter-panel');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope="' + scope + '"] [data-movie-card]'));
        var search = panel.querySelector('[data-filter-search]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var empty = document.querySelector('[data-empty-for="' + scope + '"]');

        function applyFilter() {
            var q = search ? search.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var match = true;

                if (q && haystack.indexOf(q) === -1) {
                    match = false;
                }

                if (regionValue && card.getAttribute('data-region') !== regionValue) {
                    match = false;
                }

                if (typeValue && card.getAttribute('data-type') !== typeValue) {
                    match = false;
                }

                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    match = false;
                }

                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [search, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    var searchPanel = document.querySelector('[data-search-panel]');
    var searchList = document.querySelector('[data-search-list]');
    var searchData = window.SiteSearchIndex || [];

    function renderSearch(query) {
        if (!searchPanel || !searchList) {
            return;
        }

        var q = query.trim().toLowerCase();

        if (q.length < 1) {
            searchPanel.classList.remove('is-visible');
            searchList.innerHTML = '';
            return;
        }

        var results = searchData.filter(function (item) {
            return item.text.indexOf(q) !== -1;
        }).slice(0, 18);

        if (!results.length) {
            searchList.innerHTML = '<div class="search-result"><div></div><div><h3>没有找到匹配影片</h3><p>可以尝试输入影片名、地区、年份或标签。</p></div></div>';
            searchPanel.classList.add('is-visible');
            return;
        }

        searchList.innerHTML = results.map(function (item) {
            return '<a class="search-result" href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title + '"><div><h3>' + item.title + '</h3><p>' + item.oneLine + '</p><span>' + item.meta + '</span></div></a>';
        }).join('');
        searchPanel.classList.add('is-visible');
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            renderSearch(input.value);
        });

        input.addEventListener('focus', function () {
            renderSearch(input.value);
        });
    });

    document.addEventListener('click', function (event) {
        if (!searchPanel) {
            return;
        }

        var clickedSearch = event.target.closest('[data-site-search]');
        var clickedPanel = event.target.closest('[data-search-panel]');

        if (!clickedSearch && !clickedPanel) {
            searchPanel.classList.remove('is-visible');
        }
    });
})();
