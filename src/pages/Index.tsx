import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, UserCheck, BookOpen, FileText, Users, Clock, Shield, Star, CheckCircle, ArrowRight, BarChart3, Calendar, MessageCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">LogBook Pro</span>
            </div>
            <Button onClick={() => window.location.href = "/login"} variant="outline">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Trusted by 500+ Universities
          </Badge>
          <h1 className="text-4xl md:text-7xl font-bold leading-tight">
            Digital Student
            <span className="text-primary block"> Logbook System</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your academic journey with our comprehensive digital logbook platform. 
            Record activities, track progress, and receive real-time feedback from supervisors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/login"}
              className="text-lg px-8 py-4 group"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-muted-foreground">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Universities</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-muted-foreground">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Support Available</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl">Digital Logbook</CardTitle>
              <CardDescription className="text-base">
                Replace paper logbooks with a modern digital solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Students can easily record their daily activities, hours worked, and project progress in a structured digital format.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <CheckCircle className="h-4 w-4" />
                <span>Auto-save & Backup</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl">Smart Review Process</CardTitle>
              <CardDescription className="text-base">
                AI-powered workflow for efficient supervision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Supervisors can quickly review, approve, or reject entries with detailed feedback and intelligent suggestions.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <CheckCircle className="h-4 w-4" />
                <span>Quick Actions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl">Real-time Communication</CardTitle>
              <CardDescription className="text-base">
                Instant feedback and collaboration tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Students receive immediate notifications about entry status and supervisor feedback with integrated chat.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <CheckCircle className="h-4 w-4" />
                <span>Live Notifications</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-muted/30 rounded-3xl p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Choose LogBook Pro?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of academic documentation with features designed for modern education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Save 80% Time</h3>
              <p className="text-muted-foreground text-sm">
                Automated workflows reduce administrative overhead significantly.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Secure & Compliant</h3>
              <p className="text-muted-foreground text-sm">
                Enterprise-grade security with GDPR compliance and data encryption.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Advanced Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Detailed insights and progress tracking for better outcomes.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Smart Scheduling</h3>
              <p className="text-muted-foreground text-sm">
                Integrated calendar with deadline reminders and task management.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Loved by Students & Supervisors</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            See how LogBook Pro is transforming academic documentation worldwide.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "LogBook Pro revolutionized how I track my internship progress. The interface is intuitive and the feedback system is excellent."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">SM</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Miller</div>
                  <div className="text-sm text-muted-foreground">Computer Science Student</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "As a supervisor, I can now provide timely feedback to 30+ students efficiently. The analytics help track progress beautifully."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">DJ</span>
                </div>
                <div>
                  <div className="font-semibold">Dr. James Wilson</div>
                  <div className="text-sm text-muted-foreground">University Supervisor</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "The real-time collaboration features have improved communication with my supervisor dramatically. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">AL</span>
                </div>
                <div>
                  <div className="font-semibold">Alex Chen</div>
                  <div className="text-sm text-muted-foreground">Engineering Student</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Login Options */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Choose Your Portal</h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Access your personalized dashboard based on your role
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 group" onClick={() => window.location.href = "/login"}>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-3xl mb-2">Student Portal</CardTitle>
                <CardDescription className="text-lg">
                  Record your daily activities and track your academic progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Submit entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Track hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>View feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Monitor progress</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" variant="outline">
                  Login as Student
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 group" onClick={() => window.location.href = "/login"}>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  <UserCheck className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-3xl mb-2">Supervisor Portal</CardTitle>
                <CardDescription className="text-lg">
                  Review student work and provide valuable feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Review submissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Approve entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Provide feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Track analytics</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" variant="outline">
                  Login as Supervisor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 border-t bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">LogBook Pro</span>
                </div>
                <p className="text-muted-foreground">
                  Transforming academic documentation for the digital age.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Product</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Features</div>
                  <div>Pricing</div>
                  <div>Security</div>
                  <div>Integrations</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Support</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Documentation</div>
                  <div>Help Center</div>
                  <div>Contact Us</div>
                  <div>Status</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Company</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>About</div>
                  <div>Blog</div>
                  <div>Careers</div>
                  <div>Privacy</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
              <p>&copy; 2024 LogBook Pro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
