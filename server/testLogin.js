const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const testLogin = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('✓ MongoDB Connected');

        // Check if any users exist
        const userCount = await User.countDocuments();
        console.log(`\n📊 Total users in database: ${userCount}`);

        if (userCount === 0) {
            console.log('\n⚠️  No users found in database!');
            console.log('Creating test users...\n');

            // Create a regular user
            const testUser = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            });
            console.log('✓ Created test user:', testUser.email);

            // Create an admin user
            const adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('✓ Created admin user:', adminUser.email);
        } else {
            // List all users
            const users = await User.find({}, 'name email role');
            console.log('\n👥 Existing users:');
            users.forEach(user => {
                console.log(`  - ${user.email} (${user.role})`);
            });
        }

        // Test password matching
        console.log('\n🔐 Testing password matching...');
        const testUser = await User.findOne({ email: 'test@example.com' });
        if (testUser) {
            const isMatch = await testUser.matchPassword('password123');
            console.log(`  Password match test: ${isMatch ? '✓ PASS' : '✗ FAIL'}`);
        }

        const adminUser = await User.findOne({ email: 'admin@example.com' });
        if (adminUser) {
            const isMatch = await adminUser.matchPassword('admin123');
            console.log(`  Admin password match test: ${isMatch ? '✓ PASS' : '✗ FAIL'}`);
        }

        console.log('\n📝 Test credentials:');
        console.log('  Regular User: test@example.com / password123');
        console.log('  Admin User: admin@example.com / admin123');

        mongoose.connection.close();
        console.log('\n✓ Test completed successfully');
    } catch (error) {
        console.error('❌ Error:', error.message);
        mongoose.connection.close();
    }
};

testLogin();
