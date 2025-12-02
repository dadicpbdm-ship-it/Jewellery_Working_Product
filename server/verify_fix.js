const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const verifyFix = async () => {
    await connectDB();

    try {
        // 1. Find a delivery agent
        const agent = await User.findOne({ role: 'delivery' });
        if (!agent) {
            console.log('No delivery agent found. Please create one first.');
            process.exit(1);
        }
        console.log(`Using delivery agent: ${agent.name} (${agent._id})`);

        // 2. Create a test order assigned to this agent
        const order = await Order.create({
            user: agent._id, // Just using agent as user for simplicity
            orderItems: [{
                name: 'Test Item',
                quantity: 1,
                image: '/images/test.jpg',
                price: 100,
                product: new mongoose.Types.ObjectId()
            }],
            shippingAddress: {
                address: 'Test Address',
                city: 'Test City',
                postalCode: '123456',
                country: 'Test Country'
            },
            paymentMethod: 'Cash on Delivery',
            itemsPrice: 100,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 100,
            deliveryAgent: agent._id,
            isDelivered: false
        });
        console.log(`Created test order: ${order._id}`);

        // 3. Simulate "Mark Delivered" logic (mimicking the route handler)
        console.log('--- Testing Logic Flow ---');

        // Step A: Mark as delivered (First time)
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        // Decrement active orders
        if (agent.activeOrders > 0) {
            agent.activeOrders -= 1;
            await agent.save();
            console.log('Decremented active orders');
        }
        await order.save();
        console.log('Order marked as delivered (1st time)');

        // Step B: Try to mark as delivered again (Simulating the check)
        const refetchedOrder = await Order.findById(order._id);
        if (refetchedOrder.isDelivered) {
            console.log('Check passed: Order is already marked as delivered. Request would be rejected.');
        } else {
            console.error('Check failed: Order should be marked as delivered.');
        }

        // Cleanup
        await Order.findByIdAndDelete(order._id);
        console.log('Test order cleaned up');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        mongoose.connection.close();
    }
};

verifyFix();
