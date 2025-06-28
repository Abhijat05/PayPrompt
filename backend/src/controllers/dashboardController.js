import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import Inventory from '../models/Inventory.js';

// Get dashboard summary data for shop owner
export const getDashboardSummary = async (req, res) => {
  try {
    // Get total customers count
    const totalCustomers = await Customer.countDocuments();

    // Get monthly revenue (sum of all transactions for current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    let monthlyRevenue = 0;
    try {
      const transactions = await Transaction.aggregate([
        {
          $match: {
            type: 'credit',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      monthlyRevenue = transactions.length > 0 ? transactions[0].total : 0;
    } catch (err) {
      console.error("Error calculating monthly revenue:", err);
      // Continue with zero revenue if there's an error
    }

    // Get actual inventory data from the database
    let cansInStock = 0;
    try {
      const latestInventory = await Inventory.findOne().sort({ createdAt: -1 });
      if (latestInventory) {
        cansInStock = latestInventory.availableCans;
      } else {
        console.log("No inventory records found, defaulting to 0 cans in stock");
      }
    } catch (err) {
      console.error("Error fetching inventory data:", err);
    }
    
    // Get pending deliveries count
    let pendingDeliveries = 0;
    try {
      pendingDeliveries = await Order.countDocuments({ 
        status: 'pending'
      });
    } catch (err) {
      console.error("Error counting pending deliveries:", err);
    }

    // Get recent orders - FIX: Use userId instead of customerId and manually join with customer data
    let recentOrders = [];
    try {
      const orders = await Order.find()
        .sort({ orderDate: -1 })
        .limit(5)
        .lean();

      // Get all customer IDs from these orders
      const userIds = [...new Set(orders.map(order => order.userId))];
      
      // Get all customers in one query
      const customers = await Customer.find({ clerkId: { $in: userIds } }).lean();
      
      // Create a map of clerkId to customer name for quick lookup
      const customerMap = {};
      customers.forEach(customer => {
        customerMap[customer.clerkId] = customer.name;
      });

      // Format recent orders with customer names
      recentOrders = orders.map(order => ({
        id: order._id,
        customerName: customerMap[order.userId] || 'Unknown Customer',
        quantity: order.quantity,
        date: order.orderDate
      }));
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    }

    // Get payment status
    let collectedToday = 0;
    let pendingCollections = 0;
    let overduePayments = 0;

    try {
      // Collected today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayTransactions = await Transaction.aggregate([
        {
          $match: {
            type: 'credit',
            createdAt: { $gte: today, $lt: tomorrow }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      collectedToday = todayTransactions.length > 0 ? todayTransactions[0].total : 0;

      // Pending collections - sum of all negative customer balances
      const customersWithNegativeBalance = await Customer.find({ balance: { $lt: 0 } });
      pendingCollections = customersWithNegativeBalance.reduce(
        (sum, customer) => sum + Math.abs(customer.balance), 
        0
      );

      // For overdue payments, we'll use a simple estimate
      overduePayments = Math.round(pendingCollections * 0.3); // Example: 30% of pending are overdue
    } catch (err) {
      console.error("Error calculating payment statistics:", err);
    }

    res.status(200).json({
      totalCustomers,
      monthlyRevenue,
      cansInStock,
      pendingDeliveries,
      recentOrders,
      paymentStatus: {
        collectedToday,
        pendingCollections,
        overduePayments
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ message: 'Failed to get dashboard summary', error: error.message });
  }
};

// Get customer growth data for shop owner (for charts)
export const getCustomerGrowth = async (req, res) => {
  try {
    // Get customer registrations per month for the last 6 months
    const result = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const count = await Customer.countDocuments({
        createdAt: {
          $gte: monthStart,
          $lte: monthEnd
        }
      });
      
      result.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        customers: count
      });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting customer growth data:', error);
    res.status(500).json({ message: 'Failed to get growth data', error: error.message });
  }
};