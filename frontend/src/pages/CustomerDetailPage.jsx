import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { customerService } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, User } from "lucide-react";
import { CustomerBalanceManagement } from "@/components/CustomerBalanceManagement";

export function CustomerDetailPage() {
  const { customerId } = useParams();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        // Fix: Use consistent ID formatting
        const customerData = await customerService.getCustomerById(customerId, token);
        setCustomer(customerData);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        toast({
          title: "Error",
          description: "Could not load customer information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Add the getCustomerById function to the API service if it doesn't exist
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId, getToken, toast]);

  const handleBalanceUpdated = (newBalance) => {
    setCustomer(prev => ({
      ...prev,
      balance: newBalance
    }));
    
    // Refresh transactions to show the new one
    const refreshTransactions = async () => {
      try {
        const token = await getToken();
        const result = await customerService.getTransactionHistory(customerId, { limit: 5 }, token);
        setTransactions(result.transactions);
      } catch (error) {
        console.error("Failed to refresh transactions:", error);
      }
    };
    
    refreshTransactions();
  };

  return (
    <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/customers')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Customer Details</h1>
        </div>

        {isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Customer Profile</h2>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">{customer?.name}</h3>
                    <p className="text-sm text-muted-foreground">Customer ID: {customer?.customerId}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{customer?.email || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{customer?.phone || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium">{customer?.address || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Water Cans</span>
                    <span className="font-medium">{customer?.cansInPossession || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Join Date</span>
                    <span className="font-medium">
                      {customer?.joinDate ? new Date(customer.joinDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium ${
                      customer?.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {customer?.status || "Active"}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Balance Management</h2>
                
                <div className="flex justify-between items-center py-4 border-b mb-6">
                  <span className="text-lg">Current Balance</span>
                  <span className={`text-2xl font-bold ${
                    (customer?.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ₹{customer?.balance || 0}
                  </span>
                </div>
                
                <CustomerBalanceManagement
                  customerId={customer?.customerId}
                  customerName={customer?.name}
                  currentBalance={customer?.balance || 0}
                  onBalanceUpdated={handleBalanceUpdated}
                />
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Recent Transactions</h3>
                  {transactionsLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between py-2 border-b">
                          <Skeleton className="h-4 w-[180px]" />
                          <Skeleton className="h-4 w-[60px]" />
                        </div>
                      ))}
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between py-2 border-b">
                          <div>
                            <div className="font-medium">{tx.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(tx.date).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`font-medium ${
                            tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      No transaction history available
                    </p>
                  )}
                  
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/customers/${customerId}/transactions`)}>
                      View All Transactions
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
}