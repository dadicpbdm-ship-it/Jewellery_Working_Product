const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');

/**
 * Find warehouse serving a specific pincode
 */
const findWarehouseByPincode = async (pincode) => {
    try {
        const warehouse = await Warehouse.findByPincode(pincode);
        return warehouse;
    } catch (error) {
        console.error('Error finding warehouse by pincode:', error);
        return null;
    }
};

/**
 * Check if product is available at warehouse serving the pincode
 */
const checkProductAvailability = async (productId, pincode) => {
    try {
        const warehouse = await findWarehouseByPincode(pincode);

        if (!warehouse) {
            return {
                available: false,
                reason: 'No warehouse services this pincode',
                warehouse: null,
                stock: 0
            };
        }

        const availableStock = warehouse.getProductStock(productId);

        return {
            available: availableStock > 0,
            reason: availableStock > 0 ? 'In stock' : 'Out of stock at this location',
            warehouse: {
                id: warehouse._id,
                name: warehouse.name,
                code: warehouse.code
            },
            stock: availableStock
        };
    } catch (error) {
        console.error('Error checking product availability:', error);
        return {
            available: false,
            reason: 'Error checking availability',
            warehouse: null,
            stock: 0
        };
    }
};

/**
 * Reserve stock for an order
 */
const reserveStock = async (warehouseId, items) => {
    try {
        const warehouse = await Warehouse.findById(warehouseId);

        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // Check all items first
        for (const item of items) {
            const availableStock = warehouse.getProductStock(item.productId);
            if (availableStock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.productId}. Available: ${availableStock}, Requested: ${item.quantity}`);
            }
        }

        // Reserve all items
        for (const item of items) {
            await warehouse.reserveStock(item.productId, item.quantity);
        }

        return {
            success: true,
            warehouse: warehouse._id
        };
    } catch (error) {
        console.error('Error reserving stock:', error);
        throw error;
    }
};

/**
 * Release reserved stock (e.g., order cancelled)
 */
const releaseStock = async (warehouseId, items) => {
    try {
        const warehouse = await Warehouse.findById(warehouseId);

        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        for (const item of items) {
            await warehouse.releaseStock(item.productId, item.quantity);
        }

        return {
            success: true
        };
    } catch (error) {
        console.error('Error releasing stock:', error);
        throw error;
    }
};

/**
 * Fulfill order (deduct stock after delivery)
 */
const fulfillOrder = async (warehouseId, items) => {
    try {
        const warehouse = await Warehouse.findById(warehouseId);

        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        for (const item of items) {
            await warehouse.fulfillOrder(item.productId, item.quantity);
        }

        return {
            success: true
        };
    } catch (error) {
        console.error('Error fulfilling order:', error);
        throw error;
    }
};

/**
 * Get total stock across all warehouses for a product
 */
const getTotalStock = async (productId) => {
    try {
        const warehouses = await Warehouse.find({ isActive: true });
        let totalStock = 0;

        for (const warehouse of warehouses) {
            totalStock += warehouse.getProductStock(productId);
        }

        return totalStock;
    } catch (error) {
        console.error('Error getting total stock:', error);
        return 0;
    }
};

/**
 * Update product stock in a warehouse
 */
const updateWarehouseStock = async (warehouseId, productId, quantity) => {
    try {
        const warehouse = await Warehouse.findById(warehouseId);

        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        await warehouse.updateStock(productId, quantity);

        return {
            success: true,
            warehouse: warehouse._id,
            product: productId,
            newStock: quantity
        };
    } catch (error) {
        console.error('Error updating warehouse stock:', error);
        throw error;
    }
};

module.exports = {
    findWarehouseByPincode,
    checkProductAvailability,
    reserveStock,
    releaseStock,
    fulfillOrder,
    getTotalStock,
    updateWarehouseStock
};
