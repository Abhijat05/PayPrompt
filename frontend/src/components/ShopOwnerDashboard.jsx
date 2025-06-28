import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, Users, TrendingUp, AlertTriangle } from "lucide-react";

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
  const [refreshInterval, setRefreshInterval] = useState(null);
  const { getToken } = useAuth();
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [getToken]);

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

  const renderStat = (title, value, subtitle, icon, linkText, linkPath, color = "text-primary") => {
    return (
      <Card className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{title}</h3>
          {icon && <div className={`p-2 rounded-full bg-${color}/10`}>{icon}</div>}
        </div>
        
        {isLoading ? (
          <Skeleton className="h-8 w-24 my-2" />
        ) : (
          <div className={`mt-2 text-2xl font-bold ${color}`}>{value}</div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          {linkPath && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={linkPath}>{linkText}</Link>
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Business Overview</h2>
        <Button size="sm" variant="outline" onClick={fetchDashboardData}>
          Refresh Data
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderStat(
          "Total Customers", 
          dashboardData.totalCustomers, 
          "Active accounts",
          <Users className="h-4 w-4 text-blue-500" />,
          "View All", 
          "/customers",
          "text-blue-500"
        )}
        
        {renderStat(
          "Monthly Revenue", 
          formatCurrency(dashboardData.monthlyRevenue), 
          "This month",
          <TrendingUp className="h-4 w-4 text-green-500" />,
          "Reports", 
          "/reports",
          "text-green-500"
        )}
        
        {renderStat(
          "Water Cans In Stock", 
          dashboardData.cansInStock, 
          "Available for delivery",
          null,
          "Inventory", 
          "/inventory"
        )}
        
        {renderStat(
          "Pending Deliveries", 
          dashboardData.pendingDeliveries, 
          "Needs attention",
          <AlertTriangle className="h-4 w-4 text-amber-500" />,
          "Process", 
          "/orders",
          "text-amber-500"
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Recent Orders</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                  <Skeleton className="h-5 w-[60px]" />
                </div>
              ))}
            </div>
          ) : dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
            <div className="space-y-2">
              {dashboardData.recentOrders.map((order, index) => (
                <div key={order.id || index} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="font-medium">{order.customerName}</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarClock className="mr-1 h-3 w-3" />
                      {formatDate(order.date)}
                    </div>
                  </div>
                  <span className="font-medium">{order.quantity} cans</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">No recent orders</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/customers">Manage Customers</Link>
              </Button>
            </div>
          )}
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Payment Status</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/customers/pending">View All Pending</Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between py-2 border-b">
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-5 w-[80px]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span>Collected Today</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(dashboardData.paymentStatus.collectedToday)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Pending Collections</span>
                <span className="font-medium text-amber-600">
                  {formatCurrency(dashboardData.paymentStatus.pendingCollections)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span>Overdue Payments</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(dashboardData.paymentStatus.overduePayments)}
                </span>
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              className="w-full" 
              disabled={isLoading || dashboardData.paymentStatus.pendingCollections === 0} 
              asChild
            >
              <Link to="/customers/pending">Manage Payments</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}