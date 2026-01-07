import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, MessageSquare, User, LogOut, Clock, BookOpen, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LogbookEntry {
  id: number;
  date: string;
  hoursWorked: number;
  activities: string;
  weekNumber: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewed: boolean;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvals?: Array<{
    id: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    comments: string;
    supervisor: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
}

interface ApprovalRequest {
  status: "APPROVED" | "REJECTED";
  comments: string;
}

const SupervisorDashboard = () => {
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
      const response = await fetch("http://localhost:8080/api/logbooks/all", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view logbooks",
          variant: "destructive",
        });
        navigate("/supervisor/login");
      } else {
        toast({
          title: "Error",
          description: "Failed to load logbook entries",
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

  const handleApprove = async (logbookId: number, comments: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const approvalRequest: ApprovalRequest = {
        status: "APPROVED",
        comments: comments
      };

      const response = await fetch(`http://localhost:8080/api/approvals/create/${logbookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(approvalRequest),
      });

      if (response.ok) {
        toast({
          title: "Entry Approved",
          description: "The logbook entry has been approved successfully.",
        });
        fetchLogbooks();
      } else {
        const errorText = await response.text();
        toast({
          title: "Approval Failed",
          description: errorText || "Failed to approve entry",
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

  const handleReject = async (logbookId: number, comments: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const approvalRequest: ApprovalRequest = {
        status: "REJECTED",
        comments: comments
      };

      const response = await fetch(`http://localhost:8080/api/approvals/create/${logbookId}`, {
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
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  // NEW: Check if entry has been reviewed by current supervisor
  const hasBeenReviewedByMe = (entry: LogbookEntry) => {
    return entry.reviewed || (entry.approvals && entry.approvals.length > 0);
  };

  const pendingEntries = entries.filter(entry => !hasBeenReviewedByMe(entry));
  const reviewedEntries = entries.filter(entry => hasBeenReviewedByMe(entry));

  const ReviewDialog = ({ entry }: { entry: LogbookEntry }) => {
    const [localComment, setLocalComment] = useState("");

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Review
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Logbook Entry</DialogTitle>
            <DialogDescription>
              Student: {entry.student.firstName} {entry.student.lastName} • 
              Date: {new Date(entry.date).toLocaleDateString()} • 
              Hours: {entry.hoursWorked} • 
              Week: {entry.weekNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Activity Description</Label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">
                {entry.activities}
              </p>
            </div>
            
            <div>
              <Label htmlFor="comment">Your Feedback</Label>
              <Textarea
                id="comment"
                placeholder="Add your comments and feedback..."
                value={localComment}
                onChange={(e) => setLocalComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                handleReject(entry.id, localComment);
                setLocalComment("");
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => {
                handleApprove(entry.id, localComment);
                setLocalComment("");
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
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
                <Label className="text-sm font-medium">Week Number</Label>
                <p className="text-sm">{entry.weekNumber || 'Not specified'}</p>
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
                  <span className="text-sm font-medium">Your Feedback</span>
                  <Badge variant="secondary" className={getStatusColor(approval.status)}>
                    {getStatusText(approval.status)}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading supervisor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage student logbook approvals</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Reviews ({pendingEntries.length})
            </CardTitle>
            <CardDescription>
              Logbook entries awaiting your review and approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pendingEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending entries to review
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
                        {entry.weekNumber && (
                          <Badge variant="outline" className="text-xs">
                            Week {entry.weekNumber}
                          </Badge>
                        )}
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

        {/* Previously Reviewed */}
        <Card>
          <CardHeader>
            <CardTitle>Reviewed Entries ({reviewedEntries.length})</CardTitle>
            <CardDescription>
              Logbook entries you have already reviewed
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
                        {entry.weekNumber && (
                          <Badge variant="outline" className="text-xs">
                            Week {entry.weekNumber}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {entry.hoursWorked} hours
                        </span>
                        <ViewDialog entry={entry} />
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{entry.activities}</p>
                    
                    {entry.approvals && entry.approvals.map((approval) => (
                      <div key={approval.id} className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Your Feedback</span>
                          <Badge variant="secondary" className={getStatusColor(approval.status)}>
                            {getStatusText(approval.status)}
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

export default SupervisorDashboard;