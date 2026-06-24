# Hero — Total de reseñas (Fuly Kids / revie.lat)

El hero muestra el **total de reseñas** (hoy **5440**) leyendo un **metafield de tienda** de Shopify.
Sin llamadas externas en runtime (el JWT de revie expira y el S3 no tiene CORS, por eso no se
consulta nada desde el navegador).

## Paso 1 — Crear el metafield de tienda

Shopify Admin → **Settings → Custom data → Metafields → Shop** → **Add definition**:

- **Name:** Total reviews
- **Namespace and key:** `custom.total_reviews`
- **Type:** Integer

Guardar. Luego, en esa misma pantalla (sección **Shop / Tienda**), poné el **valor = `5440`**.

> Cuando quieras actualizar el número, cambiás solo ese valor. (El feed/panel de revie
> crece con el tiempo; revisá el dashboard de revie cada tanto y actualizá.)

## Paso 2 — Insertar el snippet en el hero

Pegá `hero-total-reviews.liquid` donde va el número en la sección del hero del theme
(Online Store → Themes → Edit code → la sección del hero).

```liquid
{%- liquid
  assign total_reviews = shop.metafields.custom.total_reviews.value
  if total_reviews == blank or total_reviews == 0
    assign total_reviews = 5440
  endif
-%}
<div class="hero-reviews">
  <span class="hero-reviews__count">{{ total_reviews }}</span>
  <span class="hero-reviews__label">reseñas</span>
</div>
```

## Opción auto-actualizable (si revie ya escribe un metafield de TIENDA)

revie escribe metafields **por producto** (`product.metafields.revie.reviewData.reviewCount`).
Revisá si además escribe uno de **tienda** con el total en **Metafields → Shop**, namespace `revie`.
Si existe, cambiá el `assign` del snippet a ese key (ej.):

```liquid
assign total_reviews = shop.metafields.revie.reviewData.reviewCount.value
```

Así el número se actualiza solo, sin tocar nada a mano.

> ⚠️ No sumar `reviewCount` de todos los productos: duplica entre variantes/agrupaciones
> (da mucho más que 5440) y Liquid no puede iterar miles de productos en el hero.

## Si más adelante querés que sea 100% automático sin metafield de tienda de revie

Se puede agregar un job (GitHub Action cron) que llame la API de revie
(`/api/reviews/statestatistics` → total = APPROVED + REJECTED + PENDING_APPROVAL = 5440) y
escriba `custom.total_reviews` por Admin API. Requiere auth renovable a revie (API key estable
o Auth0 password-grant). Queda como mejora futura; hoy el camino trivial cubre el requerimiento.
