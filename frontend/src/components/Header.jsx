import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Droplet } from "lucide-react";
import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/components/UserProvider";

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { role } = useUserRole();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  const isActive = (path) => {
    return location.pathname === path ? "text-primary font-medium" : "text-foreground/80 hover:text-primary transition-colors";
  };
  
  const ListItem = ({ className, title, href, children }) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            to={href}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  };
  
  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
      scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"
    }`}>
      <div className="container px-4 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Droplet className="h-6 w-6 text-primary" />
            <Link to="/" className="text-xl font-bold">PayPrompt</Link>
          </div>
          
          {/* Desktop Navigation with shadcn NavigationMenu */}
          <NavigationMenu className="hidden md:flex mx-6 flex-auto justify-center">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/" className={cn(
                    navigationMenuTriggerStyle(),
                    location.pathname === "/" && "text-primary font-medium bg-accent/50"
                  )}>
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/dashboard" className={cn(
                    navigationMenuTriggerStyle(),
                    location.pathname === "/dashboard" && "text-primary font-medium bg-accent/50"
                  )}>
                    Dashboard
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              {/* Show different menu options based on role */}
              {role === "owner" ? (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={location.pathname.includes("/customers") && "text-primary font-medium bg-accent/50"}>Customers</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <ListItem href="/customers" title="All Customers">
                          Manage your customer accounts
                        </ListItem>
                        <ListItem href="/customers/add" title="Add Customer">
                          Create a new customer profile
                        </ListItem>
                        <ListItem href="/customers/pending" title="Pending Payments">
                          View customers with pending payments
                        </ListItem>
                        <ListItem href="/customers/history" title="Payment History">
                          View customer payment history
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/inventory" className={cn(
                        navigationMenuTriggerStyle(),
                        location.pathname === "/inventory" && "text-primary font-medium bg-accent/50"
                      )}>
                        Inventory
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/reports" className={cn(
                        navigationMenuTriggerStyle(),
                        location.pathname === "/reports" && "text-primary font-medium bg-accent/50"
                      )}>
                        Reports
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              ) : (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/customers" className={cn(
                        navigationMenuTriggerStyle(),
                        location.pathname === "/customers" && "text-primary font-medium bg-accent/50"
                      )}>
                        My Account
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/customers/history" className={cn(
                        navigationMenuTriggerStyle(),
                        location.pathname === "/customers/history" && "text-primary font-medium bg-accent/50"
                      )}>
                        Order History
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default" className="hidden md:flex">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation - slide down animation */}
      <div 
        className={`md:hidden border-t bg-background overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
          <Link to="/" className={`px-4 py-2.5 rounded-md ${isActive("/")}`}>Home</Link>
          <Link to="/dashboard" className={`px-4 py-2.5 rounded-md ${isActive("/dashboard")}`}>Dashboard</Link>
          
          {role === "owner" ? (
            <>
              <Link to="/customers" className={`px-4 py-2.5 rounded-md ${isActive("/customers")}`}>Customers</Link>
              <Link to="/inventory" className={`px-4 py-2.5 rounded-md ${isActive("/inventory")}`}>Inventory</Link>
              <Link to="/reports" className={`px-4 py-2.5 rounded-md ${isActive("/reports")}`}>Reports</Link>
            </>
          ) : (
            <>
              <Link to="/customers" className={`px-4 py-2.5 rounded-md ${isActive("/customers")}`}>My Account</Link>
              <Link to="/customers/history" className={`px-4 py-2.5 rounded-md ${isActive("/customers/history")}`}>Order History</Link>
            </>
          )}
          
          <SignedOut>
            <div className="mt-2 px-4">
              <SignInButton mode="modal">
                <Button variant="default" className="w-full">Sign In</Button>
              </SignInButton>
            </div>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}