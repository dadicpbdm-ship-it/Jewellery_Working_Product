const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('MongoDB Connected');

        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        if (products.length > 0) {
            console.log('First product sample:', JSON.stringify(products[0], null, 2));

            // Check for mixed field usage
            const withImage = products.filter(p => p.image);
            const withImageUrl = products.filter(p => p.imageUrl);

            console.log(`Products with 'image' field: ${withImage.length}`);
            console.log(`Products with 'imageUrl' field: ${withImageUrl.length}`);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkProducts();
