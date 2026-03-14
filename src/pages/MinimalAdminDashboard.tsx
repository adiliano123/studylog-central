import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Users, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const MinimalAdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("MinimalAdminDashboard: Component mounted");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      console.log("Fetching users...");
      const response = await fetch("http://localhost:8080/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Users data:", data);
        setUsers(data.users || []);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch users:", response.status, errorText);
        toast({
          title: "Error",
          description: `Failed to load users: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Minimal Admin Dashboard</h1>
                <p className="text-muted-foreground">Testing user management</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Simple Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <Button 
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-4 w-4 mr-2" />
            Users ({users.length})
          </Button>
          <Button 
            variant={activeTab === "debug" ? "default" : "outline"}
            onClick={() => setActiveTab("debug")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Debug
          </Button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all system users</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                  <Button onClick={fetchUsers} className="mt-4">
                    Refresh
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {user.email} • {user.role}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Debug Tab */}
        {activeTab === "debug" && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>System status and debugging tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Authentication Token:</strong> {localStorage.getItem("token") ? "✅ Present" : "❌ Missing"}
                  </div>
                  <div>
                    <strong>User Data:</strong> {localStorage.getItem("user") ? "✅ Present" : "❌ Missing"}
                  </div>
                  <div>
                    <strong>Users Loaded:</strong> {users.length} users
                  </div>
                  <div>
                    <strong>Backend URL:</strong> http://localhost:8080
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={fetchUsers} size="sm">
                    Refresh Users
                  </Button>
                  <Button onClick={() => {
                    console.log("Current state:", { users });
                    console.log("Token:", localStorage.getItem("token"));
                    console.log("User:", localStorage.getItem("user"));
                  }} size="sm">
                    Log to Console
                  </Button>
                  <Button onClick={async () => {
                    try {
                      const response = await fetch("http://localhost:8080/api/auth/health");
                      const data = await response.json();
                      toast({
                        title: "Backend Test",
                        description: `Status: ${data.status}`,
                      });
                    } catch (error) {
                      toast({
                        title: "Backend Test Failed",
                        description: "Cannot connect",
                        variant: "destructive",
                      });
                    }
                  }} size="sm">
                    Test Backend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MinimalAdminDashboard;