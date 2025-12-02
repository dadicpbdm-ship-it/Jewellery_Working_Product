const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testConnection = async () => {
    try {
        console.log('Attempting to connect to:', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');

        console.log('✅ MongoDB Connected Successfully!');

        // Test database operations
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        // Try to create a test user
        const User = require('./models/User');
        const testUser = await User.findOne({ email: 'test@example.com' });

        if (testUser) {
            console.log('✅ Found existing test user:', testUser.email);
        } else {
            console.log('ℹ️  No test user found yet');
        }

        await mongoose.connection.close();
        console.log('Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        process.exit(1);
    }
};

testConnection();
