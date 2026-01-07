import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogbookForm from "../components/LogbookForm";
import LogbookEntries from "../components/LogbookEntries";

interface User {
  email: string;
  role: string;
  firstName: string;  // NEW: Add first name
  lastName: string;   // NEW: Add last name
}

const StudentDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!userData || !token) {
      navigate("/student/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  // NEW: Get full name function
  const getFullName = () => {
    if (!user) return "";
    return `${user.firstName} ${user.lastName}`;
  };

  if (!user) {
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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Student Dashboard</h1>
                {/* UPDATED: Display full name instead of email */}
                <p className="text-muted-foreground">Welcome, {getFullName()}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your logbook entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {showForm ? "Cancel" : "Add New Entry"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logbook Form */}
          {showForm && (
            <LogbookForm 
              onSuccess={() => {
                setShowForm(false);
                toast({
                  title: "Entry Created",
                  description: "Your logbook entry has been saved successfully.",
                });
              }}
            />
          )}

          {/* Logbook Entries */}
          <LogbookEntries />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;