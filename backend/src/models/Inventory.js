import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  totalCans: {
    type: Number,
    default: 0
  },
  availableCans: {
    type: Number,
    default: 0
  },
  cansWithCustomers: {
    type: Number,
    default: 0
  },
  updatedBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;