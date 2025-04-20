import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { customerService } from "@/lib/api";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function UserAccount() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        
        // Get customer profile from the API
        const data = await customerService.getCustomerProfile(user.id, token);
        setCustomerData(data);
        
        // Fetch some sample transactions for demo purposes
        // In a real app, you would get this from your API
        setTransactions([
          {
            id: 'tx1',
            type: 'debit',
            description: 'Water Can Delivery',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            amount: 150
          },
          {
            id: 'tx2',
            type: 'credit',
            description: 'Account Recharge',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            amount: 500
          }
        ]);
      } catch (error) {
        console.error("Failed to fetch customer data:", error);
        toast({
          title: "Error",
          description: "Unable to load your account details. Please try again later.",
          variant: "destructive",
        });
        
        // Set fallback data if API fails
        setCustomerData({
          name: user.fullName || user.firstName || 'Customer',
          email: user.primaryEmailAddress?.emailAddress || '',
          address: 'Address not available',
          phone: 'Phone not available',
          balance: 750,
          cansInPossession: 5,
          joinDate: new Date().toLocaleDateString(),
          customerId: user.id.substring(0, 8)
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchCustomerData();
    }
  }, [user, getToken]);
  
  // Function to update profile information
  const handleUpdateProfile = async () => {
    toast({
      title: "Coming Soon",
      description: "Profile update functionality will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        {isLoading ? (
          // Skeleton loading UI
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex justify-between border-b pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Customer ID:</span>
              <span className="font-medium">{customerData?.customerId || user?.id?.substring(0, 8)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{customerData?.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{customerData?.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-medium">{customerData?.address}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{customerData?.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Current Balance:</span>
              <span className="font-medium text-primary">₹{customerData?.balance}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Water Cans:</span>
              <span className="font-medium">{customerData?.cansInPossession}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-medium">{customerData?.joinDate}</span>
            </div>
          </div>
        )}
        <div className="mt-6">
          <Button onClick={handleUpdateProfile}>Update Information</Button>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <div className="space-y-2">
          {isLoading ? (
            // Skeleton loading UI for transactions
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex justify-between py-2 border-b">
                  <div>
                    <Skeleton className="h-4 w-[120px] mb-2" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            // Render actual transactions
            transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between py-2 border-b">
                <div>
                  <div className="font-medium">{tx.description}</div>
                  <div className="text-sm text-muted-foreground">{tx.date}</div>
                </div>
                <span className={`font-medium ${
                  tx.type === 'credit' ? 'text-green-600' : 'text-destructive'
                }`}>{tx.type === 'credit' ? '+' : '-'}₹{tx.amount}</span>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">No transaction history available</p>
          )}
          
          <div className="flex justify-between py-2">
            <Link to="/customers/history">
              <Button variant="outline" size="sm">View All Transactions</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}