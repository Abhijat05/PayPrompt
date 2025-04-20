import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:3000/api";

export function ShopOwnerDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    monthlyRevenue: 0,
    cansInStock: 0,
    pendingDeliveries: 0,
    recentOrders: [],
    paymentStatus: {
      collectedToday: 0,
      pendingCollections: 0,
      overduePayments: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        
        // Fetch dashboard summary data
        const response = await axios.get(`${API_URL}/dashboard/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Failed to load dashboard data",
          description: "We couldn't load your dashboard information. Please try again later.",
          variant: "destructive"
        });
        
        // For development purposes - use placeholder data if API fails
        if (process.env.NODE_ENV === 'development') {
          setDashboardData({
            totalCustomers: 345,
            monthlyRevenue: 45231,
            cansInStock: 67,
            pendingDeliveries: 12,
            recentOrders: [
              { id: 1, customerName: "Rahul Sharma", quantity: 3, date: new Date() },
              { id: 2, customerName: "Priya Patel", quantity: 2, date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
              { id: 3, customerName: "Amit Kumar", quantity: 5, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
            ],
            paymentStatus: {
              collectedToday: 5430,
              pendingCollections: 12850,
              overduePayments: 3200
            }
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [getToken, toast]);

  // Format currency in INR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    
    // Check if date is yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    // Otherwise return the date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="font-medium">Total Customers</h3>
          <div className="mt-2 text-2xl font-bold">{dashboardData.totalCustomers}</div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-muted-foreground">Active accounts</p>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/customers">View All</Link>
            </Button>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium">Monthly Revenue</h3>
          <div className="mt-2 text-2xl font-bold">{formatCurrency(dashboardData.monthlyRevenue)}</div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-muted-foreground">This month</p>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reports">Reports</Link>
            </Button>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium">Water Cans In Stock</h3>
          <div className="mt-2 text-2xl font-bold">{dashboardData.cansInStock}</div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-muted-foreground">Available for delivery</p>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory">Inventory</Link>
            </Button>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium">Pending Deliveries</h3>
          <div className="mt-2 text-2xl font-bold">{dashboardData.pendingDeliveries}</div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-muted-foreground">Needs attention</p>
            <Button variant="ghost" size="sm">Process</Button>
          </div>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Recent Orders</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            {dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="font-medium">{order.customerName}</span>
                    <div className="text-xs text-muted-foreground">{formatDate(order.date)}</div>
                  </div>
                  <span className="font-medium">{order.quantity} cans</span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-muted-foreground">No recent orders</p>
            )}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Payment Status</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/customers/pending">View All Pending</Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span>Collected Today</span>
              <span className="font-medium text-green-600">{formatCurrency(dashboardData.paymentStatus.collectedToday)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Pending Collections</span>
              <span className="font-medium text-amber-600">{formatCurrency(dashboardData.paymentStatus.pendingCollections)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Overdue Payments</span>
              <span className="font-medium text-red-600">{formatCurrency(dashboardData.paymentStatus.overduePayments)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full" asChild>
              <Link to="/customers/pending">Manage Payments</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}