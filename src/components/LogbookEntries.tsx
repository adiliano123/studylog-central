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
  onsiteApproved: boolean;
  universityApproved: boolean;
  student: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onsiteSupervisor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  universitySupervisor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  approvals?: Array<{
    id: number;
    status: string;
    comments: string;
    supervisorType: string;
    approvalDate?: string;
    validatedActivities?: string;
    actualHoursWorked?: number;
    presenceConfirmed?: boolean;
    photoEvidenceUrl?: string;
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

  const getStatusVariant = (status: string, onsiteApproved?: boolean, universityApproved?: boolean) => {
    // Check actual approval flags
    if (onsiteApproved && universityApproved) {
      return "default"; // Green for completed
    }
    
    switch (status) {
      case "APPROVED": return "default";
      case "FULLY_APPROVED": return "default";
      case "ONSITE_APPROVED": return "secondary";
      case "UNIVERSITY_APPROVED": return "secondary";
      case "PENDING": return "secondary";
      case "REJECTED": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string, onsiteApproved?: boolean, universityApproved?: boolean) => {
    // Check actual approval flags
    if (onsiteApproved && universityApproved) {
      return "bg-green-600 text-white"; // Bright green for completed
    }
    
    switch (status) {
      case "APPROVED": return "text-green-600";
      case "FULLY_APPROVED": return "bg-green-600 text-white";
      case "ONSITE_APPROVED": return "text-blue-600";
      case "UNIVERSITY_APPROVED": return "text-blue-600";
      case "REJECTED": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  const getStatusLabel = (status: string, onsiteApproved: boolean, universityApproved: boolean) => {
    // Check actual approval flags for more accurate status
    if (onsiteApproved && universityApproved) {
      return "✓ Completed";
    }
    
    switch (status) {
      case "FULLY_APPROVED": return "✓ Completed";
      case "ONSITE_APPROVED": return "Onsite Approved";
      case "UNIVERSITY_APPROVED": return "University Approved";
      case "PENDING": return "⏳ Pending Review";
      case "REJECTED": return "✗ Rejected";
      default: return status;
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
                      <Badge variant={getStatusVariant(entry.status, entry.onsiteApproved, entry.universityApproved)} 
                             className={getStatusColor(entry.status, entry.onsiteApproved, entry.universityApproved)}>
                        {getStatusLabel(entry.status, entry.onsiteApproved, entry.universityApproved)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {entry.hoursWorked} hours worked
                    </p>
                    
                    {/* Dual Supervisor Approval Status */}
                    <div className="flex gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Onsite Supervisor:</span>
                        {entry.onsiteApproved ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ✓ Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            ⏳ Pending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">University Supervisor:</span>
                        {entry.universityApproved ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ✓ Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            ⏳ Pending
                          </Badge>
                        )}
                      </div>
                    </div>
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

                {/* Dual Supervisor Feedback */}
                {entry.approvals && entry.approvals.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Supervisor Reviews:</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Onsite Supervisor Approval */}
                      {entry.approvals.filter(a => a.supervisorType === 'ONSITE').map((approval) => (
                        <div key={approval.id} className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                              ONSITE SUPERVISOR
                            </div>
                            <Badge variant={getStatusVariant(approval.status)} className={getStatusColor(approval.status)}>
                              {approval.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold mb-1">
                            {approval.supervisor.firstName} {approval.supervisor.lastName}
                          </p>
                          {approval.approvalDate && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Reviewed: {new Date(approval.approvalDate).toLocaleString()}
                            </p>
                          )}
                          {approval.presenceConfirmed && (
                            <div className="flex items-center gap-1 text-xs text-green-700 mb-2">
                              <span>✓</span>
                              <span>Presence Confirmed</span>
                            </div>
                          )}
                          {approval.validatedActivities && (
                            <div className="mb-2">
                              <p className="text-xs font-medium mb-1">Validated Activities:</p>
                              <p className="text-xs bg-white p-2 rounded border">
                                {approval.validatedActivities}
                              </p>
                            </div>
                          )}
                          {approval.actualHoursWorked && (
                            <p className="text-xs mb-2">
                              <span className="font-medium">Validated Hours:</span> {approval.actualHoursWorked}
                            </p>
                          )}
                          {approval.comments && (
                            <div>
                              <p className="text-xs font-medium mb-1">Comments:</p>
                              <p className="text-sm bg-white p-2 rounded border">
                                {approval.comments}
                              </p>
                            </div>
                          )}
                          {approval.photoEvidenceUrl && (
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">Photo Evidence:</p>
                              <img 
                                src={approval.photoEvidenceUrl} 
                                alt="Evidence" 
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* University Supervisor Approval */}
                      {entry.approvals.filter(a => a.supervisorType === 'UNIVERSITY').map((approval) => (
                        <div key={approval.id} className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
                              UNIVERSITY SUPERVISOR
                            </div>
                            <Badge variant={getStatusVariant(approval.status)} className={getStatusColor(approval.status)}>
                              {approval.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold mb-1">
                            {approval.supervisor.firstName} {approval.supervisor.lastName}
                          </p>
                          {approval.approvalDate && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Reviewed: {new Date(approval.approvalDate).toLocaleString()}
                            </p>
                          )}
                          {approval.comments && (
                            <div>
                              <p className="text-xs font-medium mb-1">Comments:</p>
                              <p className="text-sm bg-white p-2 rounded border">
                                {approval.comments}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Pending Approvals Placeholders */}
                      {!entry.approvals.some(a => a.supervisorType === 'ONSITE') && (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded-lg">
                          <div className="bg-gray-400 text-white px-2 py-1 rounded text-xs font-semibold mb-2 inline-block">
                            ONSITE SUPERVISOR
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Awaiting onsite supervisor review...
                          </p>
                        </div>
                      )}
                      
                      {!entry.approvals.some(a => a.supervisorType === 'UNIVERSITY') && (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded-lg">
                          <div className="bg-gray-400 text-white px-2 py-1 rounded text-xs font-semibold mb-2 inline-block">
                            UNIVERSITY SUPERVISOR
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {entry.onsiteApproved 
                              ? "Awaiting university supervisor review..." 
                              : "Requires onsite approval first"}
                          </p>
                        </div>
                      )}
                    </div>
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