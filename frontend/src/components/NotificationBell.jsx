import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/components/NotificationProvider";
import { format } from "date-fns";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, isLoading } = useNotifications();

  const handleItemClick = (notificationId) => {
    markAsRead(notificationId);
  };

  const renderNotificationItem = (notification) => {
    const formattedDate = format(
      new Date(notification.createdAt), 
      'MMM d, h:mm a'
    );

    const getIcon = () => {
      switch (notification.type) {
        case 'inventory':
          return "📦";
        case 'announcement':
          return "📢";
        case 'promotion':
          return "🎉";
        default:
          return "📌";
      }
    };

    return (
      <DropdownMenuItem 
        key={notification._id} 
        className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-primary/10' : ''}`}
        onClick={() => handleItemClick(notification._id)}
      >
        <div className="flex gap-3">
          <div className="text-xl">{getIcon()}</div>
          <div className="flex-1">
            <div className="font-medium">{notification.title}</div>
            <div className="text-sm text-muted-foreground">{notification.message}</div>
            <div className="text-xs text-muted-foreground mt-1">{formattedDate}</div>
          </div>
        </div>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative w-9 h-9 p-0">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              {unreadCount} unread
            </span>
          )}
        </div>
        
        <div className="max-h-96 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map(renderNotificationItem)
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="flex w-full justify-center cursor-pointer">
            Manage All Notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}