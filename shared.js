/**
 * shared.js — قدراتك Apple Redesign
 * Theme toggle · Page transitions · Mobile menu · Scroll animations · Touch gestures
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     01  Theme Toggle (Dark / Light)
     ═══════════════════════════════════════════════════════════════ */
  const THEME_KEY = 'qd-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function getSavedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  function updateThemeIcons(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const darkIcon = btn.querySelector('.theme-icon-dark');
      const lightIcon = btn.querySelector('.theme-icon-light');
      if (darkIcon && lightIcon) {
        darkIcon.style.display = theme === 'dark' ? 'none' : '';
        lightIcon.style.display = theme === 'dark' ? '' : 'none';
      }
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن');
      btn.setAttribute('title', theme === 'dark' ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن');
    }
    updateThemeIcons(theme);

    // Update logo images if they exist
    const logos = document.querySelectorAll('[data-logo-theme]');
    logos.forEach(img => {
      const lightSrc = img.dataset.logoLight;
      const darkSrc = img.dataset.logoDark;
      if (lightSrc && darkSrc) {
        img.src = theme === 'dark' ? darkSrc : lightSrc;
      }
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  }

  function initTheme() {
    const saved = getSavedTheme();
    const theme = saved || (prefersDark.matches ? 'dark' : 'light');
    applyTheme(theme);
  }

  /* ═══════════════════════════════════════════════════════════════
     02  Page Transitions
     ═══════════════════════════════════════════════════════════════ */
  function initPageTransitions() {
    // Create transition overlay if not exists
    let overlay = document.querySelector('.page-transition');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }

    // Intercept internal link clicks
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      // Only intercept relative links that aren't anchors
      if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        link.addEventListener('click', function (e) {
          // Skip if modifier keys pressed
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          overlay.classList.add('is-active');
          setTimeout(() => {
            window.location.href = href;
          }, 250);
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     03  Page Load Animations
     ═══════════════════════════════════════════════════════════════ */
  function initPageAnimations() {
    // Fade in body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 500ms cubic-bezier(0.32, 0.72, 0, 1)';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });

    // Staggered entrance for cards and sections
    const animatedElements = document.querySelectorAll(
      '.hero, .kpi, .card, .quick__item, .attention__item, .decision, .bar, .contact__row'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 600ms cubic-bezier(0.32, 0.72, 0, 1) ${i * 60}ms, transform 600ms cubic-bezier(0.32, 0.72, 0, 1) ${i * 60}ms`;
      observer.observe(el);
    });

    // Add is-visible styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      .is-visible { opacity: 1 !important; transform: translateY(0) !important; }
    `;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════════════════════════════
     04  Mobile Menu Toggle
     ═══════════════════════════════════════════════════════════════ */
  function initMobileMenu() {
    let scrim = null;

    function createScrim() {
      if (!scrim) {
        scrim = document.createElement('div');
        scrim.className = 'sidebar-scrim';
        scrim.setAttribute('aria-hidden', 'true');
        // Insert before sidebar so it's behind it
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.parentNode) {
          sidebar.parentNode.insertBefore(scrim, sidebar);
        } else {
          document.body.appendChild(scrim);
        }
        // Click scrim to close
        scrim.addEventListener('click', closeSidebar);
      }
    }

    function removeScrim() {
      if (scrim) {
        scrim.classList.remove('is-visible');
        // Wait for transition then remove from DOM
        setTimeout(() => {
          if (scrim && scrim.parentNode) {
            scrim.parentNode.removeChild(scrim);
          }
          scrim = null;
        }, 300);
      }
    }

    function openSidebar() {
      const sidebar = document.querySelector('.sidebar');
      const toggle = document.querySelector('.mobile-menu-toggle');
      if (sidebar) {
        createScrim();
        // Force reflow
        void scrim.offsetWidth;
        scrim.classList.add('is-visible');
        sidebar.classList.add('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeSidebar() {
      const sidebar = document.querySelector('.sidebar');
      const toggle = document.querySelector('.mobile-menu-toggle');
      if (sidebar) {
        sidebar.classList.remove('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        removeScrim();
      }
    }

    function toggleSidebar() {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && sidebar.classList.contains('is-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }

    // Bind toggle buttons
    const toggles = document.querySelectorAll('.mobile-menu-toggle');
    toggles.forEach(btn => {
      btn.addEventListener('click', toggleSidebar);
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.sidebar');
      const toggle = document.querySelector('.mobile-menu-toggle');
      if (sidebar && sidebar.classList.contains('is-open')) {
        if (!sidebar.contains(e.target) && (!toggle || !toggle.contains(e.target))) {
          closeSidebar();
        }
      }
    });

    // Close sidebar on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('is-open')) {
          closeSidebar();
        }
      }
    });

    // Swipe to close sidebar (RTL: swipe right to close)
    let touchStartX = 0;
    let touchEndX = 0;
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      sidebar.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        // RTL: swipe right to close (sidebar is on the right)
        if (touchEndX - touchStartX > 60) {
          closeSidebar();
        }
      }, { passive: true });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     05  Smooth scroll for anchor links
     ═══════════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     06  Live clock (if element exists)
     ═══════════════════════════════════════════════════════════════ */
  function initClock() {
    const clock = document.getElementById('liveClock');
    if (!clock) return;
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      clock.textContent = h + ':' + m;
    }
    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════════════════════════
     07  Hover 3D tilt effect for cards (subtle)
     ═══════════════════════════════════════════════════════════════ */
  function initCardTilt() {
    const cards = document.querySelectorAll('.kpi, .quick__item');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const dx = (x - cx) / cx;
        const dy = (y - cy) / cy;
        card.style.transform = `translateY(-4px) perspective(600px) rotateX(${-dy * 2}deg) rotateY(${dx * 2}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     08  Initialize everything
     ═══════════════════════════════════════════════════════════════ */
  function init() {
    initTheme();
    initPageTransitions();
    initPageAnimations();
    initMobileMenu();
    initSmoothScroll();
    initClock();
    initCardTilt();

    // Bind theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
      if (!getSavedTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
