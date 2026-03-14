import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, ArrowLeft, Building2, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const SupervisorRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    staffId: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    position: "",
    supervisorType: "ONSITE" as "ONSITE" | "UNIVERSITY"
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTypeSelect = (type: "ONSITE" | "UNIVERSITY") => {
    setFormData(prev => ({
      ...prev,
      supervisorType: type
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Attempting supervisor registration...");
      
      const response = await fetch("http://localhost:8080/api/auth/register/supervisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          staffId: formData.staffId,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          position: formData.position,
          supervisorType: formData.supervisorType
        }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful:", data);
        
        toast({
          title: "Registration Successful",
          description: "Your supervisor account has been created! Please log in.",
        });
        
        // Redirect to supervisor login page
        navigate("/supervisor/login");
        
      } else {
        let errorMessage = "Registration failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || "Registration failed";
        }
        
        console.error("Registration failed:", errorMessage);
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Network Error",
        description: "Cannot connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Link 
          to="/supervisor/login" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Supervisor Registration</CardTitle>
            <CardDescription>
              Create your supervisor account to access the management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Supervisor Type Selection */}
              <div className="space-y-3">
                <Label>Supervisor Type *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeSelect("ONSITE")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.supervisorType === "ONSITE"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className={`h-8 w-8 ${
                        formData.supervisorType === "ONSITE" ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <div className="text-center">
                        <div className="font-semibold">Onsite Supervisor</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Company/workplace supervisor for daily verification
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleTypeSelect("UNIVERSITY")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.supervisorType === "UNIVERSITY"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <GraduationCap className={`h-8 w-8 ${
                        formData.supervisorType === "UNIVERSITY" ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <div className="text-center">
                        <div className="font-semibold">University Supervisor</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Academic supervisor for final approval
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staffId">Staff ID *</Label>
                  <Input
                    id="staffId"
                    name="staffId"
                    placeholder="e.g., SUP001"
                    value={formData.staffId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="supervisor@university.edu"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    aria-label="Department selection"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Research & Development">Research & Development</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Education">Education</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="e.g., Professor"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : `Create ${formData.supervisorType === "ONSITE" ? "Onsite" : "University"} Supervisor Account`}
              </Button>

              {/* Sample Data Buttons */}
              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground mb-2 block">Quick Fill Sample Data:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        firstName: "John",
                        lastName: "Smith",
                        staffId: "ONS001",
                        email: "john.smith@techcorp.com",
                        password: "Secure123!",
                        confirmPassword: "Secure123!",
                        department: "Engineering",
                        position: "Senior Engineer",
                        supervisorType: "ONSITE"
                      });
                    }}
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    Onsite Sample
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        firstName: "Dr. Jane",
                        lastName: "Doe",
                        staffId: "UNI001",
                        email: "jane.doe@university.edu",
                        password: "Academic123!",
                        confirmPassword: "Academic123!",
                        department: "Computer Science",
                        position: "Professor",
                        supervisorType: "UNIVERSITY"
                      });
                    }}
                  >
                    <GraduationCap className="h-3 w-3 mr-1" />
                    University Sample
                  </Button>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/supervisor/login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </div>

              {/* Info about supervisor types */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Supervisor Types:</p>
                <p className="mb-1">
                  <Building2 className="h-3 w-3 inline mr-1" />
                  <strong>Onsite:</strong> Daily verification, check-in tracking, location verification, activity validation
                </p>
                <p>
                  <GraduationCap className="h-3 w-3 inline mr-1" />
                  <strong>University:</strong> Final academic approval after onsite supervisor verification
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorRegister;