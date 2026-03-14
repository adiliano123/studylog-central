import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, MessageSquare, User, LogOut, Clock, BookOpen, Eye, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LogbookEntry {
  id: number;
  date: string;
  hoursWorked: number;
  activities: string;
  weekNumber: number;
  status: string;
  onsiteApproved: boolean;
  universityApproved: boolean;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvals?: Array<{
    id: number;
    status: string;
    comments: string;
    supervisorType?: string;
  }>;
}

interface ApprovalRequest {
  status: "APPROVED" | "REJECTED";
  comments: string;
}

const UniversitySupervisorDashboard = () => {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogbooks();
  }, []);

  const fetchLogbooks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/supervisor/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/logbooks", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("=== UNIVERSITY SUPERVISOR: Fetched logbooks ===");
        console.log("Total entries:", data.length);
        console.log("All entries:", data);
        
        // Log each entry's approval status
        data.forEach((entry: LogbookEntry, index: number) => {
          console.log(`Entry ${index + 1}:`, {
            id: entry.id,
            date: entry.date,
            status: entry.status,
            onsiteApproved: entry.onsiteApproved,
            universityApproved: entry.universityApproved,
            approvals: entry.approvals
          });
        });
        
        setEntries(data);
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view logbooks",
          variant: "destructive",
        });
        navigate("/supervisor/login");
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

  const handleApprove = async (logbookId: number, comments: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      console.log("=== UNIVERSITY SUPERVISOR: Approving logbook ===");
      console.log("Logbook ID:", logbookId);
      console.log("Comments:", comments);

      const approvalRequest = {
        status: "APPROVED",
        comments: comments,
        academicAssessment: comments, // Add academic assessment
        learningOutcomesMet: true
      };

      // NEW: Use university approval endpoint
      const response = await fetch(`http://localhost:8080/api/approvals/university/${logbookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(approvalRequest),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Approval successful:", data);
        toast({
          title: "Entry Approved",
          description: "The logbook entry has been approved for academic credit.",
        });
        fetchLogbooks();
      } else {
        const errorText = await response.text();
        console.error("Approval failed:", errorText);
        toast({
          title: "Approval Failed",
          description: errorText || "Failed to approve entry",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Network Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (logbookId: number, comments: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      console.log("=== UNIVERSITY SUPERVISOR: Rejecting logbook ===");
      console.log("Logbook ID:", logbookId);

      const approvalRequest = {
        status: "REJECTED",
        comments: comments,
        academicAssessment: comments,
        learningOutcomesMet: false
      };

      // NEW: Use university approval endpoint
      const response = await fetch(`http://localhost:8080/api/approvals/university/${logbookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(approvalRequest),
      });

      if (response.ok) {
        toast({
          title: "Entry Rejected",
          description: "The logbook entry has been rejected with feedback.",
        });
        fetchLogbooks();
      } else {
        const errorText = await response.text();
        toast({
          title: "Rejection Failed",
          description: errorText || "Failed to reject entry",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULLY_APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "ONSITE_APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "FULLY_APPROVED":
        return "Fully Approved";
      case "ONSITE_APPROVED":
        return "Onsite Approved";
      case "REJECTED":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const ReviewDialog = ({ entry }: { entry: LogbookEntry }) => {
    const [localComment, setLocalComment] = useState("");
    const [open, setOpen] = useState(false);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Review
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Academic Review & Approval</DialogTitle>
            <DialogDescription>
              Student: {entry.student.firstName} {entry.student.lastName} • 
              Date: {new Date(entry.date).toLocaleDateString()} • 
              Hours: {entry.hoursWorked}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Activity Description</Label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">
                {entry.activities}
              </p>
            </div>

            {/* Show onsite supervisor feedback if available */}
            {entry.approvals && entry.approvals.filter(a => a.supervisorType === "ONSITE").map((approval) => (
              <div key={approval.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Onsite Supervisor Feedback</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {approval.status}
                  </Badge>
                </div>
                <p className="text-sm text-blue-900">{approval.comments}</p>
              </div>
            ))}
            
            <div>
              <Label htmlFor="comment">Your Academic Feedback</Label>
              <Textarea
                id="comment"
                placeholder="Provide academic assessment, learning outcomes evaluation, and recommendations..."
                value={localComment}
                onChange={(e) => setLocalComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                handleReject(entry.id, localComment);
                setLocalComment("");
                setOpen(false);
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => {
                handleApprove(entry.id, localComment);
                setLocalComment("");
                setOpen(false);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve for Academic Credit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const ViewDialog = ({ entry }: { entry: LogbookEntry }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Logbook Entry Details</DialogTitle>
            <DialogDescription>
              Student: {entry.student.firstName} {entry.student.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Date</Label>
                <p className="text-sm">{new Date(entry.date).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Hours Worked</Label>
                <p className="text-sm">{entry.hoursWorked} hours</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant="secondary" className={getStatusColor(entry.status)}>
                  {getStatusText(entry.status)}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Activity Description</Label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">
                {entry.activities}
              </p>
            </div>
            
            {entry.approvals && entry.approvals.map((approval) => (
              <div key={approval.id} className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {approval.supervisorType === "ONSITE" ? "Onsite Supervisor" : "University Supervisor"} Feedback
                  </span>
                  <Badge variant="secondary" className={getStatusColor(approval.status)}>
                    {approval.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{approval.comments}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Filter entries: University supervisor sees entries approved by onsite but not yet by university
  const pendingEntries = entries.filter(entry => 
    entry.onsiteApproved && !entry.universityApproved
  );
  const reviewedEntries = entries.filter(entry => entry.universityApproved);
  
  console.log("=== UNIVERSITY SUPERVISOR: Filtering ===");
  console.log("Total entries:", entries.length);
  console.log("Pending entries (onsiteApproved && !universityApproved):", pendingEntries.length);
  console.log("Pending entries:", pendingEntries);
  console.log("Reviewed entries:", reviewedEntries.length);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading university supervisor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">University Supervisor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Academic assessment & final approval</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Pending Academic Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Academic Review ({pendingEntries.length})
            </CardTitle>
            <CardDescription>
              Entries verified by onsite supervisor, awaiting your academic approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pendingEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No entries pending academic review
              </p>
            ) : (
              pendingEntries.map((entry, index) => (
                <div key={entry.id}>
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {entry.student.firstName} {entry.student.lastName}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <Badge variant="secondary" className={getStatusColor(entry.status)}>
                          {getStatusText(entry.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {entry.hoursWorked} hours
                        </span>
                        <ReviewDialog entry={entry} />
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{entry.activities}</p>
                  </div>
                  {index < pendingEntries.length - 1 && <Separator className="mt-6" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Reviewed Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Academically Approved Entries ({reviewedEntries.length})</CardTitle>
            <CardDescription>
              Entries you have reviewed and approved for academic credit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviewedEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No reviewed entries yet
              </p>
            ) : (
              reviewedEntries.map((entry, index) => (
                <div key={entry.id}>
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {entry.student.firstName} {entry.student.lastName}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <Badge variant="secondary" className={getStatusColor(entry.status)}>
                          {getStatusText(entry.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {entry.hoursWorked} hours
                        </span>
                        <ViewDialog entry={entry} />
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{entry.activities}</p>
                    
                    {entry.approvals && entry.approvals.filter(a => a.supervisorType === "UNIVERSITY").map((approval) => (
                      <div key={approval.id} className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Your Feedback</span>
                          <Badge variant="secondary" className={getStatusColor(approval.status)}>
                            {approval.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{approval.comments}</p>
                      </div>
                    ))}
                  </div>
                  {index < reviewedEntries.length - 1 && <Separator className="mt-6" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UniversitySupervisorDashboard;
