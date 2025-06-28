import Notification from '../models/Notification.js';

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, isPublic, targetCustomerId } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = new Notification({
      title,
      message,
      type: type || 'inventory',
      isPublic: isPublic !== undefined ? isPublic : true,
      targetCustomerId: targetCustomerId || null,
      createdBy: req.user.id
    });
    
    await notification.save();
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find notifications that are either:
    // 1. Public notifications
    // 2. Specifically for this user
    const notifications = await Notification.find({
      $or: [
        { isPublic: true },
        { targetCustomerId: userId }
      ]
    }).sort({ createdAt: -1 });
    
    // Enhance each notification with whether it's read by this user
    const enhancedNotifications = notifications.map(notification => {
      const notificationObj = notification.toObject();
      notificationObj.isRead = notification.isRead.get(userId) || false;
      return notificationObj;
    });
    
    res.status(200).json(enhancedNotifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Update the isRead map for this user
    notification.isRead.set(userId, true);
    await notification.save();
    
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to update notification', error: error.message });
  }
};

// Get all notifications (for admin)
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await Notification.findByIdAndDelete(notificationId);
    
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};