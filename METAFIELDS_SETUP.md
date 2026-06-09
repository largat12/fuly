# Configuración de Metafields - FULY Theme

## Resumen

La theme FULY requiere metafields específicos para mostrar información detallada de productos (ingredientes, tabla nutricional, cómo preparar, beneficios, etc.).

Estos metafields **deben ser creados una sola vez** en el admin de Shopify después de instalar la theme.

## Metafields Requeridos

| Nombre | Key | Namespace | Tipo | Descripción |
|--------|-----|-----------|------|-------------|
| Beneficios | `benefits` | `custom` | `json` | Lista de beneficios en formato JSON |
| Ingredientes | `ingredientes` | `custom` | `multi_line_text_field` | Ingredientes del producto |
| Tabla Nutricional | `informacion_nutricional` | `custom` | `multi_line_text_field` | Información nutricional |
| Cómo Preparar | `modo_preparacion` | `custom` | `multi_line_text_field` | Instrucciones de preparación |
| Beneficio Funcional | `beneficio_funcional` | `custom` | `single_line_text_field` | Beneficio principal |
| Alergenos | `alergenos` | `custom` | `multi_line_text_field` | Información sobre alergenos |

## Instalación de Metafields

### Opción 1: Manual (Admin de Shopify)

1. Ve al **Admin de Shopify**
2. **Settings** → **Custom data** → **Metafields**
3. Haz click en **Products**
4. Crea cada metafield según la tabla anterior

### Opción 2: Script Automatizado

Ejecuta el script proporcionado:

```bash
# Desde la raíz del proyecto
export SHOPIFY_ACCESS_TOKEN="tu-token-aqui"
export SHOPIFY_STORE="tu-tienda.myshopify.com"
node scripts/setup-metafields.js
```

## Después de Instalar

1. Los metafields estarán disponibles en la página de edición de cada producto
2. La sección "Detalles del producto" en la theme mostrará automáticamente la información
3. No es necesario hacer nada más - la theme detecta automáticamente qué información llenar

## Para Administradores

Cuando se instale la theme en producción:

1. **Instalar la theme** en tu tienda Shopify
2. **Ejecutar el setup de metafields** (script o manual)
3. **Editar productos** y completar los nuevos campos de metafields
4. Los cambios aparecerán automáticamente en la tienda

## Notas Técnicas

- Los metafields se guardan en el namespace `custom` (no es necesario crear nuevos namespaces)
- Los tipos de datos están optimizados para Shopify 2024-10 API
- La theme es compatible con ambos namespaces: `custom` y `fuly` (si los datos están en `fuly`, también funcionará)

## Soporte

Si algún metafield no aparece:

1. Verifica que el metafield existe en **Settings** → **Custom data** → **Metafields** → **Products**
2. Asegúrate de que el producto tiene un valor guardado en ese metafield
3. Recarga la página del producto
