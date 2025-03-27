import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Droplet, ArrowRight, Shield, Users, BarChart3, Smartphone } from "lucide-react";

export function HomePage() {
  return (
    <main className="flex-1 w-full">
      {/* Hero Section with Background */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex p-3 mb-6 rounded-full bg-primary/10">
            <Droplet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Water Can Ledger Management</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10">
            The complete solution for managing your water can business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button asChild size="lg" className="px-8 py-6 text-base">
              <Link to="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-base">
              <Link to="#features">Learn More</Link>
            </Button>
          </div>
          
          {/* Stats Section */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-4 px-2 md:px-8 rounded-lg bg-card/50 backdrop-blur-sm border">
            <div className="p-4">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold">5000+</p>
              <p className="text-sm text-muted-foreground">Water Cans Delivered</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold">98%</p>
              <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-muted-foreground">Support Available</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl"></div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your water can business efficiently and grow your revenue
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customer Management</h3>
              <p className="text-muted-foreground text-center">Track customer payments, deposits, and delivery schedules efficiently.</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <Droplet className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Inventory Tracking</h3>
              <p className="text-muted-foreground text-center">Never run out of stock with our real-time inventory management system.</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Financial Reports</h3>
              <p className="text-muted-foreground text-center">Generate detailed financial reports to track your business performance.</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mobile Friendly</h3>
              <p className="text-muted-foreground text-center">Access your business data from anywhere using your smartphone or tablet.</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground text-center">Safely process payments and maintain customer deposit records.</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Billing</h3>
              <p className="text-muted-foreground text-center">Generate and share receipts with customers instantly via SMS or email.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple three-step process to transform your water can business
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">1</div>
              <div className="pt-16 px-6">
                <h3 className="text-xl font-bold mb-2">Register Customers</h3>
                <p className="text-muted-foreground">Add your customers with all their details and set up their accounts in the system.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">2</div>
              <div className="pt-16 px-6">
                <h3 className="text-xl font-bold mb-2">Track Deliveries</h3>
                <p className="text-muted-foreground">Record each water can delivery and maintain accurate inventory counts.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">3</div>
              <div className="pt-16 px-6">
                <h3 className="text-xl font-bold mb-2">Manage Payments</h3>
                <p className="text-muted-foreground">Keep track of payments, generate invoices, and send reminders for pending dues.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="rounded-xl bg-card border p-8 md:p-12 flex flex-col items-center text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to grow your business?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">
              Join hundreds of water can businesses that trust our platform for their daily operations.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/dashboard" className="inline-flex items-center gap-2">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Droplet className="h-6 w-6 text-primary" />
              <span className="font-bold">Water Can Ledger</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Water Can Ledger Management. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}