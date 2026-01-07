import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const SupervisorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting supervisor login...");
      
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        
        // Store token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          email: data.email,
          role: data.role
        }));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.email}!`,
        });
        
        // ✅ FIXED: Proper role check for supervisor/admin
        const userRole = data.role.toUpperCase();
        if (userRole === "SUPERVISOR" || userRole === "ADMIN") {
          navigate("/supervisor/dashboard");
        } else {
          console.log("User role:", data.role, "Expected: SUPERVISOR or ADMIN");
          toast({
            title: "Access Denied",
            description: "This portal is for supervisors only. Your role: " + data.role,
            variant: "destructive",
          });
          // Clear invalid login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        
      } else {
        const errorText = await response.text();
        console.error("Login failed:", errorText);
        toast({
          title: "Login Failed",
          description: "Invalid credentials or server error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Network Error",
        description: "Cannot connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Supervisor Login</CardTitle>
            <CardDescription>
              Sign in to access the supervisor dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="supervisor@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/supervisor/register" className="text-primary hover:underline">
                  Register here
                </Link>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Student?{" "}
                <Link to="/student/login" className="text-primary hover:underline">
                  Student Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorLogin;