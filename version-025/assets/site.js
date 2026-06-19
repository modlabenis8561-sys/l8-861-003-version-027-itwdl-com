(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    selectAll("[data-filter-panel]").forEach(function (panel) {
      var target = panel.getAttribute("data-target");
      var grid = document.querySelector(target);
      if (!grid) {
        return;
      }
      var cards = selectAll("[data-card]", grid);
      var input = panel.querySelector("[data-search-input]");
      var year = panel.querySelector("[data-year-filter]");
      var sort = panel.querySelector("[data-sort-filter]");
      var count = panel.querySelector("[data-result-count]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("search");
      if (query && input) {
        input.value = query;
      }

      function textOf(card) {
        return normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
      }

      function apply() {
        var q = input ? normalize(input.value) : "";
        var y = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var matchesText = !q || textOf(card).indexOf(q) !== -1;
          var matchesYear = !y || String(card.dataset.year || "").indexOf(y) !== -1;
          var ok = matchesText && matchesYear;
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible + " 部影片";
        }
      }

      function sortCards() {
        var mode = sort ? sort.value : "default";
        var ordered = cards.slice();
        if (mode === "year-desc") {
          ordered.sort(function (a, b) {
            return parseInt(b.dataset.year || "0", 10) - parseInt(a.dataset.year || "0", 10);
          });
        }
        if (mode === "year-asc") {
          ordered.sort(function (a, b) {
            return parseInt(a.dataset.year || "0", 10) - parseInt(b.dataset.year || "0", 10);
          });
        }
        if (mode === "title-asc") {
          ordered.sort(function (a, b) {
            return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
          });
        }
        ordered.forEach(function (card) {
          grid.appendChild(card);
        });
        cards = ordered;
        apply();
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (sort) {
        sort.addEventListener("change", sortCards);
      }
      apply();
    });
  }

  function initPlayer() {
    selectAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play]");
      var message = box.querySelector("[data-player-message]");
      var stream = box.getAttribute("data-stream");
      if (!video || !button) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function startVideo() {
        button.classList.add("is-hidden");
        video.controls = true;
        setMessage("");

        if (!stream) {
          setMessage("视频暂时无法播放，请稍后再试。");
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (video._player) {
            video._player.destroy();
          }
          var player = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          video._player = player;
          player.loadSource(stream);
          player.attachMedia(video);
          player.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setMessage("点击播放器即可继续观看。");
            });
          });
          player.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("视频暂时无法播放，请稍后再试。");
            }
          });
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {
              setMessage("点击播放器即可继续观看。");
            });
          }, { once: true });
          return;
        }

        setMessage("视频暂时无法播放，请更换浏览器或稍后再试。");
      }

      button.addEventListener("click", startVideo);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
