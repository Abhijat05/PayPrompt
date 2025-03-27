import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReportsPage() {
  return (
    <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Reports</h1>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This month</span>
                  <span className="font-bold">₹45,231</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last month</span>
                  <span className="font-medium">₹42,854</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Growth</span>
                  <span className="font-medium text-green-500">+5.5%</span>
                </div>
              </div>
              <div className="h-40 mt-6 border-t pt-4">
                <p className="text-center text-muted-foreground">Revenue chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribution Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Water cans sold</span>
                  <span className="font-bold">320</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New customers</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active customers</span>
                  <span className="font-medium">287</span>
                </div>
              </div>
              <div className="h-40 mt-6 border-t pt-4">
                <p className="text-center text-muted-foreground">Distribution chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Available Reports</h2>
          <div className="space-x-2">
            <Button variant="outline">Monthly</Button>
            <Button variant="outline">Quarterly</Button>
            <Button variant="outline">Yearly</Button>
          </div>
        </div>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-medium">Generated Reports</h3>
              <Button>Generate New Report</Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span>May 2023 Financial Summary</span>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Q1 2023 Business Review</span>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Customer Payment Analysis</span>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}