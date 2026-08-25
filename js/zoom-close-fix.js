/* zoom-close-fix.js
 * 修复克隆 ShopLazza 站点后，产品页主图放大层(#zoomed)无法关闭的问题。
 * 原站关闭逻辑依赖缺失的外部运行时 JS，本文件用事件委托兜底：
 *   - 点击 .zoomed_close 关闭按钮
 *   - 点击放大层背景(#zoomed 自身 / .support-zoom-slick 容器)
 *   - 按 ESC 键
 * 仅在 #zoomed 存在时生效，对正常页面无副作用。
 */
(function () {
  function closeZoom() {
    var z = document.getElementById('zoomed');
    if (z) z.remove();
    document.body.classList.remove('scroll-disabled');
    document.documentElement.classList.remove('scroll-disabled');
  }
  function closest(el, sel) {
    while (el && el.nodeType === 1) {
      if (el.classList && el.classList.contains(sel.replace(/^\./, ''))) return el;
      el = el.parentNode;
    }
    return null;
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.nodeType) return;
    // 1) 关闭按钮
    if (closest(t, '.zoomed_close')) {
      e.preventDefault();
      closeZoom();
      return;
    }
    // 2) 放大层背景本身
    if (t.id === 'zoomed') {
      e.preventDefault();
      closeZoom();
      return;
    }
    // 3) 内容容器背景(非图片/控件)
    if (closest(t, '.support-zoom-slick')) {
      // 点到图片或控件不关
      if (t.tagName === 'IMG' || closest(t, 'a') || closest(t, '.slide-arrow')) return;
      e.preventDefault();
      closeZoom();
      return;
    }
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) closeZoom();
  });
})();
