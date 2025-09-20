import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, UserCheck, BookOpen, FileText, Users, Clock, Shield, Star, CheckCircle, ArrowRight, BarChart3, Calendar, MessageCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="p-2 gradient-primary rounded-xl shadow-soft">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LogBook Pro
              </span>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.location.href = "/student/login"}
                className="gradient-primary hover:shadow-medium transition-all duration-300 hover:scale-105"
              >
                Student
              </Button>
              <Button 
                onClick={() => window.location.href = "/supervisor/login"} 
                variant="outline"
                className="border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
              >
                Supervisor
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center mb-20 space-y-8">
            <div className="animate-fade-in">
              <Badge variant="secondary" className="text-sm px-6 py-3 shadow-soft border-primary/20 bg-primary/5">
                🎓 Trusted by 500+ Universities
              </Badge>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold leading-tight animate-slide-up">
              <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Digital Student
              </span>
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-4">
                Logbook System
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              Transform your academic journey with our comprehensive digital logbook platform. 
              Record activities, track progress, and receive real-time feedback from supervisors.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = "/student/login"}
                  className="text-lg px-10 py-6 group gradient-primary hover:shadow-strong transition-all duration-300 hover:scale-105"
                >
                  Student Login
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = "/supervisor/login"}
                  className="text-lg px-10 py-6 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-105"
                >
                  Supervisor Login
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-6 border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 group"
              >
                <span className="flex items-center gap-2">
                  ▶️ Watch Demo
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center group animate-fade-in">
            <div className="relative">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                10K+
              </div>
              <div className="absolute inset-0 blur-xl bg-gradient-to-r from-primary/20 to-accent/20 rounded-full animate-pulse-soft"></div>
            </div>
            <div className="text-muted-foreground text-lg font-medium">Active Students</div>
          </div>
          <div className="text-center group animate-fade-in">
            <div className="relative">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <div className="absolute inset-0 blur-xl bg-gradient-to-r from-primary/20 to-accent/20 rounded-full animate-pulse-soft"></div>
            </div>
            <div className="text-muted-foreground text-lg font-medium">Universities</div>
          </div>
          <div className="text-center group animate-fade-in">
            <div className="relative">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                98%
              </div>
              <div className="absolute inset-0 blur-xl bg-gradient-to-r from-primary/20 to-accent/20 rounded-full animate-pulse-soft"></div>
            </div>
            <div className="text-muted-foreground text-lg font-medium">Satisfaction Rate</div>
          </div>
          <div className="text-center group animate-fade-in">
            <div className="relative">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <div className="absolute inset-0 blur-xl bg-gradient-to-r from-primary/20 to-accent/20 rounded-full animate-pulse-soft"></div>
            </div>
            <div className="text-muted-foreground text-lg font-medium">Support Available</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for modern academic documentation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center group hover:shadow-strong transition-all duration-500 border-2 hover:border-primary/30 gradient-card backdrop-blur-sm animate-fade-in hover:scale-105">
            <CardHeader>
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-medium animate-float">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Digital Logbook</CardTitle>
              <CardDescription className="text-lg">
                Replace paper logbooks with a modern digital solution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Students can easily record their daily activities, hours worked, and project progress in a structured digital format.
              </p>
              <div className="flex items-center justify-center gap-2 text-primary bg-primary/10 rounded-full py-2 px-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Auto-save & Backup</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center group hover:shadow-strong transition-all duration-500 border-2 hover:border-primary/30 gradient-card backdrop-blur-sm animate-fade-in hover:scale-105">
            <CardHeader>
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-medium animate-float">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Smart Review Process</CardTitle>
              <CardDescription className="text-lg">
                AI-powered workflow for efficient supervision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Supervisors can quickly review, approve, or reject entries with detailed feedback and intelligent suggestions.
              </p>
              <div className="flex items-center justify-center gap-2 text-primary bg-primary/10 rounded-full py-2 px-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Quick Actions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center group hover:shadow-strong transition-all duration-500 border-2 hover:border-primary/30 gradient-card backdrop-blur-sm animate-fade-in hover:scale-105">
            <CardHeader>
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-medium animate-float">
                <MessageCircle className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Real-time Communication</CardTitle>
              <CardDescription className="text-lg">
                Instant feedback and collaboration tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Students receive immediate notifications about entry status and supervisor feedback with integrated chat.
              </p>
              <div className="flex items-center justify-center gap-2 text-primary bg-primary/10 rounded-full py-2 px-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Live Notifications</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="gradient-secondary/50 backdrop-blur-sm rounded-3xl p-16 mb-20 shadow-strong border border-primary/10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Why Choose LogBook Pro?
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Experience the future of academic documentation with features designed for modern education.
              </p>
            </div>
        
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <div className="text-center space-y-6 group animate-fade-in">
                <div className="relative">
                  <div className="mx-auto p-6 gradient-primary rounded-2xl w-fit shadow-medium group-hover:scale-110 transition-transform duration-300 animate-float">
                    <Clock className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse-soft"></div>
                </div>
                <h3 className="font-bold text-xl">Save 80% Time</h3>
                <p className="text-muted-foreground">
                  Automated workflows reduce administrative overhead significantly.
                </p>
              </div>
              
              <div className="text-center space-y-6 group animate-fade-in">
                <div className="relative">
                  <div className="mx-auto p-6 gradient-primary rounded-2xl w-fit shadow-medium group-hover:scale-110 transition-transform duration-300 animate-float">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse-soft"></div>
                </div>
                <h3 className="font-bold text-xl">Secure & Compliant</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security with GDPR compliance and data encryption.
                </p>
              </div>
              
              <div className="text-center space-y-6 group animate-fade-in">
                <div className="relative">
                  <div className="mx-auto p-6 gradient-primary rounded-2xl w-fit shadow-medium group-hover:scale-110 transition-transform duration-300 animate-float">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse-soft"></div>
                </div>
                <h3 className="font-bold text-xl">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Detailed insights and progress tracking for better outcomes.
                </p>
              </div>
              
              <div className="text-center space-y-6 group animate-fade-in">
                <div className="relative">
                  <div className="mx-auto p-6 gradient-primary rounded-2xl w-fit shadow-medium group-hover:scale-110 transition-transform duration-300 animate-float">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse-soft"></div>
                </div>
                <h3 className="font-bold text-xl">Smart Scheduling</h3>
                <p className="text-muted-foreground">
                  Integrated calendar with deadline reminders and task management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Loved by Students & Supervisors
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed">
            See how LogBook Pro is transforming academic documentation worldwide.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-primary/10 hover:border-primary/20 group hover:scale-105">
            <div className="flex mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-primary text-primary animate-pulse-soft" />
              ))}
            </div>
            <p className="text-muted-foreground mb-6 italic text-lg leading-relaxed">
              "LogBook Pro revolutionized how I track my internship progress. The interface is intuitive and the feedback system is excellent."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-lg">SM</span>
              </div>
              <div>
                <div className="font-bold text-lg">Sarah Miller</div>
                <div className="text-muted-foreground">Computer Science Student</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-8 gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-primary/10 hover:border-primary/20 group hover:scale-105">
            <div className="flex mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-primary text-primary animate-pulse-soft" />
              ))}
            </div>
            <p className="text-muted-foreground mb-6 italic text-lg leading-relaxed">
              "As a supervisor, I can now provide timely feedback to 30+ students efficiently. The analytics help track progress beautifully."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-lg">DJ</span>
              </div>
              <div>
                <div className="font-bold text-lg">Dr. James Wilson</div>
                <div className="text-muted-foreground">University Supervisor</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-8 gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-primary/10 hover:border-primary/20 group hover:scale-105">
            <div className="flex mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-primary text-primary animate-pulse-soft" />
              ))}
            </div>
            <p className="text-muted-foreground mb-6 italic text-lg leading-relaxed">
              "The real-time collaboration features have improved communication with my supervisor dramatically. Highly recommended!"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-lg">AL</span>
              </div>
              <div>
                <div className="font-bold text-lg">Alex Chen</div>
                <div className="text-muted-foreground">Engineering Student</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Login Options */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Choose Your Portal
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground text-center mb-16 leading-relaxed">
            Access your personalized dashboard based on your role
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card className="hover:shadow-strong transition-all duration-500 cursor-pointer border-2 hover:border-primary/30 group gradient-card hover:scale-105" onClick={() => window.location.href = "/student/login"}>
              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-8 p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-3xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-medium">
                  <GraduationCap className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-4xl mb-4">Student Portal</CardTitle>
                <CardDescription className="text-xl">
                  Record your daily activities and track your academic progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Submit entries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Track hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">View feedback</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Monitor progress</span>
                  </div>
                </div>
                <Button className="w-full gradient-primary hover:shadow-medium transition-all duration-300" size="lg">
                  Login as Student
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-strong transition-all duration-500 cursor-pointer border-2 hover:border-primary/30 group gradient-card hover:scale-105" onClick={() => window.location.href = "/supervisor/login"}>
              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-8 p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-3xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-medium">
                  <UserCheck className="h-20 w-20 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-4xl mb-4">Supervisor Portal</CardTitle>
                <CardDescription className="text-xl">
                  Review student work and provide valuable feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Review submissions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Approve entries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Provide feedback</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Track analytics</span>
                  </div>
                </div>
                <Button className="w-full gradient-primary hover:shadow-medium transition-all duration-300" size="lg">
                  Login as Supervisor
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 gradient-primary rounded-xl shadow-soft">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  LogBook Pro
                </span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Transforming academic documentation for the digital age.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-xl">Product</h4>
              <div className="space-y-3 text-muted-foreground">
                <div className="hover:text-primary cursor-pointer transition-colors">Features</div>
                <div className="hover:text-primary cursor-pointer transition-colors">Pricing</div>
                <div className="hover:text-primary cursor-pointer transition-colors">Security</div>
                <div className="hover:text-primary cursor-pointer transition-colors">Integrations</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-xl">Support</h4>
              <div className="space-y-3 text-muted-foreground">
                <div className="hover:text-primary cursor-pointer transition-colors">Documentation</div>
                <div className="hover:text-primary cursor-pointer transition-colors">Help Center</div>
                <div className="hover:text-primary cursor-pointer transition-colors">Contact Us</div>
                <div className="hover:text-primary cursor-pointer transition-colors">Status</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-xl">Company</h4>
              <div className="space-y-3 text-muted-foreground">
                <div className="hover:text-primary cursor-pointer transition-colors">About</div>
                <div className="hover:text-primary cursor-pointer transition-colors">Blog</div>
                <div className="hover:text-primary cursor-pointer transition-colors">Careers</div>
                <div className="hover:text-primary cursor-pointer transition-colors">Privacy</div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p className="text-lg">&copy; 2024 LogBook Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;