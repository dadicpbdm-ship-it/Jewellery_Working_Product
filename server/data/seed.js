const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app')
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const products = [
    {
        name: 'Traditional Gold Jhumka',
        description: 'Exquisite 22k gold jhumka with intricate filigree work, perfect for weddings.',
        price: 45000,
        category: 'Earrings',
        imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a51?q=80&w=2000&auto=format&fit=crop',
        rating: 4.8,
        isFeatured: true,
    },
    {
        name: 'Diamond Choker Necklace',
        description: 'Stunning diamond choker set in 18k white gold, a statement piece for receptions.',
        price: 120000,
        category: 'Necklaces',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2000&auto=format&fit=crop',
        rating: 5.0,
        isFeatured: true,
    },
    {
        name: 'Kundan Bangles Set',
        description: 'Handcrafted Kundan bangles with ruby and emerald stones.',
        price: 25000,
        category: 'Bangles',
        imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000&auto=format&fit=crop',
        rating: 4.5,
        isFeatured: false,
    },
    {
        name: 'Temple Jewellery Haram',
        description: 'Antique finish temple jewellery haram featuring Goddess Lakshmi motifs.',
        price: 85000,
        category: 'Necklaces',
        imageUrl: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000&auto=format&fit=crop',
        rating: 4.9,
        isFeatured: true,
    },
    {
        name: 'Silver Oxidized Ring',
        description: 'Boho style silver oxidized ring with floral design.',
        price: 1500,
        category: 'Rings',
        imageUrl: 'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?q=80&w=2000&auto=format&fit=crop',
        rating: 4.2,
        isFeatured: false,
    },
    {
        name: 'Polki Maang Tikka',
        description: 'Elegant Polki Maang Tikka with pearl drops.',
        price: 12000,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2000&auto=format&fit=crop',
        rating: 4.6,
        isFeatured: true,
    },
    {
        name: 'Pearl Drop Earrings',
        description: 'Classic pearl drop earrings with gold plating. Elegant and timeless.',
        price: 3000,
        category: 'Earrings',
        imageUrl: 'https://images.unsplash.com/photo-1600180758895-1c2b5f2b9c3a?q=80&w=2000&auto=format&fit=crop',
        rating: 4.4,
        isFeatured: false,
    }
];

const seedData = async () => {
    try {
        await Product.deleteMany();
        console.log('Products Removed');

        await Product.insertMany(products);
        console.log('Products Imported');

        process.exit();
    } catch (error) {
        console.error('Error with data import', error);
        process.exit(1);
    }
};

seedData();
