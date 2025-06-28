import { useState, useEffect } from "react";
import { useUserRole } from "@/components/UserProvider";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Search, User, Calendar, Phone, Mail, Home, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";

const API_URL = "http://localhost:3000/api";

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
    return role === "owner" ? <OwnerCustomersList /> : <CustomerAccount />;
  };
  
  return (
    <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {location.pathname === "/customers/add" ? "Add Customer" : 
           location.pathname === "/customers/pending" ? "Pending Payments" :
           location.pathname === "/customers/history" ? "Payment History" : 
           role === "owner" ? "All Customers" : "My Account"}
        </h1>
        {renderContent()}
      </div>
    </main>
  );
}

// Sub-components for different customer views
function OwnerCustomersList() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { getToken } = useAuth();
  const { toast } = useToast();

  // Fetch all customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        
        const response = await axios.get(`${API_URL}/customers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Failed to load customers",
          description: "We couldn't load the customer list. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [getToken, toast]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <p className="text-muted-foreground">Manage your customer accounts here.</p>
        <Button asChild>
          <Link to="/customers/add">Add New Customer</Link>
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search customers by name, email, or phone"
          className="pl-8 mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid gap-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <Card key={customer._id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
              <div>
                <h3 className="font-medium">{customer.name}</h3>
                <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-muted-foreground">
                  <span>{customer.phone || 'No phone'}</span>
                  <span>{customer.email || 'No email'}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <div className="text-right md:mr-6">
                  <span className="block text-sm font-medium">Balance</span>
                  <span className={`font-semibold ${customer.balance < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    ₹{customer.balance}
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/customers/details/${customer._id}`}>View Details</Link>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'No customers match your search' : 'No customers found'}
            </p>
          </div>
        )}
      </div>
      
      {customers.length > 0 && filteredCustomers.length === 0 && (
        <div className="flex justify-center mt-4">
          <Button variant="ghost" onClick={() => setSearchTerm("")}>Clear Search</Button>
        </div>
      )}
    </div>
  );
}

function AddCustomer() {
  return <p className="text-muted-foreground">Create a new customer form will appear here.</p>;
}

function PendingPayments() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        
        // Fetch all customers first
        const response = await axios.get(`${API_URL}/customers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Filter only customers with negative balance (pending payments)
        const pendingCustomers = response.data.filter(
          customer => customer.balance < 0
        ).sort((a, b) => a.balance - b.balance); // Sort by balance (most negative first)
        
        setCustomers(pendingCustomers);
      } catch (error) {
        console.error("Error fetching pending payments:", error);
        toast({
          title: "Failed to load pending payments",
          description: "We couldn't load the pending payments list. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingCustomers();
  }, [getToken, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {customers.length > 0 
            ? `${customers.length} customers with pending payments` 
            : "No pending payments found"}
        </p>
        <Button variant="outline" onClick={() => navigate('/customers')}>
          View All Customers
        </Button>
      </div>
      
      {customers.length > 0 ? (
        <div className="grid gap-4">
          {customers.map(customer => (
            <Card key={customer._id} className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-medium">{customer.name}</h3>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-muted-foreground">
                    <span>{customer.phone || 'No phone'}</span>
                    <span>{customer.email || 'No email'}</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <div className="md:text-right md:mr-6">
                    <span className="block text-sm font-medium">Outstanding Balance</span>
                    <span className="font-semibold text-destructive">₹{Math.abs(customer.balance)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/customers/details/${customer._id}`}>View Details</Link>
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Collect Payment
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">All customer accounts are in good standing.</p>
          <p className="text-sm text-muted-foreground">When customers have outstanding payments, they will appear here.</p>
        </Card>
      )}
    </div>
  );
}

function CustomerAccount() {
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const token = await getToken();
        
        // Fetch customer data
        const response = await axios.get(`${API_URL}/customers/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setCustomerData(response.data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast({
          title: "Failed to load account data",
          description: "We couldn't load your account information. Please try again later.",
          variant: "destructive"
        });
        
        // For demo/development: Use placeholder data if API fails
        if (process.env.NODE_ENV === 'development') {
          setCustomerData({
            _id: "demo-id",
            name: user.fullName || "Customer",
            email: user.primaryEmailAddress?.emailAddress || "customer@example.com",
            phone: "123-456-7890",
            address: "123 Water Avenue",
            balance: 850,
            cansInPossession: 3,
            totalOrders: 12,
            lastOrderDate: new Date().toISOString(),
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [user, getToken, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to retrieve account information.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">View your account details and payment history.</p>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{customerData.name}</h2>
              <p className="text-sm text-muted-foreground">Customer ID: {customerData._id}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit Profile</Button>
        </div>
        
        <div className="grid gap-5">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{customerData.email || "Not provided"}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{customerData.phone || "Not provided"}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p>{customerData.address || "Not provided"}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p>{formatDate(customerData.createdAt) || formatDate(customerData.joinDate)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
              <p className={`font-medium ${customerData.balance < 0 ? 'text-destructive' : 'text-green-600'}`}>
                ₹{customerData.balance || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-medium mb-4">Account Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h4 className="text-sm text-muted-foreground">Total Orders</h4>
              <p className="text-2xl font-bold mt-1">{customerData.totalOrders || 0}</p>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm text-muted-foreground">Water Cans Available</h4>
              <p className="text-2xl font-bold mt-1">{customerData.cansInPossession || 0}</p>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm text-muted-foreground">Last Order</h4>
              <p className="mt-1">{customerData.lastOrderDate ? formatDate(customerData.lastOrderDate) : "No orders yet"}</p>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link to="/customers/history">View Order History</Link>
          </Button>
          <Button variant="outline" className="flex-1">Update Contact Information</Button>
        </div>
      </Card>
    </div>
  );
}

function CustomerPaymentHistory() {
  return <p className="text-muted-foreground">Your payment history will appear here.</p>;
}

function OwnerPaymentHistory() {
  return <p className="text-muted-foreground">All customers payment history will appear here.</p>;
}