import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function InventoryPage() {
  return (
    <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Inventory</h1>
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-4">
            <h3 className="font-medium">Total Water Cans</h3>
            <div className="mt-2 text-2xl font-bold">120</div>
            <p className="text-sm text-muted-foreground mt-1">In circulation</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium">Available Cans</h3>
            <div className="mt-2 text-2xl font-bold">67</div>
            <p className="text-sm text-muted-foreground mt-1">Ready for delivery</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium">Cans with Customers</h3>
            <div className="mt-2 text-2xl font-bold">53</div>
            <p className="text-sm text-muted-foreground mt-1">To be returned</p>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Inventory Management</h2>
          <Button>Add New Cans</Button>
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
              <div className="flex justify-between py-2 border-b">
                <span>New cans purchased</span>
                <span className="font-medium text-green-500">+20 cans</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Damaged cans</span>
                <span className="font-medium text-destructive">-3 cans</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Cans sent for cleaning</span>
                <span className="font-medium text-orange-500">10 cans</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}