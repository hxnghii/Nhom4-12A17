/* =========================================================
   SCENE 2 — TRANG CHÍNH : điều hướng, hiệu ứng cuộn, xem ảnh lớn…
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var $ = function (id) { return doc.getElementById(id); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE = 768;   // khớp breakpoint trong CSS

  /* ---------- 1. Menu 3 gạch (điện thoại) ---------- */
  var menuBtn = $('menuBtn');
  var overlay = $('overlay');

  function toggleSidebar(open) {
    body.classList.toggle('sidebar-open', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    }
  }
  if (menuBtn) menuBtn.addEventListener('click', function () {
    toggleSidebar(!body.classList.contains('sidebar-open'));
  });
  if (overlay) overlay.addEventListener('click', function () { toggleSidebar(false); });

  /* ---------- 2. Điều hướng + cuộn mượt ---------- */
  var navLinks = $$('.sidebar .nav a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (window.innerWidth <= MOBILE) toggleSidebar(false);
      if (id && id.charAt(0) === '#') {
        var target = doc.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', id);
        }
      }
    });
  });

  /* ---------- 3. Làm nổi mục đang xem ---------- */
  var sections = navLinks
    .map(function (l) { return $(l.getAttribute('data-target')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navLinks.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('data-target') === id);
        });
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- 4. Nút "i" ---------- */
  var info = $('info');
  var infoBtn = $('infoBtn');

  function toggleInfo(open) {
    if (!info || !infoBtn) return;
    info.classList.toggle('open', open);
    infoBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (infoBtn) {
    infoBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleInfo(!info.classList.contains('open'));
    });
  }
  doc.addEventListener('click', function (e) {
    if (info && info.classList.contains('open') && !e.target.closest('.info')) toggleInfo(false);
  });

  /* ---------- 5. "Xem thêm / Thu gọn" ---------- */
  // đo chiều cao thật để max-height chạy mượt
  function measure(el) {
    el.style.setProperty('--full-h', el.scrollHeight + 'px');
  }

  var moreBtn = $('moreBtn');
  var members = $('members');
  var moreText = $('moreText');
  if (moreBtn && members && moreText) {
    measure(members);
    moreBtn.addEventListener('click', function () {
      measure(members);
      var open = moreBtn.getAttribute('aria-expanded') !== 'true';
      members.classList.toggle('expanded', open);
      moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      moreText.textContent = open ? 'Thu gọn' : 'Xem thêm';
    });
  }

  $$('.more-box').forEach(function (box) {
    measure(box);
    var b = doc.createElement('button');
    b.type = 'button';
    b.className = 'more-box-btn';
    b.setAttribute('aria-expanded', 'false');
    b.textContent = 'Xem thêm ▼';
    box.parentNode.insertBefore(b, box.nextSibling);
    b.addEventListener('click', function () {
      measure(box);
      var open = !box.classList.contains('expanded');
      box.classList.toggle('expanded', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.textContent = open ? 'Thu gọn ▲' : 'Xem thêm ▼';
    });
  });

  window.addEventListener('resize', function () {
    $$('.groups, .more-box').forEach(measure);
    if (window.innerWidth > MOBILE && body.classList.contains('sidebar-open')) toggleSidebar(false);
  });
  window.addEventListener('load', function () { $$('.groups, .more-box').forEach(measure); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { $$('.groups, .more-box').forEach(measure); });

  /* ---------- 6. Hiệu ứng hiện dần khi cuộn tới ---------- */
  var revealItems = [];
  var revealStarted = false;

  // gắn trạng thái "chưa hiện" ngay từ đầu (lúc trang chính còn ẩn) để không bị nháy
  function prepareReveal() {
    var items = revealItems;
    function add(sel, opts) {
      opts = opts || {};
      $$(sel).forEach(function (el, i) {
        if (el.closest('.groups') && !el.classList.contains('groups')) return;   // phần trong khung thu gọn
        if (el.closest('.more-box') && !el.classList.contains('more-box')) return;
        el.classList.add('reveal');
        if (opts.cls) el.classList.add(opts.cls);
        var idx = opts.stagger ? i % (opts.mod || 3) : 0;
        if (idx) el.style.setProperty('--rd', idx * 110 + 'ms');
        items.push(el);
      });
    }

    add('.page > h2');
    add('.page > .lead, .vs-note');
    add('.page > h3');
    add('.hero .hero-kicker');
    add('.groups, .more-btn', { cls: 'zoom' });
    add('.prose, .page > div > .points, .page > .points, .reason-note');
    add('.author-photo', { cls: 'from-left' });
    add('.events');
    add('.event', { cls: 'from-left', stagger: true });
    add('.sim-item', { cls: 'zoom', stagger: true });
    add('.diff', { cls: 'zoom', stagger: true, mod: 1 });
    add('.pdf-card', { cls: 'zoom' });
    add('.fig', { cls: 'zoom' });
    add('.product', { cls: 'zoom', stagger: true });
    add('.site-foot');
  }

  // bắt đầu quan sát khi người dùng đã vào trang chính
  function startReveal() {
    if (revealStarted) return;
    revealStarted = true;
    var items = revealItems;
    if (!('IntersectionObserver' in window) || reduce) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 7. Thanh tiến độ + nút lên đầu trang ---------- */
  var progress = $('progress');
  var toTop = $('toTop');
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    var max = doc.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (toTop) toTop.classList.toggle('show', y > 700);
    doc.documentElement.style.setProperty('--sy', Math.round(y));
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  function scrollTop() { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
  if (toTop) toTop.addEventListener('click', scrollTop);
  var footTop = $('footTop');
  if (footTop) footTop.addEventListener('click', scrollTop);

  /* ---------- 8. Quay về màn hình chào ---------- */
  var homeBtn = $('homeBtn');
  if (homeBtn) homeBtn.addEventListener('click', function () {
    toggleSidebar(false);
    if (window.Scene) window.Scene.showIntro();
  });

  /* ---------- 9. Xem ảnh lớn (lightbox) ---------- */
  var lb = $('lightbox');
  var lbImg = $('lbImg');
  var lbCap = $('lbCap');
  var lbList = [];
  var lbIndex = 0;
  var lbOpener = null;

  function figureOf(img) { return img.closest('figure'); }
  function captionOf(img) {
    var f = figureOf(img);
    var c = f && f.querySelector('figcaption');
    return (c && c.textContent.trim()) || img.alt || '';
  }

  function lbShow(i, animate) {
    var img = lbList[i];
    if (!img) return;
    lbIndex = i;
    lbCap.textContent = captionOf(img) + (lbList.length > 1 ? '  ·  ' + (i + 1) + '/' + lbList.length : '');
    function apply() {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbImg.classList.remove('swap');
    }
    if (animate) {
      lbImg.classList.add('swap');
      setTimeout(apply, 120);
    } else {
      apply();
    }
  }

  function lbOpen(img, opener) {
    var group = img.getAttribute('data-group');
    lbList = $$('img[data-zoom]').filter(function (im) { return im.getAttribute('data-group') === group; });
    var i = lbList.indexOf(img);
    if (i < 0) { lbList = [img]; i = 0; }
    lb.classList.toggle('single', lbList.length < 2);
    lbOpener = opener || null;
    lbShow(i, false);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
    $('lbClose').focus({ preventScroll: true });
  }

  function lbClose() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    if (lbOpener) { try { lbOpener.focus({ preventScroll: true }); } catch (e) { /* bỏ qua */ } }
  }
  function lbStep(d) {
    if (lbList.length < 2) return;
    lbShow((lbIndex + d + lbList.length) % lbList.length, true);
  }

  if (lb && lbImg) {
    $$('img[data-zoom]').forEach(function (img) {
      var host = figureOf(img);
      if (!host) return;
      host.addEventListener('click', function () { lbOpen(img, host); });
      host.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lbOpen(img, host); }
      });
    });
    $('lbClose').addEventListener('click', lbClose);
    $('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); lbStep(-1); });
    $('lbNext').addEventListener('click', function (e) { e.stopPropagation(); lbStep(1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb-fig')) lbClose();
    });

    // vuốt trái / phải trên điện thoại
    var sx = 0, sy = 0;
    lb.addEventListener('touchstart', function (e) {
      sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) lbStep(dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.6) lbClose();   // vuốt xuống để đóng
    }, { passive: true });
  }

  /* ---------- 10. Bàn phím ---------- */
  doc.addEventListener('keydown', function (e) {
    if (lb && lb.classList.contains('open')) {
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbStep(-1);
      else if (e.key === 'ArrowRight') lbStep(1);
      return;
    }
    if (e.key === 'Escape') {
      if (body.classList.contains('sidebar-open')) toggleSidebar(false);
      if (info && info.classList.contains('open')) toggleInfo(false);
    }
  });

  /* ---------- 11. Gợn sóng khi bấm nút ---------- */
  $$('.more-btn, .more-box-btn, .home-btn, .nav a, .pdf-btn').forEach(attachRipple);
  doc.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.more-box-btn');
    if (b && !b.classList.contains('ripple-host')) attachRipple(b, e);
  });

  function attachRipple(el, firstEvent) {
    el.classList.add('ripple-host');
    function spawn(e) {
      if (reduce) return;
      var r = el.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2;
      var s = doc.createElement('span');
      s.className = 'ripple';
      s.style.width = s.style.height = size + 'px';
      s.style.left = (e.clientX - r.left - size / 2) + 'px';
      s.style.top = (e.clientY - r.top - size / 2) + 'px';
      el.appendChild(s);
      setTimeout(function () { s.remove(); }, 700);
    }
    el.addEventListener('pointerdown', spawn);
    if (firstEvent) spawn(firstEvent);
  }

  /* ---------- 12. Ảnh lỗi ---------- */
  $$('img[data-img]').forEach(function (img) {
    function fail() {
      img.classList.add('img-error');
      var f = figureOf(img);
      if (f) f.classList.add('img-error');
    }
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
  });

  /* ---------- 13. Khởi động hiệu ứng khi vào scene 2 ---------- */
  function onMain() {
    // chờ trang chính hiện ra rồi mới bắt đầu "hiện dần", để thấy được hiệu ứng
    setTimeout(startReveal, reduce ? 0 : 750);
    setTimeout(function () { $$('.groups, .more-box').forEach(measure); }, 900);
  }
  prepareReveal();
  doc.addEventListener('scene:main', onMain);
  if (body.classList.contains('scene-main')) onMain();
})();
