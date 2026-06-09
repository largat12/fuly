/* === FULY SEMILLA · /pages/fuly-semilla — interactivity === */
/* Vanilla JS, no dependencies. Behaviors:
   1. Tabs (Una vez / Mensual)
   2. Amount selectors (one-time / monthly / interactive)
   3. Price update (multiplier groups)
   4. WhatsApp link generation
   5. Smooth scroll to #donate-tabs
*/

(function () {
  'use strict';

  var WHATSAPP_NUMBER = '573164737772';

  function formatCOP(n) {
    return '$' + Number(n).toLocaleString('es-CO');
  }

  function init() {
    initTabs();
    initAmountSelectors();
    initWhatsAppButtons();
    initScrollToDonate();
    // Initial render: ensure button labels reflect default selections
    updateAllPrices();
    updateOnceButtonLabel();
  }

  /* ── Tabs ─────────────────────────────────────────── */
  function initTabs() {
    var tabBtns = document.querySelectorAll('[data-fuly-semilla-tab]');
    if (!tabBtns.length) return;

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabName = btn.getAttribute('data-fuly-semilla-tab');
        // Toggle active class on tabs
        tabBtns.forEach(function (b) {
          var isActive = b.getAttribute('data-fuly-semilla-tab') === tabName;
          b.classList.toggle('fuly-semilla-tab-btn--active', isActive);
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        // Show/hide panels
        var panels = document.querySelectorAll('[data-fuly-semilla-panel]');
        panels.forEach(function (p) {
          var match = p.getAttribute('data-fuly-semilla-panel') === tabName;
          p.classList.toggle('fuly-semilla-tab-panel--active', match);
          if (match) {
            p.removeAttribute('hidden');
          } else {
            p.setAttribute('hidden', '');
          }
        });
      });
    });
  }

  /* ── Amount selectors ─────────────────────────────── */
  function initAmountSelectors() {
    var groups = document.querySelectorAll('[data-fuly-amount-selector]');
    groups.forEach(function (group) {
      var btns = group.querySelectorAll('[data-fuly-amount]');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          btns.forEach(function (b) {
            b.classList.remove('fuly-semilla-amount-btn--active');
            b.classList.remove('fuly-semilla-circle-btn--active');
          });
          if (btn.classList.contains('fuly-semilla-circle-btn')) {
            btn.classList.add('fuly-semilla-circle-btn--active');
          } else {
            btn.classList.add('fuly-semilla-amount-btn--active');
          }
          updatePriceForGroup(group);
          if (group.getAttribute('data-fuly-amount-selector') === 'once') {
            updateOnceButtonLabel();
          }
        });
      });
    });
  }

  function updateAllPrices() {
    var groups = document.querySelectorAll('[data-fuly-amount-selector]');
    groups.forEach(updatePriceForGroup);
  }

  function updatePriceForGroup(group) {
    var multiplierAttr = group.getAttribute('data-fuly-amount-multiplier');
    if (!multiplierAttr) return;
    var multiplier = parseInt(multiplierAttr, 10);
    var groupKey = group.getAttribute('data-fuly-amount-selector');
    var active = group.querySelector('[data-fuly-amount].fuly-semilla-amount-btn--active, [data-fuly-amount].fuly-semilla-circle-btn--active');
    if (!active) return;
    var amount = parseInt(active.getAttribute('data-fuly-amount'), 10);
    var total = amount * multiplier;
    var display = document.querySelector('[data-fuly-price-display="' + groupKey + '"]');
    if (display) {
      display.textContent = formatCOP(total) + ' COP';
    }
  }

  function updateOnceButtonLabel() {
    var group = document.querySelector('[data-fuly-amount-selector="once"]');
    if (!group) return;
    var active = group.querySelector('[data-fuly-amount].fuly-semilla-amount-btn--active');
    if (!active) return;
    var amount = parseInt(active.getAttribute('data-fuly-amount'), 10);
    var total = amount * 60000;
    var labelEl = document.querySelector('[data-fuly-whatsapp-button="once"] [data-fuly-whatsapp-label]');
    if (labelEl) {
      labelEl.textContent = 'Donar ' + formatCOP(total);
    }
  }

  /* ── WhatsApp link generation ─────────────────────── */
  function initWhatsAppButtons() {
    var btns = document.querySelectorAll('[data-fuly-whatsapp-button]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-fuly-whatsapp-button');
        var donationType = btn.getAttribute('data-fuly-whatsapp-type') || 'Donación';
        var detail = buildDetailFor(key, btn);
        var message = '¡Hola! Quiero unirme a Fuly Give-Back\n\nMi donación:\n' +
                      donationType + ': ' + detail +
                      '\n\n¡Quiero saber cómo proceder!';
        var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });
  }

  function buildDetailFor(key, btn) {
    if (key === 'cta-final') {
      return btn.getAttribute('data-fuly-whatsapp-detail') || 'Me gustaría saber cómo ayudar';
    }
    var group = document.querySelector('[data-fuly-amount-selector="' + key + '"]');
    if (!group) return '';

    var active = group.querySelector('[data-fuly-amount].fuly-semilla-amount-btn--active, [data-fuly-amount].fuly-semilla-circle-btn--active');
    if (!active) return '';

    var label = active.getAttribute('data-fuly-amount-label') || '';
    var amount = parseInt(active.getAttribute('data-fuly-amount'), 10);

    if (key === 'once') {
      var totalOnce = amount * 60000;
      return label + ' : ' + formatCOP(totalOnce);
    }
    if (key === 'interactive') {
      var totalInter = amount * 60000;
      return label + ' : ' + formatCOP(totalInter);
    }
    if (key === 'monthly') {
      if (amount > 0) {
        return formatCOP(amount) + ' mensuales';
      }
      return 'Monto personalizado';
    }
    return label;
  }

  /* ── Scroll to donate ─────────────────────────────── */
  function initScrollToDonate() {
    var btns = document.querySelectorAll('[data-fuly-scroll-to-donate]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById('donate-tabs');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
