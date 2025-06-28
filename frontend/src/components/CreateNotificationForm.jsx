import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useNotifications } from "@/components/NotificationProvider";

export function CreateNotificationForm({ open, onOpenChange }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("inventory");
  const [isLoading, setIsLoading] = useState(false);
  const { createNotification } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setIsLoading(true);
    try {
      await createNotification({
        title,
        message,
        type,
        isPublic: true
      });
      
      // Reset form and close dialog
      setTitle("");
      setMessage("");
      setType("inventory");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Notification</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Notification title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="inventory">Inventory Update</option>
              <option value="announcement">Announcement</option>
              <option value="promotion">Promotion</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded-md min-h-[100px]"
              placeholder="Notification message"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title || !message}>
              {isLoading ? "Creating..." : "Create Notification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}