import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";
import StudentForgotPassword from "./pages/StudentForgotPassword";
import SupervisorLogin from "./pages/SupervisorLogin";
import SupervisorRegister from "./pages/SupervisorRegister";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import SupervisorForgotPassword from "./pages/SupervisorForgotPassword";
import OnsiteSupervisorDashboard from "./pages/OnsiteSupervisorDashboard";
import UniversitySupervisorDashboard from "./pages/UniversitySupervisorDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import SimpleAdminTest from "./pages/SimpleAdminTest";
import MinimalAdminDashboard from "./pages/MinimalAdminDashboard";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Student routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
          
          {/* Supervisor routes */}
          <Route path="/supervisor/login" element={<SupervisorLogin />} />
          <Route path="/supervisor/register" element={<SupervisorRegister />} />
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor/onsite/dashboard" element={<OnsiteSupervisorDashboard />} />
          <Route path="/supervisor/university/dashboard" element={<UniversitySupervisorDashboard />} />
          <Route path="/supervisor/forgot-password" element={<SupervisorForgotPassword />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/enhanced" element={<AdminDashboard />} />
          <Route path="/admin/test" element={<SimpleAdminTest />} />
          <Route path="/admin/minimal" element={<MinimalAdminDashboard />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;