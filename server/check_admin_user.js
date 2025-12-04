const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app';

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        try {
            // Define a minimal User schema to query
            const userSchema = new mongoose.Schema({
                name: String,
                email: String,
                role: String,
                password: String // We won't print this, just check if it exists
            });
            
            const User = mongoose.model('User', userSchema);
            
            // Find all users with role 'admin'
            const admins = await User.find({ role: 'admin' });
            console.log('--- Admins found ---');
            admins.forEach(u => {
                console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, ID: ${u._id}`);
            });
            
            if (admins.length === 0) {
                console.log('No users with role "admin" found.');
            }

            // Check specifically for the requested email
            const specificUser = await User.findOne({ email: 'admin@jewelindia.com' });
            console.log('\n--- Check for admin@jewelindia.com ---');
            if (specificUser) {
                console.log(`User found: Name: ${specificUser.name}, Email: ${specificUser.email}, Role: ${specificUser.role}`);
            } else {
                console.log('User admin@jewelindia.com NOT found.');
            }

        } catch (err) {
            console.error('Error querying users:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
