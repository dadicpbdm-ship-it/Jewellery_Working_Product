const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testContactSubmission() {
    console.log('Testing Contact Form Submission...\n');

    try {
        // Test 1: Valid contact submission
        console.log('Test 1: Valid contact submission');
        const validContact = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            subject: 'Product Inquiry',
            message: 'I would like to know more about your diamond collection.'
        };

        const response1 = await axios.post(`${BASE_URL}/api/contact`, validContact);
        console.log('✓ Success:', response1.data.message);
        console.log('Contact ID:', response1.data.contact._id);
        console.log('');

        // Test 2: Contact without subject (should use default)
        console.log('Test 2: Contact without subject');
        const contactNoSubject = {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            message: 'Can you provide information about custom jewelry designs?'
        };

        const response2 = await axios.post(`${BASE_URL}/api/contact`, contactNoSubject);
        console.log('✓ Success:', response2.data.message);
        console.log('Subject used:', response2.data.contact.subject);
        console.log('');

        // Test 3: Missing required field (should fail)
        console.log('Test 3: Missing required field (should fail)');
        const invalidContact = {
            name: 'Test User',
            email: 'test@example.com'
            // Missing message
        };

        try {
            await axios.post(`${BASE_URL}/api/contact`, invalidContact);
            console.log('✗ Failed: Should have returned error');
        } catch (error) {
            console.log('✓ Correctly rejected:', error.response.data.message);
        }
        console.log('');

        // Test 4: Invalid email format (should fail)
        console.log('Test 4: Invalid email format (should fail)');
        const invalidEmail = {
            name: 'Test User',
            email: 'invalid-email',
            message: 'This should fail due to invalid email'
        };

        try {
            await axios.post(`${BASE_URL}/api/contact`, invalidEmail);
            console.log('✗ Failed: Should have returned error');
        } catch (error) {
            console.log('✓ Correctly rejected:', error.response.data.message);
        }
        console.log('');

        console.log('All tests completed!');

    } catch (error) {
        console.error('Error during testing:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the tests
testContactSubmission();
