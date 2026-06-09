/* =========================================================
   FULY KIDS · ANIMACIONES AUXILIARES
   Custom Elements para marquee seamless, reveal on scroll y
   utilidades que el tema Taste no cubre.

   Namespace: todos los elementos y eventos usan prefijo fuly-*
   para evitar colisiones con pubsub del tema.
   ========================================================= */

(function () {
  'use strict';

  // ---- Utilidades --------------------------------------------------
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- 1) fuly-marquee · clona contenido para loop seamless --------
  class FulyMarquee extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      if (prefersReducedMotion) {
        this.style.setProperty('--fuly-marquee-state', 'paused');
        return;
      }
      const track = this.querySelector('.fuly-marquee__track');
      if (!track) return;
      // Clonar contenido para loop seamless (animación usa -50%)
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      this.appendChild(clone);
    }
  }

  if (!customElements.get('fuly-marquee')) {
    customElements.define('fuly-marquee', FulyMarquee);
  }

  // ---- 2) fuly-reveal · IntersectionObserver para .fuly-reveal -----
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fuly-reveal--visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    );

    const initReveal = () => {
      document.querySelectorAll('.fuly-reveal:not(.fuly-reveal--visible)').forEach((el) => {
        revealObserver.observe(el);
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initReveal);
    } else {
      initReveal();
    }

    // Re-escanear cuando el editor de Shopify recarga una sección
    document.addEventListener('shopify:section:load', initReveal);
  }

  // ---- 3) Utility · mostrar WhatsApp FAB solo tras scroll 200px ----
  // El FAB ya vive siempre visible; pero opcional: ocultarlo en footer.
  const initWhatsappVisibility = () => {
    const fab = document.querySelector('.fuly-whatsapp-fab, .whatsapp-float');
    if (!fab) return;
    let lastScroll = 0;
    const footer = document.querySelector('.footer');

    const onScroll = () => {
      if (!footer) return;
      const footerTop = footer.getBoundingClientRect().top;
      const vh = window.innerHeight;
      if (footerTop < vh - 80) {
        fab.style.opacity = '0.3';
        fab.style.pointerEvents = 'none';
      } else {
        fab.style.opacity = '';
        fab.style.pointerEvents = '';
      }
      lastScroll = window.scrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsappVisibility);
  } else {
    initWhatsappVisibility();
  }

  // ---- 4) Auto-rotar announcement bar si no tiene auto_rotate -----
  // El tema Taste ya hace auto-rotate vía slideshow-component cuando
  // data-autoplay="true". Nosotros aseguramos que si el merchant tiene
  // > 1 announcement, se active aunque olvide el toggle.
  const initAnnouncementRotator = () => {
    const slider = document.querySelector('.announcement-bar-slider .slider');
    if (!slider) return;
    if (slider.dataset.autoplay === 'true') return; // ya gestionado
    const slides = slider.querySelectorAll('.slider__slide');
    if (slides.length < 2) return;

    const speed = Number(slider.dataset.speed || 5) * 1000;
    let current = 0;

    const show = (idx) => {
      slides.forEach((s, i) => {
        s.style.opacity = i === idx ? '1' : '0';
        s.style.position = i === idx ? 'relative' : 'absolute';
        s.style.transition = 'opacity 0.3s ease';
        s.style.inset = i === idx ? 'auto' : '0';
        s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      });
    };

    show(0);
    setInterval(() => {
      current = (current + 1) % slides.length;
      show(current);
    }, speed);
  };

  if (!prefersReducedMotion) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAnnouncementRotator);
    } else {
      initAnnouncementRotator();
    }
  }
})();
