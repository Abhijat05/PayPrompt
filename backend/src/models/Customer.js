import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  cansInPossession: {
    type: Number,
    default: 0
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;