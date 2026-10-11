/* =========================================================
   SCENE 1 → SCENE 2 : màn hình chào "Tìm Hiểu" → trang chính
   Phát sự kiện  document 'scene:main'  /  'scene:intro'
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;
  var intro = doc.getElementById('intro');
  var btn = doc.getElementById('enterBtn');
  if (!intro || !btn) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var busy = false;
  var timers = [];

  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function emit(name) {
    doc.dispatchEvent(new CustomEvent(name));
  }

  /* ---------- Vào trang chính (scene 2) ---------- */
  function showMain(skipAnimation) {
    clearTimers();
    body.classList.remove('is-intro');
    body.classList.add('scene-main');
    if (!location.hash || location.hash.length < 2) window.scrollTo(0, 0);
    intro.hidden = true;
    busy = false;
    emit('scene:main');
  }

  function enter() {
    if (busy || intro.hidden || body.classList.contains('scene-main')) return;
    busy = true;
    intro.classList.add('is-leaving');
    btn.blur();

    var tSwap = reduce ? 30 : 640;    // lúc ánh sáng loé sáng nhất → đổi cảnh
    var tEnd = reduce ? 120 : 1250;   // intro đã mờ hẳn → ẩn
    later(function () {
      body.classList.remove('is-intro');
      body.classList.add('scene-main');
      window.scrollTo(0, 0);
      emit('scene:main');
    }, tSwap);
    later(function () {
      intro.hidden = true;
      busy = false;
    }, tEnd);
  }

  /* ---------- Quay lại màn hình chào ---------- */
  function showIntro() {
    if (busy || !intro.hidden) return;
    busy = true;
    clearTimers();
    window.scrollTo(0, 0);
    body.classList.remove('scene-main');
    body.classList.add('is-intro');
    intro.classList.remove('is-leaving', 'is-ready');
    intro.hidden = false;
    void intro.offsetWidth;                // chạy lại animation từ đầu
    intro.classList.add('is-ready');
    emit('scene:intro');
    later(function () {
      busy = false;
      try { btn.focus({ preventScroll: true }); } catch (e) { /* bỏ qua */ }
    }, reduce ? 50 : 2300);
  }

  window.Scene = { enter: enter, showIntro: showIntro, showMain: showMain };

  /* ---------- Mở link có #mục → bỏ qua intro ---------- */
  if (root.classList.contains('skip-intro') || body.classList.contains('scene-main')) {
    intro.hidden = true;
    body.classList.remove('is-intro');
    body.classList.add('scene-main');
    return;
  }

  /* ---------- Chờ ảnh intro tải xong rồi mới chạy animation ---------- */
  var imgs = Array.prototype.slice.call(intro.querySelectorAll('img'));
  var started = false;
  function ready() {
    if (started) return;
    started = true;
    intro.classList.remove('is-loading');
    intro.classList.add('is-ready');
    later(function () {
      try { btn.focus({ preventScroll: true }); } catch (e) { /* bỏ qua */ }
    }, reduce ? 50 : 2400);
  }

  var pending = imgs.filter(function (im) { return !(im.complete && im.naturalWidth > 0); });
  if (!pending.length) {
    ready();
  } else {
    var left = pending.length;
    var done = function () { if (--left <= 0) ready(); };
    pending.forEach(function (im) {
      im.addEventListener('load', done, { once: true });
      im.addEventListener('error', done, { once: true });
    });
    setTimeout(ready, 3500);              // mạng chậm cũng không bị kẹt
  }

  /* ---------- Nút bấm ---------- */
  btn.addEventListener('click', enter);

  // Bấm Enter / Space ở bất cứ đâu trên intro cũng vào được
  doc.addEventListener('keydown', function (e) {
    if (intro.hidden || busy) return;
    if ((e.key === 'Enter' || e.key === ' ') && e.target === body) {
      e.preventDefault();
      enter();
    }
  });

  /* ---------- Parallax nhẹ theo con trỏ (chỉ chuột, không làm trên điện thoại) ---------- */
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    var raf = 0, tx = 0, ty = 0;
    intro.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - .5) * 2;
      ty = (e.clientY / window.innerHeight - .5) * 2;
      if (!raf) {
        raf = requestAnimationFrame(function () {
          raf = 0;
          intro.style.setProperty('--px', (-tx).toFixed(3));
          intro.style.setProperty('--py', (-ty).toFixed(3));
        });
      }
    }, { passive: true });
  }
})();
