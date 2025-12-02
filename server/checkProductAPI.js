const http = require('http');

const testProductAPI = () => {
    return new Promise((resolve, reject) => {
        console.log('Testing Product API Response Structure...');

        http.get('http://localhost:5000/api/products', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('Response Type:', Array.isArray(response) ? 'Array' : 'Object');
                    if (!Array.isArray(response)) {
                        console.log('Response Keys:', Object.keys(response));
                        if (response.products) {
                            console.log('Contains "products" key:', Array.isArray(response.products) ? 'Yes (Array)' : 'No');
                        }
                    }
                    resolve();
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    reject(e);
                }
            });
        }).on('error', (err) => {
            console.error('Error:', err.message);
            reject(err);
        });
    });
};

testProductAPI();
