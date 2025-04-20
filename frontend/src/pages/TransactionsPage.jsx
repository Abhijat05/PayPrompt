import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { customerService } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export function TransactionsPage() {
  const { customerId } = useParams();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1
  });
  
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const token = await getToken();
        const customerData = await customerService.getCustomerProfile(customerId, token);
        setCustomer(customerData);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
      }
    };
    
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const result = await customerService.getTransactionHistory(
          customerId, 
          { page: pagination.page, limit: 20 }, 
          token
        );
        setTransactions(result.transactions);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast({
          title: "Error",
          description: "Could not load transaction history",
          variant: "destructive",
        });
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (customerId) {
      fetchCustomerData();
      fetchTransactions();
    }
  }, [customerId, getToken, toast, pagination.page]);
  
  return (
    <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(`/customers/${customerId}`)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            {customer && <p className="text-muted-foreground">For {customer.name}</p>}
          </div>
        </div>
        
        <Card className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between py-3 border-b">
                  <div>
                    <Skeleton className="h-5 w-[200px] mb-1" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                  <Skeleton className="h-5 w-[80px]" />
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between py-3 border-b">
                    <div>
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleString()}
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
              
              {/* Pagination controls */}
              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button 
                    variant="outline" 
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button 
                    variant="outline"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-10 text-muted-foreground">
              No transaction history available for this customer.
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}