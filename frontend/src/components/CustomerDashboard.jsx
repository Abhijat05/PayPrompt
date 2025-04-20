import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Calendar, History, Droplet } from "lucide-react";
import { OrderDialog } from "@/components/OrderDialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Link } from "react-router-dom";

// API base URL - match with OrderDialog.jsx
const API_URL = "http://localhost:3000/api";

export function CustomerDashboard() {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [userStats, setUserStats] = useState({
    balance: 0,
    availableCans: 0,
    totalConsumption: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { getToken } = useAuth();
  const { user } = useUser();

  // Define fetchUserData outside useEffect so it can be reused
  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const token = await getToken();
      
      // Fetch user data
      const customerResponse = await axios.get(`${API_URL}/customers/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch user orders
      const ordersResponse = await axios.get(`${API_URL}/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Transform orders to delivery format
      const deliveries = ordersResponse.data.map(order => ({
        date: new Date(order.orderDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        quantity: order.quantity,
        id: order._id
      }));
      
      // Calculate total consumption from orders
      const totalConsumption = ordersResponse.data.reduce(
        (sum, order) => sum + order.quantity, 0
      );
      
      // Update state with fetched data
      setRecentDeliveries(deliveries.slice(0, 5)); // Show only 5 most recent
      setUserStats({
        balance: customerResponse.data.balance || 0,
        availableCans: customerResponse.data.cansInPossession || 0,
        totalConsumption: totalConsumption
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Failed to load data",
        description: "We couldn't load your dashboard information. Please try again later.",
        variant: "destructive"
      });
      
      // For development purposes, use mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        setRecentDeliveries([
          { date: "Mar 15, 2023", quantity: 2, id: "mock1" },
          { date: "Feb 28, 2023", quantity: 3, id: "mock2" },
          { date: "Feb 14, 2023", quantity: 2, id: "mock3" }
        ]);
        setUserStats({
          balance: 650,
          availableCans: 3,
          totalConsumption: 24
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Use it in useEffect
  useEffect(() => {
    fetchUserData();
  }, [user, getToken, toast]);

  // Format balance as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };
  
  // Update the handleOrderSubmit function
  const handleOrderSubmit = async (orderData) => {
    try {
      if (!user?.id) {
        toast({
          title: "Authentication Error",
          description: "User identification is missing. Please sign in again.",
          variant: "destructive"
        });
        return;
      }
      
      const token = await getToken();
      
      // Make sure we have the required fields in the correct format
      const payload = {
        userId: user.id, // Always include the user ID
        quantity: orderData.quantity,
        orderDate: new Date().toISOString()
      };
      
      console.log("Sending order payload:", payload);
      
      const response = await axios.post(`${API_URL}/orders`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Order response:", response.data);
      
      toast({
        title: "Order placed successfully",
        description: `Your order for ${payload.quantity} water cans has been placed.`,
      });
      
      // Refresh data after placing an order
      fetchUserData();
    } catch (error) {
      console.error("Error placing order:", error);
      
      // Show more detailed error message if available
      const errorMessage = error.response?.data?.message || 
        "We couldn't process your order. Please try again later.";
      
      toast({
        title: "Failed to place order",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsOrderDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">Current Balance</h3>
            <div className="bg-primary/10 p-2 rounded-full">
              <Droplet className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${userStats.balance < 0 ? 'text-destructive' : ''}`}>
            {formatCurrency(userStats.balance)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {userStats.balance >= 0 
              ? "Your account is in good standing" 
              : "Please settle your dues"}
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">Cans Available</h3>
            <div className="bg-primary/10 p-2 rounded-full">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">{userStats.availableCans}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {userStats.availableCans > 0 
              ? "Ready for exchange" 
              : "Time to order more"}
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">Total Consumption</h3>
            <div className="bg-primary/10 p-2 rounded-full">
              <History className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">{userStats.totalConsumption}</div>
          <p className="text-sm text-muted-foreground mt-1">Water cans consumed</p>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Deliveries</h2>
        <Button onClick={() => setIsOrderDialogOpen(true)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Order Now
        </Button>
      </div>
      
      {recentDeliveries.length > 0 ? (
        <div className="grid gap-2">
          {recentDeliveries.map((delivery) => (
            <Card key={delivery.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{delivery.date}</p>
                  <p className="text-sm text-muted-foreground">Order #{delivery.id.substring(0, 8)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{delivery.quantity} cans</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          <Button className="mt-4" onClick={() => setIsOrderDialogOpen(true)}>
            Place Your First Order
          </Button>
        </Card>
      )}
      
      <div className="mt-4 flex justify-end">
        <Button variant="outline" asChild>
          <Link to="/customers/history">View All History</Link>
        </Button>
      </div>
      
      <OrderDialog 
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        onOrderPlaced={handleOrderSubmit}
        availableCans={userStats.availableCans}
      />
    </div>
  );
}