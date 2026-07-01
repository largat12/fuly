<div align="center">

# 🌱 Fuly — Tema de Shopify

**Nutrición deliciosa hecha con ciencia, para que los niños crezcan fuertes y felices.**

Tema personalizado de [Shopify](https://www.shopify.com/) para la tienda de **Fuly Colombia**, construido sobre la base del tema *Taste* con secciones a la medida para cada landing de la marca.

[![Shopify](https://img.shields.io/badge/Shopify-Theme-95BF47?logo=shopify&logoColor=white)](https://www.shopify.com/)
[![Liquid](https://img.shields.io/badge/Liquid-Templating-1A1A1A?logo=shopify&logoColor=white)](https://shopify.dev/docs/api/liquid)
[![Base](https://img.shields.io/badge/Base-Taste%20v15.3.1-7AB55C)](https://themes.shopify.com/themes/taste)
[![Store](https://img.shields.io/badge/Store-fulycolombia-635BFF)](https://fulycolombia.myshopify.com)

</div>

---

## ✨ Sobre el proyecto

**Fuly** crea productos de nutrición infantil formulados por científicos, respaldados por pediatras y disfrutados por niños. Este repositorio contiene el **código del tema de la tienda online**: las plantillas, secciones, estilos y lógica que dan vida a la experiencia de compra y a las landings de marca.

El tema mantiene la solidez de **Taste** (tema oficial de Shopify) y le suma una capa de secciones personalizadas con el prefijo `fuly-*` para mantener todo organizado y fácil de mantener.

---

## 🧩 Secciones personalizadas

Todas las secciones a la medida viven en `sections/` con el prefijo `fuly-` y están agrupadas por landing:

| Landing | Secciones |
|---|---|
| 🏠 **Home** | `home-hero`, `home-hero-slider`, `home-benefits`, `home-products`, `home-science`, `home-how-it-works`, `home-testimonials`, `home-why`, `home-faq`, `home-cta`, `home-marquee`, `home-newsletter` |
| 👨‍👩‍👧 **Nosotros** | `nosotros-hero`, `nosotros-creencia`, `nosotros-contradiccion`, `nosotros-principios`, `nosotros-formula`, `nosotros-cta` |
| 🧪 **Nuestros Ingredientes** | `ingredientes-estudios`, `ingredientes-productos`, `ingredientes-endulzamos`, `ingredientes-ciencia`, `ingredientes-cta` |
| 🌰 **Fuly Semilla** | `semilla-hero`, `semilla-sobre`, `semilla-impacto`, `semilla-caminos`, `semilla-donation`, `semilla-neuronal`, `semilla-interactive`, `semilla-tabs`, `semilla-prep`, `semilla-faq`, `semilla-cta-final` |
| 🔁 **Suscripciones** | `suscripciones-hero`, `suscripciones-cta` |
| 🛍️ **Tienda / Producto** | `tienda`, `product-details`, `reviews-badge` |
| 📰 **Blog** | `blog`, `blogs-landing`, `article`, `fuly-faq-page` |
| 🧱 **Globales** | `fuly-footer`, `fuly-slideshow`, `fuly-whatsapp-button`, `legal-page` |

> 💡 Algunas secciones (ej. *Ingredientes → Productos*) renderizan datos dinámicamente desde **metafields** de Shopify. Ver [`METAFIELDS_SETUP.md`](./METAFIELDS_SETUP.md).

---

## 📁 Estructura del repositorio

```
fuly/
├── assets/        # CSS, JS e imágenes del tema (incl. fuly-*.css)
├── config/        # settings_schema.json y settings_data.json
├── docs/          # Documentación interna del tema
├── layout/        # theme.liquid (layout base)
├── locales/       # Traducciones (es, en, y +20 idiomas)
├── scripts/       # Scripts auxiliares
├── sections/      # Secciones (102) — incluye las fuly-*
├── snippets/      # Snippets reutilizables (52)
└── templates/     # Plantillas JSON/Liquid por página (59)
```

---

## 🚀 Desarrollo local

### Requisitos

- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/install) instalado
- Acceso a la tienda `fulycolombia.myshopify.com`

### Comandos útiles

```bash
# Servir el tema en local con hot-reload
shopify theme dev --store fulycolombia.myshopify.com

# Subir cambios a un tema de desarrollo (sin publicar)
shopify theme push --unpublished

# Descargar el tema en vivo
shopify theme pull
```

---

## 🔄 Flujo de despliegue

El tema está conectado mediante la **integración de GitHub de Shopify**: los cambios fluyen desde este repositorio hacia la tienda.

```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin main   # Shopify sincroniza el tema automáticamente
```

> Para que una nueva landing aparezca, además de subir el template hay que **asignar la página al template correcto** en *Shopify Admin → Tienda online → Páginas*.

---

## 📚 Documentación

- [`METAFIELDS_SETUP.md`](./METAFIELDS_SETUP.md) — Configuración de metafields para ingredientes/productos
- [`REVIE_SETUP.md`](./REVIE_SETUP.md) — Configuración del sistema de reseñas
- [`docs/ADMIN-MENU-Y-FOOTER.md`](./docs/ADMIN-MENU-Y-FOOTER.md) — Menú de administración y footer
- [`docs/hero-total-reviews.md`](./docs/hero-total-reviews.md) — Total de reseñas en el hero

---

## 🛠️ Convenciones

- **Secciones nuevas** → prefijo `fuly-` + `landing` + `bloque` (ej. `fuly-home-hero.liquid`)
- **Estilos personalizados** → `assets/fuly-*.css`, enlazados desde `layout/theme.liquid`
- **Commits** → formato convencional (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- **No tocar** archivos marcados como *auto-generated* salvo a través del editor de temas

---

<div align="center">

Hecho con 💚 para **Fuly Colombia** · _Hechos con ciencia deliciosa en el FulyLab._

</div>
