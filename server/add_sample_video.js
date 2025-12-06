const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const SAMPLE_VIDEO = "https://videos.pexels.com/video-files/5359876/5359876-hd_1080_1920_25fps.mp4"; // Elegant jewellery rotation video

const addSampleVideo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB Connected');

        // Find the first product (or a specific "Ring" if possible)
        const products = await Product.find({ category: 'Ring' }).limit(1);
        const product = products[0];

        if (product) {
            product.videoUrl = SAMPLE_VIDEO;
            await product.save();
            console.log(`Updated product: ${product.name} with sample video URL.`);
            console.log(`Product ID: ${product._id}`);
        } else {
            console.log('No product found to update.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addSampleVideo();
