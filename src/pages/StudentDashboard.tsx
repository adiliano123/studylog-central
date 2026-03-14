import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, BookOpen, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogbookForm from "../components/LogbookForm";
import LogbookEntries from "../components/LogbookEntries";

interface User {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface CheckInStatus {
  isCheckedIn: boolean;
  checkIn?: {
    id: number;
    checkInTime: string;
    locationName?: string;
    locationLatitude?: number;
    locationLongitude?: number;
  };
}

const StudentDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>({ isCheckedIn: false });
  const [locationName, setLocationName] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
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
    // Only fetch check-in status for students
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role === 'STUDENT') {
      fetchCheckInStatus();
    }
  }, [navigate]);

  const fetchCheckInStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/checkin/status", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCheckInStatus(data);
      }
    } catch (error) {
      console.error("Error fetching check-in status:", error);
    }
  };

  const handleCheckIn = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsCheckingIn(true);

    try {
      // Get current location
      let latitude, longitude;
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      const response = await fetch("http://localhost:8080/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          locationLatitude: latitude,
          locationLongitude: longitude,
          locationName: locationName || "Workplace",
          notes: ""
        })
      });

      if (response.ok) {
        toast({
          title: "Checked In",
          description: "You have successfully checked in to the workplace.",
        });
        fetchCheckInStatus();
        setLocationName("");
      } else {
        const error = await response.text();
        toast({
          title: "Check-In Failed",
          description: error || "Failed to check in",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to check in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsCheckingIn(true);

    try {
      const response = await fetch("http://localhost:8080/api/checkin/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        toast({
          title: "Checked Out",
          description: "You have successfully checked out from the workplace.",
        });
        fetchCheckInStatus();
      } else {
        const error = await response.text();
        toast({
          title: "Check-Out Failed",
          description: error || "Failed to check out",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to check out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
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

  // NEW: Get full name function
  const getFullName = () => {
    if (!user) return "";
    return `${user.firstName} ${user.lastName}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {/* Check-In/Check-Out Card */}
          <Card className={checkInStatus.isCheckedIn ? "border-green-200 bg-green-50/50" : "border-blue-200 bg-blue-50/50"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Workplace Check-In
                  </CardTitle>
                  <CardDescription>
                    {checkInStatus.isCheckedIn 
                      ? "You are currently checked in at the workplace"
                      : "Check in when you arrive at the workplace"
                    }
                  </CardDescription>
                </div>
                <Badge 
                  variant={checkInStatus.isCheckedIn ? "default" : "secondary"}
                  className={checkInStatus.isCheckedIn ? "bg-green-600" : ""}
                >
                  {checkInStatus.isCheckedIn ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Checked In
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Checked In
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {checkInStatus.isCheckedIn ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Checked in at:</span>
                      <span>{formatTime(checkInStatus.checkIn!.checkInTime)}</span>
                    </div>
                    {checkInStatus.checkIn?.locationName && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>{checkInStatus.checkIn.locationName}</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleCheckOut}
                    disabled={isCheckingIn}
                    variant="destructive"
                    className="w-full"
                  >
                    {isCheckingIn ? "Checking Out..." : "Check Out"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="locationName">Location Name (Optional)</Label>
                    <Input
                      id="locationName"
                      placeholder="e.g., Main Office, Workshop, Site A"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your GPS location will be captured automatically
                    </p>
                  </div>
                  <Button 
                    onClick={handleCheckIn}
                    disabled={isCheckingIn}
                    className="w-full"
                  >
                    {isCheckingIn ? "Checking In..." : "Check In to Workplace"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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