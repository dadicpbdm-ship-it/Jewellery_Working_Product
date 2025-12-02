const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const checkDeliveryAgents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('✓ MongoDB Connected');

        const agents = await User.find({ role: 'delivery' });
        console.log(`\nFound ${agents.length} delivery agents:`);

        for (const agent of agents) {
            console.log(`- ${agent.email} (Name: ${agent.name})`);
            // Try to match a default password '123456' or 'password123'
            const isMatch1 = await agent.matchPassword('123456');
            const isMatch2 = await agent.matchPassword('password123');
            const isMatch3 = await agent.matchPassword('delivery123');

            if (isMatch1) console.log('  ✓ Password matches: 123456');
            else if (isMatch2) console.log('  ✓ Password matches: password123');
            else if (isMatch3) console.log('  ✓ Password matches: delivery123');
            else console.log('  ❌ Password does not match common defaults');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
    }
};

checkDeliveryAgents();
