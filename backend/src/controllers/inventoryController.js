import Inventory from '../models/Inventory.js';
import Customer from '../models/Customer.js';
import mongoose from 'mongoose';

// Get current inventory status
export const getInventoryStatus = async (req, res) => {
  try {
    // Get the most recent inventory record
    const inventory = await Inventory.findOne().sort({ createdAt: -1 });
    
    // If no inventory record exists yet, create one
    if (!inventory) {
      // Count cans with customers by summing up all customer cansInPossession
      const totalCansWithCustomers = await Customer.aggregate([
        { $group: { _id: null, total: { $sum: "$cansInPossession" } } }
      ]);
      
      const cansWithCustomers = totalCansWithCustomers.length > 0 ? totalCansWithCustomers[0].total : 0;
      
      const newInventory = new Inventory({
        totalCans: cansWithCustomers,
        availableCans: 0,
        cansWithCustomers,
        updatedBy: req.user.id
      });
      
      await newInventory.save();
      return res.status(200).json(newInventory);
    }
    
    // Return the inventory status
    res.status(200).json(inventory);
  } catch (error) {
    console.error('Error getting inventory status:', error);
    res.status(500).json({ message: 'Failed to get inventory status', error: error.message });
  }
};

// Update inventory (add or remove cans)
export const updateInventory = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    
    const { operation, quantity, reason } = req.body;
    
    if (!['add', 'remove'].includes(operation)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Operation must be add or remove' });
    }
    
    if (!quantity || quantity < 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    
    // Get current inventory status
    const currentInventory = await Inventory.findOne().sort({ createdAt: -1 }).session(session);
    
    if (!currentInventory) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'No inventory record found' });
    }
    
    // Calculate new inventory values
    let newTotalCans = currentInventory.totalCans;
    let newAvailableCans = currentInventory.availableCans;
    
    if (operation === 'add') {
      newTotalCans += quantity;
      newAvailableCans += quantity;
    } else if (operation === 'remove') {
      // Check if we have enough cans to remove
      if (newAvailableCans < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          message: `Cannot remove ${quantity} cans. Only ${newAvailableCans} available.` 
        });
      }
      
      newTotalCans -= quantity;
      newAvailableCans -= quantity;
    }
    
    // Create new inventory record
    const newInventory = new Inventory({
      totalCans: newTotalCans,
      availableCans: newAvailableCans,
      cansWithCustomers: currentInventory.cansWithCustomers,
      updatedBy: req.user.id
    });
    
    await newInventory.save({ session });
    
    // Create a record of this change for tracking
    const inventoryChange = {
      operation,
      quantity,
      reason: reason || `${operation === 'add' ? 'Added' : 'Removed'} ${quantity} cans`,
      previousTotal: currentInventory.totalCans,
      newTotal: newTotalCans,
      previousAvailable: currentInventory.availableCans,
      newAvailable: newAvailableCans,
      date: new Date()
    };
    
    // In a real application, you would save this to a separate collection
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: `Successfully ${operation === 'add' ? 'added' : 'removed'} ${quantity} cans`,
      inventory: newInventory,
      change: inventoryChange
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Failed to update inventory', error: error.message });
  }
};

// Get inventory changes history
export const getInventoryHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get the history of inventory changes
    const history = await Inventory.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Calculate changes between consecutive records
    const changes = [];
    
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i];
      const previous = history[i + 1];
      
      const totalDiff = current.totalCans - previous.totalCans;
      const availableDiff = current.availableCans - previous.availableCans;
      const withCustomersDiff = current.cansWithCustomers - previous.cansWithCustomers;
      
      changes.push({
        date: current.createdAt,
        totalDiff,
        availableDiff,
        withCustomersDiff,
        updatedBy: current.updatedBy
      });
    }
    
    res.status(200).json(changes);
  } catch (error) {
    console.error('Error getting inventory history:', error);
    res.status(500).json({ message: 'Failed to get inventory history', error: error.message });
  }
};