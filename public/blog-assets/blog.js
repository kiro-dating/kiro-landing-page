/**
 * Blog Kiro — amélioration progressive.
 *
 * Ce fichier n'est JAMAIS nécessaire pour lire un article ni pour naviguer :
 * tout le contenu et tous les liens sont déjà dans le HTML servi, et les menus
 * sont des <details> natifs. Il n'ajoute que des conforts :
 *   1. menu mobile modal : piège du focus, Échap, défilement bloqué ;
 *   2. partage (Web Share API, repli : copie du lien) et copie du lien ;
 *   3. barre de progression de lecture (statique si « Réduire les animations ») ;
 *   4. recherche côté client sur /blog/recherche/.
 *
 * Aucune dépendance, aucun suivi, aucune écriture de stockage navigateur.
 * Copié tel quel dans dist/ par scripts/build-blog.mjs (avec empreinte de cache).
 */
(function () {
  'use strict';

  var isFrench = document.documentElement.lang.indexOf('fr') === 0;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Message bref (« Lien copié »), annoncé aux lecteurs d'écran ──────── */

  var toast = null;
  var toastTimer = null;
  function announce(message) {
    if (!toast) {
      toast = document.createElement('p');
      toast.className = 'kb-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.textContent = '';
    }, 2200);
  }

  function copy(text) {
    if (!navigator.clipboard) return Promise.reject(new Error('clipboard'));
    return navigator.clipboard.writeText(text);
  }

  /* ── Menu mobile plein écran ──────────────────────────────────────────── */

  var menu = document.querySelector('[data-kb-menu]');

  if (menu) {
    var summary = menu.querySelector('summary');
    var panel = menu.querySelector('.kb-menu-panel');

    var focusables = function () {
      return [summary].concat(Array.prototype.slice.call(panel.querySelectorAll('a[href], button:not([disabled])')));
    };

    var close = function (restoreFocus) {
      if (!menu.open) return;
      menu.open = false;
      if (restoreFocus) summary.focus();
    };

    menu.addEventListener('toggle', function () {
      document.documentElement.classList.toggle('kb-menu-open', menu.open);
      if (menu.open) {
        var first = panel.querySelector('a[href]');
        if (first) first.focus();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!menu.open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== 'Tab') return;
      /* Piège du focus : le bouton du menu et les liens du panneau seulement. */
      var items = focusables();
      var firstItem = items[0];
      var lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      } else if (items.indexOf(document.activeElement) === -1) {
        event.preventDefault();
        firstItem.focus();
      }
    });

    /* Un lien d'ancre ou un passage en grand écran referme le menu. */
    panel.addEventListener('click', function (event) {
      if (event.target.closest('a')) close(false);
    });
    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 1120px)');
      var onWide = function () {
        if (wide.matches) close(false);
      };
      if (wide.addEventListener) wide.addEventListener('change', onWide);
    }
  }

  /* ── Barre de filtres : puce active visible ─────────────────────────────
     Sur mobile, la rangée de puces défile horizontalement : sur une page de
     catégorie, la puce active peut se trouver hors de l'écran. On fait
     défiler la RANGÉE (jamais la page) d'un coup, sans animation — donc rien
     à adapter pour « Réduire les animations ». L'ordre des liens et les URL
     ne changent pas. */

  var chipTracks = document.querySelectorAll('.kb-chips-track');
  for (var c = 0; c < chipTracks.length; c += 1) {
    var track = chipTracks[c];
    var activeChip = track.querySelector('.kb-chip.is-active');
    if (!activeChip || track.scrollWidth <= track.clientWidth) continue;
    var trackRect = track.getBoundingClientRect();
    var chipRect = activeChip.getBoundingClientRect();
    if (chipRect.left >= trackRect.left && chipRect.right <= trackRect.right) continue;
    var gutter = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
    track.scrollLeft += chipRect.left - trackRect.left - gutter;
  }

  /* ── Partage (en-tête d'article) ──────────────────────────────────────── */

  var shareButton = document.querySelector('[data-kb-share]');
  if (shareButton && (navigator.share || navigator.clipboard)) {
    shareButton.hidden = false;
    shareButton.addEventListener('click', function () {
      var url = shareButton.getAttribute('data-share-url') || window.location.href;
      var title = shareButton.getAttribute('data-share-title') || document.title;
      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {
          /* Annulation par l'utilisateur : rien à signaler. */
        });
        return;
      }
      copy(url).then(
        function () {
          announce(shareButton.getAttribute('data-copied-label') || (isFrench ? 'Lien copié' : 'Link copied'));
        },
        function () {},
      );
    });
  }

  /* ── Copier le lien (bloc de partage en fin d'article) ────────────────── */

  var copyButton = document.querySelector('.kb-share-copy');
  if (copyButton && navigator.clipboard) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', function () {
      var block = copyButton.closest('[data-share-url]');
      var url = (block && block.getAttribute('data-share-url')) || window.location.href;
      copy(url).then(
        function () {
          var original = copyButton.getAttribute('data-copy-label');
          copyButton.textContent = copyButton.getAttribute('data-copied-label');
          copyButton.classList.add('is-copied');
          window.setTimeout(function () {
            copyButton.textContent = original;
            copyButton.classList.remove('is-copied');
          }, 2000);
        },
        function () {},
      );
    });
  }

  /* ── Progression de lecture ───────────────────────────────────────────── */

  var progress = document.querySelector('[data-kb-progress]');
  var prose = document.querySelector('.kb-prose');
  if (progress && prose && !reduceMotion) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var rect = prose.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.6;
      var done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      progress.style.transform = 'scaleX(' + done.toFixed(4) + ')';
    };
    var request = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  }

  /* ── Recherche ────────────────────────────────────────────────────────── */

  var form = document.querySelector('[data-search-index]');
  if (!form) return;

  var input = form.querySelector('input[type="search"]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var indexUrl = form.getAttribute('data-search-index');

  var strings = isFrench
    ? { none: 'Aucun article ne correspond à cette recherche.', prompt: 'Tape un mot pour lancer la recherche.', error: 'La recherche est momentanément indisponible.', min: 'min', count: function (n) { return n === 1 ? '1 article trouvé' : n + ' articles trouvés'; } }
    : { none: 'No article matches this search.', prompt: 'Type a word to start searching.', error: 'Search is temporarily unavailable.', min: 'min', count: function (n) { return n === 1 ? '1 article found' : n + ' articles found'; } };

  var data = null;
  var loading = null;

  /** Normalise pour comparer sans accents ni casse. */
  function fold(value) {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      /* Les insécables de la typographie française deviennent des espaces
         ordinaires : « 45 % » se trouve en tapant « 45 % ». */
      .replace(/[\u00a0\u202f]/g, ' ');
  }

  function load() {
    if (data) return Promise.resolve(data);
    if (loading) return loading;
    loading = fetch(indexUrl)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (json) {
        data = json.map(function (item) {
          item._haystack = fold([item.t, item.d, item.c, (item.g || []).join(' '), item.b].join(' '));
          item._title = fold(item.t);
          return item;
        });
        return data;
      });
    return loading;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var fallback = document.querySelector('[data-search-fallback]');

  /** Même balisage que la carte `card()` de scripts/blog/templates.mjs. */
  function render(list) {
    if (fallback) fallback.hidden = true;
    if (list.length === 0) {
      results.innerHTML = '';
      status.textContent = strings.none;
      return;
    }
    status.textContent = strings.count(list.length);
    results.innerHTML = list
      .map(function (item) {
        return (
          '<article class="kb-card">' +
          '<div class="kb-card-media">' +
          (item.i
            ? '<img src="' + escapeHtml(item.i) + '" alt="" loading="lazy" decoding="async" width="1200" height="630" />'
            : '<span class="kb-placeholder"></span>') +
          '</div>' +
          '<div class="kb-card-body">' +
          '<p class="kb-eyebrow">' + escapeHtml(item.c) + '</p>' +
          '<h2 class="kb-card-title"><a class="kb-stretched" href="' + escapeHtml(item.u) + '">' + escapeHtml(item.t) + '</a></h2>' +
          '<p class="kb-card-meta"><span>' + escapeHtml(item.p) + '</span><span aria-hidden="true"> · </span><span>' + escapeHtml(item.r) + '</span></p>' +
          '</div></article>'
        );
      })
      .join('');
  }

  /** Score simple : le titre pèse plus que le corps, tous les mots doivent apparaître. */
  function search(query) {
    var words = fold(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      results.innerHTML = '';
      status.textContent = strings.prompt;
      if (fallback) fallback.hidden = false;
      return;
    }
    load()
      .then(function (items) {
        var matches = [];
        for (var i = 0; i < items.length; i += 1) {
          var item = items[i];
          var score = 0;
          var all = true;
          for (var w = 0; w < words.length; w += 1) {
            var inTitle = item._title.indexOf(words[w]) !== -1;
            var inBody = item._haystack.indexOf(words[w]) !== -1;
            if (!inTitle && !inBody) {
              all = false;
              break;
            }
            score += inTitle ? 10 : 1;
          }
          if (all) matches.push({ item: item, score: score });
        }
        matches.sort(function (a, b) {
          return b.score - a.score;
        });
        render(
          matches.map(function (m) {
            return m.item;
          }),
        );
      })
      .catch(function () {
        status.textContent = strings.error;
      });
  }

  var timer = null;
  input.addEventListener('input', function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      search(input.value);
      updateQueryString(input.value);
    }, 180);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    search(input.value);
    updateQueryString(input.value);
  });

  /** L'URL reflète la recherche : le lien reste partageable et rechargeable. */
  function updateQueryString(value) {
    if (!window.history.replaceState) return;
    var url = window.location.pathname + (value ? '?q=' + encodeURIComponent(value) : '');
    window.history.replaceState(null, '', url);
  }

  var initial = new URLSearchParams(window.location.search).get('q');
  if (initial) {
    input.value = initial;
    search(initial);
  }
})();
