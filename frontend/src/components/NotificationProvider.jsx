import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { notificationService } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, isSignedIn } = useAuth();
  const toastUtils = useToast(); // Get the entire toast object

  const fetchNotifications = useCallback(async () => {
    if (!isSignedIn) return;
    
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await notificationService.getUserNotifications(token);
      
      setNotifications(data);
      setUnreadCount(data.filter(notification => !notification.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isSignedIn]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = await getToken();
      await notificationService.markAsRead(notificationId, token);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      if (toastUtils && typeof toastUtils.toast === 'function') {
        toastUtils.toast({
          title: "Error",
          description: "Failed to update notification status",
          variant: "destructive"
        });
      }
    }
  }, [getToken, toastUtils]);

  // Create a notification (admin only)
  const createNotification = useCallback(async (notificationData) => {
    try {
      const token = await getToken();
      const result = await notificationService.createNotification(notificationData, token);
      
      if (toastUtils && typeof toastUtils.toast === 'function') {
        toastUtils.toast({
          title: "Notification Created",
          description: "The notification has been created successfully.",
          variant: "success"
        });
      }
      
      return result.notification;
    } catch (error) {
      console.error("Failed to create notification:", error);
      if (toastUtils && typeof toastUtils.toast === 'function') {
        toastUtils.toast({
          title: "Error",
          description: "Failed to create the notification.",
          variant: "destructive"
        });
      }
      throw error;
    }
  }, [getToken, toastUtils]);

  // Initial fetch
  useEffect(() => {
    if (isSignedIn) {
      fetchNotifications();
      
      // Poll for new notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      createNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);