const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const testRajaLoginDirectly = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('✓ MongoDB Connected\n');

        const email = 'Raja@deliveryagent.com';
        const password = 'password123';

        console.log('Testing login with:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}\n`);

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found with this email');
            console.log('\nLet me check all delivery agents:');
            const allAgents = await User.find({ role: 'delivery' });
            console.log('\nAll delivery agents:');
            allAgents.forEach(agent => {
                console.log(`  - Name: ${agent.name}, Email: ${agent.email}`);
            });
            mongoose.connection.close();
            return;
        }

        console.log('✅ User found!');
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);

        // Test password
        const isMatch = await user.matchPassword(password);
        console.log(`\nPassword match: ${isMatch ? '✅ YES' : '❌ NO'}`);

        if (isMatch) {
            console.log('\n✅ LOGIN SHOULD WORK!');
            console.log('The credentials are correct.');
        } else {
            console.log('\n❌ PASSWORD DOES NOT MATCH');
            console.log('Testing other common passwords...');

            const testPasswords = ['Password123', 'Raja123', 'raja123', '12345678'];
            for (const pwd of testPasswords) {
                const match = await user.matchPassword(pwd);
                if (match) {
                    console.log(`   ✅ Found match: ${pwd}`);
                }
            }
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
    }
};

testRajaLoginDirectly();
