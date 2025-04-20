import Customer from '../models/Customer.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Development mode shortcut - check email address for role indicators
      if (process.env.NODE_ENV === 'development') {
        const email = req.user?.email?.toLowerCase() || '';
        
        // For development: Allow "owner" access based on email pattern
        if (role === 'owner' && (email.includes('owner') || email.includes('admin'))) {
          req.user.role = 'owner'; // Set the role for future middleware
          return next();
        }
        
        // For development: Allow "customer" role by default
        if (role === 'customer') {
          req.user.role = 'customer';
          return next();
        }
      }
      
      // Check Clerk metadata for role
      try {
        const user = await clerkClient.users.getUser(userId);
        
        // Check if user has the required role in metadata
        const userRole = user.publicMetadata?.role;
        
        if (userRole === role) {
          req.user.role = userRole; // Set the role for future middleware
          return next();
        }
      } catch (clerkError) {
        console.error('Clerk API error:', clerkError);
        // Continue to check in our database if Clerk API fails
      }
      
      // If no role in Clerk metadata, check in our database
      const customer = await Customer.findOne({ clerkId: userId });
      
      if (!customer) {
        // In development mode, create a dummy customer for testing if needed
        if (process.env.NODE_ENV === 'development' && role === 'customer') {
          req.user.role = 'customer';
          return next();
        }
        
        return res.status(404).json({ 
          message: 'Customer not found' 
        });
      }
      
      // Check if customer has the role field (we might need to add this to schema)
      if (customer.role === role) {
        req.user.role = customer.role;
        return next();
      }
      
      // Special case: If no role is set but we're checking for customer
      if (role === 'customer' && !customer.role) {
        req.user.role = 'customer';
        return next();
      }
      
      return res.status(403).json({ 
        message: 'Permission denied. Required role: ' + role 
      });
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Role verification failed' });
    }
  };
};

// Middleware to check if user has owner role
export const requireOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // For development mode: Allow owner access based on email
    if (process.env.NODE_ENV === 'development') {
      const email = req.user.email?.toLowerCase() || '';
      if (email.includes('owner') || email.includes('admin')) {
        req.user.role = 'owner';
        return next();
      }
    }
    
    // Check if already verified as owner in previous middleware
    if (req.user.role === 'owner') {
      return next();
    }
    
    // Check Clerk metadata
    try {
      const user = await clerkClient.users.getUser(req.user.id);
      if (user.publicMetadata?.role === 'owner') {
        req.user.role = 'owner';
        return next();
      }
    } catch (clerkError) {
      console.error('Clerk API error:', clerkError);
      // Continue to database check
    }
    
    // Check database
    const customer = await Customer.findOne({ clerkId: req.user.id });
    if (customer?.role === 'owner') {
      req.user.role = 'owner';
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied. Owner role required.' });
  } catch (error) {
    console.error('Owner role check error:', error);
    res.status(500).json({ message: 'Role verification failed' });
  }
};

// Middleware to check if user is a customer
export const requireCustomer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // In development, all authenticated users can be customers
    if (process.env.NODE_ENV === 'development') {
      req.user.role = 'customer';
      return next();
    }
    
    // Check if already verified as customer
    if (req.user.role === 'customer') {
      return next();
    }
    
    // Every authenticated user can access customer routes by default
    // unless specifically marked as another role
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      req.user.role = 'customer';
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied. Customer role required.' });
  } catch (error) {
    console.error('Customer role check error:', error);
    res.status(500).json({ message: 'Role verification failed' });
  }
};
