#!/usr/bin/env node

/**
 * Cleanup script para borrar definiciones de metafields incorrectas
 *
 * Uso:
 *   export SHOPIFY_ACCESS_TOKEN="shpat_..."
 *   node scripts/cleanup-metafields.js
 */

const https = require('https');

const SHOP = process.env.SHOPIFY_STORE || 'fulycolombia.myshopify.com';
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('\x1b[31m❌ Error: SHOPIFY_ACCESS_TOKEN o SHOPIFY_ADMIN_TOKEN no está configurado\x1b[0m');
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

async function getMetafieldDefinitions() {
  const query = `
    query {
      metafieldDefinitions(first: 50, ownerType: PRODUCT, namespace: "custom") {
        edges {
          node {
            id
            key
            name
            description
            type {
              name
            }
          }
        }
      }
    }
  `;

  return makeGraphQLRequest(query);
}

async function deleteMetafieldDefinition(id, key) {
  const query = `
    mutation {
      metafieldDefinitionDelete(id: "${id}") {
        deletedDefinitionId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await makeGraphQLRequest(query);
  return response;
}

async function main() {
  console.log('\n\x1b[34m═══════════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[34m🧹 Cleanup - Metafield Definitions\x1b[0m');
  console.log('\x1b[34m═══════════════════════════════════════════════════════════\x1b[0m\n');
  console.log(`📦 Tienda: ${SHOP}\n`);

  try {
    const response = await getMetafieldDefinitions();

    if (response.errors) {
      console.log('\x1b[31m❌ GraphQL Error:\x1b[0m');
      response.errors.forEach(err => console.log(`   ${err.message}`));
      process.exit(1);
    }

    const definitions = response.data?.metafieldDefinitions?.edges || [];

    console.log(`Found ${definitions.length} metafield definitions:\n`);

    // Find definitions with wrong keys (benefits instead of beneficios)
    const toDelete = definitions.filter(({ node }) => node.key === 'benefits');

    if (toDelete.length === 0) {
      console.log('\x1b[32m✅ No incorrect definitions found. All good!\x1b[0m\n');
      return;
    }

    console.log(`\x1b[33m⚠️  Found ${toDelete.length} definition(s) to delete:\x1b[0m\n`);

    for (const { node } of toDelete) {
      console.log(`   Deleting: ${node.key} (${node.name})`);
      try {
        await deleteMetafieldDefinition(node.id, node.key);
        console.log(`   \x1b[32m✅ Deleted\x1b[0m`);
      } catch (error) {
        console.log(`   \x1b[31m❌ Error: ${error.message}\x1b[0m`);
      }
    }

    console.log('\n\x1b[32m✅ Cleanup complete!\x1b[0m\n');

  } catch (error) {
    console.error('\x1b[31m❌ Error:\x1b[0m', error.message);
    process.exit(1);
  }
}

main();
