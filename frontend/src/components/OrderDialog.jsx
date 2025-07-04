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
      const token = await getToken();
      
      // Create the order directly here
      const response = await axios.post(`${API_URL}/orders`, {
        userId: user?.id,
        quantity: quantity,
        orderDate: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Notify parent component
      onOrderPlaced?.({
        quantity: quantity,
        userId: user?.id,
        orderData: response.data
      });
      
      toast({
        title: "Order Placed Successfully",
        description: `Your order for ${quantity} water can${quantity > 1 ? 's' : ''} has been placed.`
      });
      
      // Reset form state
      setQuantity(1);
      onOpenChange(false);
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage = error.response?.data?.message || 
        "We couldn't process your order. Please try again.";
      
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
          <DialogTitle>Place a New Order</DialogTitle>
          <DialogDescription>
            Enter the number of water cans you'd like to order.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Water Can Quantity
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
            
            <div className="flex justify-between">
              <span>Price per can:</span>
              <span>₹30</span>
            </div>
            
            <div className="flex justify-between border-t pt-4 font-bold">
              <span>Total:</span>
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