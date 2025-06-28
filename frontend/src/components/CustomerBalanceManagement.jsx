import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { customerService } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export function CustomerBalanceManagement({ 
  customerId, 
  customerName,
  currentBalance,
  onBalanceUpdated 
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add' or 'remove'
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const { toast } = useToast();

  const openAddDialog = () => {
    setDialogType('add');
    setAmount(0);
    setDescription('Account recharge');
    setOpenDialog(true);
  };

  const openRemoveDialog = () => {
    setDialogType('remove');
    setAmount(0);
    setDescription('Balance adjustment');
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const token = await getToken();
      
      if (dialogType === 'add') {
        const result = await customerService.updateCustomerBalance(customerId, {
          amount: amount,
          transactionType: 'credit',
          description: description || 'Account recharge'
        }, token);
        
        toast({
          title: "Balance Added",
          description: `Successfully added ₹${amount} to ${customerName}'s account.`,
          variant: "success",
        });
        onBalanceUpdated(result.newBalance);
      } else {
        // Check if there's enough balance for debit
        if (currentBalance < amount) {
          toast({
            title: "Insufficient Balance",
            description: `Customer only has ₹${currentBalance} available.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const result = await customerService.updateCustomerBalance(customerId, {
          amount: amount,
          transactionType: 'debit',
          description: description || 'Balance adjustment'
        }, token);
        
        toast({
          title: "Balance Removed",
          description: `Successfully removed ₹${amount} from ${customerName}'s account.`,
          variant: "success",
        });
        onBalanceUpdated(result.newBalance);
      }
      
      // Close dialog
      setOpenDialog(false);
    } catch (error) {
      console.error("Failed to update balance:", error);
      const errorMessage = error.response?.data?.message || 
        "Failed to update the customer's balance. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={openAddDialog}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Add Balance
        </Button>
        <Button 
          onClick={openRemoveDialog} 
          variant="destructive"
          className="flex-1"
        >
          Remove Balance
        </Button>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'add' ? 'Add Balance' : 'Remove Balance'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Current Balance: <span className="font-bold">₹{currentBalance}</span>
              </label>
              
              <div className="space-y-1">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount (₹)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter amount"
                />
              </div>

              {dialogType === 'remove' && (
                <div className="space-y-1">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Reason for removing balance"
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || amount <= 0}
                variant={dialogType === 'add' ? 'default' : 'destructive'}
              >
                {isLoading ? 'Processing...' : dialogType === 'add' ? 'Add Balance' : 'Remove Balance'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}