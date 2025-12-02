const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Automatically assign an order to a delivery agent
 * Algorithm:
 * 1. Find agents assigned to the delivery area (city)
 * 2. Among matched agents, select one with lowest ACTIVE orders (calculated dynamically)
 * 3. If no area match, select agent with lowest ACTIVE orders globally
 * 4. Return the selected agent's ID
 */
const assignDeliveryAgent = async (deliveryCity) => {
    try {
        console.log('\n========== ASSIGNMENT SERVICE ==========');
        console.log('Delivery City:', deliveryCity);

        // Normalize city name for comparison
        const normalizedCity = deliveryCity.trim().toLowerCase();

        // Find all delivery agents
        const allAgents = await User.find({ role: 'delivery' });

        if (allAgents.length === 0) {
            console.log('❌ No delivery agents available');
            return null;
        }

        // Calculate dynamic active orders for all agents
        const agentsWithLoad = await Promise.all(allAgents.map(async (agent) => {
            const activeCount = await Order.countDocuments({
                deliveryAgent: agent._id,
                isDelivered: false
            });
            return {
                ...agent.toObject(),
                currentLoad: activeCount
            };
        }));

        // Filter agents by assigned area (city match)
        const areaMatchedAgents = agentsWithLoad.filter(agent => {
            if (!agent.assignedArea) return false;
            return agent.assignedArea.trim().toLowerCase() === normalizedCity;
        });

        console.log(`Found ${areaMatchedAgents.length} agents for area "${normalizedCity}"`);

        let selectedAgent;

        if (areaMatchedAgents.length > 0) {
            // Select agent with lowest workload from area-matched agents
            selectedAgent = areaMatchedAgents.reduce((prev, current) => {
                return (current.currentLoad < prev.currentLoad) ? current : prev;
            });
            console.log(`✓ Assigned to area-matched agent: ${selectedAgent.name} (Load: ${selectedAgent.currentLoad})`);
        } else {
            // No area match, select agent with lowest workload globally
            selectedAgent = agentsWithLoad.reduce((prev, current) => {
                return (current.currentLoad < prev.currentLoad) ? current : prev;
            });
            console.log(`⚠ No area match. Assigned to global agent: ${selectedAgent.name} (Load: ${selectedAgent.currentLoad})`);
        }

        console.log('========================================\n');
        return selectedAgent._id;
    } catch (error) {
        console.error('❌ Error in assignDeliveryAgent:', error);
        return null;
    }
};

/**
 * Deprecated: Decrement active orders count
 * Kept for backward compatibility but does nothing now as we use dynamic counting.
 */
const decrementActiveOrders = async (agentId) => {
    // No-op: We now calculate active orders dynamically
    console.log(`[AssignmentService] decrementActiveOrders called for ${agentId} - Ignored (using dynamic counting)`);
};

module.exports = {
    assignDeliveryAgent,
    decrementActiveOrders
};
