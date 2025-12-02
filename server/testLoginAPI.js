const http = require('http');

console.log('🧪 Testing Login API Endpoints\n');

// Test 1: Check if server is running
const testServerHealth = () => {
    return new Promise((resolve, reject) => {
        console.log('1️⃣  Checking if server is running...');
        const req = http.get('http://localhost:5000/', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   ✓ Server is running: ${data}\n`);
                resolve();
            });
        });
        req.on('error', (err) => {
            console.log(`   ❌ Server is NOT running!`);
            console.log(`   Error: ${err.message}\n`);
            reject(err);
        });
    });
};

// Test 2: Test user login
const testUserLogin = () => {
    return new Promise((resolve, reject) => {
        console.log('2️⃣  Testing user login (test@example.com)...');
        const postData = JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const response = JSON.parse(data);
                if (res.statusCode === 200) {
                    console.log(`   ✓ Login successful!`);
                    console.log(`   User: ${response.name} (${response.role})`);
                    console.log(`   Token: ${response.token.substring(0, 20)}...`);
                } else {
                    console.log(`   ❌ Login failed: ${response.message}`);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(`   ❌ Error: ${err.message}`);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
};

// Test 3: Test admin login
const testAdminLogin = () => {
    return new Promise((resolve, reject) => {
        console.log('\n3️⃣  Testing admin login (admin@jewelindia.com)...');
        const postData = JSON.stringify({
            email: 'admin@jewelindia.com',
            password: 'admin123'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const response = JSON.parse(data);
                if (res.statusCode === 200) {
                    console.log(`   ✓ Login successful!`);
                    console.log(`   User: ${response.name} (${response.role})`);
                    console.log(`   Token: ${response.token.substring(0, 20)}...`);
                } else {
                    console.log(`   ❌ Login failed: ${response.message}`);
                    console.log(`   Note: You may need to verify the admin password`);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(`   ❌ Error: ${err.message}`);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
};

// Test 4: Test Rate Limit (Attempt 10 logins)
const testRateLimit = async () => {
    console.log('\n4️⃣  Testing Rate Limit (10 attempts)...');
    for (let i = 1; i <= 10; i++) {
        process.stdout.write(`   Attempt ${i}: `);
        await new Promise((resolve) => {
            const postData = JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            });

            const options = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log('✓ Success');
                    } else {
                        console.log(`❌ Failed (${res.statusCode}): ${data}`);
                    }
                    resolve();
                });
            });

            req.on('error', (err) => {
                console.log(`❌ Error: ${err.message}`);
                resolve();
            });

            req.write(postData);
            req.end();
        });
    }
};

// Test 5: Test Delivery Agent Login
const testDeliveryAgentLogin = () => {
    return new Promise((resolve, reject) => {
        console.log('\n5️⃣  Testing Delivery Agent Login (agent@test.com)...');
        const postData = JSON.stringify({
            email: 'agent@test.com',
            password: 'password123'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const response = JSON.parse(data);
                if (res.statusCode === 200) {
                    console.log(`   ✓ Login successful!`);
                    console.log(`   User: ${response.name} (${response.role})`);
                } else {
                    console.log(`   ❌ Login failed: ${response.message}`);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(`   ❌ Error: ${err.message}`);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
};

// Run all tests
(async () => {
    try {
        await testServerHealth();
        await testUserLogin();
        await testAdminLogin();
        await testRateLimit();
        await testDeliveryAgentLogin();
        console.log('\n✅ API test completed');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
})();
