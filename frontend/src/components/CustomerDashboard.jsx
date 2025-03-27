import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Calendar, History } from "lucide-react";

export function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-medium">Current Balance</h3>
          <div className="mt-2 text-2xl font-bold">₹750</div>
          <p className="text-sm text-muted-foreground mt-1">Last updated: 3 hrs ago</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium">Water Cans Available</h3>
          <div className="mt-2 text-2xl font-bold">5 Cans</div>
          <p className="text-sm text-muted-foreground mt-1">Refill scheduled for Monday</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium">Total Consumption</h3>
          <div className="mt-2 text-2xl font-bold">12 Cans</div>
          <p className="text-sm text-muted-foreground mt-1">This month</p>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex justify-between mb-4">
            <h3 className="font-medium">Recent Deliveries</h3>
            <Button variant="ghost" size="sm" className="h-8">
              <History className="mr-2 h-4 w-4" /> View All
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span>May 15, 2023</span>
              <span className="font-medium">2 cans</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>May 8, 2023</span>
              <span className="font-medium">3 cans</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>May 1, 2023</span>
              <span className="font-medium">2 cans</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Button className="justify-start">
              <ShoppingCart className="mr-2 h-4 w-4" /> 
              Order Water Cans
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="mr-2 h-4 w-4" /> 
              Schedule Delivery
            </Button>
            <Button variant="secondary" className="justify-start">
              View Payment History
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}