const Contact = require('../models/Contact');
const sendEmail = require('../utils/emailService');

const submitContact = async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                message: 'Please provide name, email, and message'
            });
        }

        // Create new contact submission
        const contact = new Contact({
            name,
            email,
            subject: subject || 'General Inquiry',
            message
        });

        const savedContact = await contact.save();

        // Send email notification to admin
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'; // Fallback or env var
            const emailSubject = `New Contact Inquiry: ${subject || 'General Inquiry'}`;
            const emailMessage = `
                You have received a new contact inquiry.
                
                Name: ${name}
                Email: ${email}
                Subject: ${subject || 'General Inquiry'}
                Message: ${message}
                
                Login to dashboard to view more details.
            `;

            await sendEmail({
                email: adminEmail,
                subject: emailSubject,
                message: emailMessage
            });
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Continue execution, don't fail the request just because email failed
        }

        res.status(201).json({
            message: 'Thank you for contacting us! We will get back to you soon.',
            contact: {
                _id: savedContact._id,
                name: savedContact.name,
                email: savedContact.email,
                subject: savedContact.subject,
                createdAt: savedContact.createdAt
            }
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({
            message: 'Failed to submit contact form. Please try again later.',
            error: error.message
        });
    }
};

// Admin function to get all contact submissions
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin function to update contact status
const updateContactStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        contact.status = status;
        await contact.save();

        res.json({ message: 'Contact status updated', contact });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitContact, getAllContacts, updateContactStatus };
