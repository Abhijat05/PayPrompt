import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { orderService } from "@/lib/api";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const { getToken } = useAuth();

  // Function to refresh orders that can be called from any component
  // Using useCallback to prevent unnecessary re-renders
  const refreshOrders = useCallback(async (token) => {
    // Debounce requests - don't fetch if we just fetched (within last 3 seconds)
    const now = Date.now();
    if (lastFetchTime && now - lastFetchTime < 3000) {
      return;
    }
    
    try {
      setIsLoading(true);
      setLastFetchTime(now);
      
      const filters = { limit: 10 }; // Get the most recent 10 orders
      const ordersData = await orderService.getAllOrders(filters, token);
      
      // Transform orders to a standardized format
      const formattedOrders = ordersData.map(order => ({
        id: order._id,
        customerName: order.customerName || "Customer", // Will be populated from backend if available
        userId: order.userId,
        date: new Date(order.orderDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        quantity: order.quantity,
        status: order.status,
        totalAmount: order.totalAmount
      }));
      
      setRecentOrders(formattedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetchTime]);

  // Add a new order to the context (called when customer places order)
  // Using useCallback to prevent unnecessary re-renders
  const addOrder = useCallback((order) => {
    setRecentOrders(prev => {
      // Check if the order already exists (prevent duplicates)
      const exists = prev.some(o => o.id === order.id);
      if (exists) return prev;
      return [order, ...prev];
    });
  }, []);

  return (
    <OrderContext.Provider value={{ recentOrders, isLoading, refreshOrders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};