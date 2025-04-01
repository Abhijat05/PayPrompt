import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";

// API base URL - consider moving this to an environment variable
const API_URL = "http://localhost:3000/api";

export function OrderDialog({ open, onOpenChange, onOrderPlaced }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get authentication token from Clerk
      const token = await getToken();
      
      // Prepare order data
      const orderData = {
        quantity,
        userId: user?.id,
        orderDate: new Date().toISOString()
      };
      
      // Make API call to backend using axios
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Call the callback with order data from response
      onOrderPlaced?.({
        quantity,
        orderId: response.data.orderId,
        totalAmount: response.data.totalAmount
      });
      
      // Close the dialog and reset form
      onOpenChange(false);
      setQuantity(1);
      
      toast({
        title: "Order Placed Successfully",
        description: `Your order for ${quantity} water cans has been placed.`,
        variant: "success"
      });
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage = error.response?.data?.message || "There was a problem placing your order.";
      
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Water Cans</DialogTitle>
          <DialogDescription>
            Enter the number of water cans you'd like to order.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium leading-none">
              Quantity
            </label>
            <div className="flex items-center">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <input
                id="quantity"
                type="number"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-16 h-8 mx-2 text-center border rounded-md"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="pt-2 flex justify-between items-center border-t">
            <div>
              <p className="text-sm font-medium">Total</p>
              <p className="text-lg font-bold">₹{quantity * 30}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Placing Order..." : "Place Order"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}