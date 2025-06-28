import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

export function InventoryPage() {
  const [inventory, setInventory] = useState({
    totalCans: 0,
    availableCans: 0,
    cansWithCustomers: 0
  });
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'remove'
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  // Fetch inventory data
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        
        // Fetch inventory status
        const statusResponse = await axios.get(`${API_URL}/inventory/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setInventory(statusResponse.data);
        
        // Fetch recent inventory changes
        const historyResponse = await axios.get(`${API_URL}/inventory/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setInventoryHistory(historyResponse.data);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        toast({
          title: "Failed to load inventory data",
          description: "We couldn't load the inventory information. Please try again later.",
          variant: "destructive"
        });
        
        // Set some default data for development purposes
        if (process.env.NODE_ENV === 'development') {
          setInventory({
            totalCans: 120,
            availableCans: 67,
            cansWithCustomers: 53
          });
          
          setInventoryHistory([
            {
              date: new Date().toISOString(),
              totalDiff: 20,
              availableDiff: 20,
              description: "New cans purchased"
            },
            {
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              totalDiff: -3,
              availableDiff: -3,
              description: "Damaged cans"
            },
            {
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              availableDiff: -10,
              withCustomersDiff: 10,
              description: "Cans sent for cleaning"
            }
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInventoryData();
  }, [getToken, toast]);
  
  const handleOpenDialog = (mode) => {
    setDialogMode(mode);
    setQuantity(1);
    setReason(mode === 'add' ? 'New cans purchased' : 'Damaged/lost cans');
    setIsDialogOpen(true);
  };
  
  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    
    if (quantity < 1) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a quantity greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = await getToken();
      
      const response = await axios.post(`${API_URL}/inventory/update`, {
        operation: dialogMode,
        quantity: parseInt(quantity),
        reason
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast({
        title: "Inventory Updated",
        description: response.data.message,
        variant: "success"
      });
      
      // Update our local state with the new inventory data
      setInventory(response.data.inventory);
      
      // Refresh inventory history
      const historyResponse = await axios.get(`${API_URL}/inventory/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setInventoryHistory(historyResponse.data);
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating inventory:", error);
      
      const errorMessage = error.response?.data?.message || 
        "We couldn't update the inventory. Please try again.";
      
      toast({
        title: "Failed to Update Inventory",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
    <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Inventory</h1>
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-4">
            <h3 className="font-medium">Total Water Cans</h3>
            <div className="mt-2 text-2xl font-bold">{inventory.totalCans}</div>
            <p className="text-sm text-muted-foreground mt-1">In circulation</p>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-medium">Available Cans</h3>
            <div className="mt-2 text-2xl font-bold">{inventory.availableCans}</div>
            <p className="text-sm text-muted-foreground mt-1">Ready for delivery</p>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-medium">Cans with Customers</h3>
            <div className="mt-2 text-2xl font-bold">{inventory.cansWithCustomers}</div>
            <p className="text-sm text-muted-foreground mt-1">To be returned</p>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Inventory Management</h2>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenDialog('add')}>Add Cans</Button>
            <Button 
              variant="destructive" 
              onClick={() => handleOpenDialog('remove')}
              disabled={inventory.availableCans <= 0}
            >
              Remove Cans
            </Button>
          </div>
        </div>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-medium">Recent Updates</h3>
                <p className="text-sm text-muted-foreground">Last 7 days inventory changes</p>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            <div className="space-y-2">
              {inventoryHistory.length > 0 ? (
                inventoryHistory.map((change, index) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <span>{change.reason || 'Inventory update'}</span>
                    <span className={`font-medium ${
                      (change.totalDiff > 0 || change.availableDiff > 0) 
                        ? 'text-green-500' 
                        : (change.totalDiff < 0 || change.availableDiff < 0)
                          ? 'text-destructive'
                          : 'text-orange-500'
                    }`}>
                      {change.totalDiff > 0 && `+${change.totalDiff} cans`}
                      {change.totalDiff < 0 && `${change.totalDiff} cans`}
                      {change.totalDiff === 0 && change.availableDiff < 0 && `${change.availableDiff} available`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">No recent inventory updates</p>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add' ? 'Add New Water Cans' : 'Remove Water Cans'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateInventory} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={dialogMode === 'remove' ? inventory.availableCans : 999}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason
              </label>
              <input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Reason for inventory change"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                variant={dialogMode === 'add' ? 'default' : 'destructive'}
                disabled={isSubmitting || quantity < 1 || (dialogMode === 'remove' && quantity > inventory.availableCans)}
              >
                {isSubmitting 
                  ? 'Processing...' 
                  : dialogMode === 'add' 
                    ? 'Add Cans' 
                    : 'Remove Cans'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}