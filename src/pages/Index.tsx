import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, UserCheck, BookOpen, FileText, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Student Logbook
            <span className="text-primary"> Management System</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A digital solution for university students to record their daily activities and supervisors to review and provide feedback on logbook entries.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/login"}
            className="text-lg px-8 py-4"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Digital Logbook</CardTitle>
              <CardDescription>
                Replace paper logbooks with a modern digital solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Students can easily record their daily activities, hours worked, and project progress in a structured digital format.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Easy Review Process</CardTitle>
              <CardDescription>
                Streamlined approval workflow for supervisors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Supervisors can quickly review, approve, or reject entries with detailed feedback and comments.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Real-time Communication</CardTitle>
              <CardDescription>
                Instant feedback and communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Students receive immediate notifications about entry status and supervisor feedback.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Login Options */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Portal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = "/login"}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                  <GraduationCap className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Student Portal</CardTitle>
                <CardDescription>
                  Record your daily activities and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Submit daily logbook entries</li>
                  <li>• Track hours worked</li>
                  <li>• View supervisor feedback</li>
                  <li>• Monitor approval status</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Login as Student
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = "/login"}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                  <UserCheck className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Supervisor Portal</CardTitle>
                <CardDescription>
                  Review and provide feedback on student entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Review student submissions</li>
                  <li>• Approve or reject entries</li>
                  <li>• Provide detailed feedback</li>
                  <li>• Track student progress</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Login as Supervisor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
