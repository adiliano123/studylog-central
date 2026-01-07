import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";
import SupervisorLogin from "./pages/SupervisorLogin";
import SupervisorRegister from "./pages/SupervisorRegister"; // Add this import
import SupervisorDashboard from "./pages/SupervisorDashboard";

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
          
          {/* Supervisor routes */}
          <Route path="/supervisor/login" element={<SupervisorLogin />} />
          <Route path="/supervisor/register" element={<SupervisorRegister />} /> {/* Add this route */}
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;