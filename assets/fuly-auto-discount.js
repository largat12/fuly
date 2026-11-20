/*
 * Muestra los descuentos automáticos de Shopify como precio tachado en las
 * tarjetas de producto y en la ficha (PDP), antes de agregar al carrito.
 *
 * Shopify no expone los descuentos automáticos en Liquid, así que creamos un
 * carrito temporal por variante en la Storefront API (acceso sin token) y
 * leemos el precio final. Ese carrito no es el del cliente y nunca se usa.
 * Un carrito por variante para que condiciones de "mínimo de compra" no se
 * activen al juntar varios productos.
 */
(() => {
  const API_VERSION = '2025-07';
  const CACHE_KEY = 'fuly-auto-discount-v1';
  const CACHE_TTL_MS = 10 * 60 * 1000;
  const shop = window.Shopify && window.Shopify.shop;
  if (!shop) return;
  const endpoint = `https://${shop}/api/${API_VERSION}/graphql.json`;

  const QUERY = `mutation($id: ID!) {
    cartCreate(input: { lines: [{ merchandiseId: $id, quantity: 1 }] }) {
      cart { lines(first: 1) { nodes {
        cost { subtotalAmount { amount } totalAmount { amount } }
      } } }
    }
  }`;

  const readCache = () => {
    try {
      const raw = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
      return Date.now() - (raw.t || 0) < CACHE_TTL_MS ? raw.v || {} : {};
    } catch (e) {
      return {};
    }
  };
  const cache = readCache();
  const writeCache = () => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: cache }));
    } catch (e) {
      /* sin storage: solo se pierde la caché */
    }
  };

  const pending = {};
  // Devuelve { original, final } en unidades de moneda, o null si no hay descuento.
  const fetchDiscount = (variantId) => {
    if (variantId in cache) return Promise.resolve(cache[variantId]);
    if (pending[variantId]) return pending[variantId];
    pending[variantId] = fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { id: `gid://shopify/ProductVariant/${variantId}` } }),
    })
      .then((r) => r.json())
      .then((json) => {
        const cost = json?.data?.cartCreate?.cart?.lines?.nodes?.[0]?.cost;
        const original = parseFloat(cost?.subtotalAmount?.amount);
        const final = parseFloat(cost?.totalAmount?.amount);
        cache[variantId] = original > 0 && final < original ? { original, final } : null;
        writeCache();
        return cache[variantId];
      })
      .catch((err) => {
        console.warn('[fuly-auto-discount]', err);
        return null;
      });
    return pending[variantId];
  };

  // ponytail: reutiliza el formato del precio que ya pinta Liquid (símbolo y
  // separador de miles) y omite decimales; suficiente para COP sin centavos.
  const formatLike = (sample, amount) => {
    const sep = /\d\.\d{3}/.test(sample) ? '.' : ',';
    const digits = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return sample.replace(/\d[\d.,]*/, digits);
  };

  const applyToCard = (group, d) => {
    const priceEl = group.querySelector('.fuly-product-card__price');
    if (!priceEl || group.dataset.fulyAutoDiscount) return;
    const sample = priceEl.textContent.trim();
    if (!group.querySelector('.fuly-product-card__price--compare')) {
      const s = document.createElement('s');
      s.className = 'fuly-product-card__price--compare';
      s.textContent = formatLike(sample, d.original);
      group.prepend(s);
    }
    priceEl.textContent = formatLike(sample, d.final);
    group.dataset.fulyAutoDiscount = '1';
  };

  const applyToPdp = (priceEl, d) => {
    const regular = priceEl.querySelector('.price__regular .price-item--regular');
    const saleCompare = priceEl.querySelector('.price__sale s.price-item--regular');
    const salePrice = priceEl.querySelector('.price__sale .price-item--sale');
    if (!regular || !saleCompare || !salePrice) return;
    const sample = regular.textContent.trim();
    saleCompare.textContent = formatLike(sample, d.original);
    salePrice.textContent = formatLike(sample, d.final);
    priceEl.classList.add('price--on-sale', 'fuly-auto-discount');
  };

  const scanCards = (root = document) => {
    root.querySelectorAll('.fuly-product-card__price-group:not([data-fuly-auto-discount])').forEach((group) => {
      const btn = group.closest('.fuly-product-card__footer')?.querySelector('[data-variant-id]');
      const id = btn?.dataset.variantId;
      if (id) fetchDiscount(id).then((d) => d && applyToCard(group, d));
    });
  };

  const scanPdp = () => {
    document.querySelectorAll('[id^="price-"] .price:not(.price--on-sale)').forEach((priceEl) => {
      const scope = priceEl.closest('product-info, section') || document;
      const id = scope.querySelector('form[action*="/cart/add"] [name="id"]')?.value;
      if (id) fetchDiscount(id).then((d) => d && applyToPdp(priceEl, d));
    });
  };

  // Widget de la app de suscripciones: fila "Compra Única". Solo se toca el
  // precio de compra única; el de suscripción lo calcula la app.
  const scanSubscription = () => {
    const el = document.querySelector('#subscription-widget-root .sub-price-one-time');
    const id = document.querySelector('form[action*="/cart/add"] [name="id"]')?.value;
    if (!el || !id) return;
    fetchDiscount(id).then((d) => {
      if (!d) return;
      const current = el.textContent.trim();
      const final = formatLike(current, d.final);
      if (current === final) return;
      let compare = el.previousElementSibling;
      if (!compare || !compare.classList.contains('fuly-sub-compare')) {
        compare = document.createElement('s');
        compare.className = 'sub-price-original fuly-sub-compare';
        el.before(compare);
      }
      compare.textContent = formatLike(current, d.original);
      el.textContent = final;
    });
  };

  const watchSubscriptionWidget = () => {
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scanSubscription();
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  const run = () => {
    scanCards();
    scanPdp();
    if (document.querySelector('form[action*="/cart/add"]')) {
      scanSubscription();
      watchSubscriptionWidget();
    }
    // La PDP re-renderiza el precio al cambiar de variante.
    if (typeof subscribe === 'function' && window.PUB_SUB_EVENTS) {
      subscribe(PUB_SUB_EVENTS.variantChange, () => setTimeout(scanPdp, 0));
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
