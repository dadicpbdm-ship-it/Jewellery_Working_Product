const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    serviceablePincodes: [{
        type: String,
        trim: true
    }],
    inventory: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        reservedStock: {
            type: Number,
            default: 0,
            min: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    manager: {
        name: String,
        email: String,
        phone: String
    }
}, {
    timestamps: true
});

// Indexes for performance
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ 'serviceablePincodes': 1 });
warehouseSchema.index({ 'inventory.product': 1 });

// Methods
warehouseSchema.methods.getProductStock = function (productId) {
    const item = this.inventory.find(inv => inv.product.toString() === productId.toString());
    return item ? item.stock - item.reservedStock : 0;
};

warehouseSchema.methods.updateStock = async function (productId, quantity) {
    const item = this.inventory.find(inv => inv.product.toString() === productId.toString());

    if (item) {
        item.stock = quantity;
        item.lastUpdated = Date.now();
    } else {
        this.inventory.push({
            product: productId,
            stock: quantity,
            reservedStock: 0,
            lastUpdated: Date.now()
        });
    }

    return await this.save();
};

warehouseSchema.methods.reserveStock = async function (productId, quantity) {
    const item = this.inventory.find(inv => inv.product.toString() === productId.toString());

    if (!item) {
        throw new Error('Product not found in warehouse inventory');
    }

    const availableStock = item.stock - item.reservedStock;
    if (availableStock < quantity) {
        throw new Error(`Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`);
    }

    item.reservedStock += quantity;
    item.lastUpdated = Date.now();

    return await this.save();
};

warehouseSchema.methods.releaseStock = async function (productId, quantity) {
    const item = this.inventory.find(inv => inv.product.toString() === productId.toString());

    if (!item) {
        throw new Error('Product not found in warehouse inventory');
    }

    item.reservedStock = Math.max(0, item.reservedStock - quantity);
    item.lastUpdated = Date.now();

    return await this.save();
};

warehouseSchema.methods.fulfillOrder = async function (productId, quantity) {
    const item = this.inventory.find(inv => inv.product.toString() === productId.toString());

    if (!item) {
        throw new Error('Product not found in warehouse inventory');
    }

    if (item.reservedStock < quantity) {
        throw new Error('Insufficient reserved stock');
    }

    item.stock -= quantity;
    item.reservedStock -= quantity;
    item.lastUpdated = Date.now();

    return await this.save();
};

// Static methods
warehouseSchema.statics.findByPincode = async function (pincode) {
    return await this.findOne({
        serviceablePincodes: pincode,
        isActive: true
    });
};

module.exports = mongoose.model('Warehouse', warehouseSchema);
