const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Order = require('./models/Order');
const Pincode = require('./models/Pincode');
const { assignDeliveryAgent } = require('./services/assignmentService');

dotenv.config();

const verifyPincodeSystem = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('MongoDB Connected');

        const TEST_PINCODE = '999999';
        const TEST_CITY = 'TestCity';

        // 1. Setup: Create Pincode
        console.log('\n1. Creating Test Pincode...');
        await Pincode.deleteOne({ code: TEST_PINCODE });
        await Pincode.create({
            code: TEST_PINCODE,
            city: TEST_CITY,
            state: 'TestState',
            deliveryDays: 2
        });
        console.log('✓ Pincode created');

        // 2. Setup: Create Agent with Pincode
        console.log('\n2. Creating Test Agent...');
        const agentEmail = 'testagent_pincode@example.com';
        await User.deleteOne({ email: agentEmail });
        const agent = await User.create({
            name: 'Pincode Agent',
            email: agentEmail,
            password: 'password123',
            role: 'delivery',
            assignedPincodes: [TEST_PINCODE],
            assignedArea: 'OtherCity' // Intentionally different city to prove pincode priority
        });
        console.log('✓ Agent created with assignedPincodes:', agent.assignedPincodes);

        // 3. Test Assignment Logic
        console.log('\n3. Testing Assignment Logic...');

        // Case A: Match by Pincode (Should succeed)
        console.log('Case A: Testing Pincode Match...');
        const assignedId = await assignDeliveryAgent(TEST_CITY, TEST_PINCODE);

        if (assignedId && assignedId.toString() === agent._id.toString()) {
            console.log('✓ SUCCESS: Agent assigned based on Pincode!');
        } else {
            console.log('❌ FAILED: Wrong agent assigned or null');
            console.log('Assigned ID:', assignedId);
            console.log('Expected ID:', agent._id);
        }

        // Case B: Mismatch Pincode (Should fail or fallback)
        console.log('\nCase B: Testing Pincode Mismatch...');
        const otherPincode = '888888';
        const assignedId2 = await assignDeliveryAgent(TEST_CITY, otherPincode);

        if (assignedId2 && assignedId2.toString() === agent._id.toString()) {
            // If it falls back to global, it might pick this agent if they are the only one or have low load
            console.log('⚠ Agent assigned (likely fallback to global/city)');
        } else {
            console.log('✓ Agent NOT assigned (as expected for strict pincode match if implemented strictly, or assigned to another)');
        }

        // Cleanup
        console.log('\nCleaning up...');
        await User.deleteOne({ _id: agent._id });
        await Pincode.deleteOne({ code: TEST_PINCODE });
        console.log('✓ Cleanup done');

    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyPincodeSystem();
