import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:3000/api";

export function CustomerAccount() {
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const token = await getToken();
        
        // Fetch customer data
        const response = await axios.get(`${API_URL}/customers/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setCustomerData(response.data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast({
          title: "Failed to load account data",
          description: "We couldn't load your account information. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [user, getToken, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to retrieve account information.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">View your account details and payment history.</p>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Account Information</h2>
          <Button variant="outline" size="sm">Edit Details</Button>
        </div>
        
        <div className="grid gap-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Customer ID:</span>
            <span className="font-medium">{customerData._id || "Not assigned"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{customerData.name || "Not provided"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{customerData.email || "Not provided"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Address:</span>
            <span className="font-medium">{customerData.address || "Not provided"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium">{customerData.phone || "Not provided"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Balance:</span>
            <span className={`font-medium ${customerData.balance < 0 ? 'text-destructive' : 'text-primary'}`}>
              ₹{customerData.balance}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Membership Information</h3>
          </div>
          <div className="grid gap-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-medium">{formatDate(customerData.createdAt)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Last Order Date:</span>
              <span className="font-medium">{customerData.lastOrderDate ? formatDate(customerData.lastOrderDate) : "No orders yet"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button asChild className="flex-1">
            <Link to="/customers/history">View Order History</Link>
          </Button>
          <Button variant="outline" className="flex-1">Add Funds</Button>
        </div>
      </Card>
    </div>
  );
}