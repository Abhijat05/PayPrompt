import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['inventory', 'announcement', 'promotion', 'other'],
    default: 'inventory'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  // If targetCustomerId is null, it's for all users
  targetCustomerId: {
    type: String,
    default: null
  },
  isRead: {
    type: Map,
    of: Boolean,
    default: {}
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;