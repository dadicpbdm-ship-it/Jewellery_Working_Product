const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const testDeliveryAgentLogin = async () => {
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

        console.log('✅ Found Raja:');
        console.log(`   Email: ${raja.email}`);
        console.log(`   Role: ${raja.role}`);
        console.log(`   Password (hashed): ${raja.password.substring(0, 30)}...`);
        console.log(`   Password starts with $2: ${raja.password.startsWith('$2')}`);
        console.log('');

        // Test common passwords
        const testPasswords = ['password', 'Password', 'raja', 'Raja', '123456', 'password123'];

        console.log('Testing common passwords:');
        for (const pwd of testPasswords) {
            const isMatch = await raja.matchPassword(pwd);
            if (isMatch) {
                console.log(`   ✅ Password '${pwd}' MATCHES!`);
            } else {
                console.log(`   ❌ Password '${pwd}' does not match`);
            }
        }

        console.log('\n💡 If none match, the password you set in admin panel was different.');
        console.log('   Try logging in with the exact password you entered when creating Raja.');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
    }
};

testDeliveryAgentLogin();
