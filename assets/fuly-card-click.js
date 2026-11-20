/**
 * FULY — Tarjeta de producto clickeable completa.
 * Un clic en cualquier parte vacía de .fuly-product-card abre el producto.
 * Los botones (Agregar, etc.) y los enlaces siguen funcionando normal.
 */
(function () {
  'use strict';
  if (window.__fulyCardClick) return;
  window.__fulyCardClick = true;

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button > 1) return;
    var card = e.target.closest && e.target.closest('.fuly-product-card');
    if (!card) return;
    if (e.target.closest('a, button, input, select, textarea, label, summary, [data-fuly-add-to-cart]')) return;
    var selection = window.getSelection ? String(window.getSelection()) : '';
    if (selection) return;
    var link = card.querySelector('a[href]');
    if (!link) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      window.open(link.href, '_blank', 'noopener');
      return;
    }
    window.location.href = link.href;
  });
})();
