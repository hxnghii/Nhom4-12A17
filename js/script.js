(function() {
  'use strict';

  // 1. Mobile sidebar toggle
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

  // 2. Close sidebar on nav click & 7. Smooth scroll
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

  // 3. Active navigation highlighting
  const sections = Array.from(navLinks)
    .map(link => {
      const targetId = link.getAttribute('data-target');
      return targetId ? document.getElementById(targetId) : null;
    })
    .filter(section => section !== null);

  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
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

  // 4. Info menu toggle
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

  // 5. "Xem thêm" / "Thu gọn" members toggle
  const moreBtn = document.getElementById('moreBtn');
  const members = document.getElementById('members');
  const moreText = document.getElementById('moreText');

  if (moreBtn && members && moreText) {
    moreBtn.addEventListener('click', () => {
      const isExpanded = moreBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        members.classList.remove('expanded');
        moreBtn.setAttribute('aria-expanded', 'false');
        moreText.textContent = 'Xem thêm';
      } else {
        members.classList.add('expanded');
        moreBtn.setAttribute('aria-expanded', 'true');
        moreText.textContent = 'Thu gọn';
      }
    });
  }

  // 6. More-box expand/collapse
  const moreBoxes = document.querySelectorAll('.more-box');
  moreBoxes.forEach(box => {
    const btn = document.createElement('button');
    btn.className = 'more-box-btn';
    btn.type = 'button';
    btn.style.marginTop = '1rem';
    btn.style.cursor = 'pointer';
    btn.style.background = 'none';
    btn.style.border = 'none';
    btn.style.fontWeight = 'bold';
    btn.textContent = 'Xem thêm ▼';
    
    if (box.parentNode) {
      box.parentNode.insertBefore(btn, box.nextSibling);
    }
    
    btn.addEventListener('click', () => {
      const isExpanded = box.classList.contains('expanded');
      if (isExpanded) {
        box.classList.remove('expanded');
        btn.textContent = 'Xem thêm ▼';
      } else {
        box.classList.add('expanded');
        btn.textContent = 'Thu gọn ▲';
      }
    });
  });

  // 8. Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (window.innerWidth <= 1024 && document.body.classList.contains('sidebar-open')) {
        toggleSidebar(false);
      }
      if (infoMenu && !infoMenu.hasAttribute('hidden')) {
        toggleInfoMenu(false);
      }
    }
  });

  // 9. Image error handling
  const images = document.querySelectorAll('img[data-img]');
  images.forEach(img => {
    img.addEventListener('error', () => {
      img.classList.add('img-error');
      if (img.parentElement && img.parentElement.tagName.toLowerCase() === 'figure') {
        img.parentElement.classList.add('img-error');
      }
    });
  });

  // 10. Resize handling
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && document.body.classList.contains('sidebar-open')) {
      toggleSidebar(false);
    }
  });

})();
