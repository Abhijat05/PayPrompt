import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Bell, Plus } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { notificationService } from "@/lib/api";
import { format } from "date-fns";
import { CreateNotificationForm } from "@/components/CreateNotificationForm";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { getToken } = useAuth();
  const toastUtils = useToast();
  
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await notificationService.getAllNotifications(token);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toastUtils.toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (notificationId) => {
    try {
      const token = await getToken();
      await notificationService.deleteNotification(notificationId, token);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Use toastUtils.toast instead of just toast
      if (toastUtils && typeof toastUtils.toast === 'function') {
        toastUtils.toast({
          title: "Success",
          description: "Notification deleted successfully",
          variant: "success"
        });
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      if (toastUtils && typeof toastUtils.toast === 'function') {
        toastUtils.toast({
          title: "Error",
          description: "Failed to delete the notification",
          variant: "destructive"
        });
      }
    }
  };
  
  const getTypeInfo = (type) => {
    switch (type) {
      case 'inventory':
        return { icon: "📦", label: "Inventory", className: "bg-blue-100 text-blue-800" };
      case 'announcement':
        return { icon: "📢", label: "Announcement", className: "bg-purple-100 text-purple-800" };
      case 'promotion':
        return { icon: "🎉", label: "Promotion", className: "bg-green-100 text-green-800" };
      default:
        return { icon: "📌", label: "Other", className: "bg-gray-100 text-gray-800" };
    }
  };
  
  useEffect(() => {
    fetchNotifications();
  }, [getToken]);
  
  const handleCreateSuccess = () => {
    fetchNotifications();
  };
  
  return (
    <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications Management</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <Bell className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No notifications have been created yet.</p>
                <Button 
                  className="mt-4" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Create Your First Notification
                </Button>
              </Card>
            ) : (
              notifications.map(notification => {
                const typeInfo = getTypeInfo(notification.type);
                const formattedDate = format(
                  new Date(notification.createdAt), 
                  'MMM d, yyyy - h:mm a'
                );
                
                return (
                  <Card key={notification._id} className="p-4">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-lg">{notification.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.className}`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-3">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">Created: {formattedDate}</p>
                      </div>
                      <div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(notification._id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
      
      <CreateNotificationForm 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </main>
  );
}