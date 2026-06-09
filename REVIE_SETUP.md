# Conectar el total de reseñas (revie.lat)

El badge de reseñas del **Home Hero**, del **Hero Slider** y de **Fuly Home Products**
muestra un número total de reseñas. Ese número se calcula con el snippet
`snippets/fuly-reviews-total.liquid`, que es **configurable** desde el editor de temas.

## Cómo funciona

El snippet obtiene el número en este orden:

1. Si la fuente está en **Manual**, usa el "Número manual / respaldo".
2. Si hay un **metafield de tienda** (shop) configurado, usa ese total agregado.
3. Si no, **suma el metafield de cada producto** (namespace.key) en `collections.all`.
4. Si el resultado es 0, cae al **número manual** de respaldo.

## Pasos para conectarlo con la app Revie

Revie (app.revie.lat) guarda las reseñas en tu tienda Shopify. Para que el total salga
de la app:

1. En **Shopify Admin → Settings → Custom data → Metafields → Products**, revisa qué
   metafield usa Revie para el conteo de reseñas. Lo más común:
   - `reviews.rating_count` (metafield estándar de Shopify) → ya funciona sin cambios.
   - Un namespace propio, por ejemplo `revie.rating_count`.
2. En el editor de temas, abre la sección (Home Hero / Hero Slider / Home Products) y en
   **"Badge de reseñas"** ajusta:
   - **Fuente del número:** Automático.
   - **Reseñas · namespace (producto):** el namespace que viste (ej. `reviews` o `revie`).
   - **Reseñas · key (producto):** la key (ej. `rating_count`).
3. Si Revie expone un **total agregado a nivel tienda** (shop metafield), rellena
   **"namespace metafield de tienda"** y **"key metafield de tienda"**; tiene prioridad.
4. Deja siempre un **Número manual / respaldo** por si la app no ha poblado los datos.

> Nota: Revie también ofrece *app blocks* (widget por producto) que ya están insertados
> en la página de producto (`templates/product.json`). Esos widgets muestran reseñas por
> producto del lado del cliente; el **total sitewide** del badge se calcula con el
> metafield según los pasos de arriba. Si Revie no escribe ningún metafield agregable,
> usa el modo **Manual** y actualiza el número desde el editor.

## Otros pasos de admin (una sola vez)

- **Metafields de producto:** crear `custom.expert` (descripción corta, grid) y
  `custom.talle` (talle, grid + página de producto). Ver `METAFIELDS_SETUP.md`.
- **FAQ editable:** asignar a la página "Preguntas frecuentes" el template
  `page.preguntas-frecuentes` (sección *Fuly FAQ Page*), que permite agregar/quitar/
  editar preguntas desde el editor.
- **Blog:** crear/confirmar una página con handle `blog` y template `page.blog`
  (landing de categorías). El link del footer ya apunta a `/pages/blog`.
- **Logo del footer:** subir el logo en la sección *Footer → Logo*. Si es un logo a
  color, desactiva "Invertir color del logo".
