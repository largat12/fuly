/* === FULY Header behaviors ===========================================
 *  Vanilla ES6+ — no jQuery, no external deps.
 *  Listeners attached on DOMContentLoaded.
 * ====================================================================== */
(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* ------------------------------------------------------------------ *
   * 1. Announcement rotation
   * ------------------------------------------------------------------ */
  function initAnnouncementRotation(header) {
    var bar = header.querySelector('[data-fuly-announcement]');
    if (!bar) return;
    var items = bar.querySelectorAll('[data-fuly-announcement-item]');
    if (!items || items.length < 2) return;

    var rotationMs = parseInt(header.getAttribute('data-rotation-ms'), 10);
    var fadeMs = parseInt(header.getAttribute('data-fade-ms'), 10);
    if (!rotationMs || isNaN(rotationMs)) rotationMs = 5000;
    if (!fadeMs || isNaN(fadeMs)) fadeMs = 300;

    var index = 0;
    setInterval(function () {
      var current = items[index];
      if (current) current.removeAttribute('data-active');
      setTimeout(function () {
        index = (index + 1) % items.length;
        var next = items[index];
        if (next) next.setAttribute('data-active', '');
      }, fadeMs);
    }, rotationMs);
  }

  /* ------------------------------------------------------------------ *
   * 2. Desktop "Más" dropdown
   * ------------------------------------------------------------------ */
  function initDesktopMore(header) {
    var more = header.querySelector('[data-fuly-more]');
    if (!more) return;
    var trigger = more.querySelector('[data-fuly-more-trigger]');
    var panel = more.querySelector('[data-fuly-more-panel]');
    if (!trigger || !panel) return;

    function open() {
      panel.removeAttribute('hidden');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      panel.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function isOpen() {
      return !panel.hasAttribute('hidden');
    }

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen()) {
        close();
      } else {
        open();
      }
    });

    document.addEventListener('mousedown', function (e) {
      if (!isOpen()) return;
      if (more.contains(e.target)) return;
      close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        close();
        if (trigger && typeof trigger.focus === 'function') trigger.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. Mobile fullscreen menu open/close
   * ------------------------------------------------------------------ */
  function initMobileMenu(header) {
    var hamburger = header.querySelector('[data-fuly-hamburger]');
    var overlay = header.querySelector('[data-fuly-mobile-menu]');
    var closeBtn = header.querySelector('[data-fuly-mobile-close]');
    if (!hamburger || !overlay) return;

    function isOpen() {
      return overlay.hasAttribute('data-open');
    }
    function open() {
      header.setAttribute('data-mobile-open', '');
      overlay.removeAttribute('hidden');
      overlay.setAttribute('data-open', '');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      header.removeAttribute('data-mobile-open');
      overlay.removeAttribute('data-open');
      overlay.setAttribute('hidden', '');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function (e) {
      e.preventDefault();
      if (isOpen()) {
        close();
      } else {
        open();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        close();
      });
    }

    overlay.addEventListener('click', function (e) {
      var target = e.target;
      if (!target) return;
      var anchor = target.closest ? target.closest('a') : null;
      if (anchor && overlay.contains(anchor)) {
        close();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        close();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. Mobile "Más" accordion (inside overlay)
   * ------------------------------------------------------------------ */
  function initMobileMore(header) {
    var trigger = header.querySelector('[data-fuly-mobile-more-trigger]');
    var panel = header.querySelector('[data-fuly-mobile-more-panel]');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('hidden', '');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 5. Cart icon → Dawn cart-drawer
   * ------------------------------------------------------------------ */
  function openDawnCartDrawer() {
    var drawer = document.querySelector('cart-drawer');
    if (!drawer) {
      window.location.href = '/cart';
      return;
    }
    if (typeof drawer.open === 'function') {
      try { drawer.open(); return; } catch (err) { /* fall through */ }
    }
    try {
      drawer.dispatchEvent(new CustomEvent('cart:open', { bubbles: true }));
    } catch (err) { /* ignore */ }
    drawer.classList.add('active');
  }

  function initCartButton(header) {
    var cartBtn = header.querySelector('[data-fuly-cart]');
    if (!cartBtn) return;
    cartBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openDawnCartDrawer();
    });
  }

  function updateCartBadge(header, count) {
    var badge = header.querySelector('[data-fuly-cart-count]');
    if (!badge) return;
    var n = parseInt(count, 10);
    if (isNaN(n) || n < 0) n = 0;
    badge.textContent = String(n);
    if (n > 0) {
      badge.removeAttribute('hidden');
    } else {
      badge.setAttribute('hidden', '');
    }
  }

  function initCartBadgeSync(header) {
    function refetchAndUpdate() {
      try {
        fetch('/cart.js', { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
          .then(function (res) { return res.ok ? res.json() : null; })
          .then(function (data) {
            if (!data) return;
            updateCartBadge(header, data.item_count);
          })
          .catch(function () { /* ignore */ });
      } catch (err) { /* ignore */ }
    }

    // Dawn pub/sub (assets/pub-sub.js): subscribe('cart-update', cb)
    try {
      if (typeof window.subscribe === 'function' && window.PUB_SUB_EVENTS) {
        var ev = window.PUB_SUB_EVENTS.cartUpdate || 'cart-update';
        window.subscribe(ev, function (payload) {
          if (payload && payload.cartData && typeof payload.cartData.item_count !== 'undefined') {
            updateCartBadge(header, payload.cartData.item_count);
          } else {
            refetchAndUpdate();
          }
        });
      }
    } catch (err) { /* ignore */ }

    // Generic DOM events as fallback
    document.addEventListener('cart:refresh', refetchAndUpdate);
    document.addEventListener('cart:updated', refetchAndUpdate);
  }

  /* ------------------------------------------------------------------ *
   * 6. Search button -> search overlay
   * ------------------------------------------------------------------ */
  function initSearch(header) {
    var btn = header.querySelector('[data-fuly-search]');
    var overlay = header.querySelector('[data-fuly-search-overlay]');
    if (!btn || !overlay) return;
    var input = overlay.querySelector('[data-fuly-search-input]');
    var closeBtn = overlay.querySelector('[data-fuly-search-close]');

    function isOpen() {
      return !overlay.hasAttribute('hidden');
    }
    function open() {
      overlay.removeAttribute('hidden');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      window.setTimeout(function () {
        if (input && typeof input.focus === 'function') input.focus();
      }, 50);
    }
    function close() {
      overlay.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (typeof btn.focus === 'function') btn.focus();
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (isOpen()) { close(); } else { open(); }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        close();
      });
    }

    // Click on the backdrop (outside the panel) closes
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) close();
    });

    // Escape closes
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && isOpen()) close();
    });

    // Avoid submitting empty queries
    var form = overlay.querySelector('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        if (input && input.value.trim() === '') {
          e.preventDefault();
          if (typeof input.focus === 'function') input.focus();
        }
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  onReady(function () {
    var header = document.querySelector('[data-fuly-header]');
    if (!header) return;
    initAnnouncementRotation(header);
    initDesktopMore(header);
    initMobileMenu(header);
    initMobileMore(header);
    initCartButton(header);
    initCartBadgeSync(header);
    initSearch(header);
  });
})();
