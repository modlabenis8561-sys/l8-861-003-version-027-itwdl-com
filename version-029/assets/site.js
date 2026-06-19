(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHeaderSearch() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    showSlide(0);
    start();
  }

  function initCategoryFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }

    var keywordInput = panel.querySelector("[data-filter-keyword]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var genreSelect = panel.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var count = panel.querySelector("[data-filter-count]");

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var genre = genreSelect ? genreSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-genre"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var cardGenre = card.getAttribute("data-genre") || "";
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (genre && cardGenre.indexOf(genre) === -1) {
          matched = false;
        }

        card.style.display = matched ? "flex" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    [keywordInput, yearSelect, typeSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  function initSearchPage() {
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var count = document.querySelector("[data-search-count]");
    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function render(query) {
      var normalized = normalize(query).trim();
      var data = window.MOVIE_SEARCH_DATA;
      var matches = [];

      if (normalized) {
        matches = data.filter(function (movie) {
          var haystack = normalize(movie.title + " " + movie.oneLine + " " + movie.tags + " " + movie.genre + " " + movie.year + " " + movie.region);
          return haystack.indexOf(normalized) !== -1;
        }).slice(0, 120);
      } else {
        matches = data.slice(0, 24);
      }

      results.innerHTML = matches.map(function (movie) {
        return [
          '<a class="movie-card" data-movie-card href="' + movie.url + '">',
          '  <div class="movie-card-image">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="card-badge">' + escapeHtml(movie.type) + '</span>',
          '    <span class="card-play-mask">▶</span>',
          '  </div>',
          '  <div class="movie-card-body">',
          '    <h3 class="movie-card-title line-clamp-2">' + escapeHtml(movie.title) + '</h3>',
          '    <p class="movie-card-desc line-clamp-3">' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="movie-card-foot">',
          '      <span>' + escapeHtml(movie.year) + '</span>',
          '      <span>' + escapeHtml(movie.genre) + '</span>',
          '    </div>',
          '  </div>',
          '</a>'
        ].join("\n");
      }).join("\n");

      if (count) {
        count.textContent = normalized ? "找到 " + matches.length + " 条匹配结果" : "默认展示 " + matches.length + " 部热门影片";
      }
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initialQuery);
  }

  function initPlayer() {
    var player = document.querySelector("[data-movie-player]");
    if (!player) {
      return;
    }

    var hlsInstance = null;
    var buttons = document.querySelectorAll("[data-play-src]");
    var overlays = document.querySelectorAll("[data-play-overlay]");

    function loadSource(sourceUrl) {
      if (!sourceUrl) {
        return;
      }

      overlays.forEach(function (overlay) {
        overlay.classList.add("is-hidden");
      });

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (player.canPlayType("application/vnd.apple.mpegurl")) {
        player.src = sourceUrl;
        player.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(player);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          player.play().catch(function () {});
        });
        return;
      }

      player.src = sourceUrl;
      player.play().catch(function () {});
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        loadSource(button.getAttribute("data-play-src"));
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeaderSearch();
    initHeroSlider();
    initCategoryFilters();
    initSearchPage();
    initPlayer();
  });
})();
