const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const resetRajaPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('✓ MongoDB Connected\n');

        // Find Raja
        const raja = await User.findOne({ name: 'Raja', role: 'delivery' });

        if (!raja) {
            console.log('❌ Raja not found in database');
            mongoose.connection.close();
            return;
        }

        // Set new password
        const newPassword = 'password123';
        raja.password = newPassword;
        await raja.save(); // This will trigger the pre-save hook to hash the password

        console.log('✅ Password reset successfully!');
        console.log('');
        console.log('📧 Email: ' + raja.email);
        console.log('🔑 New Password: ' + newPassword);
        console.log('');
        console.log('You can now login with these credentials.');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
    }
};

resetRajaPassword();
