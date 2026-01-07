import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Eye } from "lucide-react";
import UpdateLogbookForm from "./UpdateLogbookForm";

interface LogbookEntry {
  id: number;
  date: string;
  hoursWorked: number;
  activities: string;
  weekNumber: number;
  status: string;
  reviewed: boolean;
  createdAt: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
  };
  approvals?: Array<{
    id: number;
    status: string;
    comments: string;
    supervisor: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
}

const LogbookEntries = () => {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/logbooks/my", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data);
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

  const handleDelete = async (entryId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("Are you sure you want to delete this logbook entry?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/logbooks/delete/${entryId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Entry Deleted",
          description: "Logbook entry has been deleted successfully.",
        });
        fetchEntries(); // Refresh the list
      } else {
        const errorText = await response.text();
        toast({
          title: "Delete Failed",
          description: errorText || "Failed to delete entry",
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

  const handleUpdateSuccess = () => {
    setEditingEntry(null);
    fetchEntries();
    toast({
      title: "Entry Updated",
      description: "Logbook entry has been updated successfully.",
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED": return "default";
      case "PENDING": return "secondary";
      case "REJECTED": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "text-green-600";
      case "REJECTED": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  // Check if entry can be modified (not reviewed and pending)
  const canModifyEntry = (entry: LogbookEntry) => {
    return !entry.reviewed && entry.status === "PENDING";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading entries...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (editingEntry) {
    return (
      <UpdateLogbookForm 
        entry={editingEntry}
        onSuccess={handleUpdateSuccess}
        onCancel={() => setEditingEntry(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Logbook Entries</CardTitle>
        <CardDescription>
          View all your submitted entries and supervisor feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No logbook entries yet. Create your first entry above!
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">
                        {new Date(entry.date).toLocaleDateString()} 
                        {entry.weekNumber && ` • Week ${entry.weekNumber}`}
                      </h3>
                      <Badge variant={getStatusVariant(entry.status)} className={getStatusColor(entry.status)}>
                        {entry.status}
                        {entry.reviewed && " (Reviewed)"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {entry.hoursWorked} hours worked
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {canModifyEntry(entry) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                    {!canModifyEntry(entry) && (
                      <Button variant="outline" size="sm" disabled>
                        <Eye className="h-4 w-4 mr-1" />
                        View Only
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Activities:</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {entry.activities}
                  </p>
                </div>

                {/* Supervisor Feedback */}
                {entry.approvals && entry.approvals.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Supervisor Feedback:</h4>
                    {entry.approvals.map((approval) => (
                      <div key={approval.id} className="bg-blue-50 p-3 rounded-lg mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {approval.supervisor.firstName} {approval.supervisor.lastName}:
                          </span>
                          <Badge variant={getStatusVariant(approval.status)}>
                            {approval.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {approval.comments}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-4">
                  Created: {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogbookEntries;