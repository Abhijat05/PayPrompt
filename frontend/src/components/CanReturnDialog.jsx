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
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

export function CanReturnDialog({ 
  open, 
  onOpenChange, 
  customerId, 
  customerName,
  cansInPossession,
  onSuccess
}) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (quantity < 1 || quantity > cansInPossession) {
      toast({
        title: "Invalid quantity",
        description: `Please enter a quantity between 1 and ${cansInPossession}.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = await getToken();
      
      const response = await axios.post(`${API_URL}/orders/return`, {
        customerId,
        quantity: parseInt(quantity)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast({
        title: "Return Processed",
        description: `Successfully processed return of ${quantity} cans from ${customerName}.`,
        variant: "success",
      });
      
      onSuccess(response.data.customerCansRemaining);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to process return:", error);
      
      const errorMessage = error.response?.data?.message || 
        "We couldn't process this return. Please try again.";
      
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) setQuantity(1);
      onOpenChange(isOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Can Return</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <p className="mb-2">
              <span className="font-medium">{customerName}</span> currently has{" "}
              <span className="font-medium">{cansInPossession}</span> water cans.
            </p>
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Cans to Return
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
                  max={cansInPossession}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 h-8 mx-2 text-center border rounded-md"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => quantity < cansInPossession && setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || quantity < 1 || quantity > cansInPossession}
            >
              {isLoading ? "Processing..." : "Process Return"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}