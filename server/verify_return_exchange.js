const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const verifyReturnExchange = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find a delivered order
        const order = await Order.findOne({ isDelivered: true });
        if (!order) {
            console.log('No delivered order found. Please create one first.');
            process.exit(0);
        }
        console.log(`Found delivered order: ${order._id}`);

        // 2. Simulate User Request
        console.log('Simulating User Return Request...');
        order.returnExchangeRequest = {
            type: 'Return',
            reason: 'Product damaged',
            status: 'Pending',
            requestDate: Date.now()
        };
        await order.save();
        console.log('Return request saved successfully.');

        // 3. Verify Request Exists
        const updatedOrder = await Order.findById(order._id);
        if (updatedOrder.returnExchangeRequest.type === 'Return' && updatedOrder.returnExchangeRequest.status === 'Pending') {
            console.log('Verification Passed: Return request is pending.');
        } else {
            console.error('Verification Failed: Return request not found or status incorrect.');
        }

        // 4. Simulate Admin Approval
        console.log('Simulating Admin Approval...');
        updatedOrder.returnExchangeRequest.status = 'Approved';
        updatedOrder.returnExchangeRequest.adminComment = 'Approved by test script';
        await updatedOrder.save();
        console.log('Order approved successfully.');

        // 5. Verify Approval
        const finalOrder = await Order.findById(order._id);
        if (finalOrder.returnExchangeRequest.status === 'Approved') {
            console.log('Verification Passed: Return request is approved.');
        } else {
            console.error('Verification Failed: Status is not approved.');
        }

        // Cleanup (Optional - reset to None)
        // finalOrder.returnExchangeRequest = { type: 'None', status: 'Pending' };
        // await finalOrder.save();
        // console.log('Cleanup: Reset order return status.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

verifyReturnExchange();
