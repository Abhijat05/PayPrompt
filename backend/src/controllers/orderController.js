import Order from '../models/Order.js';
import Customer from '../models/Customer.js';

// Constants
const WATER_CAN_PRICE = 30; // Price per water can

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { quantity, userId, orderDate } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Use the authenticated user's ID if userId isn't provided in the request
    const effectiveUserId = userId || req.user?.id;
    
    if (!effectiveUserId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if we have the customer record
    let customer = await Customer.findOne({ clerkId: effectiveUserId });
    
    // If customer doesn't exist, create one based on the authenticated user
    if (!customer) {
      customer = new Customer({
        name: req.user?.name || 'Customer',
        email: req.user?.email || '',
        address: 'Address pending update',
        phone: 'Phone pending update',
        clerkId: effectiveUserId, // Make sure clerkId is set properly
        balance: 1000, // Initial balance for new customers
        cansInPossession: 0 // Start with no cans
      });
      
      await customer.save();
      console.log('Created new customer from Clerk user:', effectiveUserId);
    }

    // Check if customer has sufficient balance
    const orderTotal = WATER_CAN_PRICE * quantity;
    
    if (customer.balance < orderTotal) {
      return res.status(400).json({ 
        message: `Insufficient balance. Required: ₹${orderTotal}, Available: ₹${customer.balance}` 
      });
    }

    // Create the new order
    const newOrder = new Order({
      userId: effectiveUserId,
      quantity,
      orderDate: orderDate || new Date(),
      price: WATER_CAN_PRICE,
      totalAmount: orderTotal,
      status: 'pending'
    });

    await newOrder.save();

    // Update customer's balance and cans in possession
    customer.balance -= newOrder.totalAmount;
    customer.cansInPossession += quantity; // Increment cans when order is placed
    await customer.save();

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: newOrder._id,
      quantity: newOrder.quantity,
      totalAmount: newOrder.totalAmount,
      status: newOrder.status
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create order', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get a specific order by ID
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the user has permission to view this order
    // Only the order owner or shop owner can view order details
    const isOwner = req.user.role === 'owner';
    const isOrderCreator = req.user.id === order.userId;
    
    if (!isOwner && !isOrderCreator) {
      return res.status(403).json({ message: 'You do not have permission to view this order' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// Get orders for the authenticated user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Find all orders for this user, sorted by date (most recent first)
    const orders = await Order.find({ userId })
      .sort({ orderDate: -1 })
      .lean();
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get all orders (for shop owner)
export const getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) {
        query.orderDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.orderDate.$lte = new Date(endDate);
      }
    }
    
    const orders = await Order.find(query).sort({ orderDate: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryDate } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order fields
    if (status) order.status = status;
    if (deliveryDate) order.deliveryDate = deliveryDate;
    
    await order.save();
    
    res.status(200).json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};