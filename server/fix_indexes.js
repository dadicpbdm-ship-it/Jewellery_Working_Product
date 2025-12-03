const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('✅ MongoDB Connected');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // List indexes
        const indexes = await collection.indexes();
        console.log('📊 Current Indexes:', indexes.map(i => i.name));

        // Drop email index if it exists
        const emailIndex = indexes.find(i => i.key.email);
        if (emailIndex) {
            console.log(`🗑️ Dropping index: ${emailIndex.name}`);
            await collection.dropIndex(emailIndex.name);
            console.log('✅ Index dropped successfully');
        } else {
            console.log('⚠️ Email index not found');
        }

        console.log('🔄 Please restart the server to let Mongoose recreate the index with sparse: true');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixIndexes();
