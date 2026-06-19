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
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
    var previous = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
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
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initSearchAndFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var scopeSelector = input.getAttribute("data-search-input") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
      var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
      var activeFilter = "all";

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
          var filterText = (card.getAttribute("data-filter-text") || "").toLowerCase();
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesFilter = activeFilter === "all" || filterText.indexOf(activeFilter) !== -1;
          card.classList.toggle("hidden-card", !(matchesKeyword && matchesFilter));
        });
      }

      input.addEventListener("input", apply);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeFilter = (button.getAttribute("data-filter-button") || "all").toLowerCase();
          apply();
        });
      });
      apply();
    });
  }

  function initMoviePlayer(videoId, coverId, hlsUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !hlsUrl) {
      return;
    }
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = hlsUrl;
    }

    function start() {
      attach();
      cover.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    initMobileMenu();
    initCarousel();
    initSearchAndFilters();
  });
})();
