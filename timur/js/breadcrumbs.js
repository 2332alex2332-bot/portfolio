(function () {
  'use strict';

  var SITE_LABELS = {
    timur: 'Ремонт квартир',
    'gloris-beauty': 'Салон красоты',
    'custom-cars': 'Детейлинг-центр',
  };

  var FILE_LABELS = {
    'index.html': 'Главная',
    'services.html': 'Услуги',
    'services-medical.html': 'Медицинские услуги',
    'masters.html': 'Мастера',
    'works.html': 'Наши работы',
    'promo.html': 'Акции',
    'contacts.html': 'Контакты',
    'telegram-chat.html': 'Чат в Telegram',
    'privacy-policy.html': 'Политика конфиденциальности',
    'cookie-policy.html': 'Политика файлов cookie',
    'user-agreement.html': 'Пользовательское соглашение',
  };

  var FOLDER_LABELS = {
    legal: 'Правовая информация',
    'old-site': 'Старый сайт',
  };

  var SECTION_LABELS = {
    about: 'О нас',
    calc: 'Калькулятор',
    portfolio: 'Портфолио',
    contact: 'Контакты',
    wash: 'Мойка',
    film: 'Плёнка',
    ceramic: 'Керамика',
    body: 'Кузов',
    salon: 'Салон',
    glass: 'Стёкла',
    complexes: 'Комплексы',
  };

  var SITE_FOLDERS = ['timur', 'gloris-beauty', 'custom-cars'];

  function slugToTitle(slug) {
    return slug.replace(/\.html$/i, '').replace(/[-_]+/g, ' ');
  }

  function normalizePath(pathname) {
    try {
      return decodeURIComponent(pathname || '/');
    } catch (error) {
      return pathname || '/';
    }
  }

  function findSiteIndex(parts, href) {
    for (var i = 0; i < parts.length; i++) {
      if (SITE_FOLDERS.indexOf(parts[i]) !== -1) {
        return i;
      }
    }

    var lowerHref = href.toLowerCase();
    for (var j = 0; j < SITE_FOLDERS.length; j++) {
      var folder = SITE_FOLDERS[j];
      if (lowerHref.indexOf('/' + folder + '/') !== -1 || lowerHref.indexOf('/' + folder) !== -1) {
        return parts.indexOf(folder);
      }
    }

    return -1;
  }

  function buildContext() {
    var pathname = normalizePath(window.location.pathname);
    var href = window.location.href || '';
    var hash = (window.location.hash || '').replace(/^#/, '');
    var parts = pathname.split('/').filter(Boolean);
    var detectedIdx = findSiteIndex(parts, href);
    var siteIdx = detectedIdx;

    if (siteIdx === -1) {
      siteIdx = 0;
      parts = parts.length ? parts : ['index.html'];
    }

    var siteFolder = detectedIdx !== -1 ? parts[detectedIdx] : '';

    var afterSite = parts.slice(siteIdx + 1);
    var file = afterSite.length ? afterSite[afterSite.length - 1] : 'index.html';
    if (!/\.html?$/i.test(file)) {
      file = 'index.html';
    }

    var folders = afterSite.slice(0, -1);
    var depthFromSite = afterSite.length ? afterSite.length - 1 : 0;
    var relToSite = '';
    for (var i = 0; i < depthFromSite; i++) {
      relToSite += '../';
    }

    var upToPortfolio = '';
    for (var j = 0; j <= depthFromSite; j++) {
      upToPortfolio += '../';
    }

    return {
      file: file,
      folders: folders,
      hash: hash,
      siteFolder: siteFolder,
      isIndex: file === 'index.html' && folders.length === 0,
      siteHomeHref: relToSite + 'index.html',
      portfolioHref: upToPortfolio + 'index.html',
      relPrefix: relToSite,
    };
  }

  function buildItems(ctx) {
    var items = [];
    var position = 1;

    items.push({ label: 'Станислав', href: ctx.portfolioHref, position: position++ });
    items.push({
      label: SITE_LABELS[ctx.siteFolder] || slugToTitle(ctx.siteFolder) || 'Демо-сайт',
      href: ctx.siteHomeHref,
      position: position++,
    });

    var needHomeLink = !ctx.isIndex || ctx.folders.length > 0 || (ctx.hash && ctx.hash !== 'top');
    if (needHomeLink) {
      items.push({ label: 'Главная', href: ctx.siteHomeHref, position: position++ });
    }

    var folderPath = ctx.relPrefix;
    ctx.folders.forEach(function (folder) {
      folderPath += folder + '/';
      items.push({
        label: FOLDER_LABELS[folder] || slugToTitle(folder),
        href: folderPath + 'index.html',
        position: position++,
      });
    });

    if (!ctx.isIndex) {
      var pageHref = ctx.relPrefix + (ctx.folders.length ? ctx.folders.join('/') + '/' : '') + ctx.file;
      items.push({
        label: FILE_LABELS[ctx.file] || slugToTitle(ctx.file),
        href: pageHref,
        position: position++,
      });
    }

    if (ctx.isIndex && !ctx.folders.length && (!ctx.hash || ctx.hash === 'top')) {
      items.push({ label: 'Главная', href: null, position: position++ });
    }

    if (ctx.hash && ctx.hash !== 'top' && SECTION_LABELS[ctx.hash]) {
      items.push({
        label: SECTION_LABELS[ctx.hash],
        href: ctx.siteHomeHref + '#' + ctx.hash,
        position: position++,
      });
    }

    return items;
  }

  function renderList(items) {
    var html = '<ol class="site-breadcrumbs__list">';
    items.forEach(function (item, index) {
      var isLast = index === items.length - 1;
      html += '<li class="site-breadcrumbs__item">';
      if (!isLast && item.href) {
        html += '<a href="' + item.href + '">' + item.label + '</a>';
      } else {
        html += '<span aria-current="page">' + item.label + '</span>';
      }
      html += '</li>';
    });
    html += '</ol>';
    return html;
  }

  function injectSchema(items) {
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map(function (item) {
        var entry = {
          '@type': 'ListItem',
          position: item.position,
          name: item.label,
        };
        if (item.href) {
          entry.item = new URL(item.href, window.location.href).href;
        }
        return entry;
      }),
    });
    document.head.appendChild(script);
  }

  function renderAll() {
    document.querySelectorAll('[data-breadcrumbs-root]').forEach(function (root) {
      var items = buildItems(buildContext());
      root.innerHTML = renderList(items);
    });
  }

  if (!document.querySelector('[data-breadcrumbs-root]')) {
    return;
  }

  renderAll();
  window.addEventListener('hashchange', renderAll);
})();
