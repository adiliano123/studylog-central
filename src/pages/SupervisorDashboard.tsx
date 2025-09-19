import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, MessageSquare, User, LogOut, Clock } from "lucide-react";

interface LogbookEntry {
  id: string;
  studentName: string;
  studentEmail: string;
  date: string;
  description: string;
  hoursWorked: number;
  status: "pending" | "approved" | "rejected";
  supervisorComment?: string;
}

const SupervisorDashboard = () => {
  const [entries, setEntries] = useState<LogbookEntry[]>([
    {
      id: "1",
      studentName: "Alice Johnson",
      studentEmail: "alice.johnson@university.edu",
      date: "2024-01-16",
      description: "Attended team meeting and discussed project milestones. Prepared presentation for next week.",
      hoursWorked: 4,
      status: "pending"
    },
    {
      id: "2",
      studentName: "Bob Smith",
      studentEmail: "bob.smith@university.edu",
      date: "2024-01-15",
      description: "Conducted data analysis for research project. Created visualizations and preliminary findings report.",
      hoursWorked: 6,
      status: "pending"
    },
    {
      id: "3",
      studentName: "Alice Johnson",
      studentEmail: "alice.johnson@university.edu",
      date: "2024-01-15",
      description: "Conducted literature review on renewable energy systems. Researched solar panel efficiency improvements and documented findings.",
      hoursWorked: 8,
      status: "approved",
      supervisorComment: "Excellent research work! Well documented."
    }
  ]);

  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleApprove = (entryId: string, comment: string) => {
    setEntries(entries.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: "approved" as const, supervisorComment: comment }
        : entry
    ));
    toast({
      title: "Entry Approved",
      description: "The logbook entry has been approved successfully.",
    });
  };

  const handleReject = (entryId: string, comment: string) => {
    setEntries(entries.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: "rejected" as const, supervisorComment: comment }
        : entry
    ));
    toast({
      title: "Entry Rejected",
      description: "The logbook entry has been rejected with feedback.",
    });
  };

  const pendingEntries = entries.filter(entry => entry.status === "pending");
  const reviewedEntries = entries.filter(entry => entry.status !== "pending");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const ReviewDialog = ({ entry }: { entry: LogbookEntry }) => {
    const [localComment, setLocalComment] = useState("");

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Review</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Logbook Entry</DialogTitle>
            <DialogDescription>
              Student: {entry.studentName} • Date: {entry.date} • Hours: {entry.hoursWorked}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Activity Description</Label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">
                {entry.description}
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
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
                          <span className="font-medium">{entry.studentName}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{entry.date}</span>
                        <Badge variant="secondary" className={getStatusColor(entry.status)}>
                          Pending Review
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {entry.hoursWorked} hours
                        </span>
                        <ReviewDialog entry={entry} />
                      </div>
                    </div>
                    
                    <p className="text-sm">{entry.description}</p>
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
            <CardTitle>Previously Reviewed</CardTitle>
            <CardDescription>
              Logbook entries you have already reviewed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviewedEntries.map((entry, index) => (
              <div key={entry.id}>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{entry.studentName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                      <Badge variant="secondary" className={getStatusColor(entry.status)}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {entry.hoursWorked} hours
                    </span>
                  </div>
                  
                  <p className="text-sm">{entry.description}</p>
                  
                  {entry.supervisorComment && (
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Your Feedback</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.supervisorComment}</p>
                    </div>
                  )}
                </div>
                {index < reviewedEntries.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorDashboard;