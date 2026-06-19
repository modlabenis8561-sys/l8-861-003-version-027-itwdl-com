(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var value = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(value);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
      var empty = panel.querySelector("[data-empty-result]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
      var filter = "all";
      function apply() {
        var term = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var category = card.getAttribute("data-category") || "";
          var matchTerm = !term || haystack.indexOf(term) !== -1;
          var matchFilter = filter === "all" || category === filter;
          var show = matchTerm && matchFilter;
          card.classList.toggle("is-hidden", !show);
          if (show) {
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
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          filter = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute("data-src") || "";
      var attached = false;
      function attach() {
        if (attached || !source) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          return;
        }
        video.src = source;
      }
      function begin() {
        attach();
        shell.classList.add("is-playing");
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
      button.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (!attached) {
          begin();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
