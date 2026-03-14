import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const SimpleAdminTest = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("SimpleAdminTest: Component mounted");
    testAuthentication();
  }, []);

  const testAuthentication = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    console.log("Token exists:", !!token);
    console.log("User data:", user);
    
    if (!token) {
      setError("No authentication token found");
      setIsLoading(false);
      return;
    }

    fetchUsers();
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    
    try {
      console.log("Fetching users...");
      const response = await fetch("http://localhost:8080/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Users data received:", data);
        setUsers(data.users || []);
        setError(null);
      } else {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        setError(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      setError(`Network Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Simple Admin Test</h1>
          <Button onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
              <Button onClick={fetchUsers} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>
              Testing user management functionality
            </CardDescription>
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Token:</strong> {localStorage.getItem("token") ? "Present" : "Missing"}
              </div>
              <div>
                <strong>User Data:</strong> {localStorage.getItem("user") ? "Present" : "Missing"}
              </div>
              <div>
                <strong>Users Loaded:</strong> {users.length}
              </div>
              <div>
                <strong>Error:</strong> {error || "None"}
              </div>
            </div>
            
            <div className="mt-4 space-x-2">
              <Button onClick={() => {
                console.log("Current state:", { users, error, isLoading });
                console.log("Token:", localStorage.getItem("token"));
                console.log("User:", localStorage.getItem("user"));
              }}>
                Log to Console
              </Button>
              
              <Button onClick={fetchUsers}>
                Test API Call
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
              }}>
                Test Backend
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleAdminTest;