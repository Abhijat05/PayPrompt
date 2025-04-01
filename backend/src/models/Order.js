import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date
    },
    price: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Calculate total amount before saving
orderSchema.pre('save', function (next) {
    this.totalAmount = this.price * this.quantity;
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;