import { useUserRole } from "@/components/UserProvider";
import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CustomersPage() {
  const { role } = useUserRole();
  const location = useLocation();
  
  const renderContent = () => {
    // For the main customers page
    if (location.pathname === "/customers") {
      return role === "owner" ? <OwnerCustomersList /> : <CustomerAccount />;
    }
    
    // For the add customer page
    if (location.pathname === "/customers/add") {
      return <AddCustomer />;
    }
    
    // For the pending payments page
    if (location.pathname === "/customers/pending") {
      return <PendingPayments />;
    }
    
    // For the history page
    if (location.pathname === "/customers/history") {
      return role === "owner" ? <OwnerPaymentHistory /> : <CustomerPaymentHistory />;
    }
    
    // Default case
    return <CustomersList />;
  };
  
  return (
    <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {location.pathname === "/customers/add" ? "Add Customer" : 
           location.pathname === "/customers/pending" ? "Pending Payments" :
           location.pathname === "/customers/history" ? "Payment History" : "Customers"}
        </h1>
        {renderContent()}
      </div>
    </main>
  );
}

// Sub-components for different customer views
function OwnerCustomersList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage your customer accounts here.</p>
        <Button>Add New Customer</Button>
      </div>
      
      <div className="grid gap-4">
        {/* Sample customer list */}
        <Card className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Rahul Sharma</h3>
            <p className="text-sm text-muted-foreground">Balance: ₹450</p>
          </div>
          <Button variant="outline" size="sm">View Details</Button>
        </Card>
        <Card className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Priya Patel</h3>
            <p className="text-sm text-muted-foreground">Balance: ₹1200</p>
          </div>
          <Button variant="outline" size="sm">View Details</Button>
        </Card>
        <Card className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Amit Kumar</h3>
            <p className="text-sm text-muted-foreground">Balance: ₹-300</p>
          </div>
          <Button variant="outline" size="sm">View Details</Button>
        </Card>
      </div>
    </div>
  );
}

function CustomerAccount() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">View your account details and payment history.</p>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="grid gap-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Customer ID:</span>
            <span className="font-medium">CUST12345</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">John Doe</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Address:</span>
            <span className="font-medium">123 Main Street, New Delhi</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium">+91 98765 43210</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Balance:</span>
            <span className="font-medium text-primary">₹750</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AddCustomer() {
  return <p className="text-muted-foreground">Create a new customer form will appear here.</p>;
}

function PendingPayments() {
  return <p className="text-muted-foreground">Customers with pending payments will appear here.</p>;
}

function CustomerPaymentHistory() {
  return <p className="text-muted-foreground">Your payment history will appear here.</p>;
}

function OwnerPaymentHistory() {
  return <p className="text-muted-foreground">All customers payment history will appear here.</p>;
}