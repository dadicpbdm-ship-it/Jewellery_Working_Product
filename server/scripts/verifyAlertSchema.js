const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Alert = require('../models/Alert');
const User = require('../models/User');

dotenv.config();

const testPincodeAlert = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Get a random user and product
        const user = await User.findOne();
        if (!user) throw new Error('No user found');

        console.log(`Using User: ${user.email}`);

        // 2. Create a Mock Alert Object with Pincode
        const alertData = {
            user: user._id,
            product: new mongoose.Types.ObjectId(), // Fake Product ID
            type: 'availability',
            pincode: '560001',
            channels: ['whatsapp', 'email']
        };

        // 3. Save directly to DB to verify Schema compatibility
        // (We are testing the Model here primarily, seeing if it accepts the fields)
        const alert = await Alert.create(alertData);

        console.log('Alert Created Successfully:');
        console.log(`ID: ${alert._id}`);
        console.log(`Type: ${alert.type}`);
        console.log(`Pincode: ${alert.pincode}`);
        console.log(`Channels: ${alert.channels.join(', ')}`);

        if (alert.pincode === '560001' && alert.channels.includes('whatsapp')) {
            console.log('✅ TEST PASSED: Alert schema accepts pincode and channels.');
        } else {
            console.log('❌ TEST FAILED: Pincode or channels mismatch.');
        }

        // Cleanup
        await Alert.deleteOne({ _id: alert._id });
        console.log('Cleanup successful');

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testPincodeAlert();
