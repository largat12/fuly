/**
 * FULY — Add to cart desde tarjetas de producto.
 * Botones con [data-fuly-add-to-cart][data-variant-id] agregan la variante
 * al carrito vía /cart/add.js y abren el cart-drawer de Dawn, sin navegar
 * a la página del producto.
 */
(function () {
  'use strict';

  var SELECTOR = '[data-fuly-add-to-cart]';
  var ADDED_STATE_MS = 1800;
  var SECTIONS = 'cart-drawer,cart-icon-bubble';

  function getRoutes() {
    var routes = window.routes || {};
    return {
      add: routes.cart_add_url || '/cart/add',
      cart: routes.cart_url || '/cart'
    };
  }

  function setState(btn, state) {
    btn.classList.remove('is-loading', 'is-added', 'is-error');
    if (state) btn.classList.add(state);
    btn.disabled = state === 'is-loading';
  }

  function notifyCartUpdated(variantId, response) {
    try {
      if (typeof window.publish === 'function' && window.PUB_SUB_EVENTS) {
        window.publish(window.PUB_SUB_EVENTS.cartUpdate, {
          source: 'fuly-product-card',
          productVariantId: variantId,
          cartData: response
        });
      }
    } catch (err) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
  }

  function openDrawer(response) {
    var drawer = document.querySelector('cart-drawer');
    if (!drawer) return false;
    if (typeof drawer.renderContents === 'function' && response && response.sections) {
      drawer.renderContents(response);
      // El drawer conserva `is-empty` en el elemento exterior tras renderContents,
      // lo que oculta los ítems cuando el carrito estaba vacío. Se quita igual
      // que hace el propio drawer en snippets/cart-drawer.liquid.
      drawer.classList.remove('is-empty');
      return true;
    }
    if (typeof drawer.open === 'function') {
      drawer.open();
      return true;
    }
    return false;
  }

  function addToCart(btn) {
    var variantId = btn.getAttribute('data-variant-id');
    if (!variantId || btn.classList.contains('is-loading')) return;

    var routes = getRoutes();
    var body = {
      items: [{ id: Number(variantId), quantity: 1 }],
      sections: SECTIONS,
      sections_url: window.location.pathname
    };

    setState(btn, 'is-loading');

    fetch(routes.add + '.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || data.status) {
            var msg = (data && (data.description || data.message)) || 'No se pudo agregar al carrito';
            throw new Error(msg);
          }
          return data;
        });
      })
      .then(function (data) {
        setState(btn, 'is-added');
        notifyCartUpdated(variantId, data);
        if (!openDrawer(data)) {
          window.location.href = routes.cart;
          return;
        }
        setTimeout(function () { setState(btn, null); }, ADDED_STATE_MS);
      })
      .catch(function (err) {
        console.error('[fuly-add-to-cart]', err);
        setState(btn, 'is-error');
        setTimeout(function () { setState(btn, null); }, ADDED_STATE_MS);
      });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest(SELECTOR);
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    addToCart(btn);
  });
})();
