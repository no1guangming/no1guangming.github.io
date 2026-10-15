/*
 * app.js - vanilla JS, no jQuery (2026 refactor)
 * 负责：① 移动端汉堡菜单折叠 ② 返回顶部 ③ .ltbox 图片灯箱
 * 原实现依赖 jQuery + bootstrap.min.js + magnific-popup（约 135KB），
 * 现全部用原生 API 等价实现。
 */
(function () {
  'use strict';

  /* ---------- ① 移动端折叠菜单（等价 bootstrap collapse） ---------- */
  // mobilemenu.html 的按钮: data-toggle="collapse" data-target=".navbar-responsive-collapse"
  // bootstrap 的折叠本质就是切换目标元素的 .in 类（配合 bootstrap.css 的显隐样式）
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-toggle="collapse"]');
    if (!btn) return;
    var targets = document.querySelectorAll(btn.getAttribute('data-target'));
    for (var i = 0; i < targets.length; i++) {
      targets[i].classList.toggle('in');
    }
    btn.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', String(targets[0].classList.contains('in')));
  });

  /* ---------- ② 返回顶部按钮 ---------- */
  var toTop = document.querySelector('.scrollToTop');
  if (toTop) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        toTop.style.display = window.scrollY > 100 ? 'block' : 'none';
        ticking = false;
      });
    }, { passive: true });
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- ③ 轻量图片灯箱（等价 magnific-popup 的图片模式） ---------- */
  // 用法不变：任意 <a class="ltbox" href="大图"><img ...></a>
  var overlay = null;
  function openLightbox(src, alt) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'vanilla-lightbox';
      overlay.innerHTML =
        '<button class="vl-close" type="button" aria-label="关闭">&times;</button>' +
        '<img class="vl-img" alt="">';
      overlay.addEventListener('click', closeLightbox);
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') closeLightbox();
      });
      document.body.appendChild(overlay);
    }
    overlay.querySelector('.vl-img').src = src;
    overlay.querySelector('.vl-img').alt = alt || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a.ltbox');
    if (!link) return;
    e.preventDefault();
    var img = link.querySelector('img');
    openLightbox(link.getAttribute('href'), img ? img.alt : link.title);
  });
})();
