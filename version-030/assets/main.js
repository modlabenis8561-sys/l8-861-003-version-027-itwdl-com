(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var show = function (next) {
      slides[index].classList.remove('is-active');
      if (dots[index]) {
        dots[index].classList.remove('is-active');
      }
      index = next;
      slides[index].classList.add('is-active');
      if (dots[index]) {
        dots[index].classList.add('is-active');
      }
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  });

  document.querySelectorAll('[data-local-filter]').forEach(function (input) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var run = function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.classList.toggle('hidden-card', !match);
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    input.addEventListener('input', run);
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && Array.isArray(window.SearchMovies)) {
    var searchInput = searchPage.querySelector('[data-search-input]');
    var searchButton = searchPage.querySelector('[data-search-button]');
    var results = searchPage.querySelector('[data-search-results]');
    var render = function () {
      var query = searchInput.value.trim().toLowerCase();
      var list = window.SearchMovies.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase();
        return !query || text.indexOf(query) !== -1;
      }).slice(0, 60);
      if (!list.length) {
        results.innerHTML = '<div class="empty-state is-visible">没有找到匹配影片</div>';
        return;
      }
      results.innerHTML = '<div class="movie-grid">' + list.map(function (movie) {
        return '<a class="movie-card" href="./' + movie.file + '">' +
          '<div class="movie-poster"><img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-badge">' + escapeHtml(movie.type) + '</span><span class="poster-year">' + escapeHtml(movie.year) + '</span><span class="poster-play">▶</span></div>' +
          '<div class="movie-card-body"><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.oneLine) + '</p><div class="movie-meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div></div>' +
          '</a>';
      }).join('') + '</div>';
    };
    if (searchInput) {
      searchInput.addEventListener('input', render);
    }
    if (searchButton) {
      searchButton.addEventListener('click', render);
    }
    render();
  }

  window.initMoviePlayer = function (videoUrl) {
    var video = document.querySelector('[data-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-play-button]');
    var loaded = false;
    var load = function () {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    };
    var play = function () {
      load();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', play);
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          play();
        }
      });
    }
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }
})();
