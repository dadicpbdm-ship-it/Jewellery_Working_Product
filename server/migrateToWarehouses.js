const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Warehouse = require('./models/Warehouse');
const Product = require('./models/Product');
const Pincode = require('./models/Pincode');

dotenv.config();

const migrateToWarehouses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app');
        console.log('MongoDB Connected');

        // Check if default warehouse already exists
        let defaultWarehouse = await Warehouse.findOne({ code: 'DEFAULT' });

        if (defaultWarehouse) {
            console.log('✓ Default warehouse already exists');
        } else {
            console.log('\n1. Creating Default Warehouse...');

            // Get all serviceable pincodes
            const pincodes = await Pincode.find({ isActive: true });
            const serviceablePincodes = pincodes.map(p => p.code);

            defaultWarehouse = await Warehouse.create({
                name: 'Default Warehouse',
                code: 'DEFAULT',
                location: {
                    address: 'Main Distribution Center',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001'
                },
                serviceablePincodes: serviceablePincodes,
                isActive: true,
                manager: {
                    name: 'System Admin',
                    email: 'admin@jewelindia.com',
                    phone: 'N/A'
                },
                inventory: []
            });

            console.log(`✓ Default warehouse created with ${serviceablePincodes.length} serviceable pincodes`);
        }

        // Migrate product stock to warehouse inventory
        console.log('\n2. Migrating Product Stock to Warehouse...');
        const products = await Product.find({});
        let migratedCount = 0;
        let skippedCount = 0;

        for (const product of products) {
            // Check if product already in warehouse inventory
            const existingItem = defaultWarehouse.inventory.find(
                inv => inv.product.toString() === product._id.toString()
            );

            if (existingItem) {
                console.log(`  ⚠ Skipped ${product.name} (already in warehouse)`);
                skippedCount++;
                continue;
            }

            // Add product to warehouse inventory
            defaultWarehouse.inventory.push({
                product: product._id,
                stock: product.stock || 0,
                reservedStock: 0,
                lastUpdated: new Date()
            });

            migratedCount++;
        }

        if (migratedCount > 0) {
            await defaultWarehouse.save();
            console.log(`✓ Migrated ${migratedCount} products to warehouse inventory`);
        }

        if (skippedCount > 0) {
            console.log(`  Skipped ${skippedCount} products (already migrated)`);
        }

        console.log('\n✅ Migration Complete!');
        console.log(`\nSummary:`);
        console.log(`- Warehouse: ${defaultWarehouse.name} (${defaultWarehouse.code})`);
        console.log(`- Serviceable Pincodes: ${defaultWarehouse.serviceablePincodes.length}`);
        console.log(`- Products in Inventory: ${defaultWarehouse.inventory.length}`);

    } catch (error) {
        console.error('❌ Migration Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

migrateToWarehouses();
