import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Calendar, History } from "lucide-react";
import { OrderDialog } from "@/components/OrderDialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

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

  // Fetch user orders and data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const token = await getToken();
        
        // Fetch user orders
        const response = await axios.get(`${API_URL}/orders/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Transform orders to delivery format
        const deliveries = response.data.map(order => ({
          date: new Date(order.orderDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          quantity: order.quantity,
          id: order._id
        }));
        
        setRecentDeliveries(deliveries);
        
        // In a real implementation, you would also fetch customer balance data
        // This is a placeholder - you would typically get this from a customer endpoint
        // Add a customer info endpoint to your backend for this
        setUserStats({
          balance: 750, // Placeholder - replace with API data
          availableCans: 5, // Placeholder - replace with API data
          totalConsumption: deliveries.reduce((total, delivery) => total + delivery.quantity, 0)
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Failed to load data",
          description: "We couldn't load your orders. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, getToken, toast]);

  const handleOrderPlaced = async (orderData) => {
    // Add the new order to recent deliveries at the top
    const newDelivery = {
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      quantity: orderData.quantity,
      id: orderData.orderId
    };
    
    setRecentDeliveries(prev => [newDelivery, ...prev]);
    
    // Update consumption stats
    setUserStats(prev => ({
      ...prev,
      totalConsumption: prev.totalConsumption + orderData.quantity,
      balance: prev.balance - (orderData.totalAmount || orderData.quantity * 30)
    }));
    
    toast({
      title: "Order Placed Successfully",
      description: `Your order for ${orderData.quantity} water cans has been placed.`,
      variant: "success"
    });
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
          <h3 className="font-medium">Current Balance</h3>
          <div className="mt-2 text-2xl font-bold">₹{userStats.balance}</div>
          <p className="text-sm text-muted-foreground mt-1">Last updated: 3 hrs ago</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium">Water Cans Available</h3>
          <div className="mt-2 text-2xl font-bold">{userStats.availableCans} Cans</div>
          <p className="text-sm text-muted-foreground mt-1">Refill scheduled for Monday</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium">Total Consumption</h3>
          <div className="mt-2 text-2xl font-bold">{userStats.totalConsumption} Cans</div>
          <p className="text-sm text-muted-foreground mt-1">This month</p>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex justify-between mb-4">
            <h3 className="font-medium">Recent Deliveries</h3>
            <Button variant="ghost" size="sm" className="h-8">
              <History className="mr-2 h-4 w-4" /> View All
            </Button>
          </div>
          
          <div className="space-y-2">
            {recentDeliveries.length > 0 ? (
              recentDeliveries.map((delivery, index) => (
                <div key={delivery.id || index} className="flex justify-between py-2 border-b">
                  <span>{delivery.date}</span>
                  <span className="font-medium">{delivery.quantity} cans</span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-muted-foreground">No recent deliveries found</p>
            )}
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Button 
              className="justify-start"
              onClick={() => setIsOrderDialogOpen(true)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> 
              Order Water Cans
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="mr-2 h-4 w-4" /> 
              Schedule Delivery
            </Button>
            <Button variant="secondary" className="justify-start">
              View Payment History
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Order Dialog */}
      <OrderDialog 
        open={isOrderDialogOpen} 
        onOpenChange={setIsOrderDialogOpen}
        onOrderPlaced={handleOrderPlaced}
      />
    </div>
  );
}