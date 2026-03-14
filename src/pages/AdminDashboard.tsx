import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Users, UserCheck, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  course: string;
  year: number;
  assignedSupervisor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface Supervisor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

const AdminDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [studentsRes, supervisorsRes] = await Promise.all([
        fetch("http://localhost:8080/api/admin/students", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://localhost:8080/api/admin/supervisors", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (studentsRes.ok && supervisorsRes.ok) {
        const studentsData = await studentsRes.json();
        const supervisorsData = await supervisorsRes.json();
        setStudents(studentsData);
        setSupervisors(supervisorsData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignSupervisor = async (studentId: number, supervisorId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/admin/assign-supervisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId,
          supervisorId: parseInt(supervisorId)
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Supervisor assigned successfully",
        });
        fetchData();
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

  const handleRemoveSupervisor = async (studentId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/remove-supervisor/${studentId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Supervisor assignment removed",
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: "Failed to remove supervisor",
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
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage student-supervisor assignments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/admin/enhanced")}>
                <Settings className="h-4 w-4 mr-2" />
                Enhanced Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/minimal")}>
                <Settings className="h-4 w-4 mr-2" />
                Minimal Test
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/test")}>
                <Settings className="h-4 w-4 mr-2" />
                Simple Test
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Student-Supervisor Assignments
              </CardTitle>
              <CardDescription>
                Assign supervisors to students for logbook review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {student.studentId} • {student.course} • Year {student.year}
                      </p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select
                        value={student.assignedSupervisor?.id.toString() || ""}
                        onValueChange={(value) => handleAssignSupervisor(student.id, value)}
                      >
                        <SelectTrigger className="w-[250px]">
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          {supervisors.map((supervisor) => (
                            <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                              {supervisor.firstName} {supervisor.lastName} - {supervisor.department || 'No Dept'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {student.assignedSupervisor && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSupervisor(student.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {students.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No students found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Supervisors ({supervisors.length})</CardTitle>
              <CardDescription>
                List of all registered supervisors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {supervisors.map((supervisor) => (
                  <div key={supervisor.id} className="p-3 border rounded-lg">
                    <p className="font-medium">
                      {supervisor.firstName} {supervisor.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {supervisor.email} • {supervisor.department || 'No Department'}
                    </p>
                  </div>
                ))}
                
                {supervisors.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No supervisors found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
