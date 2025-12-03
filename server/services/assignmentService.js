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
const assignDeliveryAgent = async (deliveryCity, deliveryPincode) => {
    try {
        console.log('\n========== ASSIGNMENT SERVICE ==========');
        console.log('Delivery City:', deliveryCity);
        console.log('Delivery Pincode:', deliveryPincode);

        // Normalize inputs
        const normalizedCity = deliveryCity.trim().toLowerCase();
        const normalizedPincode = deliveryPincode ? deliveryPincode.trim() : '';

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

        // 1. Filter by Pincode Match (Highest Priority)
        const pincodeMatchedAgents = agentsWithLoad.filter(agent => {
            if (!agent.assignedPincodes || agent.assignedPincodes.length === 0) return false;
            return agent.assignedPincodes.includes(normalizedPincode);
        });

        let selectedAgent;

        if (pincodeMatchedAgents.length > 0) {
            console.log(`Found ${pincodeMatchedAgents.length} agents for pincode "${normalizedPincode}"`);
            // Select agent with lowest workload from pincode-matched agents
            selectedAgent = pincodeMatchedAgents.reduce((prev, current) => {
                return (current.currentLoad < prev.currentLoad) ? current : prev;
            });
            console.log(`✓ Assigned to PINCODE-matched agent: ${selectedAgent.name} (Load: ${selectedAgent.currentLoad})`);
        } else {
            // 2. Fallback to City Match
            const areaMatchedAgents = agentsWithLoad.filter(agent => {
                if (!agent.assignedArea) return false;
                return agent.assignedArea.trim().toLowerCase() === normalizedCity;
            });

            if (areaMatchedAgents.length > 0) {
                console.log(`Found ${areaMatchedAgents.length} agents for city "${normalizedCity}"`);
                // Select agent with lowest workload from area-matched agents
                selectedAgent = areaMatchedAgents.reduce((prev, current) => {
                    return (current.currentLoad < prev.currentLoad) ? current : prev;
                });
                console.log(`✓ Assigned to CITY-matched agent: ${selectedAgent.name} (Load: ${selectedAgent.currentLoad})`);
            } else {
                // 3. Fallback to Global Match
                // Select agent with lowest workload globally
                selectedAgent = agentsWithLoad.reduce((prev, current) => {
                    return (current.currentLoad < prev.currentLoad) ? current : prev;
                });
                console.log(`⚠ No specific match. Assigned to GLOBAL agent: ${selectedAgent.name} (Load: ${selectedAgent.currentLoad})`);
            }
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
