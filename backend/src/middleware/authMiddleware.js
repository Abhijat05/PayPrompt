import { clerkClient } from '@clerk/clerk-sdk-node';
import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
      // Verify token with Clerk's SDK
      const decoded = jwt.decode(token);
      
      if (!decoded?.sub) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      try {
        // Verify the user exists in Clerk
        const user = await clerkClient.users.getUser(decoded.sub);
        
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        
        // Set user info in request object with more details from Clerk
        req.user = { 
          id: decoded.sub,
          email: user.emailAddresses[0]?.emailAddress,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer',
        };
      } catch (clerkError) {
        console.error('Clerk API error:', clerkError);
        // Continue without Clerk verification if Clerk API fails in development
        if (process.env.NODE_ENV !== 'development') {
          return res.status(401).json({ message: 'Authentication service unavailable' });
        }
        
        // Minimal user info for development
        req.user = { id: decoded.sub };
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};