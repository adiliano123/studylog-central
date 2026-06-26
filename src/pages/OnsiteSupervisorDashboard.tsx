import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, MessageSquare, User, LogOut, Clock, BookOpen, Search, UserCheck, MapPin, Activity, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "@/components/UserAvatar";
import ProfilePictureUploadModal from "@/components/ProfilePictureUploadModal";

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
    studentId?: string;
  };
  onsiteApproval?: {
    id: number;
    status: string;
    comments: string;
    presenceConfirmed: boolean;
    locationLatitude?: number;
    locationLongitude?: number;
    validatedActivities?: string;
    actualHoursWorked?: number;
    photoEvidenceUrl?: string;
    approvalDate: string;
    supervisor?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface StudentInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  course?: string;
  year?: number;
}

interface CheckInInfo {
  id: number;
  checkInTime: string;
  checkOutTime?: string;
  locationName?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  notes?: string;
}

interface OnsiteApprovalRequest {
  status: "APPROVED" | "REJECTED";
  comments: string;
  presenceConfirmed: boolean;
  locationLatitude?: number;
  locationLongitude?: number;
  validatedActivities?: string;
  actualHoursWorked?: number;
  photoEvidenceUrl?: string;
}

const OnsiteSupervisorDashboard = () => {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentSearchId, setStudentSearchId] = useState("");
  const [searchedStudent, setSearchedStudent] = useState<StudentInfo | null>(null);
  const [studentLogbooks, setStudentLogbooks] = useState<LogbookEntry[]>([]);
  const [studentCheckIns, setStudentCheckIns] = useState<CheckInInfo[]>([]);
  const [currentlyCheckedIn, setCurrentlyCheckedIn] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showStudentView, setShowStudentView] = useState(false);
  const [newEntriesCount, setNewEntriesCount] = useState(0);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [supervisorProfile, setSupervisorProfile] = useState<{ firstName: string; lastName: string; profileImageUrl?: string | null }>({ firstName: "", lastName: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load supervisor profile from localStorage for avatar display
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setSupervisorProfile({ firstName: u.firstName ?? "", lastName: u.lastName ?? "", profileImageUrl: u.profileImageUrl ?? null });
      } catch { /* ignore */ }
    }
    // Don't fetch all logbooks on load - only fetch checked-in students
    setIsLoading(false);
    fetchCurrentlyCheckedIn();
    
    // Check for checked-in students every 30 seconds
    const interval = setInterval(() => {
      fetchCurrentlyCheckedIn();
    }, 30000);

    return () => clearInterval(interval);
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
        setEntries(data);
        
        // Count new entries (created in last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const newEntries = data.filter((entry: LogbookEntry) => 
          !entry.onsiteApproved &&
          new Date(entry.date) >= oneDayAgo
        );
        setNewEntriesCount(newEntries.length);
        
        // Show notification if there are new entries
        const currentPendingCount = data.filter((entry: LogbookEntry) => !entry.onsiteApproved).length;
        if (newEntries.length > 0 && entries.length > 0 && newEntries.length > currentPendingCount) {
          toast({
            title: "New Logbook Entries",
            description: `${newEntries.length} new ${newEntries.length === 1 ? 'entry' : 'entries'} awaiting your review`,
          });
        }
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

  const fetchCurrentlyCheckedIn = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/checkin/currently-checked-in", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentlyCheckedIn(data);
      }
    } catch (error) {
      console.error("Error fetching checked-in students:", error);
    }
  };

  const searchStudent = async () => {
    if (!studentSearchId.trim()) {
      toast({
        title: "Student ID Required",
        description: "Please enter a student ID to search",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSearching(true);

    try {
      const studentResponse = await fetch(`http://localhost:8080/api/students/search?studentId=${studentSearchId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (studentResponse.ok) {
        const student = await studentResponse.json();
        setSearchedStudent(student);
        
        // Fetch student's logbooks
        const logbooksResponse = await fetch(`http://localhost:8080/api/logbooks/student/${student.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        let loadedLogbooksCount = 0;
        if (logbooksResponse.ok) {
          const logbooks = await logbooksResponse.json();
          loadedLogbooksCount = logbooks.length;
          setStudentLogbooks(logbooks);
          // Also update the main entries state to show this student's entries
          setEntries(logbooks);
        }

        // Fetch student's check-ins
        const checkInsResponse = await fetch(`http://localhost:8080/api/checkin/student/${student.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (checkInsResponse.ok) {
          const checkIns = await checkInsResponse.json();
          setStudentCheckIns(checkIns);
        }

        setShowStudentView(true);
        
        toast({
          title: "Student Found",
          description: `Loaded ${loadedLogbooksCount} logbook entries for ${student.firstName} ${student.lastName}`,
        });
      } else if (studentResponse.status === 404) {
        toast({
          title: "Student Not Found",
          description: "No student found with this ID",
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
      setIsSearching(false);
    }
  };

  const clearStudentSearch = () => {
    setStudentSearchId("");
    setSearchedStudent(null);
    setStudentLogbooks([]);
    setStudentCheckIns([]);
    setShowStudentView(false);
    setEntries([]); // Clear the entries when clearing search
  };

  const handleOnsiteApproval = async (logbookId: number, approvalData: OnsiteApprovalRequest) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/approvals/onsite/${logbookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(approvalData),
      });

      if (response.ok) {
        toast({
          title: approvalData.status === "APPROVED" ? "Entry Approved" : "Entry Rejected",
          description: approvalData.status === "APPROVED" 
            ? "The logbook entry has been approved with onsite verification." 
            : "The logbook entry has been rejected.",
        });
        // Refresh the current student's data
        if (showStudentView && searchedStudent) {
          searchStudent();
        }
      } else {
        const errorText = await response.text();
        toast({
          title: "Action Failed",
          description: errorText || "Failed to process approval",
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
        return "Pending Review";
    }
  };

  const OnsiteReviewDialog = ({ entry }: { entry: LogbookEntry }) => {
    const [comments, setComments] = useState("");
    const [presenceConfirmed, setPresenceConfirmed] = useState(false);
    const [validatedActivities, setValidatedActivities] = useState(entry.activities);
    const [actualHours, setActualHours] = useState(entry.hoursWorked);
    const [location, setLocation] = useState({ lat: 0, lng: 0 });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [checkInRecords, setCheckInRecords] = useState<CheckInInfo[]>([]);
    const [loadingCheckIns, setLoadingCheckIns] = useState(false);

    useEffect(() => {
      if (open) {
        // Get location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => console.error("Error getting location:", error)
          );
        }

        // Fetch student's check-in records for the entry date
        fetchCheckInRecords();
      }
    }, [open]);

    const fetchCheckInRecords = async () => {
      setLoadingCheckIns(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`http://localhost:8080/api/checkin/student/${entry.student.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Filter check-ins for the same date as the logbook entry
          const entryDate = new Date(entry.date).toDateString();
          const relevantCheckIns = data.filter((checkIn: CheckInInfo) => {
            const checkInDate = new Date(checkIn.checkInTime).toDateString();
            return checkInDate === entryDate;
          });
          setCheckInRecords(relevantCheckIns);
        }
      } catch (error) {
        console.error("Error fetching check-ins:", error);
      } finally {
        setLoadingCheckIns(false);
      }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const uploadPhoto = async (): Promise<string | undefined> => {
      if (!photoFile) return undefined;

      setIsUploading(true);
      try {
        // In a real app, upload to cloud storage (S3, Cloudinary, etc.)
        // For now, we'll use base64 encoding
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(photoFile);
        });
      } catch (error) {
        console.error("Error uploading photo:", error);
        return undefined;
      } finally {
        setIsUploading(false);
      }
    };

    const handleApprove = async () => {
      const photoUrl = await uploadPhoto();
      
      const approvalData: OnsiteApprovalRequest = {
        status: "APPROVED",
        comments,
        presenceConfirmed,
        locationLatitude: location.lat,
        locationLongitude: location.lng,
        validatedActivities,
        actualHoursWorked: actualHours,
        photoEvidenceUrl: photoUrl
      };
      handleOnsiteApproval(entry.id, approvalData);
      setOpen(false);
      resetForm();
    };

    const handleReject = () => {
      const approvalData: OnsiteApprovalRequest = {
        status: "REJECTED",
        comments,
        presenceConfirmed: false
      };
      handleOnsiteApproval(entry.id, approvalData);
      setOpen(false);
      resetForm();
    };

    const resetForm = () => {
      setComments("");
      setPresenceConfirmed(false);
      setValidatedActivities(entry.activities);
      setActualHours(entry.hoursWorked);
      setPhotoFile(null);
      setPhotoPreview("");
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Review & Verify
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Onsite Verification & Approval</DialogTitle>
            <DialogDescription>
              Student: {entry.student.firstName} {entry.student.lastName} • 
              Date: {new Date(entry.date).toLocaleDateString()} • 
              Claimed Hours: {entry.hoursWorked}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Check-In Verification */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Check-In Verification for {new Date(entry.date).toLocaleDateString()}
              </h4>
              {loadingCheckIns ? (
                <p className="text-sm text-blue-700">Loading check-in records...</p>
              ) : checkInRecords.length === 0 ? (
                <p className="text-sm text-red-700">⚠️ No check-in record found for this date</p>
              ) : (
                <div className="space-y-2">
                  {checkInRecords.map((checkIn) => (
                    <div key={checkIn.id} className="text-sm bg-white p-2 rounded">
                      <p className="font-medium text-green-700">✓ Student checked in</p>
                      <p className="text-gray-600">
                        Time: {new Date(checkIn.checkInTime).toLocaleTimeString()}
                        {checkIn.checkOutTime && ` - ${new Date(checkIn.checkOutTime).toLocaleTimeString()}`}
                      </p>
                      {checkIn.locationName && (
                        <p className="text-gray-600">Location: {checkIn.locationName}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Presence Confirmation */}
            <div className="flex items-center space-x-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <Checkbox 
                id="presence" 
                checked={presenceConfirmed}
                onCheckedChange={(checked) => setPresenceConfirmed(checked as boolean)}
              />
              <label
                htmlFor="presence"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                ✓ I confirm the student was physically present on site and performed these activities
              </label>
            </div>

            {/* Student's Claimed Information */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-xs text-gray-600">Student's Claimed Hours</Label>
                <p className="text-lg font-semibold">{entry.hoursWorked} hours</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Week Number</Label>
                <p className="text-lg font-semibold">Week {entry.weekNumber}</p>
              </div>
            </div>

            {/* Original Activity */}
            <div>
              <Label className="text-sm font-medium">Student's Activity Description</Label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg border">
                {entry.activities}
              </p>
            </div>

            <Separator />

            {/* Validated Activities */}
            <div>
              <Label htmlFor="validatedActivities">
                Validated Activities <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground ml-2">(Confirm or correct the activities)</span>
              </Label>
              <Textarea
                id="validatedActivities"
                value={validatedActivities}
                onChange={(e) => setValidatedActivities(e.target.value)}
                rows={4}
                placeholder="Confirm or correct the activities performed..."
                className="mt-1"
              />
            </div>

            {/* Hours Validation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Claimed Hours</Label>
                <Input value={entry.hoursWorked} disabled className="bg-gray-100" />
              </div>
              <div>
                <Label htmlFor="actualHours">
                  Actual Hours Worked <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="actualHours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={actualHours}
                  onChange={(e) => setActualHours(parseFloat(e.target.value))}
                  className={actualHours !== entry.hoursWorked ? "border-yellow-500" : ""}
                />
                {actualHours !== entry.hoursWorked && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Hours adjusted from {entry.hoursWorked} to {actualHours}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Photo Evidence Upload */}
            <div>
              <Label htmlFor="photo">
                Photo Evidence (Optional)
                <span className="text-xs text-muted-foreground ml-2">Upload photo of completed work</span>
              </Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-1"
              />
              {photoPreview && (
                <div className="mt-2">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="max-w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview("");
                    }}
                    className="mt-1"
                  >
                    Remove Photo
                  </Button>
                </div>
              )}
            </div>

            {/* Location Info */}
            {location.lat !== 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <MapPin className="h-4 w-4 inline mr-2 text-green-600" />
                <span className="font-medium text-green-900">Approval location captured:</span>
                <span className="text-green-700 ml-2">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </span>
              </div>
            )}

            {/* Supervisor Comments */}
            <div>
              <Label htmlFor="comments">
                Supervisor Comments & Feedback <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="comments"
                placeholder="Provide detailed feedback, observations, and recommendations for the student..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your feedback helps the student improve and provides context for the university supervisor
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <div className="flex-1 text-xs text-muted-foreground">
              {!presenceConfirmed && (
                <p className="text-yellow-600">⚠️ Please confirm presence to approve</p>
              )}
              {!comments.trim() && (
                <p className="text-yellow-600">⚠️ Comments are required</p>
              )}
            </div>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isUploading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Entry
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!presenceConfirmed || !comments.trim() || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve with Verification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const ViewApprovalDialog = ({ entry }: { entry: LogbookEntry }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Onsite Approval Details</DialogTitle>
            <DialogDescription>
              Student: {entry.student.firstName} {entry.student.lastName} • 
              Date: {new Date(entry.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Approval Status */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-900">Approval Status</h4>
                <Badge className="bg-green-100 text-green-800">
                  {entry.onsiteApproval?.status || 'APPROVED'}
                </Badge>
              </div>
              {entry.onsiteApproval?.approvalDate && (
                <p className="text-sm text-green-700">
                  Approved on: {new Date(entry.onsiteApproval.approvalDate).toLocaleString()}
                </p>
              )}
              {entry.onsiteApproval?.supervisor && (
                <p className="text-sm text-green-700">
                  By: {entry.onsiteApproval.supervisor.firstName} {entry.onsiteApproval.supervisor.lastName}
                </p>
              )}
            </div>

            {/* Presence Confirmation */}
            {entry.onsiteApproval?.presenceConfirmed && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    ✓ Student presence confirmed
                  </span>
                </div>
              </div>
            )}

            {/* Hours Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-xs text-gray-600">Student's Claimed Hours</Label>
                <p className="text-lg font-semibold">{entry.hoursWorked} hours</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-xs text-gray-600">Validated Hours</Label>
                <p className="text-lg font-semibold">
                  {entry.onsiteApproval?.actualHoursWorked || entry.hoursWorked} hours
                </p>
                {entry.onsiteApproval?.actualHoursWorked && 
                 entry.onsiteApproval.actualHoursWorked !== entry.hoursWorked && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Hours adjusted
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Original Activities */}
            <div>
              <Label className="text-sm font-medium">Student's Activity Description</Label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg border">
                {entry.activities}
              </p>
            </div>

            {/* Validated Activities */}
            {entry.onsiteApproval?.validatedActivities && (
              <div>
                <Label className="text-sm font-medium">Validated Activities</Label>
                <p className="text-sm mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                  {entry.onsiteApproval.validatedActivities}
                </p>
              </div>
            )}

            <Separator />

            {/* Location Info */}
            {entry.onsiteApproval?.locationLatitude && entry.onsiteApproval?.locationLongitude && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Approval Location</span>
                </div>
                <p className="text-sm text-green-700">
                  Coordinates: {entry.onsiteApproval.locationLatitude.toFixed(6)}, {entry.onsiteApproval.locationLongitude.toFixed(6)}
                </p>
              </div>
            )}

            {/* Photo Evidence */}
            {entry.onsiteApproval?.photoEvidenceUrl && (
              <div>
                <Label className="text-sm font-medium">Photo Evidence</Label>
                <div className="mt-2">
                  <img 
                    src={entry.onsiteApproval.photoEvidenceUrl} 
                    alt="Work evidence" 
                    className="max-w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}

            {/* Supervisor Comments */}
            {entry.onsiteApproval?.comments && (
              <div>
                <Label className="text-sm font-medium">Supervisor Comments & Feedback</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-lg border">
                  {entry.onsiteApproval.comments}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Filter entries for onsite supervisor: show entries not yet approved by onsite supervisor
  const pendingEntries = entries.filter(entry => !entry.onsiteApproved);
  const approvedEntries = entries.filter(entry => entry.onsiteApproved);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading onsite supervisor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Onsite Supervisor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Daily verification & presence monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Profile avatar button — plain img, no Avatar component */}
            <button
              type="button"
              aria-label="Profile picture"
              onClick={() => setAvatarModalOpen(true)}
              className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary/40 transition-all flex-shrink-0 focus:outline-none"
            >
              {supervisorProfile.profileImageUrl ? (
                <img
                  key={supervisorProfile.profileImageUrl}
                  src={`http://localhost:8080${supervisorProfile.profileImageUrl}?v=${encodeURIComponent(supervisorProfile.profileImageUrl)}`}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(supervisorProfile.firstName.charAt(0) + supervisorProfile.lastName.charAt(0)).toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* ── Profile Card ─────────────────────────────────────────── */}
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              {/* Photo */}
              <button
                type="button"
                aria-label="Change profile picture"
                onClick={() => setAvatarModalOpen(true)}
                className="relative flex-shrink-0 group focus:outline-none"
              >
                {supervisorProfile.profileImageUrl ? (
                  <img
                    key={supervisorProfile.profileImageUrl}
                    src={`http://localhost:8080${supervisorProfile.profileImageUrl}?v=${encodeURIComponent(supervisorProfile.profileImageUrl)}`}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-orange-200 group-hover:ring-orange-400 transition-all"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center ring-4 ring-orange-200 group-hover:ring-orange-400 transition-all">
                    <span className="text-white text-lg font-bold">
                      {(supervisorProfile.firstName.charAt(0) + supervisorProfile.lastName.charAt(0)).toUpperCase() || "OS"}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 h-5 w-5 bg-orange-500 rounded-full flex items-center justify-center shadow">
                  <Activity className="h-2.5 w-2.5 text-white" />
                </div>
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-tight truncate">
                  {supervisorProfile.firstName} {supervisorProfile.lastName}
                </p>
                <Badge className="bg-orange-100 text-orange-800 text-xs mt-0.5">Onsite Supervisor</Badge>
              </div>

              {/* Upload button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAvatarModalOpen(true)}
                className="flex-shrink-0 gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Search className="h-3.5 w-3.5" />
                {supervisorProfile.profileImageUrl ? "Change Photo" : "Upload Photo"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* New Entries Notification */}
        {newEntriesCount > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900">
                    {newEntriesCount} New Logbook {newEntriesCount === 1 ? 'Entry' : 'Entries'} Awaiting Review
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Students have submitted new logbook entries that require your onsite verification
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    const element = document.getElementById('pending-section');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Review Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Currently Checked In Students */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Currently On Site ({currentlyCheckedIn.length})
            </CardTitle>
            <CardDescription>
              Students who are currently checked in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentlyCheckedIn.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No students currently checked in</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentlyCheckedIn.map((checkIn: any) => (
                  <div key={checkIn.id} className="p-3 bg-white border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{checkIn.student?.firstName} {checkIn.student?.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          Since: {new Date(checkIn.checkInTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">On Site</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Search */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Find Student on Site
            </CardTitle>
            <CardDescription>
              Enter student ID to view their information and verify their work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter Student ID (e.g., STU001)"
                value={studentSearchId}
                onChange={(e) => setStudentSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchStudent()}
              />
              <Button onClick={searchStudent} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
              {showStudentView && (
                <Button variant="outline" onClick={clearStudentSearch}>Clear</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student View */}
        {showStudentView && searchedStudent && (
          <Card className="border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle>Student: {searchedStudent.firstName} {searchedStudent.lastName}</CardTitle>
              <CardDescription>ID: {searchedStudent.studentId} • {searchedStudent.email}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Check-In Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Recent Check-Ins
                </h3>
                {studentCheckIns.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No check-in records</p>
                ) : (
                  <div className="space-y-2">
                    {studentCheckIns.slice(0, 5).map((checkIn) => (
                      <div key={checkIn.id} className="flex justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{checkIn.locationName || 'Location not specified'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(checkIn.checkInTime).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={checkIn.checkOutTime ? "secondary" : "default"}>
                          {checkIn.checkOutTime ? "Checked Out" : "On Site"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Logbook Entries */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Logbook Entries ({studentLogbooks.length})
                </h3>
                {studentLogbooks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No logbook entries</p>
                ) : (
                  <div className="space-y-3">
                    {studentLogbooks.map((entry) => (
                      <div key={entry.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            <Badge className={getStatusColor(entry.status)}>
                              {getStatusText(entry.status)}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{entry.hoursWorked} hours</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{entry.activities}</p>
                        {!entry.onsiteApproved && (
                          <OnsiteReviewDialog entry={entry} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Reviews */}
        <Card id="pending-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Onsite Verification ({pendingEntries.length})
              {showStudentView && searchedStudent && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - {searchedStudent.firstName} {searchedStudent.lastName}
                </span>
              )}
              {newEntriesCount > 0 && showStudentView && (
                <Badge className="ml-2 bg-yellow-500">
                  {newEntriesCount} New
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {showStudentView 
                ? `Logbook entries from ${searchedStudent?.firstName} awaiting your verification`
                : 'Search for a student to view their logbook entries'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showStudentView ? (
              <div className="text-center py-12 space-y-3">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Search for a Student</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Use the search box above to find a student by their Student ID. 
                  You'll be able to view and verify their logbook entries.
                </p>
              </div>
            ) : pendingEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchedStudent ? `${searchedStudent.firstName} has no pending entries` : 'No pending entries'}
              </p>
            ) : (
              pendingEntries.map((entry) => (
                <div key={entry.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{entry.student.firstName} {entry.student.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()} • {entry.hoursWorked} hours
                      </p>
                    </div>
                    <Badge className={getStatusColor(entry.status)}>
                      {getStatusText(entry.status)}
                    </Badge>
                  </div>
                  <p className="text-sm">{entry.activities}</p>
                  <OnsiteReviewDialog entry={entry} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Approved Entries */}
        <Card>
          <CardHeader>
            <CardTitle>
              Onsite Approved Entries ({approvedEntries.length})
              {showStudentView && searchedStudent && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - {searchedStudent.firstName} {searchedStudent.lastName}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {showStudentView 
                ? `Entries you have verified and approved for ${searchedStudent?.firstName}`
                : 'Search for a student to view their approved entries'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showStudentView ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Search for a Student</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Search for a student above to view their approved entries
                </p>
              </div>
            ) : approvedEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchedStudent ? `${searchedStudent.firstName} has no approved entries yet` : 'No approved entries yet'}
              </p>
            ) : (
              approvedEntries.map((entry) => (
                <div key={entry.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{entry.student.firstName} {entry.student.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()} • {entry.hoursWorked} hours
                      </p>
                      {entry.onsiteApproval?.approvalDate && (
                        <p className="text-xs text-muted-foreground">
                          Approved: {new Date(entry.onsiteApproval.approvalDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(entry.status)}>
                      {getStatusText(entry.status)}
                    </Badge>
                  </div>
                  <p className="text-sm">{entry.activities}</p>
                  
                  {/* Show approval summary */}
                  {entry.onsiteApproval && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {entry.onsiteApproval.presenceConfirmed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Presence Confirmed
                        </Badge>
                      )}
                      {entry.onsiteApproval.actualHoursWorked && 
                       entry.onsiteApproval.actualHoursWorked !== entry.hoursWorked && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Hours Adjusted: {entry.onsiteApproval.actualHoursWorked}h
                        </Badge>
                      )}
                      {entry.onsiteApproval.locationLatitude && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <MapPin className="h-3 w-3 mr-1" />
                          Location Verified
                        </Badge>
                      )}
                      {entry.onsiteApproval.photoEvidenceUrl && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Photo Evidence
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <ViewApprovalDialog entry={entry} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile picture modal */}
      <ProfilePictureUploadModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentImageUrl={supervisorProfile.profileImageUrl}
        firstName={supervisorProfile.firstName}
        lastName={supervisorProfile.lastName}
        onSuccess={(newUrl) => setSupervisorProfile(p => ({ ...p, profileImageUrl: newUrl }))}
      />
    </div>
  );
};

export default OnsiteSupervisorDashboard;
