// lang-toggle.js — bilingual (he/en) switcher for the Ownest legal pages
// (terms / privacy / accessibility). Loaded SYNCHRONOUSLY in <head> so the
// language resolves before first paint (no flash of the wrong language):
//   ?lang= (links from the app) > saved choice (localStorage) > browser
//   language > the page's data-lang default.
// Only an explicit click on the flag toggle persists the choice — a ?lang=
// deep link never overwrites it. Pages opt in by carrying data-lang /
// data-title-en / data-title-he on <html> and wrapping their content in
// .lang-en / .lang-he containers.
(function () {
  'use strict';

  var STORAGE_KEY = 'ownest-lang';
  var root = document.documentElement;
  var TITLES = {
    en: root.getAttribute('data-title-en'),
    he: root.getAttribute('data-title-he')
  };

  function normalize(v) {
    return v === 'he' || v === 'en' ? v : null;
  }

  function fromQuery() {
    try {
      var m = window.location.search.match(/[?&]lang=([^&#]*)/);
      return m ? normalize(decodeURIComponent(m[1])) : null;
    } catch (e) { return null; }
  }

  function fromStorage() {
    try { return normalize(window.localStorage.getItem(STORAGE_KEY)); }
    catch (e) { return null; }
  }

  function fromBrowser() {
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) {
      var l = String(langs[i]).toLowerCase();
      if (l.indexOf('he') === 0 || l.indexOf('iw') === 0) { return 'he'; }
      if (l.indexOf('en') === 0) { return 'en'; }
    }
    return null;
  }

  function apply(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    if (TITLES[lang]) { document.title = TITLES[lang]; }
    var btns = document.querySelectorAll('.ownest-lang-btn');
    for (var i = 0; i < btns.length; i++) {
      var active = btns[i].getAttribute('data-lang-target') === lang;
      btns[i].setAttribute('aria-pressed', active ? 'true' : 'false');
      btns[i].className = 'ownest-lang-btn' + (active ? ' is-active' : '');
    }
  }

  // Shared styles — injected synchronously so the hidden-language rule exists
  // before first paint (this script is parser-blocking in <head>).
  var style = document.createElement('style');
  style.textContent =
    'html[data-lang="en"] .lang-he{display:none !important}' +
    'html[data-lang="he"] .lang-en{display:none !important}' +
    '.lang-he{font-family:\'Rubik\',\'DM Sans\',sans-serif}' +
    '.lang-he ul{padding-left:0;padding-right:24px}' +
    '#ownest-lang-toggle{position:fixed;top:14px;inset-inline-end:14px;z-index:99998;' +
    'display:flex;gap:4px;background:rgba(255,255,255,.94);border:1px solid #d7dde6;' +
    'border-radius:999px;padding:4px;box-shadow:0 6px 18px rgba(15,23,42,.22);' +
    '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '.ownest-lang-btn{display:flex;align-items:center;gap:6px;border:0;background:transparent;' +
    'border-radius:999px;padding:6px 11px;font:600 13px/1 \'Rubik\',\'DM Sans\',sans-serif;' +
    'color:#334155;cursor:pointer}' +
    '.ownest-lang-btn.is-active{background:#1e3a5f;color:#fff}' +
    '.ownest-lang-btn:focus-visible{outline:3px solid #2563eb;outline-offset:2px}' +
    '.ownest-lang-flag{font-size:15px;line-height:1}';
  document.head.appendChild(style);

  apply(fromQuery() || fromStorage() || fromBrowser() ||
    normalize(root.getAttribute('data-lang')) || 'en');

  function choose(lang) {
    apply(lang);
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function makeButton(lang, flag, label, ariaLabel) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ownest-lang-btn';
    btn.setAttribute('data-lang-target', lang);
    btn.setAttribute('aria-label', ariaLabel);
    btn.setAttribute('lang', lang);
    var flagSpan = document.createElement('span');
    flagSpan.className = 'ownest-lang-flag';
    flagSpan.setAttribute('aria-hidden', 'true');
    flagSpan.textContent = flag;
    var labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    btn.appendChild(flagSpan);
    btn.appendChild(labelSpan);
    btn.addEventListener('click', function () { choose(lang); });
    return btn;
  }

  function mount() {
    if (document.getElementById('ownest-lang-toggle')) { return; }
    var wrap = document.createElement('div');
    wrap.id = 'ownest-lang-toggle';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language / שפה');
    wrap.appendChild(makeButton('en', '🇺🇸', 'EN', 'English'));
    wrap.appendChild(makeButton('he', '🇮🇱', 'עב', 'עברית'));
    document.body.appendChild(wrap);
    // Sync aria-pressed on the freshly-mounted buttons.
    apply(normalize(root.getAttribute('data-lang')) || 'en');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
