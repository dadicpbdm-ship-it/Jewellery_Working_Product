const http = require('http');

const testLoginAPI = () => {
    return new Promise((resolve, reject) => {
        console.log('Testing Login API with Raja credentials...\n');
        const postData = JSON.stringify({
            email: 'Raja@deliveryagent.com',
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
                console.log(`Status Code: ${res.statusCode}`);
                console.log(`Response: ${data}\n`);

                try {
                    const response = JSON.parse(data);
                    if (res.statusCode === 200) {
                        console.log('✅ Login successful!');
                        console.log(`User: ${response.name} (${response.role})`);
                    } else {
                        console.log('❌ Login failed!');
                        console.log(`Error: ${response.message}`);
                    }
                } catch (e) {
                    console.log('❌ Error parsing response');
                    console.log(`Raw response: ${data}`);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Request Error: ${err.message}`);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
};

testLoginAPI();
