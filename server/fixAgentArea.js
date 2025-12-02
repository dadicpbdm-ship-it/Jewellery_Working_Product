const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jewellery_app')
    .then(() => console.log('✓ Connected to MongoDB'))
    .catch(err => console.error('✗ MongoDB connection error:', err));

async function fixAgentAssignedArea() {
    try {
        console.log('\n========== FIXING DELIVERY AGENT ASSIGNED AREA ==========\n');

        // Find Krishna (the agent without assigned area)
        const agent = await User.findOne({ email: 'test@deliveryagent.com', role: 'delivery' });

        if (!agent) {
            console.log('❌ Agent not found!');
            process.exit(1);
        }

        console.log(`Found agent: ${agent.name}`);
        console.log(`Current assigned area: "${agent.assignedArea || 'NOT SET'}"`);

        // Update assigned area to a default city
        // You can change this to any city you want
        const newAssignedArea = 'Delhi';

        agent.assignedArea = newAssignedArea;
        await agent.save();

        console.log(`✓ Updated assigned area to: "${newAssignedArea}"`);
        console.log('\n========================================\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

// Run fix
fixAgentAssignedArea();
