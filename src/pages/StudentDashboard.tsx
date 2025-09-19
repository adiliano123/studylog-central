import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Clock, CheckCircle, XCircle, MessageSquare, LogOut } from "lucide-react";

interface LogbookEntry {
  id: string;
  date: string;
  description: string;
  hoursWorked: number;
  status: "pending" | "approved" | "rejected";
  supervisorComment?: string;
}

const StudentDashboard = () => {
  const [entries, setEntries] = useState<LogbookEntry[]>([
    {
      id: "1",
      date: "2024-01-15",
      description: "Conducted literature review on renewable energy systems. Researched solar panel efficiency improvements and documented findings.",
      hoursWorked: 8,
      status: "approved",
      supervisorComment: "Excellent research work! Well documented."
    },
    {
      id: "2",
      date: "2024-01-16",
      description: "Attended team meeting and discussed project milestones. Prepared presentation for next week.",
      hoursWorked: 4,
      status: "pending"
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    date: "",
    description: "",
    hoursWorked: ""
  });

  const { toast } = useToast();

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: LogbookEntry = {
      id: Date.now().toString(),
      date: newEntry.date,
      description: newEntry.description,
      hoursWorked: parseFloat(newEntry.hoursWorked),
      status: "pending"
    };

    setEntries([entry, ...entries]);
    setNewEntry({ date: "", description: "", hoursWorked: "" });
    
    toast({
      title: "Entry Submitted",
      description: "Your logbook entry has been submitted for review.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Logbook</h1>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* New Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Add New Entry
            </CardTitle>
            <CardDescription>
              Record your daily activities and hours worked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitEntry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours Worked</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="8"
                    value={newEntry.hoursWorked}
                    onChange={(e) => setNewEntry({ ...newEntry, hoursWorked: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description of Activities</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you worked on today..."
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Your Logbook Entries</CardTitle>
            <CardDescription>
              View all your submitted entries and supervisor feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {entries.map((entry, index) => (
              <div key={entry.id}>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{entry.date}</span>
                      <Badge variant="secondary" className={getStatusColor(entry.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(entry.status)}
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
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
                        <span className="text-sm font-medium">Supervisor Feedback</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.supervisorComment}</p>
                    </div>
                  )}
                </div>
                {index < entries.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;