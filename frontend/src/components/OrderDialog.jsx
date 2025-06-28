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
      // Fix: Include userId in the payload
      onOrderPlaced?.({
        quantity: quantity,
        userId: user?.id
      });
      
      // Reset form state
      setQuantity(1);
    } catch (error) {
      console.error("Error in order form submission:", error);
      toast({
        title: "Order Failed",
        description: "There was a problem processing your order form.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Reset form state when dialog closes
      if (!isOpen) {
        setQuantity(1);
        setIsLoading(false);
      }
      onOpenChange(isOpen);
    }}>
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