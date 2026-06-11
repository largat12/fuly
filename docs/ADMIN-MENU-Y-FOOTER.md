# Administrar Menú (Header) y Footer desde Shopify

Esta guía explica **dónde y cómo** la persona administra los enlaces del menú
superior y del footer **sin tocar código**, y la regla para que esos cambios no
se pierdan.

---

## 1. ¿Dónde se editan? (admin de Shopify)

Todo se edita desde el **editor de temas**:

> **Tienda online → Temas → Personalizar**

### Menú superior (Header)
- En el editor, selecciona la sección **Header** (arriba).
- Verás **bloques** de tipo:
  - **`nav_link`** → cada enlace principal del menú (Tienda, FAQ, Suscripciones, Give-Back, MÁS NIÑOS, NutriScan…).
  - **`dropdown_item`** → los enlaces del menú desplegable "Más" (+) (Nosotros, Contacto…).
- En cada bloque puedes editar: **etiqueta (label)**, **URL**, si **abre en pestaña nueva** (`is_external`) y si muestra **ícono de enlace externo**.
- Puedes **agregar, quitar y reordenar** bloques.

### Footer
- Selecciona la sección **Footer**.
- Verás bloques **`footer_link`**, cada uno con:
  - **Columna** (TIENDA / AYUDA / COMUNIDAD / LEGAL…)
  - **Texto del enlace**
  - **URL**
- Las columnas se crean solas según el campo "Columna" de cada bloque.

> **Ejemplo — enlace de WhatsApp:** el enlace "Contacto" usa la URL de WhatsApp
> (`https://api.whatsapp.com/send?phone=...`). Para cambiarlo, edita la **URL del
> bloque** correspondiente y activa "abre en pestaña nueva".

---

## 2. Archivos fuente (para devs)

| Qué se renderiza en vivo | Archivo | Cómo trae los enlaces |
|---|---|---|
| **Header** | `sections/header.liquid` → `snippets/fuly-header.liquid` | Bloques `nav_link` / `dropdown_item` definidos en `sections/header-group.json` |
| **Footer** | `sections/fuly-footer.liquid` | Bloques `footer_link` definidos en `sections/footer-group.json` |

- `sections/header-group.json` y `sections/footer-group.json` son **auto-generados**:
  guardan los bloques/settings del tema **publicado**. El editor de temas los reescribe.
- **Código muerto (no se usa, no editar pensando que es lo vivo):**
  `snippets/fuly-footer.liquid` y `sections/footer.liquid` (footer hardcodeado antiguo).
- En `snippets/fuly-header.liquid` hay **fallbacks hardcodeados** (Tienda, FAQ, etc.)
  que **solo aparecen si se borran TODOS los bloques** del header. Son una red de
  seguridad; normalmente nunca se muestran porque siempre hay bloques.

---

## 3. Regla de oro: ¿quién manda? (evitar que los cambios se reviertan)

Hay **dos fuentes de verdad**:

| Tipo | Vive en | Lo administra |
|---|---|---|
| **Código** (liquid, css, js, schemas de sección) | el repo / Git | el desarrollador |
| **Contenido y settings** (enlaces del menú/footer, contenido editable de secciones) | el **tema publicado en la tienda** (`*-group.json`, `templates/*.json`, `config/settings_data.json`) | la persona, desde el customizer |

**Por qué importa:** si editas a mano los enlaces en `header-group.json` /
`footer-group.json` del repo y luego se sincroniza con la tienda, **puede chocar**
con lo que la persona editó en el admin (uno pisa al otro).

### Recomendación de flujo
- **Enlaces de menú/footer → que los edite la persona en el customizer.** No los
  cambies a mano en el repo (salvo para fijar un default inicial).
- **Antes de hacer `shopify theme push` de código**, trae los settings de la tienda:
  ```bash
  shopify theme pull --only templates/*.json --only sections/*-group.json --only config/settings_data.json
  ```
  o usa la **integración de GitHub de Shopify** (sincroniza en ambos sentidos).
- Así el código viaja repo → tienda, y el contenido viaja tienda → repo, sin pisarse.

---

## 4. Resumen rápido para la persona

- **Menú:** Personalizar → **Header** → editar los enlaces (bloques).
- **Footer:** Personalizar → **Footer** → editar los enlaces (bloques).
- **Páginas (ej. Give-Back):** Personalizar → abrir la página → editar cada sección.
- No hace falta tocar código para ninguno de estos.
