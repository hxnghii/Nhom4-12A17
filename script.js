/* Cánh đồng bất tận & Cỏ lau | Tổ 4 - 12A17
   Điều hướng trang, menu điện thoại, nút "i", hiệu ứng mở/đóng mượt. */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile = matchMedia('(max-width: 860px)');
  const EASE = 'cubic-bezier(.4, 0, .2, 1)';

  /* ---------- Tiện ích ---------- */

  // Cuộn lên đầu ngay lập tức (bỏ qua scroll-behavior: smooth của CSS)
  function jumpToTop() {
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = '';
  }

  // Tạo chuyển động chiều cao giữa hai giá trị đã đo
  function animateSize(el, from, to, prop = 'height') {
    if (reduceMotion.matches || from === to) return Promise.resolve();
    el.getAnimations().forEach(a => a.cancel());
    el.style.overflow = 'hidden';
    const anim = el.animate({ [prop]: [`${from}px`, `${to}px`] }, { duration: 360, easing: EASE });
    const done = () => { el.style.overflow = ''; };
    anim.addEventListener('finish', done);
    anim.addEventListener('cancel', done);
    return anim.finished.catch(() => {});
  }

  /* ---------- Chuyển trang (một trang hiển thị mỗi lần) ---------- */

  const pages = $$('.page');
  const navLinks = $$('.nav a[data-target]');
  const pageIds = new Set(pages.map(p => p.id));
  const DEFAULT_PAGE = pages.length ? pages[0].id : '';
  let currentId = null;

  function showPage(id, { push = true } = {}) {
    if (!pageIds.has(id)) id = DEFAULT_PAGE;

    if (id !== currentId) {
      pages.forEach(p => p.classList.toggle('active', p.id === id));
      navLinks.forEach(a => {
        const on = a.dataset.target === id;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
      currentId = id;
      jumpToTop();
    } else {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    if (push && location.hash !== `#${id}`) history.pushState({ id }, '', `#${id}`);
  }

  // Mọi link nội bộ trỏ tới một trang đều đi qua showPage
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!pageIds.has(id)) return;
    e.preventDefault();
    showPage(id);
    setMenu(false);
  });

  window.addEventListener('popstate', () => showPage(location.hash.slice(1), { push: false }));

  /* ---------- Menu 3 gạch (điện thoại) ---------- */

  const menuBtn = $('#menuBtn');
  const sidebar = $('#sidebar');
  const overlay = $('#overlay');

  function syncSidebarFocus() {
    // Khi sidebar trượt ra ngoài màn hình, không cho Tab chui vào
    if (sidebar) sidebar.inert = isMobile.matches && !sidebar.classList.contains('open');
  }

  function setMenu(open) {
    if (!menuBtn || !sidebar) return;
    sidebar.classList.toggle('open', open);
    overlay?.classList.toggle('show', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    document.body.classList.toggle('no-scroll', open);
    syncSidebarFocus();
  }

  menuBtn?.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  overlay?.addEventListener('click', () => setMenu(false));
  isMobile.addEventListener('change', () => { setMenu(false); syncSidebarFocus(); });
  syncSidebarFocus();

  /* ---------- Nút "i" ở góc phải ---------- */

  const infoBtn = $('#infoBtn');
  const infoMenu = $('#infoMenu');
  let infoTimer = 0;

  function setInfo(open, { restoreFocus = false } = {}) {
    if (!infoBtn || !infoMenu) return;
    clearTimeout(infoTimer);
    infoBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      infoMenu.hidden = false;
      requestAnimationFrame(() => infoMenu.classList.add('show'));
    } else {
      infoMenu.classList.remove('show');
      infoTimer = setTimeout(() => { infoMenu.hidden = true; }, reduceMotion.matches ? 0 : 170);
      if (restoreFocus) infoBtn.focus();
    }
  }

  infoBtn?.addEventListener('click', () => setInfo(infoMenu.hidden || !infoMenu.classList.contains('show')));
  document.addEventListener('pointerdown', e => {
    if (infoMenu && !infoMenu.hidden && !e.target.closest('.info')) setInfo(false);
  });

  // Link chưa có địa chỉ thật: báo nhẹ thay vì nhảy lên đầu trang
  let toast, toastTimer = 0;
  function showToast(msg) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  infoMenu?.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;
    if (link.hasAttribute('data-todo') && link.getAttribute('href') === '#') {
      e.preventDefault();
      showToast('Link sẽ được cập nhật sau');
    }
    setInfo(false);
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (infoMenu && !infoMenu.hidden) setInfo(false, { restoreFocus: true });
    if (sidebar?.classList.contains('open')) { setMenu(false); menuBtn?.focus(); }
  });

  /* ---------- Danh sách thành viên: Xem thêm / Thu gọn ---------- */

  const groups = $('#members');
  const moreBtn = $('#moreBtn');
  const moreText = $('#moreText');

  moreBtn?.addEventListener('click', () => {
    const open = !groups.classList.contains('expanded');
    const from = groups.getBoundingClientRect().height;
    groups.classList.toggle('expanded', open);
    const to = groups.getBoundingClientRect().height;
    moreBtn.setAttribute('aria-expanded', String(open));
    if (moreText) moreText.textContent = open ? 'Thu gọn' : 'Xem thêm';
    animateSize(groups, from, to, 'height');
  });

  /* ---------- Khối văn bản dài (Tóm tắt tác phẩm): tự thêm nút Xem thêm ---------- */

  $$('.more-box').forEach((box, i) => {
    if (!box.id) box.id = `more-box-${i + 1}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', box.id);
    btn.innerHTML = '<span>Xem thêm</span><i class="chev"></i>';
    box.after(btn);

    btn.addEventListener('click', () => {
      const open = !box.classList.contains('open');
      const from = box.getBoundingClientRect().height;
      box.classList.toggle('open', open);
      const to = box.getBoundingClientRect().height;
      btn.setAttribute('aria-expanded', String(open));
      btn.firstElementChild.textContent = open ? 'Thu gọn' : 'Xem thêm';
      // max-height bị giới hạn bởi CSS nên phải chạy chuyển động trên max-height
      animateSize(box, from, to, 'maxHeight');
      if (!open && box.getBoundingClientRect().top < 0) {
        box.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    });
  });

  /* ---------- Sản phẩm (<details>): mở/đóng có chuyển động ---------- */

  $$('details.product').forEach(details => {
    const summary = $('summary', details);
    const body = $('.p-body', details);
    if (!summary || !body) return;

    const collapsed = { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 };
    const fullFrame = () => {
      const cs = getComputedStyle(body);
      return { height: `${body.offsetHeight}px`, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, opacity: 1 };
    };

    summary.addEventListener('click', e => {
      e.preventDefault();
      body.getAnimations().forEach(a => a.cancel());

      if (reduceMotion.matches) { details.open = !details.open; return; }

      body.style.overflow = 'hidden';
      const cleanup = () => { body.style.overflow = ''; };

      if (!details.open) {
        details.open = true;
        body.animate([collapsed, fullFrame()], { duration: 320, easing: EASE })
          .addEventListener('finish', cleanup);
      } else {
        const anim = body.animate([fullFrame(), collapsed], { duration: 260, easing: EASE });
        anim.addEventListener('finish', () => { details.open = false; cleanup(); });
        anim.addEventListener('cancel', cleanup);
      }
    });
  });

  /* ---------- Ảnh: tải lười + hiện khung nhắc khi thiếu ảnh ---------- */

  $$('img[data-img]').forEach(img => {
    img.loading = 'lazy';
    img.decoding = 'async';
    const markMissing = () => img.classList.add('missing');
    img.addEventListener('error', markMissing);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markMissing();
  });

  /* ---------- Khởi động ---------- */

  // Tự xử lý vị trí cuộn, tránh trình duyệt nhảy tới neo (#id) làm tiêu đề bị cắt
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  showPage(location.hash.slice(1) || DEFAULT_PAGE, { push: false });
  window.addEventListener('load', () => requestAnimationFrame(jumpToTop), { once: true });
})();
