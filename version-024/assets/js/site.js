(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var images = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-image]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      images.forEach(function (image, imageIndex) {
        image.classList.toggle("is-active", imageIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindCardFilter() {
    var input = document.querySelector("[data-card-search]");
    var select = document.querySelector("[data-card-select]");
    var reset = document.querySelector("[data-card-reset]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var empty = document.querySelector("[data-result-empty]");
    if (!input && !select) {
      return;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var selected = normalize(select ? select.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var selectText = normalize([
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matched = (!query || haystack.indexOf(query) !== -1) && (!selected || selectText.indexOf(selected) !== -1);
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (select) {
          select.value = "";
        }
        apply();
      });
    }
    apply();
  }

  function bindCatalogSearch() {
    var form = document.querySelector("[data-catalog-form]");
    var input = document.querySelector("[data-catalog-input]");
    var results = document.querySelector("[data-catalog-results]");
    var empty = document.querySelector("[data-catalog-empty]");
    if (!form || !input || !results || !window.MOVIE_CATALOG) {
      return;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "" +
        "<article class=\"movie-card\">" +
          "<a href=\"" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<span class=\"poster-wrap\">" +
              "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
              "<span class=\"poster-glow\"></span>" +
              "<span class=\"play-icon\">▶</span>" +
            "</span>" +
            "<span class=\"card-body\">" +
              "<strong>" + escapeHtml(movie.title) + "</strong>" +
              "<span class=\"card-line\">" + escapeHtml(movie.oneLine) + "</span>" +
              "<span class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></span>" +
              "<span class=\"card-tags\">" + tags + "</span>" +
            "</span>" +
          "</a>" +
        "</article>";
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>\"]/g, function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[character];
      });
    }

    function render() {
      var query = normalize(input.value);
      var items = window.MOVIE_CATALOG.filter(function (movie) {
        if (!query) {
          return true;
        }
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ")).indexOf(query) !== -1;
      }).slice(0, 120);
      results.innerHTML = items.map(card).join("");
      if (empty) {
        empty.classList.toggle("show", items.length === 0);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    if (initial) {
      input.value = initial;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  function initPlayer(playUrl) {
    var video = document.querySelector("[data-video-player]");
    var cover = document.querySelector("[data-player-cover]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-player-button]"));
    var attached = false;
    var hlsInstance = null;
    if (!video || !playUrl) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    function attach() {
      if (cover) {
        cover.classList.add("hidden");
      }
      video.controls = true;
      if (!attached) {
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(playUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          playVideo();
          return;
        }
        video.src = playUrl;
      }
      playVideo();
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", attach);
    });
    if (cover) {
      cover.addEventListener("click", attach);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        attach();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    bindNavigation();
    bindHero();
    bindCardFilter();
    bindCatalogSearch();
  });

  window.SitePlayer = {
    init: initPlayer
  };
})();
