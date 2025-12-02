const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewellery_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const seedAdmin = async () => {
    try {
        await User.deleteMany({ email: 'admin@example.com' });

        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword', // Will be hashed by pre-save hook
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user seeded');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
