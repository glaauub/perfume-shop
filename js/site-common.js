/* ShengPerfume 站点增强脚本
 * - 价格统一折算为美元（USD），不提供任何货币切换
 * - 移除失效的 Google 翻译语言按钮
 * - 多图缩略图切换：压住 slick 位移，纯显示切换（与手机/桌面视口无关）
 * 注：原站价格为 art-template 运行时渲染，故换算在运行时完成。
 */
(function () {
  'use strict';

  // 币种符号 -> 相对 USD 的汇率（USD=1）。来源：原站 currency 列表 data-finance。
  var RATES = {
    '$': 1, 'US$': 1,
    'HK$': 7.838425,
    'A$': 1.394982, 'CA$': 1.379641,
    '€': 0.856198, '£': 0.732765,
    '¥': 158.89295, 'RM': 4.039798,
    'S$': 1.26939, '฿': 32.628026,
    'NT$': 31.798299, '₫': 26063.5
  };

  function toUSD(el) {
    if (!el) return;
    var txt = el.textContent.trim();
    if (/^\$\s?[\d.,]+$/.test(txt)) return; // 已是 USD，跳过
    var m = txt.match(/([^\d.,\s]*)\s*([\d.,]+)/);
    if (!m) return;
    var sym = m[1].trim();
    var num = parseFloat(m[2].replace(/,/g, ''));
    if (isNaN(num)) return;
    var rate = (sym in RATES) ? RATES[sym] : 1;
    var usd = num / rate;
    el.textContent = '$' + usd.toFixed(2);
  }

  function convertAll() {
    var els = document.querySelectorAll('.money');
    for (var i = 0; i < els.length; i++) toUSD(els[i]);
  }

  function removeCurrencySelector() {
    var sels = document.querySelectorAll('.shoplazza-currency');
    for (var i = sels.length - 1; i >= 0; i--) {
      if (sels[i] && sels[i].parentNode) sels[i].parentNode.removeChild(sels[i]);
    }
  }

  function removeLangButton() {
    var gt = document.getElementById('google_translate_element');
    if (gt && gt.parentNode) gt.parentNode.removeChild(gt);
    var ph = document.querySelector('.plugin__translate-header');
    if (ph && ph.parentNode) ph.parentNode.removeChild(ph);
    var combo = document.querySelector('.goog-te-combo');
    if (combo && combo.parentNode) combo.parentNode.removeChild(combo);
  }

  function setImp(el, prop, val) {
    try { el.style.setProperty(prop, val, 'important'); }
    catch (e) { el.style[prop] = val; }
  }

  function initGallery() {
    // 主图轮播：slick 实例状态在静态快照里已丢失（容器被硬编码 slick-initialized），
    // 真机加载 CDN 后 slick 可能被重新初始化并对 .slick-track 施加 translate 位移，
    // 导致切换到的图片被推出可视框（右大框空白）。这里改用纯“显示切换”，并强制
    // 压住 slick 的位移/宽度，与视口（手机/桌面）无关。
    var track = document.querySelector('.product-image .support-slick .slick-track')
            || document.querySelector('.support-slick .slick-track')
            || document.querySelector('.slick-track');
    if (!track) return;
    var slides = Array.prototype.slice.call(
      track.querySelectorAll(':scope > .product-info__slide, :scope > .product-image__slide'));
    if (!slides.length) return;

    // 抵消 slick 施加的位移/宽度，让 slide 按普通文档流堆叠（仅激活项可见）
    function neutralize() {
      track.style.setProperty('transform', 'none', 'important');
      track.style.setProperty('-webkit-transform', 'none', 'important');
      track.style.setProperty('width', '100%', 'important');
      slides.forEach(function (s) {
        s.style.setProperty('position', 'relative', 'important');
        s.style.setProperty('left', 'auto', 'important');
        s.style.setProperty('top', 'auto', 'important');
        s.style.setProperty('float', 'none', 'important');
        s.style.setProperty('width', '100%', 'important');
      });
    }

    var thumbsWrap = document.querySelector('.product-image__thumbs-content');
    var thumbs = thumbsWrap
      ? Array.prototype.slice.call(thumbsWrap.querySelectorAll(':scope > .product-image__thumbs-item'))
      : [];
    if (!thumbs.length) {
      thumbs = Array.prototype.slice.call(document.querySelectorAll('.product-image__thumbs-item'));
    }

    // 自包含切换：用 !important 覆盖源码写死的 display:none !important，不依赖外部 slick
    function show(idx) {
      if (idx < 0 || idx >= slides.length) idx = 0;
      neutralize();
      slides.forEach(function (s, i) {
        var on = (i === idx);
        s.style.setProperty('display', on ? 'block' : 'none', 'important');
        s.style.setProperty('opacity', on ? '1' : '0', 'important');
        s.style.setProperty('visibility', on ? 'visible' : 'hidden', 'important');
        s.classList.toggle('slick-current', on);
        s.classList.toggle('slick-active', on);
        s.classList.toggle('slick-hidden', !on);
        var img = s.querySelector('img');
        if (img) {
          img.style.setProperty('display', 'block', 'important');
          img.style.setProperty('visibility', 'visible', 'important');
          img.style.setProperty('opacity', '1', 'important');
        }
      });
      thumbs.forEach(function (t, i) {
        t.classList.toggle('slick-current', i === idx);
        t.classList.toggle('is-active', i === idx);
      });
      var cnt = document.querySelector('.product-image-count');
      if (cnt) cnt.textContent = (idx + 1) + '/' + slides.length;
    }

    thumbs.forEach(function (t, idx) {
      t.addEventListener('click', function (e) {
        if (e) e.preventDefault();
        show(idx);
      });
    });

    // 初始显示第 1 张；外部 slick 脚本可能晚初始化再位移，故 load 后强制一次
    show(0);
    window.addEventListener('load', function () { setTimeout(function () { show(0); }, 300); });
  }

  function run() {
    removeLangButton();
    convertAll();
    removeCurrencySelector();
    initGallery();
    // art-template 可能晚于本脚本渲染价格，监听新增 .money 再折算一次
    if (window.MutationObserver) {
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (mu) {
          mu.addedNodes.forEach(function (n) {
            if (n.nodeType !== 1) return;
            if (n.classList && n.classList.contains('money')) toUSD(n);
            else if (n.querySelectorAll) {
              var ms = n.querySelectorAll('.money');
              for (var i = 0; i < ms.length; i++) toUSD(ms[i]);
            }
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  // 评论区交互：点赞(有帮助) + 展开更多评论
  (function reviewsInteractions() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      // 点赞
      var btn = t.closest ? t.closest('.rv-helpful-btn') : null;
      if (btn) {
        if (btn.classList.contains('rv-voted')) return;
        btn.classList.add('rv-voted');
        var cnt = btn.parentNode.querySelector('.rv-helpful-count');
        if (cnt) {
          var n = (parseInt(cnt.getAttribute('data-n') || '0', 10) || 0) + 1;
          cnt.setAttribute('data-n', n);
          cnt.textContent = (n === 1 ? '1 person found this helpful'
            : n + ' people found this helpful');
        }
        btn.textContent = '👍 Helpful ✓';
        return;
      }
      // 展开更多
      var more = t.closest ? t.closest('.rv-more') : null;
      if (more) {
        var list = more.parentNode.querySelector('.rv-list');
        if (!list) return;
        var hidden = list.querySelectorAll('.rv-item.rv-hidden');
        var step = 8;
        for (var i = 0; i < hidden.length && i < step; i++) {
          hidden[i].classList.remove('rv-hidden');
        }
        var left = list.querySelectorAll('.rv-item.rv-hidden').length;
        if (left <= 0) { more.style.display = 'none'; }
        else { more.textContent = 'Show more reviews (' + left + ')'; }
      }
    });
  })();

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', function () { convertAll(); removeCurrencySelector(); });
})();
