const testOrder = async () => {
    try {
        // 1. Login to get token
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
        const user = await loginRes.json();

        if (!user.token) {
            console.error('Login failed:', user);
            return;
        }
        console.log('Login successful');

        // 2. Create Order
        const orderData = {
            orderItems: [
                {
                    name: 'Test Product',
                    quantity: 1,
                    image: 'http://example.com/image.jpg',
                    price: 1000,
                    product: '692b3034cf7dc8b7fc295f60' // Using ID from previous check
                }
            ],
            shippingAddress: {
                address: '123 Test St',
                city: 'Test City',
                postalCode: '12345',
                country: 'Test Country'
            },
            paymentMethod: 'Cash on Delivery',
            itemsPrice: 1000,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 1000
        };

        const orderRes = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify(orderData)
        });

        const order = await orderRes.json();
        console.log('Order Response Status:', orderRes.status);
        console.log('Order Created:', order);

    } catch (error) {
        console.error('Error:', error);
    }
};

testOrder();
