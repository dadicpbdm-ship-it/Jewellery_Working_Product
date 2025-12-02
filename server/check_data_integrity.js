const mongoose = require('mongoose');
const Order = require('./models/Order');
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

const checkData = async () => {
    await connectDB();

    try {
        const orders = await Order.find({});
        console.log(`Found ${orders.length} orders.`);

        let invalidCount = 0;

        for (const order of orders) {
            // Check for 'qty' vs 'quantity' in orderItems
            let hasIssue = false;
            if (order.orderItems && order.orderItems.length > 0) {
                order.orderItems.forEach((item, index) => {
                    // Mongoose might have stripped 'qty' if it's not in schema, 
                    // but if 'quantity' is missing, it's an issue.
                    if (item.quantity === undefined || item.quantity === null) {
                        console.log(`Order ${order._id}: Item ${index} missing 'quantity'. Raw item:`, item);
                        hasIssue = true;
                    }

                    // Check if 'qty' exists in the raw document (need to use toObject or lean if we want to see extra fields, 
                    // but Mongoose model instance might hide them. Let's rely on missing 'quantity').
                });
            }

            if (hasIssue) {
                invalidCount++;
                console.log(`Order ${order._id} is invalid.`);

                // Try to validate
                try {
                    await order.validate();
                } catch (err) {
                    console.log(`Validation error for order ${order._id}:`, err.message);
                }
            }
        }

        console.log(`Total invalid orders found: ${invalidCount}`);

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkData();
