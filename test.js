const http = require('http');

// Test helper function
function makeRequest(path, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = [];
      
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: Buffer.concat(data)
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// Test cases
async function runTests() {
  console.log('Starting ImageZT tests...\n');
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const tests = [
    {
      name: 'Valid basic request',
      path: '/800x600/ffffff/000000',
      expectedStatus: 200
    },
    {
      name: 'Valid request with custom text',
      path: '/400x300/ff0000/00ff00?text=Hello',
      expectedStatus: 200
    },
    {
      name: 'Valid small image',
      path: '/100x100/cccccc/333333',
      expectedStatus: 200
    },
    {
      name: 'Invalid dimensions (negative)',
      path: '/-100x100/ffffff/000000',
      expectedStatus: 400
    },
    {
      name: 'Invalid dimensions (non-numeric)',
      path: '/abcxdef/ffffff/000000',
      expectedStatus: 400
    },
    {
      name: 'Invalid background color (short hex)',
      path: '/800x600/fff/000000',
      expectedStatus: 400
    },
    {
      name: 'Invalid foreground color (invalid chars)',
      path: '/800x600/ffffff/gghhii',
      expectedStatus: 400
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await makeRequest(test.path);
      
      if (response.statusCode === test.expectedStatus) {
        console.log(`✓ ${test.name}`);
        passed++;
        
        // Additional checks for successful responses
        if (test.expectedStatus === 200) {
          if (response.headers['content-type'] !== 'image/png') {
            console.log(`  ✗ Wrong content type: ${response.headers['content-type']}`);
            failed++;
            passed--;
          }
          
          if (!response.headers['cache-control']) {
            console.log(`  ✗ Missing cache-control header`);
            failed++;
            passed--;
          }
        }
      } else {
        console.log(`✗ ${test.name} - Expected status ${test.expectedStatus}, got ${response.statusCode}`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('All tests passed! ✓');
    process.exit(0);
  } else {
    console.log('Some tests failed! ✗');
    process.exit(1);
  }
}

// Check if server is running, if not start it
function checkServer() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 1000
    }, () => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('Server is not running. Please start the server first with: npm start');
    process.exit(1);
  }
  
  await runTests();
}

main().catch(console.error);