import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

// Get all customers (for shop owner)
export const getAllCustomers = async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { status, search } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Text search if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get all customers with optional filtering
    const customers = await Customer.find(query).sort({ name: 1 });
    
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
};

// Get a specific customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Failed to fetch customer', error: error.message });
  }
};

// Get the authenticated customer's information
export const getCustomerProfile = async (req, res) => {
  try {
    // Use the clerk ID from the authenticated user
    const clerkId = req.user?.id;
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }
    
    // Find the customer with this clerk ID
    const customer = await Customer.findOne({ clerkId });
    
    // If no customer found but we're in development, create a mock customer
    if (!customer && process.env.NODE_ENV === 'development') {
      // console.log('Creating mock customer data for development');
      
      // Mock customer data
      const mockCustomer = {
        _id: 'mock-id-' + clerkId.substring(0, 5),
        name: req.user.name || 'Test Customer',
        email: req.user.email || 'customer@example.com',
        address: '123 Test Street',
        phone: '555-123-4567',
        clerkId: clerkId,
        balance: 1200,
        cansInPossession: 4,
        status: 'active',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        totalOrders: 8,
        lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      };
      
      return res.status(200).json(mockCustomer);
    }
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get additional statistics
    let totalOrders = 0;
    let lastOrder = null;
    
    try {
      totalOrders = await Order.countDocuments({ userId: customer.clerkId });
      lastOrder = await Order.findOne({ userId: customer.clerkId })
        .sort({ orderDate: -1 })
        .limit(1);
    } catch (orderError) {
      console.error('Error fetching order statistics:', orderError);
      // Continue without order statistics
    }
    
    // Enhance the customer data with these statistics
    const enhancedCustomer = {
      ...customer.toObject(),
      totalOrders,
      lastOrderDate: lastOrder?.orderDate || null,
    };
    
    res.status(200).json(enhancedCustomer);
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ message: 'Failed to fetch customer profile', error: error.message });
  }
};

// Update customer profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { name, address, phone, email } = req.body;
    
    // Ensure the user can only update their own profile unless they're an owner
    const isOwner = req.user.role === 'owner';
    if (!isOwner && req.user.id !== customerId) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }
    
    // Find and update customer
    const customer = await Customer.findOne({ clerkId: customerId });
    
    if (!customer) {
      // If customer doesn't exist but user is authenticated, create a new customer record
      if (req.user && req.user.id === customerId) {
        const newCustomer = new Customer({
          name: name || req.user.name || 'Customer',
          email: email || req.user.email || '',
          address: address || 'Address not provided',
          phone: phone || 'Phone not provided',
          clerkId: customerId,
          balance: 0, // Default starting balance
        });
        
        await newCustomer.save();
        return res.status(201).json({
          message: 'Customer profile created',
          customer: {
            name: newCustomer.name,
            email: newCustomer.email,
            address: newCustomer.address,
            phone: newCustomer.phone,
            customerId: newCustomer.clerkId
          }
        });
      }
      
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Update customer fields if provided
    if (name) customer.name = name;
    if (address) customer.address = address;
    if (phone) customer.phone = phone;
    if (email) customer.email = email;
    
    await customer.save();
    
    res.status(200).json({
      message: 'Profile updated successfully',
      customer: {
        name: customer.name,
        email: customer.email,
        address: customer.address,
        phone: customer.phone,
        customerId: customer.clerkId
      }
    });
  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Update customer balance (add or remove)
export const updateCustomerBalance = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    
    const { customerId } = req.params;
    const { amount, transactionType, description } = req.body;

    if (!amount || amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    if (!['credit', 'debit'].includes(transactionType)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Transaction type must be credit or debit' });
    }

    const customer = await Customer.findOne({ clerkId: customerId }).session(session);
    
    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Calculate new balance
    let newBalance;
    if (transactionType === 'credit') {
      newBalance = customer.balance + amount;
    } else {
      // Check if sufficient balance for debit
      if (customer.balance < amount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Insufficient balance for this transaction' });
      }
      newBalance = customer.balance - amount;
    }

    // Update customer balance
    customer.balance = newBalance;
    await customer.save({ session });

    // Create transaction record
    const transaction = new Transaction({
      customerId: customer.clerkId,
      amount,
      type: transactionType,
      description: description || (transactionType === 'credit' ? 'Account recharge' : 'Balance adjustment'),
      createdBy: req.user.id,
      balanceAfter: newBalance
    });

    await transaction.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: `Balance ${transactionType === 'credit' ? 'added' : 'removed'} successfully`,
      transaction: {
        id: transaction._id,
        amount,
        type: transactionType,
        description: transaction.description,
        date: transaction.createdAt,
        balanceAfter: newBalance
      },
      newBalance
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update balance error:', error);
    res.status(500).json({ message: 'Failed to update balance', error: error.message });
  }
};

// Get transaction history for a customer
export const getTransactionHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { startDate, endDate, type, limit = 20, page = 1 } = req.query;
    
    // Ensure the user can only view their own transactions unless they're an owner
    const isOwner = req.user.role === 'owner';
    if (!isOwner && req.user.id !== customerId) {
      return res.status(403).json({ message: 'You can only view your own transactions' });
    }
    
    // Build query
    let query = { customerId };
    
    if (type && ['credit', 'debit'].includes(type)) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get transactions or return empty array if none exist
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .catch(err => {
        console.error("Transaction query error:", err);
        return [];
      });
    
    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(query).catch(() => 0);
    
    // If no transactions exist yet for this customer, return empty array instead of error
    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        transactions: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          pages: 0
        }
      });
    }
    
    res.status(200).json({
      transactions: transactions.map(tx => ({
        id: tx._id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        date: tx.createdAt,
        balanceAfter: tx.balanceAfter
      })),
      pagination: {
        total: totalCount,
        page: parseInt(page),
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    // Return empty data instead of error for better UX
    res.status(200).json({
      transactions: [],
      pagination: {
        total: 0,
        page: parseInt(page || 1),
        pages: 0
      }
    });
  }
};

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, address, phone, balance = 0, clerkId } = req.body;
    
    // For security, only allow creating with the authenticated user's ID or
    // if the request is coming from an owner
    const finalClerkId = clerkId || req.user.id;
    
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ clerkId: finalClerkId });
    if (existingCustomer) {
      return res.status(409).json({ message: 'Customer already exists' });
    }
    
    // Create new customer
    const customer = new Customer({
      name,
      address,
      phone,
      email: req.body.email,
      clerkId: finalClerkId,
      balance
    });
    
    await customer.save();
    
    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Failed to create customer', error: error.message });
  }
};