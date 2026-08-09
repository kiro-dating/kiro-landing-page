/**
 * Blog Kiro — amélioration progressive.
 *
 * Ce fichier n'est JAMAIS nécessaire pour lire un article : tout le contenu est
 * déjà dans le HTML servi. Il n'ajoute que deux conforts :
 *   1. la copie du lien de partage ;
 *   2. la recherche côté client sur /blog/recherche/.
 *
 * Aucune dépendance, aucun suivi, aucune écriture de stockage navigateur.
 * Copié tel quel dans dist/ par scripts/build-blog.mjs (avec empreinte de cache).
 */
(function () {
  'use strict';

  /* ── Menus dépliants : fermeture au clic extérieur et à Échap ──────────── */

  /* Les menus du blog sont des <details> natifs : ils fonctionnent déjà sans
     JavaScript, au clavier comme à la souris. Ce bloc n'ajoute que le confort
     attendu d'un menu — se refermer quand on clique ailleurs ou qu'on appuie
     sur Échap — et rend le focus au bouton, comme le veut la pratique ARIA. */
  var menus = document.querySelectorAll('details.more-menu, details.nav-menu, details.search-toggle');

  if (menus.length > 0) {
    document.addEventListener('click', function (event) {
      for (var i = 0; i < menus.length; i += 1) {
        if (menus[i].open && !menus[i].contains(event.target)) menus[i].open = false;
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      for (var i = 0; i < menus.length; i += 1) {
        if (!menus[i].open) continue;
        menus[i].open = false;
        var summary = menus[i].querySelector('summary');
        if (summary) summary.focus();
      }
    });

    /* La recherche dépliable donne le focus au champ dès l'ouverture. */
    for (var m = 0; m < menus.length; m += 1) {
      if (!menus[m].classList.contains('search-toggle')) continue;
      menus[m].addEventListener('toggle', function () {
        if (!this.open) return;
        var field = this.querySelector('input[type="search"]');
        if (field) field.focus();
      });
    }
  }

  /* ── Partage : copier le lien ─────────────────────────────────────────── */

  var shareBlock = document.querySelector('.post-share');
  var copyButton = shareBlock && shareBlock.querySelector('.post-share-copy');

  if (copyButton && navigator.clipboard) {
    copyButton.addEventListener('click', function () {
      var url = shareBlock.getAttribute('data-share-url') || window.location.href;
      navigator.clipboard.writeText(url).then(
        function () {
          var original = copyButton.getAttribute('data-copy-label');
          copyButton.textContent = copyButton.getAttribute('data-copied-label');
          copyButton.classList.add('is-copied');
          window.setTimeout(function () {
            copyButton.textContent = original;
            copyButton.classList.remove('is-copied');
          }, 2000);
        },
        function () {
          /* Le presse-papiers peut être refusé : on laisse le bouton inchangé. */
        },
      );
    });
  } else if (copyButton) {
    /* Pas d'API presse-papiers : le bouton n'apporte rien, on le retire. */
    copyButton.remove();
  }

  /* ── Partage natif (mobile), en complément des liens réseaux ──────────── */

  if (shareBlock && navigator.share) {
    var nativeButton = document.createElement('button');
    nativeButton.type = 'button';
    nativeButton.className = 'post-share-copy';
    nativeButton.textContent = shareBlock.getAttribute('data-share-native-label') || 'Partager';
    nativeButton.setAttribute('aria-label', document.documentElement.lang.indexOf('fr') === 0 ? 'Partager' : 'Share');
    nativeButton.addEventListener('click', function () {
      navigator
        .share({
          title: shareBlock.getAttribute('data-share-title') || document.title,
          url: shareBlock.getAttribute('data-share-url') || window.location.href,
        })
        .catch(function () {
          /* Annulation utilisateur : rien à signaler. */
        });
    });
    shareBlock.appendChild(nativeButton);
  }

  /* ── Recherche ────────────────────────────────────────────────────────── */

  var form = document.querySelector('[data-search-index]');
  if (!form) return;

  var input = form.querySelector('input[type="search"]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var indexUrl = form.getAttribute('data-search-index');
  var isFrench = document.documentElement.lang.indexOf('fr') === 0;

  var strings = isFrench
    ? { none: 'Aucun article ne correspond à cette recherche.', prompt: 'Tape un mot pour lancer la recherche.', error: 'La recherche est momentanément indisponible.', count: function (n) { return n === 1 ? '1 article trouvé' : n + ' articles trouvés'; } }
    : { none: 'No article matches this search.', prompt: 'Type a word to start searching.', error: 'Search is temporarily unavailable.', count: function (n) { return n === 1 ? '1 article found' : n + ' articles found'; } };

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

  function render(list) {
    /* Le bloc de repli n'a de sens que tant qu'aucune recherche n'est lancée. */
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
          '<article class="post-card">' +
          '<a class="post-card-media" href="' + escapeHtml(item.u) + '" tabindex="-1" aria-hidden="true">' +
          (item.i
            ? '<img src="' + escapeHtml(item.i) + '" alt="" loading="lazy" decoding="async" width="1200" height="630" />'
            : '<span class="post-card-placeholder"></span>') +
          '</a>' +
          '<div class="post-card-body">' +
          '<span class="post-card-cat">' + escapeHtml(item.c) + '</span>' +
          '<h3 class="post-card-title"><a href="' + escapeHtml(item.u) + '">' + escapeHtml(item.t) + '</a></h3>' +
          '<p class="post-card-excerpt">' + escapeHtml(item.d) + '</p>' +
          '<p class="post-card-meta"><span>' + escapeHtml(item.p) + '</span><span aria-hidden="true">•</span><span>' + escapeHtml(item.r) + '</span></p>' +
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
