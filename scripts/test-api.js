/**
 * Test Molt Mart APIs
 * Simple test script to verify API functionality
 */

const https = require('https');

const BASE_URL = 'https://molt-mart-ioajk3gaq-sproutys-projects.vercel.app';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'User-Agent': 'MoltMart-Test/1.0',
        'Accept': 'application/json',
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAPIs() {
  console.log('🧪 Testing Molt Mart APIs...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await makeRequest('/api/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data, null, 2)}\n`);

    // Test categories API
    console.log('2. Testing categories API...');
    const categories = await makeRequest('/api/v1/categories');
    console.log(`   Status: ${categories.status}`);
    if (categories.data.success) {
      console.log(`   Found ${categories.data.data.length} categories`);
      categories.data.data.slice(0, 3).forEach(cat => {
        console.log(`   ${cat.icon} ${cat.name} (${cat.product_count} products)`);
      });
    } else {
      console.log(`   Error: ${categories.data.error}`);
    }
    console.log();

    // Test products API
    console.log('3. Testing products API...');
    const products = await makeRequest('/api/v1/products?limit=5');
    console.log(`   Status: ${products.status}`);
    if (products.data.success) {
      console.log(`   Found ${products.data.data.length} products`);
      console.log(`   Total in database: ${products.data.pagination.total}`);
    } else {
      console.log(`   Error: ${products.data.error}`);
    }
    console.log();

    // Test search API
    console.log('4. Testing search API...');
    const search = await makeRequest('/api/v1/search?q=API&limit=3');
    console.log(`   Status: ${search.status}`);
    if (search.data.success) {
      console.log(`   Found ${search.data.data.length} results for "API"`);
      console.log(`   Recommendations: ${search.data.recommendations.length}`);
    } else {
      console.log(`   Error: ${search.data.error}`);
    }
    console.log();

    // Test payment endpoint (should show error since no Stripe keys)
    console.log('5. Testing payment setup...');
    const payment = await makeRequest('/api/create-checkout-session', 'POST', {
      productId: 'test',
      userId: 'test'
    });
    console.log(`   Status: ${payment.status}`);
    console.log(`   Response indicates: ${payment.data.error ? 'Payment not configured' : 'Payment ready'}\n`);

    console.log('✅ API Testing Complete!');
    console.log('\n📊 Summary:');
    console.log(`   • Categories API: ${categories.status === 200 ? '✅' : '❌'}`);
    console.log(`   • Products API: ${products.status === 200 ? '✅' : '❌'}`);
    console.log(`   • Search API: ${search.status === 200 ? '✅' : '❌'}`);
    console.log(`   • Payment API: ${payment.status >= 200 && payment.status < 500 ? '✅' : '❌'} (config needed)`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

module.exports = { testAPIs, makeRequest };

if (require.main === module) {
  testAPIs().then(() => {
    console.log('\n🚀 Ready for AI agent integration!');
    process.exit(0);
  });
}