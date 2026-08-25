console.log('[offline-currency] external JS loaded');
(function () {
  // Persist the chosen currency across pages (mirrors the original store behaviour:
  // pick a currency on the homepage and every page you enter shows that currency).
  var STORAGE_KEY = 'oc_currency';
  var DEFAULT_CODE = 'HKD'; // original store defaults to HKD

  function fmt(n, sym, pos) {
    n = (Math.round(n * 100) / 100).toFixed(2);
    return pos === 'right' ? n + sym : sym + n;
  }

  function getRate(code) {
    var list = document.querySelector('.shoplazza-currency__list');
    if (!list) return null;
    var li = list.querySelector('li[data-value="' + code + '"]');
    if (!li) return null;
    return {
      rate: parseFloat(li.getAttribute('data-finance')) || 1,
      sym: li.getAttribute('data-symbol') || '',
      pos: li.getAttribute('data-position') || 'left',
      li: li
    };
  }

  function convert(code) {
    var info = getRate(code);
    if (!info) return;

    // Recompute every price from its USD origin value.
    var nodes = document.querySelectorAll('.money');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.className && el.className.indexOf('save-amount') > -1) continue;
      var o = el.getAttribute('data-currency-origin');
      if (!o) continue;
      var usd = parseFloat(String(o).replace(/[^0-9.\-]/g, ''));
      if (isNaN(usd)) continue;
      el.textContent = fmt(usd * info.rate, info.sym, info.pos);
    }

    // Update every currency label (header + footer) to the chosen currency.
    var labels = document.querySelectorAll('.shoplazza-currency__label');
    for (var j = 0; j < labels.length; j++) {
      var lbl = labels[j];
      var img = info.li.querySelector('img');
      var inner = img ? '<img alt="' + code + '" src="' + img.getAttribute('src') + '">' : '';
      lbl.innerHTML = inner + '<span>' + code + '</span>';
    }

    // Improvement over the original: always close the dropdown after a selection.
    var openOnes = document.querySelectorAll('.shoplazza-currency.open');
    for (var k = 0; k < openOnes.length; k++) openOnes[k].classList.remove('open');

    markActive(code);
  }

  function persist(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  }
  function getSaved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function injectCss() {
    // Override the theme's :hover rule so the dropdown closes immediately after
    // a selection instead of staying open while the cursor is still over it.
    // Also remove the clipped max-height so EVERY currency (incl. HKD at the
    // bottom) is visible without scrolling — customers shouldn't have to know
    // the list scrolls. On very short viewports it still scrolls with a clear
    // scrollbar; the open handler scrolls the active currency into view.
    var style = document.createElement('style');
    style.textContent =
      '.shoplazza-currency:not(.open) .shoplazza-currency__list{display:none!important}' +
      '.shoplazza-currency.open .shoplazza-currency__list{display:block!important}' +
      '.shoplazza-currency__list{max-height:80vh!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:thin}' +
      '.shoplazza-currency__list::-webkit-scrollbar{width:8px}' +
      '.shoplazza-currency__list::-webkit-scrollbar-thumb{background:#c9c9c9;border-radius:4px}' +
      '.shoplazza-currency__list li.is-active{background:#f5f5f5;font-weight:600}' +
      '.shoplazza-currency__list li.is-active::after{content:"\\2713";float:right;color:#111;margin-right:10px}';
    if (document.body) document.body.appendChild(style);
  }

  // Highlight the currently selected currency in the dropdown so customers can
  // see at a glance which one is active (and that HKD is a normal option).
  // There are several independent currency controls on a page (header/footer),
  // so mark the active item in EVERY list.
  function markActive(code) {
    var lists = document.querySelectorAll('.shoplazza-currency__list');
    for (var l = 0; l < lists.length; l++) {
      var lis = lists[l].querySelectorAll('li[data-value]');
      for (var i = 0; i < lis.length; i++) {
        if (lis[i].getAttribute('data-value') === code) lis[i].classList.add('is-active');
        else lis[i].classList.remove('is-active');
      }
    }
  }

  function init() {
    injectCss();
    var controls = document.querySelectorAll('.shoplazza-currency');
    for (var i = 0; i < controls.length; i++) {
      (function (sc) {
        sc.addEventListener('click', function (e) {
          if (!e.target || !e.target.closest) return;
          var li = e.target.closest('.shoplazza-currency__list li');
          if (li && li.getAttribute('data-value')) {
            var code = li.getAttribute('data-value');
            convert(code);
            persist(code);
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }
          if (e.target.closest('.shoplazza-currency__label')) {
            sc.classList.toggle('open');
            e.preventDefault();
            e.stopImmediatePropagation();
            // Safety net: if the list ever scrolls (short viewports), make sure
            // the currently selected currency is visible when the dropdown opens.
            if (sc.classList.contains('open')) {
              var cur = getSaved();
              if (!cur || !getRate(cur)) cur = DEFAULT_CODE;
              var li = sc.querySelector('li[data-value="' + cur + '"]');
              if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
            }
          }
        });
      })(controls[i]);
    }

    // Close any open dropdown when clicking elsewhere on the page.
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.shoplazza-currency')) {
        var openOnes = document.querySelectorAll('.shoplazza-currency.open');
        for (var i = 0; i < openOnes.length; i++) openOnes[i].classList.remove('open');
      }
    });
  }

  function applyOnLoad() {
    var saved = getSaved();
    var code = (saved && getRate(saved)) ? saved : DEFAULT_CODE;
    convert(code);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); applyOnLoad(); });
  } else {
    init();
    applyOnLoad();
  }

  window.__ocCurrency = convert;
})();
