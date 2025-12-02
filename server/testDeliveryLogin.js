const http = require('http');

const testDeliveryLogin = () => {
    return new Promise((resolve, reject) => {
        console.log('Testing Delivery Agent Login (agent@test.com)...');
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
                try {
                    const response = JSON.parse(data);
                    if (res.statusCode === 200) {
                        console.log(`✓ Login successful!`);
                        console.log(`User: ${response.name} (${response.role})`);
                        console.log(`Token: ${response.token ? 'Yes' : 'No'}`);
                    } else {
                        console.log(`❌ Login failed: ${response.message}`);
                    }
                    resolve();
                } catch (e) {
                    console.log(`❌ Error parsing response: ${data}`);
                    resolve();
                }
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
};

testDeliveryLogin();
