import { Card } from "@/components/ui/card";

export function ShopOwnerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="font-medium">Total Customers</h3>
          <div className="mt-2 text-2xl font-bold">345</div>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium">Monthly Revenue</h3>
          <div className="mt-2 text-2xl font-bold">₹45,231</div>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium">Water Cans In Stock</h3>
          <div className="mt-2 text-2xl font-bold">67</div>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium">Pending Deliveries</h3>
          <div className="mt-2 text-2xl font-bold">12</div>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-medium mb-4">Recent Orders</h3>
          <div className="space-y-2">
            {/* Order items would go here */}
            <div className="flex justify-between py-2 border-b">
              <span>Rahul Sharma</span>
              <span className="font-medium">3 cans</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Priya Patel</span>
              <span className="font-medium">2 cans</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Amit Kumar</span>
              <span className="font-medium">5 cans</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-4">Payment Status</h3>
          <div className="space-y-2">
            {/* Payment status items would go here */}
            <div className="flex justify-between py-2 border-b">
              <span>Collected Today</span>
              <span className="font-medium">₹5,430</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Pending Collections</span>
              <span className="font-medium">₹12,850</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Overdue Payments</span>
              <span className="font-medium">₹3,200</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}