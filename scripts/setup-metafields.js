#!/usr/bin/env node

/**
 * Setup Script para Metafields de FULY Theme
 *
 * Uso:
 *   export SHOPIFY_ACCESS_TOKEN="shpat_..."
 *   node scripts/setup-metafields.js
 */

const https = require('https');

const SHOP = process.env.SHOPIFY_STORE || 'fulycolombia.myshopify.com';
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('\x1b[31m❌ Error: SHOPIFY_ACCESS_TOKEN o SHOPIFY_ADMIN_TOKEN no está configurado\x1b[0m');
  console.error('\nUso:');
  console.error('  export SHOPIFY_ACCESS_TOKEN="shpat_..."');
  console.error('  node scripts/setup-metafields.js\n');
  process.exit(1);
}

async function makeGraphQLRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query, variables });

    const options = {
      hostname: SHOP,
      path: '/admin/api/2024-10/graphql.json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function createMetafieldDefinition(name, key, type, description) {
  const query = `
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
          key
          type {
            name
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    definition: {
      name,
      key,
      namespace: 'custom',
      description,
      type,
      ownerType: 'PRODUCT',
    }
  };

  return makeGraphQLRequest(query, variables);
}

async function main() {
  console.log('\n\x1b[34m═══════════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[34m🔧 Setup de Metafields - FULY Theme\x1b[0m');
  console.log('\x1b[34m═══════════════════════════════════════════════════════════\x1b[0m\n');
  console.log(`📦 Tienda: ${SHOP}\n`);

  const definitions = [
    {
      name: 'Beneficios',
      key: 'beneficios',
      type: 'json',
      description: 'Lista de beneficios del producto en formato JSON',
    },
    {
      name: 'Ingredientes',
      key: 'ingredientes',
      type: 'multi_line_text_field',
      description: 'Listado completo de ingredientes',
    },
    {
      name: 'Tabla Nutricional',
      key: 'informacion_nutricional',
      type: 'multi_line_text_field',
      description: 'Información nutricional por porción',
    },
    {
      name: 'Cómo Preparar',
      key: 'modo_preparacion',
      type: 'multi_line_text_field',
      description: 'Instrucciones paso a paso para preparar el producto',
    },
    {
      name: 'Beneficio Funcional',
      key: 'beneficio_funcional',
      type: 'single_line_text_field',
      description: 'Beneficio funcional principal del producto',
    },
    {
      name: 'Alergenos',
      key: 'alergenos',
      type: 'multi_line_text_field',
      description: 'Información sobre alergenos e ingredientes que pueden estar presentes',
    },
    {
      name: 'Experto / Descripción corta',
      key: 'expert',
      type: 'multi_line_text_field',
      description: 'Descripción corta que se muestra en la tarjeta del grid de productos (prioriza sobre el beneficio funcional)',
    },
    {
      name: 'Talle',
      key: 'talle',
      type: 'single_line_text_field',
      description: 'Talle/size del producto. Se muestra en la tarjeta del grid y en la página de producto',
    },
  ];

  console.log('\x1b[34m📋 Creando metafields...\x1b[0m\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const def of definitions) {
    process.stdout.write(`  ⏳ ${def.name}... `);

    try {
      const response = await createMetafieldDefinition(
        def.name,
        def.key,
        def.type,
        def.description
      );

      if (response.data?.metafieldDefinitionCreate?.createdDefinition?.id) {
        console.log('\x1b[32m✅ Creado\x1b[0m');
        successCount++;
      } else if (response.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
        const error = response.data.metafieldDefinitionCreate.userErrors[0];
        if (error.message.includes('already exists')) {
          console.log('\x1b[33m⏭️  Ya existe\x1b[0m');
          skipCount++;
        } else {
          console.log(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
          errorCount++;
        }
      } else if (response.errors) {
        console.log(`\x1b[31m❌ ${response.errors[0].message}\x1b[0m`);
        errorCount++;
      }
    } catch (error) {
      console.log(`\x1b[31m❌ ${error.message}\x1b[0m`);
      errorCount++;
    }
  }

  console.log('\n\x1b[34m═══════════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[32m✅ Setup completado\x1b[0m');
  console.log(`   Creados: ${successCount} | Ya existen: ${skipCount} | Errores: ${errorCount}`);
  console.log('\x1b[34m═══════════════════════════════════════════════════════════\x1b[0m\n');

  if (errorCount === 0) {
    console.log('\x1b[32m🎉 ¡Todo listo! Los metafields están configurados.\x1b[0m\n');
    console.log('Próximos pasos:');
    console.log('  1. Ve al Admin de Shopify');
    console.log('  2. Edita un producto');
    console.log('  3. Verás nuevos campos en la sección "Metafields"');
    console.log('  4. Completa los campos con la información del producto\n');
  }
}

main().catch(error => {
  console.error('\x1b[31m❌ Error fatal:\x1b[0m', error.message);
  process.exit(1);
});
