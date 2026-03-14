import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, Users, UserCheck, BarChart3, Settings, Plus, Edit, Trash2, 
  RefreshCw, Search, Filter, UserPlus, Key, BookOpen, TrendingUp,
  AlertCircle, CheckCircle, Clock, XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  studentId?: string;
  course?: string;
  year?: number;
  staffId?: string;
  department?: string;
  assignedSupervisor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalSupervisors: number;
  totalAdmins: number;
  totalLogbooks: number;
  pendingLogbooks: number;
  approvedLogbooks: number;
  rejectedLogbooks: number;
  studentsWithSupervisors: number;
  studentsWithoutSupervisors: number;
}

const EnhancedAdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    console.log("Enhanced Admin Dashboard - Checking authentication");
    console.log("Token exists:", !!token);
    console.log("User data:", user);
    
    if (!token) {
      console.error("No authentication token found");
      toast({
        title: "Authentication Required",
        description: "Please login as an admin to access this page",
        variant: "destructive",
      });
      navigate("/admin/login");
      return;
    }

    // Verify user is admin
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log("User role:", userData.role);
        if (userData.role !== "ADMIN") {
          console.error("User is not an admin:", userData.role);
          toast({
            title: "Access Denied",
            description: "You must be an admin to access this page",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    console.log("Starting to fetch all data...");
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    console.log("fetchAllData: Starting to fetch all data");
    setIsLoading(true);
    
    try {
      await Promise.all([
        fetchUsers(),
        fetchSupervisors(),
        fetchStats()
      ]);
      console.log("fetchAllData: All data fetched successfully");
    } catch (error) {
      console.error("fetchAllData: Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      console.log("Fetching users with token:", token.substring(0, 20) + "...");
      const response = await fetch(`http://localhost:8080/api/admin/users?search=${searchTerm}&role=${roleFilter}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log("Users data:", data);
        setUsers(data.users || []);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch users:", response.status, errorText);
        toast({
          title: "Error",
          description: `Failed to load users: ${response.status} ${errorText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users: " + error.message,
        variant: "destructive",
      });
    }
  };

  const fetchSupervisors = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found for supervisors");
      return;
    }

    try {
      console.log("Fetching supervisors...");
      const response = await fetch("http://localhost:8080/api/admin/supervisors", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      console.log("Supervisors response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Supervisors data:", data);
        setSupervisors(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch supervisors:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found for stats");
      return;
    }

    try {
      console.log("Fetching statistics...");
      const response = await fetch("http://localhost:8080/api/admin/statistics", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      console.log("Statistics response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Statistics data:", data);
        setStats(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch statistics:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleCreateUser = async (userData: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No authentication token found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating user with data:", userData);
      const response = await fetch("http://localhost:8080/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      console.log("Create user response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("User created successfully:", data);
        toast({
          title: "Success",
          description: "User created successfully",
        });
        setShowCreateUser(false);
        fetchAllData();
      } else {
        const errorText = await response.text();
        console.error("Failed to create user:", response.status, errorText);
        toast({
          title: "Creation Failed",
          description: `${response.status}: ${errorText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error creating user:", error);
      toast({
        title: "Network Error",
        description: "Unable to connect to server: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (userId: number, userData: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        setEditingUser(null);
        fetchAllData();
      } else {
        const errorText = await response.text();
        toast({
          title: "Update Failed",
          description: errorText,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchAllData();
      } else {
        const errorText = await response.text();
        toast({
          title: "Delete Failed",
          description: errorText,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt("Enter new password (minimum 6 characters):");
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password reset successfully",
        });
      } else {
        const errorText = await response.text();
        toast({
          title: "Reset Failed",
          description: errorText,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleBulkAssignSupervisor = async (supervisorId: number) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select users first",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/admin/bulk-assign-supervisors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          studentIds: selectedUsers,
          supervisorId: supervisorId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Assigned supervisor to ${data.assignedCount} students`,
        });
        setSelectedUsers([]);
        fetchAllData();
      } else {
        const errorText = await response.text();
        toast({
          title: "Assignment Failed",
          description: errorText,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-800";
      case "SUPERVISOR": return "bg-blue-100 text-blue-800";
      case "STUDENT": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.staffId && user.staffId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
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
                <h1 className="text-2xl font-bold">Enhanced Admin Dashboard</h1>
                <p className="text-muted-foreground">Complete system management</p>
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="logbooks">Logbooks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalStudents} students, {stats.totalSupervisors} supervisors, {stats.totalAdmins} admins
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Logbooks</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalLogbooks}</div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {stats.pendingLogbooks} pending
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {stats.approvedLogbooks} approved
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.studentsWithSupervisors}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.studentsWithoutSupervisors} students need assignment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">Good</div>
                    <p className="text-xs text-muted-foreground">
                      All systems operational
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all system users</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateUser(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Roles</SelectItem>
                      <SelectItem value="STUDENT">Students</SelectItem>
                      <SelectItem value="SUPERVISOR">Supervisors</SelectItem>
                      <SelectItem value="ADMIN">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchUsers}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {selectedUsers.length} user(s) selected
                      </span>
                      <div className="flex gap-2">
                        <Select onValueChange={(value) => handleBulkAssignSupervisor(parseInt(value))}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Assign supervisor" />
                          </SelectTrigger>
                          <SelectContent>
                            {supervisors.map((supervisor) => (
                              <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                                {supervisor.firstName} {supervisor.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => setSelectedUsers([])}>
                          Clear Selection
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Table */}
                <div className="space-y-4">
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              }
                            }}
                            className="rounded"
                            aria-label={`Select ${user.firstName} ${user.lastName}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {user.firstName} {user.lastName}
                              </h3>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.role === "STUDENT" && (
                              <p className="text-sm text-muted-foreground">
                                {user.studentId} • {user.course} • Year {user.year}
                                {user.assignedSupervisor && (
                                  <span className="ml-2 text-blue-600">
                                    → {user.assignedSupervisor.firstName} {user.assignedSupervisor.lastName}
                                  </span>
                                )}
                              </p>
                            )}
                            {user.role === "SUPERVISOR" && (
                              <p className="text-sm text-muted-foreground">
                                {user.staffId} • {user.department}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user.id)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {users.length === 0 ? (
                          <>
                            No users found in the system.{" "}
                            <Button variant="link" onClick={() => setShowCreateUser(true)} className="p-0 h-auto">
                              Create the first user
                            </Button>
                          </>
                        ) : (
                          "No users found matching your criteria"
                        )}
                      </p>
                      {users.length === 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Debug Info:</strong> Users array length: {users.length}
                            <br />
                            Check the browser console for API errors.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Student-Supervisor Assignments</CardTitle>
                <CardDescription>Manage student assignments to supervisors</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Assignment management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logbooks">
            <Card>
              <CardHeader>
                <CardTitle>Logbook Management</CardTitle>
                <CardDescription>Overview of all logbook entries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Logbook management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings & Debug</CardTitle>
                <CardDescription>Configure system-wide settings and debug information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Debug Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Debug Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Authentication Token:</strong> {localStorage.getItem("token") ? "✅ Present" : "❌ Missing"}
                    </div>
                    <div>
                      <strong>User Data:</strong> {localStorage.getItem("user") ? "✅ Present" : "❌ Missing"}
                    </div>
                    <div>
                      <strong>Backend URL:</strong> http://localhost:8080
                    </div>
                    <div>
                      <strong>Users Loaded:</strong> {users.length} users
                    </div>
                    <div>
                      <strong>Supervisors Loaded:</strong> {supervisors.length} supervisors
                    </div>
                    <div>
                      <strong>Statistics:</strong> {stats ? "✅ Loaded" : "❌ Not loaded"}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      console.log("Current state:", { users, supervisors, stats });
                      console.log("Token:", localStorage.getItem("token"));
                      console.log("User:", localStorage.getItem("user"));
                    }}>
                      Log State to Console
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchAllData}>
                      Refresh All Data
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      navigate("/admin/login");
                    }}>
                      Clear Auth & Logout
                    </Button>
                  </div>
                </div>

                {/* API Test Section */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">API Test</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={async () => {
                      try {
                        const response = await fetch("http://localhost:8080/api/auth/health");
                        const data = await response.json();
                        toast({
                          title: "Backend Health Check",
                          description: `Status: ${data.status} - ${data.message}`,
                        });
                      } catch (error) {
                        toast({
                          title: "Backend Health Check Failed",
                          description: "Cannot connect to backend",
                          variant: "destructive",
                        });
                      }
                    }}>
                      Test Backend Connection
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={async () => {
                      const token = localStorage.getItem("token");
                      if (!token) {
                        toast({
                          title: "No Token",
                          description: "Please login first",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      try {
                        const response = await fetch("http://localhost:8080/api/admin/users", {
                          headers: { "Authorization": `Bearer ${token}` }
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          toast({
                            title: "API Test Success",
                            description: `Retrieved ${data.users?.length || 0} users`,
                          });
                        } else {
                          toast({
                            title: "API Test Failed",
                            description: `Status: ${response.status}`,
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "API Test Error",
                          description: "Network error",
                          variant: "destructive",
                        });
                      }
                    }}>
                      Test Users API
                    </Button>
                  </div>
                </div>

                {/* System Settings Placeholder */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">System Settings</h3>
                  <p className="text-muted-foreground">System configuration options will be available here in future updates.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create User Dialog */}
      <CreateUserDialog 
        open={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSubmit={handleCreateUser}
      />

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(userData) => handleUpdateUser(editingUser.id, userData)}
        />
      )}
    </div>
  );
};

// Create User Dialog Component
const CreateUserDialog = ({ open, onClose, onSubmit }: any) => {
  const [formData, setFormData] = useState({
    role: "STUDENT",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    studentId: "",
    course: "",
    year: 1,
    staffId: "",
    department: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      role: "STUDENT",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      studentId: "",
      course: "",
      year: 1,
      staffId: "",
      department: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user to the system</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
            />
          </div>

          {/* Role-specific fields */}
          {formData.role === "STUDENT" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                />
              </div>
            </div>
          )}

          {formData.role === "SUPERVISOR" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staffId">Staff ID</Label>
                <Input
                  id="staffId"
                  value={formData.staffId}
                  onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit User Dialog Component (simplified)
const EditUserDialog = ({ user, onClose, onSubmit }: any) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    studentId: user.studentId || "",
    course: user.course || "",
    year: user.year || 1,
    staffId: user.staffId || "",
    department: user.department || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          {/* Role-specific fields */}
          {user.role === "STUDENT" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                />
              </div>
            </div>
          )}

          {user.role === "SUPERVISOR" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staffId">Staff ID</Label>
                <Input
                  id="staffId"
                  value={formData.staffId}
                  onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAdminDashboard;