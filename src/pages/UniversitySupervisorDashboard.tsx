import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, XCircle, MessageSquare, User, LogOut, Clock,
  BookOpen, Eye, GraduationCap, Search, Users, TrendingUp,
  RefreshCw, ChevronRight, Activity, MapPin, Filter, BarChart3,
  FileText, AlertCircle, Camera,
} from "lucide-react";
import LocationMap from "@/components/LocationMap";
import UserAvatar from "@/components/UserAvatar";
import ProfilePictureUploadModal from "@/components/ProfilePictureUploadModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  course: string;
  year: number;
  onsiteSupervisor?: { id: number; firstName: string; lastName: string };
  universitySupervisor?: { id: number; firstName: string; lastName: string };
}

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
    course?: string;
  };
  onsiteApproval?: {
    status: string;
    comments: string;
    validatedActivities?: string;
    actualHoursWorked?: number;
    presenceConfirmed?: boolean;
  };
  universityApproval?: {
    status: string;
    comments: string;
    academicAssessment?: string;
  };
  approvals?: Array<{ id: number; status: string; comments: string; supervisorType?: string }>;
}

interface StudentProgress {
  studentId: number;
  totalSubmitted: number;
  approved: number;
  pending: number;
  rejected: number;
  totalWeeks: number;
  completionPercent: number;
  lastActivityDate: string | null;
}

const API = "http://localhost:8080";
const authHeaders = () => ({
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = (s: string) => {
  switch (s) {
    case "FULLY_APPROVED":    return "bg-green-100 text-green-800 border-green-200";
    case "ONSITE_APPROVED":   return "bg-blue-100 text-blue-800 border-blue-200";
    case "REJECTED":          return "bg-red-100 text-red-800 border-red-200";
    default:                  return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
};
const statusLabel = (s: string) => {
  switch (s) {
    case "FULLY_APPROVED":  return "Fully Approved";
    case "ONSITE_APPROVED": return "Onsite Approved";
    case "REJECTED":        return "Rejected";
    default:                return "Pending";
  }
};

// ─── Sub-component: Stat Card ─────────────────────────────────────────────────
const Stat = ({ label, value, icon: Icon, color = "text-primary" }: {
  label: string; value: number; icon: React.ElementType; color?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

// ─── Main component ───────────────────────────────────────────────────────────
const UniversitySupervisorDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [students, setStudents] = useState<Student[]>([]);
  const [logbooks, setLogbooks] = useState<LogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorProfile, setSupervisorProfile] = useState<{ firstName: string; lastName: string; profileImageUrl?: string | null }>({ firstName: "", lastName: "" });
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Filters
  const [studentSearch, setStudentSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Student profile drawer state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentLogbooks, setStudentLogbooks] = useState<LogbookEntry[]>([]);
  const [studentProfileOpen, setStudentProfileOpen] = useState(false);
  const [locationStudentId, setLocationStudentId] = useState<number | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    if (!token) { navigate("/supervisor/login"); return; }
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setSupervisorName(`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim());
        setSupervisorProfile({ firstName: u.firstName ?? "", lastName: u.lastName ?? "", profileImageUrl: u.profileImageUrl ?? null });
      } catch { /* ignore */ }
    }
    loadAll();
    // Fetch latest profile picture URL from backend (in case localStorage is stale)
    fetchMyProfilePicture(token ?? "");
  }, [navigate]);

  const fetchMyProfilePicture = async (token: string) => {
    try {
      const res = await fetch(`${API}/api/profile/picture`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const url: string | null = data.profileImageUrl ?? null;
        setSupervisorProfile(p => ({ ...p, profileImageUrl: url }));
        // Keep localStorage in sync
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          u.profileImageUrl = url;
          localStorage.setItem("user", JSON.stringify(u));
        }
      }
    } catch { /* non-critical */ }
  };

  // ── Data fetching ───────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([fetchStudents(), fetchLogbooks()]);
    setIsLoading(false);
  }, []);

  const fetchStudents = async () => {
    const res = await fetch(`${API}/api/students/my-assigned`, { headers: authHeaders() });
    if (res.ok) setStudents(await res.json());
  };

  const fetchLogbooks = async () => {
    const res = await fetch(`${API}/api/logbooks/assigned-to-me`, { headers: authHeaders() });
    if (res.ok) {
      setLogbooks(await res.json());
    } else if (res.status === 403) {
      navigate("/supervisor/login");
    }
  };

  const fetchStudentLogbooks = async (studentId: number) => {
    const res = await fetch(`${API}/api/logbooks/student/${studentId}`, { headers: authHeaders() });
    if (res.ok) setStudentLogbooks(await res.json());
  };

  // ── Approval actions ────────────────────────────────────────────────────────
  const handleApprove = async (logbookId: number, comments: string, learningOutcomesMet: boolean) => {
    const res = await fetch(`${API}/api/approvals/university/${logbookId}`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({
        status: "APPROVED", comments,
        academicAssessment: comments,
        learningOutcomesMet,
      }),
    });
    if (res.ok) {
      toast({ title: "Approved", description: "Entry approved for academic credit." });
      fetchLogbooks();
      if (selectedStudent) fetchStudentLogbooks(selectedStudent.id);
    } else {
      toast({ title: "Failed", description: await res.text(), variant: "destructive" });
    }
  };

  const handleReject = async (logbookId: number, comments: string) => {
    const res = await fetch(`${API}/api/approvals/university/${logbookId}`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ status: "REJECTED", comments, academicAssessment: comments, learningOutcomesMet: false }),
    });
    if (res.ok) {
      toast({ title: "Rejected", description: "Entry rejected with feedback." });
      fetchLogbooks();
      if (selectedStudent) fetchStudentLogbooks(selectedStudent.id);
    } else {
      toast({ title: "Failed", description: await res.text(), variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const pendingLogbooks  = logbooks.filter(l => l.onsiteApproved && !l.universityApproved);
  const approvedLogbooks = logbooks.filter(l => l.universityApproved);
  const rejectedLogbooks = logbooks.filter(l => l.status === "REJECTED");
  const recentActivity   = [...logbooks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  // Per-student progress
  const progressMap: Record<number, StudentProgress> = {};
  logbooks.forEach(l => {
    const sid = l.student.id;
    if (!progressMap[sid]) {
      progressMap[sid] = { studentId: sid, totalSubmitted: 0, approved: 0, pending: 0, rejected: 0, totalWeeks: 0, completionPercent: 0, lastActivityDate: null };
    }
    const p = progressMap[sid];
    p.totalSubmitted++;
    if (l.universityApproved) p.approved++;
    else if (l.status === "REJECTED") p.rejected++;
    else p.pending++;
    if (l.weekNumber > p.totalWeeks) p.totalWeeks = l.weekNumber;
    if (!p.lastActivityDate || l.date > p.lastActivityDate) p.lastActivityDate = l.date;
  });
  Object.values(progressMap).forEach(p => {
    p.completionPercent = p.totalSubmitted > 0 ? Math.round((p.approved / p.totalSubmitted) * 100) : 0;
  });

  // Unique courses for filter
  const courses = Array.from(new Set(students.map(s => s.course).filter(Boolean)));

  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase();
    const matchQ = !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    const matchCourse = courseFilter === "ALL" || s.course === courseFilter;
    return matchQ && matchCourse;
  });

  const filteredLogbooks = logbooks.filter(l => {
    const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchStatus;
  });

  // ── Review dialog ────────────────────────────────────────────────────────────
  const ReviewDialog = ({ entry }: { entry: LogbookEntry }) => {
    const [comment, setComment] = useState("");
    const [loMet, setLoMet] = useState(true);
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> Review
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Academic Review</DialogTitle>
            <DialogDescription>
              {entry.student.firstName} {entry.student.lastName} · {new Date(entry.date).toLocaleDateString()} · Week {entry.weekNumber} · {entry.hoursWorked}h
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Activity */}
            <div>
              <Label className="text-sm font-medium">Activity Description</Label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">{entry.activities}</p>
            </div>
            {/* Onsite feedback */}
            {entry.onsiteApproval && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Onsite Supervisor Feedback</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">{entry.onsiteApproval.status}</Badge>
                </div>
                <p className="text-sm text-blue-800">{entry.onsiteApproval.comments}</p>
                {entry.onsiteApproval.validatedActivities && (
                  <p className="text-xs text-blue-700 mt-1">Validated: {entry.onsiteApproval.validatedActivities}</p>
                )}
                {entry.onsiteApproval.actualHoursWorked && (
                  <p className="text-xs text-blue-700">Actual hours: {entry.onsiteApproval.actualHoursWorked}h</p>
                )}
              </div>
            )}
            {/* Learning outcomes */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="lo-met"
                checked={loMet}
                onChange={e => setLoMet(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="lo-met" className="text-sm font-medium cursor-pointer">
                Learning outcomes met for this entry
              </label>
            </div>
            {/* Feedback textarea */}
            <div>
              <Label htmlFor="review-comment">Academic Feedback <span className="text-red-500">*</span></Label>
              <Textarea
                id="review-comment"
                placeholder="Provide academic assessment, evaluation of learning outcomes, and recommendations…"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={() => { handleReject(entry.id, comment); setOpen(false); }}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button onClick={() => { handleApprove(entry.id, comment, loMet); setOpen(false); }} disabled={!comment.trim()}>
              <CheckCircle className="h-4 w-4 mr-1" /> Approve for Academic Credit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ── View dialog (read-only) ───────────────────────────────────────────────────
  const ViewDialog = ({ entry }: { entry: LogbookEntry }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1.5">
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Logbook Entry</DialogTitle>
          <DialogDescription>
            {entry.student.firstName} {entry.student.lastName} · {new Date(entry.date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-muted/40 rounded-lg">
              <p className="text-xs text-muted-foreground">Week</p>
              <p className="font-semibold">{entry.weekNumber}</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="font-semibold">{entry.hoursWorked}h</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className={`${statusColor(entry.status)} text-xs mt-0.5`}>{statusLabel(entry.status)}</Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Activities</Label>
            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">{entry.activities}</p>
          </div>
          {entry.onsiteApproval && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-1">Onsite Approval</p>
              <p className="text-sm text-blue-900">{entry.onsiteApproval.comments}</p>
            </div>
          )}
          {entry.universityApproval && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs font-semibold text-purple-800 mb-1">Your Academic Feedback</p>
              <p className="text-sm text-purple-900">{entry.universityApproval.comments}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">University Supervisor</h1>
              {supervisorName && <p className="text-xs text-muted-foreground">Welcome, {supervisorName}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadAll}>
              <RefreshCw className="h-4 w-4" />
            </Button>
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
                <div className="h-full w-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(supervisorProfile.firstName.charAt(0) + supervisorProfile.lastName.charAt(0)).toUpperCase() || "US"}
                  </span>
                </div>
              )}
            </button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          {/* Tab bar */}
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-auto gap-1 bg-card border p-1 rounded-xl">
              {[
                { value: "overview",  label: "Overview",  icon: BarChart3 },
                { value: "students",  label: "Students",  icon: Users },
                { value: "logbooks",  label: "Logbooks",  icon: BookOpen },
                { value: "pending",   label: `Pending (${pendingLogbooks.length})`, icon: Clock },
                { value: "approved",  label: "Approved",  icon: CheckCircle },
                { value: "locations", label: "Locations", icon: MapPin },
                { value: "profile",   label: "Profile",   icon: User },
              ].map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Stat label="Assigned Students" value={students.length} icon={Users} color="text-purple-600" />
              <Stat label="Total Logbooks" value={logbooks.length} icon={FileText} color="text-blue-600" />
              <Stat label="Pending Review" value={pendingLogbooks.length} icon={Clock} color="text-yellow-600" />
              <Stat label="Approved" value={approvedLogbooks.length} icon={CheckCircle} color="text-green-600" />
              <Stat label="Rejected" value={rejectedLogbooks.length} icon={XCircle} color="text-red-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pending alert */}
              {pendingLogbooks.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50/50 lg:col-span-2">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-yellow-900">
                            {pendingLogbooks.length} entr{pendingLogbooks.length === 1 ? "y" : "ies"} awaiting your academic review
                          </p>
                          <p className="text-sm text-yellow-700">These have been verified by onsite supervisors and need your approval.</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" onClick={() => setTab("pending")}>
                        Review Now <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent activity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Recent Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentActivity.length === 0
                    ? <p className="text-sm text-muted-foreground text-center py-4">No submissions yet</p>
                    : recentActivity.map(l => (
                      <div key={l.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{l.student.firstName} {l.student.lastName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(l.date).toLocaleDateString()} · Wk {l.weekNumber} · {l.hoursWorked}h
                          </p>
                        </div>
                        <Badge className={`${statusColor(l.status)} text-xs`}>{statusLabel(l.status)}</Badge>
                      </div>
                    ))
                  }
                </CardContent>
              </Card>

              {/* Student progress snapshot */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Student Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {students.length === 0
                    ? <p className="text-sm text-muted-foreground text-center py-4">No assigned students</p>
                    : students.slice(0, 5).map(s => {
                        const p = progressMap[s.id];
                        const pct = p?.completionPercent ?? 0;
                        return (
                          <div key={s.id}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium">{s.firstName} {s.lastName}</span>
                              <span className="text-muted-foreground text-xs">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                  }
                  {students.length > 5 && (
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setTab("students")}>
                      View all {students.length} students →
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ══ STUDENTS ══════════════════════════════════════════════════════ */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" /> Assigned Students
                </CardTitle>
                <CardDescription>{students.length} student{students.length !== 1 ? "s" : ""} assigned to you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, ID, email…"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-3.5 w-3.5 mr-1" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Courses</SelectItem>
                      {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Student cards */}
                <div className="space-y-3">
                  {filteredStudents.map(s => {
                    const p = progressMap[s.id];
                    return (
                      <div key={s.id} className="p-4 border rounded-lg hover:border-purple-200 hover:bg-purple-50/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-semibold">{s.firstName} {s.lastName}</p>
                              <Badge variant="outline" className="text-xs">{s.studentId ?? "—"}</Badge>
                              {s.course && <Badge className="bg-purple-100 text-purple-800 text-xs">{s.course}</Badge>}
                              {s.year && <span className="text-xs text-muted-foreground">Year {s.year}</span>}
                            </div>
                            <p className="text-sm text-muted-foreground">{s.email}</p>

                            {/* Progress bar */}
                            {p && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                  <span>{p.approved}/{p.totalSubmitted} approved · {p.pending} pending · Wk {p.totalWeeks}</span>
                                  <span className="font-medium text-purple-700">{p.completionPercent}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${p.completionPercent}%` }} />
                                </div>
                                {p.lastActivityDate && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Last activity: {new Date(p.lastActivityDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                            {!p && <p className="text-xs text-muted-foreground mt-1">No logbook submissions yet</p>}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(s);
                                fetchStudentLogbooks(s.id);
                                setStudentProfileOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> Profile
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setLocationStudentId(s.id); setTab("locations"); }}
                            >
                              <MapPin className="h-3.5 w-3.5 mr-1" /> Location
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12 space-y-2">
                      <Users className="h-10 w-10 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">
                        {students.length === 0
                          ? "No students are assigned to you yet. Contact your administrator."
                          : "No students match your search filters."}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══ ALL LOGBOOKS ══════════════════════════════════════════════════ */}
          <TabsContent value="logbooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> All Logbook Entries
                </CardTitle>
                <CardDescription>{logbooks.length} total entries from your assigned students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ONSITE_APPROVED">Onsite Approved</SelectItem>
                    <SelectItem value="FULLY_APPROVED">Fully Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Student</th>
                        <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date</th>
                        <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Week</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-right px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredLogbooks.map(l => (
                        <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{l.student.firstName} {l.student.lastName}</p>
                            <p className="text-xs text-muted-foreground">{l.student.studentId}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                            {new Date(l.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">Wk {l.weekNumber}</td>
                          <td className="px-4 py-3">
                            <Badge className={`${statusColor(l.status)} text-xs`}>{statusLabel(l.status)}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {l.onsiteApproved && !l.universityApproved && <ReviewDialog entry={l} />}
                              <ViewDialog entry={l} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLogbooks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No entries match your filter</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══ PENDING REVIEW ════════════════════════════════════════════════ */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Academic Review ({pendingLogbooks.length})
                </CardTitle>
                <CardDescription>
                  Entries verified by onsite supervisors — awaiting your academic approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingLogbooks.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm text-muted-foreground">No entries pending your review.</p>
                  </div>
                ) : (
                  pendingLogbooks.map((l, i) => (
                    <div key={l.id}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-4 bg-yellow-50/30 border border-yellow-100 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold">{l.student.firstName} {l.student.lastName}</span>
                            <span className="text-xs text-muted-foreground">{l.student.course}</span>
                            <Badge className={`${statusColor(l.status)} text-xs`}>{statusLabel(l.status)}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {new Date(l.date).toLocaleDateString()} · Week {l.weekNumber} · {l.hoursWorked}h
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{l.activities}</p>
                          {/* Onsite summary */}
                          {l.onsiteApproval && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-blue-700">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Onsite approved: "{l.onsiteApproval.comments?.slice(0, 60)}{(l.onsiteApproval.comments?.length ?? 0) > 60 ? "…" : ""}"</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <ReviewDialog entry={l} />
                          <ViewDialog entry={l} />
                        </div>
                      </div>
                      {i < pendingLogbooks.length - 1 && <Separator className="my-1 opacity-0" />}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══ APPROVED ══════════════════════════════════════════════════════ */}
          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Academically Approved ({approvedLogbooks.length})
                </CardTitle>
                <CardDescription>Entries you have approved for academic credit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {approvedLogbooks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No approved entries yet</p>
                ) : (
                  approvedLogbooks.map(l => (
                    <div key={l.id} className="flex items-start justify-between p-4 border rounded-lg bg-green-50/30 border-green-100 gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium">{l.student.firstName} {l.student.lastName}</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">Fully Approved</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(l.date).toLocaleDateString()} · Week {l.weekNumber} · {l.hoursWorked}h
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{l.activities}</p>
                        {l.universityApproval?.comments && (
                          <p className="text-xs text-green-700 mt-1">
                            Your feedback: "{l.universityApproval.comments.slice(0, 80)}{l.universityApproval.comments.length > 80 ? "…" : ""}"
                          </p>
                        )}
                      </div>
                      <ViewDialog entry={l} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══ LOCATIONS ══════════════════════════════════════════════════════ */}
          <TabsContent value="locations" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Select Student</CardTitle>
                  <CardDescription>View training location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                  {students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setLocationStudentId(s.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted/50 ${locationStudentId === s.id ? "border-purple-500 bg-purple-50/50" : ""}`}
                    >
                      <p className="font-medium text-sm">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground">{s.studentId} · {s.course}</p>
                    </button>
                  ))}
                  {students.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No assigned students</p>
                  )}
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                {locationStudentId
                  ? <LocationMap readOnly studentId={locationStudentId} />
                  : (
                    <Card className="h-full flex items-center justify-center min-h-[320px]">
                      <div className="text-center space-y-2">
                        <MapPin className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Select a student to view their location</p>
                      </div>
                    </Card>
                  )
                }
              </div>
            </div>
          </TabsContent>

          {/* ══ PROFILE ══════════════════════════════════════════════════════ */}
          <TabsContent value="profile" className="space-y-4">
            <div className="max-w-lg mx-auto">
              <Card className="border-purple-200">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="flex items-center justify-center gap-2 text-base">
                    <User className="h-5 w-5 text-purple-600" /> My Profile
                  </CardTitle>
                  <CardDescription>Manage your profile picture and personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo area */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      {supervisorProfile.profileImageUrl ? (
                        <img
                          key={supervisorProfile.profileImageUrl}
                          src={`http://localhost:8080${supervisorProfile.profileImageUrl}?v=${encodeURIComponent(supervisorProfile.profileImageUrl)}`}
                          alt="Profile"
                          className="h-28 w-28 rounded-full object-cover ring-4 ring-purple-200 group-hover:ring-purple-400 transition-all"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center ring-4 ring-purple-200 group-hover:ring-purple-400 transition-all">
                          <span className="text-white text-3xl font-bold select-none">
                            {`${supervisorProfile.firstName.charAt(0)}${supervisorProfile.lastName.charAt(0)}`.toUpperCase() || "SV"}
                          </span>
                        </div>
                      )}
                      {/* Camera overlay on hover */}
                      <button
                        type="button"
                        aria-label="Change profile picture"
                        onClick={() => setAvatarModalOpen(true)}
                        className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera className="h-7 w-7 text-white" />
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="font-bold text-xl">{supervisorProfile.firstName} {supervisorProfile.lastName}</p>
                      <Badge className="bg-purple-100 text-purple-800 mt-1">University Supervisor</Badge>
                    </div>

                    <div className="flex gap-3 w-full">
                      <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={() => setAvatarModalOpen(true)}
                      >
                        <Camera className="h-4 w-4" />
                        {supervisorProfile.profileImageUrl ? "Change Photo" : "Upload Photo"}
                      </Button>
                      {supervisorProfile.profileImageUrl && (
                        <Button
                          variant="outline"
                          className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => setAvatarModalOpen(true)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="border-t pt-4 space-y-3">
                    {[
                      { label: "Full Name", value: `${supervisorProfile.firstName} ${supervisorProfile.lastName}` },
                      { label: "Role", value: "University Supervisor" },
                      { label: "Assigned Students", value: `${students.length} student${students.length !== 1 ? "s" : ""}` },
                      { label: "Pending Reviews", value: `${pendingLogbooks.length} entr${pendingLogbooks.length !== 1 ? "ies" : "y"}` },
                      { label: "Approved Logbooks", value: `${approvedLogbooks.length}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* ══ Profile Picture Modal ══════════════════════════════════════════════ */}
      <ProfilePictureUploadModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentImageUrl={supervisorProfile.profileImageUrl}
        firstName={supervisorProfile.firstName}
        lastName={supervisorProfile.lastName}
        onSuccess={(newUrl) => {
          setSupervisorProfile(p => ({ ...p, profileImageUrl: newUrl }));
          // Sync localStorage
          const raw = localStorage.getItem("user");
          if (raw) {
            const u = JSON.parse(raw);
            u.profileImageUrl = newUrl;
            localStorage.setItem("user", JSON.stringify(u));
          }
        }}
      />

      {/* ══ Student Profile Dialog ═════════════════════════════════════════════ */}
      <Dialog open={studentProfileOpen} onOpenChange={v => { setStudentProfileOpen(v); if (!v) setSelectedStudent(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </DialogTitle>
                <DialogDescription>
                  {selectedStudent.studentId} · {selectedStudent.course} · Year {selectedStudent.year}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Info grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Email", value: selectedStudent.email },
                    { label: "Student ID", value: selectedStudent.studentId ?? "—" },
                    { label: "Course", value: selectedStudent.course ?? "—" },
                    { label: "Year", value: `Year ${selectedStudent.year ?? "—"}` },
                    { label: "Onsite Supervisor", value: selectedStudent.onsiteSupervisor ? `${selectedStudent.onsiteSupervisor.firstName} ${selectedStudent.onsiteSupervisor.lastName}` : "Not assigned" },
                    { label: "University Supervisor", value: "You" },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 bg-muted/40 rounded-lg">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                {progressMap[selectedStudent.id] && (() => {
                  const p = progressMap[selectedStudent.id];
                  return (
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Submitted", value: p.totalSubmitted, color: "text-blue-600" },
                        { label: "Approved", value: p.approved, color: "text-green-600" },
                        { label: "Pending", value: p.pending, color: "text-yellow-600" },
                        { label: "Rejected", value: p.rejected, color: "text-red-600" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="text-center p-3 bg-muted/40 rounded-lg">
                          <p className={`text-2xl font-bold ${color}`}>{value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <Separator />

                {/* Logbook entries */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Logbook Entries ({studentLogbooks.length})</h3>
                  {studentLogbooks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No entries submitted yet</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {studentLogbooks.map(l => (
                        <div key={l.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Week {l.weekNumber}</span>
                              <Badge className={`${statusColor(l.status)} text-xs`}>{statusLabel(l.status)}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(l.date).toLocaleDateString()} · {l.hoursWorked}h
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {l.onsiteApproved && !l.universityApproved && <ReviewDialog entry={l} />}
                            <ViewDialog entry={l} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => { setLocationStudentId(selectedStudent.id); setStudentProfileOpen(false); setTab("locations"); }}>
                  <MapPin className="h-4 w-4 mr-1" /> View Location
                </Button>
                <Button variant="outline" onClick={() => setStudentProfileOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UniversitySupervisorDashboard;
