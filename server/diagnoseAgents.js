const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jewellery_app')
    .then(() => console.log('✓ Connected to MongoDB'))
    .catch(err => console.error('✗ MongoDB connection error:', err));

async function diagnoseDeliveryAgents() {
    try {
        console.log('\n========== DELIVERY AGENT DIAGNOSIS ==========\n');

        // Find all delivery agents
        const agents = await User.find({ role: 'delivery' });

        console.log(`Total Delivery Agents: ${agents.length}\n`);

        if (agents.length === 0) {
            console.log('❌ NO DELIVERY AGENTS FOUND!');
            console.log('   → Please register delivery agents first\n');
            process.exit(0);
        }

        // Analyze each agent
        agents.forEach((agent, index) => {
            console.log(`Agent #${index + 1}:`);
            console.log(`  Name: ${agent.name}`);
            console.log(`  Email: ${agent.email}`);
            console.log(`  Assigned Area: "${agent.assignedArea || 'NOT SET'}"`);
            console.log(`  Active Orders: ${agent.activeOrders || 0}`);
            console.log(`  Phone: ${agent.phone || 'N/A'}`);
            console.log(`  Created: ${agent.createdAt}`);

            // Check for issues
            if (!agent.assignedArea || agent.assignedArea.trim() === '') {
                console.log(`  ⚠️  WARNING: No assigned area set!`);
            } else {
                console.log(`  ✓ Assigned area is set`);
            }
            console.log('');
        });

        // Summary
        const agentsWithArea = agents.filter(a => a.assignedArea && a.assignedArea.trim() !== '');
        const agentsWithoutArea = agents.filter(a => !a.assignedArea || a.assignedArea.trim() === '');

        console.log('========== SUMMARY ==========');
        console.log(`Agents with assigned area: ${agentsWithArea.length}`);
        console.log(`Agents without assigned area: ${agentsWithoutArea.length}`);

        if (agentsWithArea.length > 0) {
            console.log('\nAssigned Areas:');
            agentsWithArea.forEach(a => {
                console.log(`  - ${a.assignedArea} (${a.name})`);
            });
        }

        if (agentsWithoutArea.length > 0) {
            console.log('\n⚠️  ISSUE FOUND:');
            console.log(`   ${agentsWithoutArea.length} agent(s) have no assigned area.`);
            console.log('   These agents will NOT be automatically assigned to orders.');
            console.log('\n   SOLUTION: Update these agents with assigned areas:');
            agentsWithoutArea.forEach(a => {
                console.log(`   - ${a.name} (${a.email})`);
            });
        }

        console.log('\n========================================\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

// Run diagnosis
diagnoseDeliveryAgents();
