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

const fixPaymentStatus = async () => {
    await connectDB();

    try {
        // Find orders where COD payment is received but isPaid is false
        const ordersToFix = await Order.find({
            codPaymentReceived: true,
            isPaid: false
        });

        console.log(`Found ${ordersToFix.length} orders to fix.`);

        for (const order of ordersToFix) {
            console.log(`Fixing Order ID: ${order._id}`);
            order.isPaid = true;
            // Use codPaymentReceivedAt if available, otherwise now
            order.paidAt = order.codPaymentReceivedAt || Date.now();

            await order.save();
            console.log(`✓ Order ${order._id} marked as Paid.`);
        }

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Error fixing payment status:', error);
    } finally {
        mongoose.connection.close();
    }
};

fixPaymentStatus();
