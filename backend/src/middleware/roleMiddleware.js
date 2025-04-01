import Customer from '../models/Customer.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      try {
        // Get user from Clerk
        const user = await clerkClient.users.getUser(userId);
        
        // Check if user has the required role in metadata
        const userRole = user.publicMetadata?.role;
        
        if (userRole === role) {
          return next();
        }
      } catch (clerkError) {
        console.error('Clerk API error:', clerkError);
        // Continue to check in our database if Clerk API fails
      }
      
      // If no role in Clerk metadata, check in our database
      const customer = await Customer.findOne({ clerkId: userId });
      
      if (!customer) {
        return res.status(404).json({ 
          message: 'Customer not found' 
        });
      }
      
      if (customer.role !== role) {
        return res.status(403).json({ 
          message: 'Permission denied. Required role: ' + role 
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Role verification failed' });
    }
  };
};
