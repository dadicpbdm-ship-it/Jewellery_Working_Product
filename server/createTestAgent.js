const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const createTestAgent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('✓ MongoDB Connected');

        const email = 'agent@test.com';
        const password = 'password123';

        // Delete if exists
        await User.deleteOne({ email });

        const agent = await User.create({
            name: 'Test Agent',
            email,
            password,
            role: 'delivery',
            assignedArea: 'Test Area'
        });

        console.log('✅ Created test agent:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: ${agent.role}`);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
    }
};

createTestAgent();
