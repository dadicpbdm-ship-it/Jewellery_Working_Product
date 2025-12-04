const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User'); // Adjust path if needed

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app';

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            const email = 'admin@jewelindia.com';
            const newPassword = 'password123';

            const user = await User.findOne({ email });

            if (!user) {
                console.log(`User ${email} not found!`);
            } else {
                console.log(`Found user: ${user.name} (${user.role})`);

                // Explicitly set the password. The pre-save hook in User.js will hash it.
                user.password = newPassword;
                await user.save();

                console.log(`Password for ${email} has been reset to '${newPassword}'`);
            }

        } catch (err) {
            console.error('Error resetting password:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
