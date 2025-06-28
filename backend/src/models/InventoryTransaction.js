import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  operation: {
    type: String,
    enum: ['add', 'remove', 'transfer'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true
  },
  previousTotal: Number,
  newTotal: Number,
  previousAvailable: Number,
  newAvailable: Number,
  performedBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;