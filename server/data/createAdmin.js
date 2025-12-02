const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('MongoDB Connected');

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@jewelindia.com' });

        if (adminExists) {
            console.log('ℹ️  Admin user already exists');
            console.log('Email:', adminExists.email);
            console.log('Role:', adminExists.role);
        } else {
            // Create admin user
            const admin = await User.create({
                name: 'Admin',
                email: 'admin@jewelindia.com',
                password: 'admin123',
                role: 'admin'
            });

            console.log('✅ Admin user created successfully!');
            console.log('Email:', admin.email);
            console.log('Password: admin123');
            console.log('Role:', admin.role);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
