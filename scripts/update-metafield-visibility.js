#!/usr/bin/env node

/**
 * Update Metafield Visibility in Shopify Admin
 * Makes metafields visible in the product editor
 *
 * Uso:
 *   export SHOPIFY_ACCESS_TOKEN="shpat_..."
 *   node scripts/update-metafield-visibility.js
 */

const https = require('https');

const SHOP = process.env.SHOPIFY_STORE || 'fulycolombia.myshopify.com';
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('\x1b[31m❌ Error: SHOPIFY_ACCESS_TOKEN no está configurado\x1b[0m');
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

async function updateMetafieldDefinition(definitionId, name, description) {
  const query = `
    mutation UpdateMetafieldDefinition($definition: MetafieldDefinitionInput!, $definitionId: ID!) {
      metafieldDefinitionUpdate(definition: $definition, id: $definitionId) {
        metafieldDefinition {
          id
          key
          name
          description
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    definitionId,
    definition: {
      name,
      description,
    }
  };

  return makeGraphQLRequest(query, variables);
}

async function main() {
  console.log('\n\x1b[34m═══════════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[34m🔍 Metafield Definitions Check\x1b[0m');
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

    if (definitions.length === 0) {
      console.log('\x1b[33m⚠️  No metafield definitions found\x1b[0m\n');
      process.exit(0);
    }

    console.log(`\x1b[32m✅ Found ${definitions.length} metafield definitions:\x1b[0m\n`);

    definitions.forEach(({ node }) => {
      console.log(`   • ${node.key}`);
      console.log(`     Name: ${node.name}`);
      console.log(`     Type: ${node.type?.name}`);
      console.log(`     ID: ${node.id}\n`);
    });

    console.log('\x1b[34m═══════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[33m📝 Important: Metafields are stored in Shopify!\x1b[0m');
    console.log('\x1b[34m═══════════════════════════════════════════════════════════\x1b[0m\n');

    console.log('To see metafields in the Shopify Admin product editor:');
    console.log('');
    console.log('Option 1: Use a Shopify App');
    console.log('  - Search for "Metafield Manager" or similar app in the Shopify App Store');
    console.log('  - Install and configure to display your custom metafields');
    console.log('');
    console.log('Option 2: Access via Shopify Admin API');
    console.log('  - Use a custom app or GraphQL Admin API to read/write metafields');
    console.log('  - The theme Liquid template can already display them');
    console.log('');
    console.log('Option 3: Create a Custom App with Admin Extension');
    console.log('  - Develop a Shopify app with an admin UI extension');
    console.log('  - Display and edit metafields directly in the product editor');
    console.log('\n');

  } catch (error) {
    console.error('\x1b[31m❌ Error:\x1b[0m', error.message);
    process.exit(1);
  }
}

main();
