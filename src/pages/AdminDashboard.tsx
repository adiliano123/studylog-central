import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import {
  Users, UserCheck, BookOpen, BarChart3, Settings, LogOut, Search,
  Plus, Edit, Trash2, Key, RefreshCw, Bell, MapPin, Shield,
  CheckCircle, Clock, XCircle, AlertTriangle, GraduationCap,
  Building2, TrendingUp, Eye, UserPlus, Filter, Download,
  ChevronRight, Activity,
} from "lucide-react";
import LocationMap from "@/components/LocationMap";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  studentId?: string;
  course?: string;
  year?: number;
  staffId?: string;
  department?: string;
  supervisorType?: string;
  // Both supervisor assignments for students
  onsiteSupervisor?: { id: number; firstName: string; lastName: string; email: string; supervisorType?: string };
  universitySupervisor?: { id: number; firstName: string; lastName: string; email: string; supervisorType?: string };
  assignedSupervisor?: { id: number; firstName: string; lastName: string; email: string };
}

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalSupervisors: number;
  totalAdmins: number;
  totalLogbooks: number;
  pendingLogbooks: number;
  approvedLogbooks: number;
  onsiteApprovedLogbooks: number;
  universityApprovedLogbooks: number;
  rejectedLogbooks: number;
  studentsWithSupervisors: number;
  studentsWithoutSupervisors: number;
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
  student: { id: number; firstName: string; lastName: string; email: string; studentId?: string };
}

const API = "http://localhost:8080";

const authHeaders = () => ({
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// ─── Colour helpers ───────────────────────────────────────────────────────────

const roleBadge = (role: string) => {
  switch (role) {
    case "ADMIN": return "bg-red-100 text-red-800 border-red-200";
    case "SUPERVISOR": return "bg-blue-100 text-blue-800 border-blue-200";
    default: return "bg-green-100 text-green-800 border-green-200";
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case "FULLY_APPROVED": return "bg-green-100 text-green-800";
    case "ONSITE_APPROVED": return "bg-blue-100 text-blue-800";
    case "REJECTED": return "bg-red-100 text-red-800";
    default: return "bg-yellow-100 text-yellow-800";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "FULLY_APPROVED": return "Fully Approved";
    case "ONSITE_APPROVED": return "Onsite Approved";
    case "UNIVERSITY_APPROVED": return "University Approved";
    case "REJECTED": return "Rejected";
    default: return "Pending";
  }
};

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Reusable stat card */
const StatCard = ({
  title, value, sub, icon: Icon, color = "text-primary",
}: { title: string; value: string | number; sub?: string; icon: React.ElementType; color?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </CardContent>
  </Card>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [supervisors, setSupervisors] = useState<AdminUser[]>([]);
  const [logbooks, setLogbooks] = useState<LogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [logbookSearch, setLogbookSearch] = useState("");
  const [logbookStatusFilter, setLogbookStatusFilter] = useState("ALL");

  // Selected student for location view
  const [locationStudentId, setLocationStudentId] = useState<number | null>(null);

  // Dialog state
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignStudent, setAssignStudent] = useState<AdminUser | null>(null);
  const [assigningType, setAssigningType] = useState<"ONSITE" | "UNIVERSITY">("UNIVERSITY");
  const [notifyOpen, setNotifyOpen] = useState(false);

  // Form state – create user
  const [newUser, setNewUser] = useState({
    firstName: "", lastName: "", email: "", password: "",
    role: "STUDENT", studentId: "", course: "", year: 1,
    staffId: "", department: "", supervisorType: "ONSITE",
  });

  // Notification form
  const [notification, setNotification] = useState({ title: "", message: "", target: "ALL" });

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) { navigate("/admin/login"); return; }
    try {
      const parsed = JSON.parse(userData || "{}");
      if (parsed.role !== "ADMIN") { navigate("/"); return; }
    } catch { navigate("/"); return; }
    loadAll();
  }, [navigate]);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([fetchStats(), fetchUsers(), fetchLogbooks()]);
    setIsLoading(false);
  }, []);

  const fetchStats = async () => {
    const res = await fetch(`${API}/api/admin/statistics`, { headers: authHeaders() });
    if (res.ok) setStats(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API}/api/admin/users`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      const list: AdminUser[] = data.users ?? data ?? [];
      setUsers(list);
      setSupervisors(list.filter((u) => u.role === "SUPERVISOR"));
    }
  };

  const fetchLogbooks = async () => {
    const res = await fetch(`${API}/api/admin/logbooks`, { headers: authHeaders() });
    if (res.ok) setLogbooks(await res.json());
  };

  // ── User management ─────────────────────────────────────────────────────────
  const handleCreateUser = async () => {
    const res = await fetch(`${API}/api/admin/users`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      toast({ title: "User created" });
      setCreateUserOpen(false);
      setNewUser({ firstName: "", lastName: "", email: "", password: "", role: "STUDENT", studentId: "", course: "", year: 1, staffId: "", department: "", supervisorType: "ONSITE" });
      fetchUsers();
    } else {
      toast({ title: "Failed", description: await res.text(), variant: "destructive" });
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    const res = await fetch(`${API}/api/admin/users/${editUser.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(editUser),
    });
    if (res.ok) {
      toast({ title: "User updated" });
      setEditUser(null);
      fetchUsers();
    } else {
      toast({ title: "Failed", description: await res.text(), variant: "destructive" });
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const res = await fetch(`${API}/api/admin/users/${id}`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) { toast({ title: "User deleted" }); fetchUsers(); fetchStats(); }
    else toast({ title: "Failed", description: await res.text(), variant: "destructive" });
  };

  const handleResetPassword = async (id: number) => {
    const pwd = prompt("New password (min 6 chars):");
    if (!pwd || pwd.length < 6) return;
    const res = await fetch(`${API}/api/admin/users/${id}/reset-password`, {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ password: pwd }),
    });
    if (res.ok) toast({ title: "Password reset" });
    else toast({ title: "Failed", description: await res.text(), variant: "destructive" });
  };

  const handleAssignSupervisor = async (studentId: number, supervisorId: number) => {
    const res = await fetch(`${API}/api/admin/assign-supervisor`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ studentId, supervisorId }),
    });
    if (res.ok) {
      const typeLabel = assigningType === "UNIVERSITY" ? "University" : "Onsite";
      toast({ title: `${typeLabel} supervisor assigned` });
      fetchUsers();
      setAssignOpen(false);
    } else {
      toast({ title: "Failed", description: await res.text(), variant: "destructive" });
    }
  };

  const handleRemoveSupervisor = async (studentId: number) => {
    const res = await fetch(`${API}/api/admin/remove-supervisor/${studentId}`, {
      method: "POST", headers: authHeaders(),
    });
    if (res.ok) { toast({ title: "Supervisor removed" }); fetchUsers(); }
    else toast({ title: "Failed", variant: "destructive" });
  };

  const handleDeleteLogbook = async (id: number) => {
    if (!confirm("Delete this logbook entry?")) return;
    const res = await fetch(`${API}/api/logbooks/delete/${id}`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) { toast({ title: "Logbook deleted" }); fetchLogbooks(); fetchStats(); }
    else toast({ title: "Failed", description: await res.text(), variant: "destructive" });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchSearch = !q ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.studentId?.toLowerCase().includes(q) ||
      u.staffId?.toLowerCase().includes(q);
    const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredLogbooks = logbooks.filter((l) => {
    const q = logbookSearch.toLowerCase();
    const matchSearch = !q ||
      l.student?.firstName?.toLowerCase().includes(q) ||
      l.student?.lastName?.toLowerCase().includes(q) ||
      l.student?.studentId?.toLowerCase().includes(q) ||
      l.activities?.toLowerCase().includes(q);
    const matchStatus = logbookStatusFilter === "ALL" || l.status === logbookStatusFilter;
    return matchSearch && matchStatus;
  });

  const students = users.filter((u) => u.role === "STUDENT");

  // ── Chart data ──────────────────────────────────────────────────────────────
  const logbookStatusData = stats
    ? [
        { name: "Pending", value: stats.pendingLogbooks },
        { name: "Onsite Approved", value: stats.onsiteApprovedLogbooks },
        { name: "Fully Approved", value: stats.approvedLogbooks },
        { name: "Rejected", value: stats.rejectedLogbooks },
      ].filter((d) => d.value > 0)
    : [];

  const userRoleData = stats
    ? [
        { name: "Students", value: stats.totalStudents },
        { name: "Supervisors", value: stats.totalSupervisors },
        { name: "Admins", value: stats.totalAdmins },
      ]
    : [];

  const assignmentData = stats
    ? [
        { name: "Assigned", value: stats.studentsWithSupervisors },
        { name: "Unassigned", value: stats.studentsWithoutSupervisors },
      ]
    : [];

  // Weekly logbook submission trend (last 5 weeks derived from logbooks)
  const weeklyTrend = (() => {
    const counts: Record<number, number> = {};
    logbooks.forEach((l) => { counts[l.weekNumber] = (counts[l.weekNumber] ?? 0) + 1; });
    return Object.entries(counts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .slice(-8)
      .map(([week, count]) => ({ week: `Wk ${week}`, count }));
  })();

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Header ── */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Online Industrial Practical Training Logbook</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setNotifyOpen(true)}>
              <Bell className="h-4 w-4 mr-1" /> Notify
            </Button>
            <Button variant="ghost" size="sm" onClick={loadAll}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          {/* ── Tab bar ── */}
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-auto gap-1 bg-card border p-1 rounded-xl">
              {[
                { value: "overview", label: "Overview", icon: BarChart3 },
                { value: "users", label: "Users", icon: Users },
                { value: "students", label: "Students", icon: GraduationCap },
                { value: "supervisors", label: "Supervisors", icon: UserCheck },
                { value: "logbooks", label: "Logbooks", icon: BookOpen },
                { value: "locations", label: "Locations", icon: MapPin },
                { value: "reports", label: "Reports", icon: TrendingUp },
                { value: "settings", label: "Settings", icon: Settings },
              ].map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ══════════════════════════════════════════════════════════
              OVERVIEW TAB
          ══════════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard title="Total Students" value={stats?.totalStudents ?? 0} icon={GraduationCap} color="text-green-600" />
              <StatCard title="Supervisors" value={stats?.totalSupervisors ?? 0} icon={UserCheck} color="text-blue-600" />
              <StatCard title="Admins" value={stats?.totalAdmins ?? 0} icon={Shield} color="text-red-600" />
              <StatCard title="Total Logbooks" value={stats?.totalLogbooks ?? 0} icon={BookOpen} color="text-purple-600" />
              <StatCard title="Approved" value={stats?.approvedLogbooks ?? 0} icon={CheckCircle} color="text-green-600" sub="Fully approved" />
              <StatCard title="Pending" value={stats?.pendingLogbooks ?? 0} icon={Clock} color="text-yellow-600" sub="Awaiting review" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Logbook status pie */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Logbook Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={logbookStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {logbookStatusData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User roles bar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Users by Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={userRoleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weekly submission trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Weekly Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Assignment status + recent logbooks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Assignment summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> Supervisor Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Assigned students</span>
                    <span className="font-semibold text-green-600">{stats?.studentsWithSupervisors ?? 0}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: stats && stats.totalStudents > 0 ? `${(stats.studentsWithSupervisors / stats.totalStudents) * 100}%` : "0%" }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unassigned students</span>
                    <span className="font-semibold text-red-500">{stats?.studentsWithoutSupervisors ?? 0}</span>
                  </div>
                  {(stats?.studentsWithoutSupervisors ?? 0) > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setTab("students")} className="w-full">
                      Assign supervisors <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Recent logbooks */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Recent Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {logbooks.slice(0, 5).map((l) => (
                    <div key={l.id} className="flex items-center justify-between py-1 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{l.student?.firstName} {l.student?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(l.date).toLocaleDateString()} · {l.hoursWorked}h</p>
                      </div>
                      <Badge className={statusBadge(l.status)}>{statusLabel(l.status)}</Badge>
                    </div>
                  ))}
                  {logbooks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No logbooks yet</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              USERS TAB
          ══════════════════════════════════════════════════════════ */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>{users.length} total users in the system</CardDescription>
                  </div>
                  <Button onClick={() => setCreateUserOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" /> Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name, email, ID…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      <SelectItem value="STUDENT">Students</SelectItem>
                      <SelectItem value="SUPERVISOR">Supervisors</SelectItem>
                      <SelectItem value="ADMIN">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Name</th>
                        <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Email</th>
                        <th className="text-left px-4 py-3 font-medium">Role</th>
                        <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Details</th>
                        <th className="text-right px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{u.firstName} {u.lastName}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                          <td className="px-4 py-3">
                            <Badge className={roleBadge(u.role)}>{u.role}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                            {u.role === "STUDENT" && `${u.studentId ?? "—"} · ${u.course ?? "—"} · Y${u.year ?? "—"}`}
                            {u.role === "SUPERVISOR" && `${u.staffId ?? "—"} · ${u.department ?? "—"} · ${u.supervisorType ?? "—"}`}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditUser({ ...u })}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleResetPassword(u.id)}>
                                <Key className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDeleteUser(u.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No users match your filters</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              STUDENTS TAB
          ══════════════════════════════════════════════════════════ */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>{students.length} registered students · {stats?.studentsWithoutSupervisors ?? 0} without university supervisor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.map((s) => (
                  <div key={s.id} className="p-4 border rounded-lg space-y-3">
                    {/* Student header row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{s.firstName} {s.lastName}</p>
                        <p className="text-sm text-muted-foreground">{s.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ID: {s.studentId ?? "—"} · {s.course ?? "—"} · Year {s.year ?? "—"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setLocationStudentId(s.id); setTab("locations"); }}>
                        <MapPin className="h-3.5 w-3.5 mr-1" /> Location
                      </Button>
                    </div>

                    {/* Supervisor assignments */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* University Supervisor */}
                      <div className={`p-3 rounded-lg border ${s.universitySupervisor ? "border-purple-200 bg-purple-50/50" : "border-dashed border-muted"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-800">University Supervisor</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => {
                              setAssignStudent(s);
                              setAssigningType("UNIVERSITY");
                              setAssignOpen(true);
                            }}
                          >
                            {s.universitySupervisor ? "Change" : "Assign"}
                          </Button>
                        </div>
                        {s.universitySupervisor ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{s.universitySupervisor.firstName} {s.universitySupervisor.lastName}</p>
                              <p className="text-xs text-muted-foreground">{s.universitySupervisor.email}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={async () => {
                                const res = await fetch(`${API}/api/admin/remove-university-supervisor/${s.id}`, { method: "POST", headers: authHeaders() });
                                if (res.ok) { toast({ title: "University supervisor removed" }); fetchUsers(); }
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not assigned</p>
                        )}
                      </div>

                      {/* Onsite Supervisor */}
                      <div className={`p-3 rounded-lg border ${s.onsiteSupervisor ? "border-orange-200 bg-orange-50/50" : "border-dashed border-muted"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-800">Onsite Supervisor</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => {
                              setAssignStudent(s);
                              setAssigningType("ONSITE");
                              setAssignOpen(true);
                            }}
                          >
                            {s.onsiteSupervisor ? "Change" : "Assign"}
                          </Button>
                        </div>
                        {s.onsiteSupervisor ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{s.onsiteSupervisor.firstName} {s.onsiteSupervisor.lastName}</p>
                              <p className="text-xs text-muted-foreground">{s.onsiteSupervisor.email}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={async () => {
                                const res = await fetch(`${API}/api/admin/remove-onsite-supervisor/${s.id}`, { method: "POST", headers: authHeaders() });
                                if (res.ok) { toast({ title: "Onsite supervisor removed" }); fetchUsers(); }
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not assigned</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {students.length === 0 && <p className="text-center text-muted-foreground py-8">No students found</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              SUPERVISORS TAB
          ══════════════════════════════════════════════════════════ */}
          <TabsContent value="supervisors" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* University Supervisors */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      <div>
                        <CardTitle className="text-base">University Supervisors</CardTitle>
                        <CardDescription>{supervisors.filter(s => s.supervisorType === "UNIVERSITY" || !s.supervisorType).length} registered</CardDescription>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => { setNewUser({ ...newUser, role: "SUPERVISOR", supervisorType: "UNIVERSITY" }); setCreateUserOpen(true); }}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {supervisors
                    .filter(sv => sv.supervisorType === "UNIVERSITY" || !sv.supervisorType)
                    .map((sv) => {
                      const assigned = students.filter(s => s.universitySupervisor?.id === sv.id);
                      return (
                        <div key={sv.id} className="flex items-center justify-between p-3 border rounded-lg bg-purple-50/30">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{sv.firstName} {sv.lastName}</p>
                              <Badge className="bg-purple-100 text-purple-800 text-xs flex-shrink-0">University</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{sv.email}</p>
                            <p className="text-xs text-muted-foreground">{sv.department ?? "—"} · {sv.staffId ?? "—"}</p>
                            <p className="text-xs text-purple-600">{assigned.length} student{assigned.length !== 1 ? "s" : ""}</p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditUser({ ...sv })}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => handleDeleteUser(sv.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  {supervisors.filter(s => s.supervisorType === "UNIVERSITY" || !s.supervisorType).length === 0 && (
                    <p className="text-center text-muted-foreground py-6 text-sm">No university supervisors yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Onsite Supervisors */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-orange-600" />
                      <div>
                        <CardTitle className="text-base">Onsite Supervisors</CardTitle>
                        <CardDescription>{supervisors.filter(s => s.supervisorType === "ONSITE").length} registered</CardDescription>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => { setNewUser({ ...newUser, role: "SUPERVISOR", supervisorType: "ONSITE" }); setCreateUserOpen(true); }}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {supervisors
                    .filter(sv => sv.supervisorType === "ONSITE")
                    .map((sv) => {
                      const assigned = students.filter(s => s.onsiteSupervisor?.id === sv.id);
                      return (
                        <div key={sv.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50/30">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{sv.firstName} {sv.lastName}</p>
                              <Badge className="bg-orange-100 text-orange-800 text-xs flex-shrink-0">Onsite</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{sv.email}</p>
                            <p className="text-xs text-muted-foreground">{sv.department ?? "—"} · {sv.staffId ?? "—"}</p>
                            <p className="text-xs text-orange-600">{assigned.length} student{assigned.length !== 1 ? "s" : ""}</p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditUser({ ...sv })}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => handleDeleteUser(sv.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  {supervisors.filter(s => s.supervisorType === "ONSITE").length === 0 && (
                    <p className="text-center text-muted-foreground py-6 text-sm">No onsite supervisors yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              LOGBOOKS TAB
          ══════════════════════════════════════════════════════════ */}
          <TabsContent value="logbooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logbook Management</CardTitle>
                <CardDescription>{logbooks.length} total entries · {filteredLogbooks.length} shown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by student, activities…" value={logbookSearch} onChange={(e) => setLogbookSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={logbookStatusFilter} onValueChange={setLogbookStatusFilter}>
                    <SelectTrigger className="w-[180px]">
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
                </div>

                <div className="space-y-2">
                  {filteredLogbooks.map((l) => (
                    <div key={l.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-medium">{l.student?.firstName} {l.student?.lastName}</p>
                          <Badge className={statusBadge(l.status)}>{statusLabel(l.status)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(l.date).toLocaleDateString()} · Week {l.weekNumber} · {l.hoursWorked}h
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{l.activities}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 flex-shrink-0" onClick={() => handleDeleteLogbook(l.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {filteredLogbooks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No logbooks match your filters</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              LOCATIONS TAB
          ══════════════════════════════════════════════════════════ */}
          <TabsContent value="locations" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Student selector */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Select Student</CardTitle>
                  <CardDescription>View a student's current location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setLocationStudentId(s.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted/50 ${locationStudentId === s.id ? "border-primary bg-primary/5" : ""}`}
                    >
                      <p className="font-medium text-sm">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground">{s.studentId} · {s.course}</p>
                    </button>
                  ))}
                  {students.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No students found</p>}
                </CardContent>
              </Card>

              {/* Map */}
              <div className="lg:col-span-2">
                {locationStudentId ? (
                  <LocationMap readOnly studentId={locationStudentId} />
                ) : (
                  <Card className="h-full flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-2">
                      <MapPin className="h-10 w-10 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">Select a student to view their location</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              REPORTS TAB
          ══════════════════════════════════════════════════════════ */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logbook status breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Approval Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={logbookStatusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                        {logbookStatusData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Assignment pie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Assignment Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={assignmentData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        <Cell fill="#22c55e" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weekly trend */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm">Logbook Submission Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Summary table */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">System Summary</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      <Download className="h-3.5 w-3.5 mr-1" /> Print / Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {[
                      { label: "Total Users", value: stats?.totalUsers ?? 0 },
                      { label: "Total Logbooks", value: stats?.totalLogbooks ?? 0 },
                      { label: "Fully Approved", value: stats?.approvedLogbooks ?? 0 },
                      { label: "Pending Review", value: stats?.pendingLogbooks ?? 0 },
                      { label: "Rejected", value: stats?.rejectedLogbooks ?? 0 },
                      { label: "Onsite Approved", value: stats?.onsiteApprovedLogbooks ?? 0 },
                      { label: "Assigned Students", value: stats?.studentsWithSupervisors ?? 0 },
                      { label: "Unassigned", value: stats?.studentsWithoutSupervisors ?? 0 },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 bg-muted/40 rounded-lg">
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              SETTINGS TAB
          ══════════════════════════════════════════════════════════ */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Institution Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Institution Name</Label>
                    <Input defaultValue="Online Industrial Practical Training" className="mt-1" />
                  </div>
                  <div>
                    <Label>System Email</Label>
                    <Input defaultValue="admin@university.edu" className="mt-1" />
                  </div>
                  <div>
                    <Label>Academic Year</Label>
                    <Input defaultValue="2025/2026" className="mt-1" />
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    ["Frontend", "React 18 + TypeScript + Tailwind"],
                    ["Backend", "Spring Boot 3 + Java"],
                    ["Database", "MySQL"],
                    ["Auth", "JWT"],
                    ["Maps", "Leaflet + OpenStreetMap"],
                    ["Charts", "Recharts"],
                    ["Total Users", String(stats?.totalUsers ?? "—")],
                    ["Total Logbooks", String(stats?.totalLogbooks ?? "—")],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b last:border-0">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ══ Dialogs ══════════════════════════════════════════════════════════ */}

      {/* Create User */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Fill in the details for the new user account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name *</Label>
                <Input value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Password *</Label>
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Role *</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newUser.role === "STUDENT" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Student ID</Label>
                    <Input value={newUser.studentId} onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input type="number" min={1} max={6} value={newUser.year} onChange={(e) => setNewUser({ ...newUser, year: parseInt(e.target.value) })} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Course</Label>
                  <Input value={newUser.course} onChange={(e) => setNewUser({ ...newUser, course: e.target.value })} className="mt-1" />
                </div>
              </>
            )}
            {newUser.role === "SUPERVISOR" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Staff ID</Label>
                    <Input value={newUser.staffId} onChange={(e) => setNewUser({ ...newUser, staffId: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Supervisor Type</Label>
                    <Select value={newUser.supervisorType} onValueChange={(v) => setNewUser({ ...newUser, supervisorType: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONSITE">Onsite</SelectItem>
                        <SelectItem value="UNIVERSITY">University</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} className="mt-1" />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateUserOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input value={editUser.firstName} onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={editUser.lastName} onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} className="mt-1" />
              </div>
              {editUser.role === "STUDENT" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Student ID</Label>
                    <Input value={editUser.studentId ?? ""} onChange={(e) => setEditUser({ ...editUser, studentId: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Course</Label>
                    <Input value={editUser.course ?? ""} onChange={(e) => setEditUser({ ...editUser, course: e.target.value })} className="mt-1" />
                  </div>
                </div>
              )}
              {editUser.role === "SUPERVISOR" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Staff ID</Label>
                      <Input value={editUser.staffId ?? ""} onChange={(e) => setEditUser({ ...editUser, staffId: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input value={editUser.department ?? ""} onChange={(e) => setEditUser({ ...editUser, department: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Supervisor Type</Label>
                    <div className="flex rounded-lg overflow-hidden border mt-1">
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${(editUser.supervisorType ?? "UNIVERSITY") === "UNIVERSITY" ? "bg-purple-600 text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                        onClick={() => setEditUser({ ...editUser, supervisorType: "UNIVERSITY" })}
                      >
                        <GraduationCap className="h-3.5 w-3.5" /> University
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${editUser.supervisorType === "ONSITE" ? "bg-orange-500 text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                        onClick={() => setEditUser({ ...editUser, supervisorType: "ONSITE" })}
                      >
                        <Building2 className="h-3.5 w-3.5" /> Onsite
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Supervisor — type-aware */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {assigningType === "UNIVERSITY"
                ? <><GraduationCap className="h-5 w-5 text-purple-600" /> Assign University Supervisor</>
                : <><Building2 className="h-5 w-5 text-orange-600" /> Assign Onsite Supervisor</>}
            </DialogTitle>
            <DialogDescription>
              Student: <span className="font-medium">{assignStudent?.firstName} {assignStudent?.lastName}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${assigningType === "UNIVERSITY" ? "bg-purple-600 text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
              onClick={() => setAssigningType("UNIVERSITY")}
            >
              <GraduationCap className="h-3.5 w-3.5" /> University
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${assigningType === "ONSITE" ? "bg-orange-500 text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
              onClick={() => setAssigningType("ONSITE")}
            >
              <Building2 className="h-3.5 w-3.5" /> Onsite
            </button>
          </div>

          {/* Filtered supervisor list */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {supervisors
              .filter(sv =>
                assigningType === "ONSITE"
                  ? sv.supervisorType === "ONSITE"
                  : sv.supervisorType === "UNIVERSITY" || !sv.supervisorType
              )
              .map((sv) => (
                <button
                  key={sv.id}
                  className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={() => assignStudent && handleAssignSupervisor(assignStudent.id, sv.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{sv.firstName} {sv.lastName}</p>
                      <p className="text-xs text-muted-foreground">{sv.email}</p>
                      {sv.department && <p className="text-xs text-muted-foreground">{sv.department}</p>}
                    </div>
                    <Badge className={assigningType === "UNIVERSITY" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"}>
                      {assigningType === "UNIVERSITY" ? "University" : "Onsite"}
                    </Badge>
                  </div>
                </button>
              ))}
            {supervisors.filter(sv =>
              assigningType === "ONSITE"
                ? sv.supervisorType === "ONSITE"
                : sv.supervisorType === "UNIVERSITY" || !sv.supervisorType
            ).length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">
                No {assigningType === "UNIVERSITY" ? "university" : "onsite"} supervisors registered yet
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification */}
      <Dialog open={notifyOpen} onOpenChange={setNotifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>Send an announcement to system users.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Recipients</Label>
              <Select value={notification.target} onValueChange={(v) => setNotification({ ...notification, target: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                  <SelectItem value="STUDENT">Students Only</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisors Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={notification.title} onChange={(e) => setNotification({ ...notification, title: e.target.value })} className="mt-1" placeholder="Announcement title" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={notification.message} onChange={(e) => setNotification({ ...notification, message: e.target.value })} className="mt-1" rows={4} placeholder="Your announcement message…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ title: "Notification sent", description: `Sent to ${notification.target}` });
              setNotifyOpen(false);
              setNotification({ title: "", message: "", target: "ALL" });
            }}>
              <Bell className="h-4 w-4 mr-2" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
