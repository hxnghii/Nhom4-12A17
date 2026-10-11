(function() {
  'use strict';

  // 1. Chuyển cảnh Scene 1 (Intro) -> Scene 2 (Main Site)
  const sceneIntro = document.getElementById('sceneIntro');
  const sceneMain = document.getElementById('sceneMain');
  const enterSiteBtn = document.getElementById('enterSiteBtn');
  const backToIntroBtn = document.getElementById('backToIntroBtn');

  function enterMainSite() {
    if (!sceneIntro) return;
    sceneIntro.classList.add('is-exiting');
    setTimeout(() => {
      sceneIntro.setAttribute('hidden', '');
      sceneIntro.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  }

  function returnToIntro() {
    if (!sceneIntro) return;
    sceneIntro.style.display = 'flex';
    sceneIntro.removeAttribute('hidden');
    void sceneIntro.offsetWidth;
    sceneIntro.classList.remove('is-exiting');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toggleSidebar(false);
  }

  if (enterSiteBtn) {
    enterSiteBtn.addEventListener('click', enterMainSite);
  }

  if (backToIntroBtn) {
    backToIntroBtn.addEventListener('click', returnToIntro);
  }

  // 2. Mobile sidebar toggle
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  
  function toggleSidebar(open) {
    if (open) {
      document.body.classList.add('sidebar-open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('sidebar-open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      toggleSidebar(!isExpanded);
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => toggleSidebar(false));
  }

  // 3. Smooth scroll & Close sidebar on nav click
  const navLinks = document.querySelectorAll('.sidebar .nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        toggleSidebar(false);
      }
      
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 4. Active navigation highlighting with IntersectionObserver
  const sections = Array.from(navLinks)
    .map(link => {
      const targetId = link.getAttribute('data-target');
      return targetId ? document.getElementById(targetId) : null;
    })
    .filter(section => section !== null);

  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -55% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('data-target') === id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // 5. Scroll reveal animation cho các section và card
  const revealItems = document.querySelectorAll('.reveal-item');
  if (revealItems.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.08
    });

    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('reveal-visible'));
  }

  // 6. Thanh tiến trình đọc sách & Nút lên đầu trang
  const readingProgress = document.getElementById('readingProgress');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progressPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (readingProgress) {
      readingProgress.style.width = progressPercent + '%';
    }

    if (scrollTopBtn) {
      if (scrollTop > 350) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 7. Info menu toggle
  const infoBtn = document.getElementById('infoBtn');
  const infoMenu = document.getElementById('infoMenu');
  
  function toggleInfoMenu(open) {
    if (!infoBtn || !infoMenu) return;
    if (open) {
      infoMenu.removeAttribute('hidden');
      infoBtn.setAttribute('aria-expanded', 'true');
    } else {
      infoMenu.setAttribute('hidden', '');
      infoBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (infoBtn) {
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = infoBtn.getAttribute('aria-expanded') === 'true';
      toggleInfoMenu(!isExpanded);
    });
  }

  document.addEventListener('click', (e) => {
    if (infoMenu && !infoMenu.hasAttribute('hidden')) {
      const infoContainer = e.target.closest('.info');
      if (!infoContainer) {
        toggleInfoMenu(false);
      }
    }
  });

  // 8. "Xem thêm" / "Thu gọn" thành viên nhóm
  const moreBtn = document.getElementById('moreBtn');
  const members = document.getElementById('members');
  const moreText = document.getElementById('moreText');

  if (moreBtn && members && moreText) {
    moreBtn.addEventListener('click', () => {
      const isExpanded = moreBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        members.classList.remove('expanded');
        moreBtn.setAttribute('aria-expanded', 'false');
        moreText.textContent = 'Xem thêm danh sách';
      } else {
        members.classList.add('expanded');
        moreBtn.setAttribute('aria-expanded', 'true');
        moreText.textContent = 'Thu gọn danh sách';
      }
    });
  }

  // 9. Nút Xem thêm / Thu gọn văn bản tóm tắt
  const moreBoxes = document.querySelectorAll('.more-box');
  moreBoxes.forEach(box => {
    const btn = document.createElement('button');
    btn.className = 'more-box-btn';
    btn.type = 'button';
    btn.textContent = 'Xem thêm nội dung ▼';
    
    if (box.parentNode) {
      box.parentNode.insertBefore(btn, box.nextSibling);
    }
    
    btn.addEventListener('click', () => {
      const isExpanded = box.classList.contains('expanded');
      if (isExpanded) {
        box.classList.remove('expanded');
        btn.textContent = 'Xem thêm nội dung ▼';
      } else {
        box.classList.add('expanded');
        btn.textContent = 'Thu gọn nội dung ▲';
      }
    });
  });

  // 10. Lightbox phóng to ảnh khi click
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  function openLightbox(src, caption) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightboxModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.setAttribute('hidden', '');
    if (lightboxImg) lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  const zoomableFigures = document.querySelectorAll('.zoomable-fig img');
  zoomableFigures.forEach(img => {
    img.addEventListener('click', () => {
      const figcaption = img.closest('figure') ? img.closest('figure').querySelector('figcaption') : null;
      const captionText = figcaption ? figcaption.textContent : img.getAttribute('alt');
      openLightbox(img.src, captionText);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  // 11. Escape key navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightboxModal && !lightboxModal.hasAttribute('hidden')) {
        closeLightbox();
      }
      if (window.innerWidth <= 1024 && document.body.classList.contains('sidebar-open')) {
        toggleSidebar(false);
      }
      if (infoMenu && !infoMenu.hasAttribute('hidden')) {
        toggleInfoMenu(false);
      }
    }
  });

  // 12. Fallback ảnh lỗi
  const images = document.querySelectorAll('img[data-img]');
  images.forEach(img => {
    img.addEventListener('error', () => {
      img.classList.add('img-error');
      if (img.parentElement && img.parentElement.tagName.toLowerCase() === 'figure') {
        img.parentElement.classList.add('img-error');
      }
    });
  });

  // 13. Tự đóng sidebar khi phóng to cửa sổ
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && document.body.classList.contains('sidebar-open')) {
      toggleSidebar(false);
    }
  });

})();
