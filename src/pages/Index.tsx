import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Clock, Shield, Star, CheckCircle, BarChart3, Calendar, MessageCircle, Heart, Rocket, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// ─── Animated hero data ───────────────────────────────────────────────────────

const heroSlides = [
  {
    prefix:   "Welcome to",
    keyword:  "Online Logbook",
    suffix:   "Management System",
    subtitle: "The official platform for Industrial Practical Training documentation.",
    accent:   "from-blue-500 to-indigo-600",
  },
  {
    prefix:   "Track Your",
    keyword:  "Industrial Training",
    suffix:   "Progress",
    subtitle: "Log daily activities, hours, and milestones — all in one place.",
    accent:   "from-purple-500 to-pink-600",
  },
  {
    prefix:   "Manage Logbooks",
    keyword:  "Efficiently",
    suffix:   "& Professionally",
    subtitle: "Digital workflows that replace paper and speed up approvals.",
    accent:   "from-emerald-500 to-teal-600",
  },
  {
    prefix:   "Connect Students",
    keyword:  "and Supervisors",
    suffix:   "Seamlessly",
    subtitle: "Real-time communication and instant feedback between all parties.",
    accent:   "from-orange-500 to-red-600",
  },
  {
    prefix:   "Digitalize Your",
    keyword:  "Internship",
    suffix:   "Experience",
    subtitle: "Modern tools built for the next generation of graduates.",
    accent:   "from-sky-500 to-cyan-600",
  },
];

// ─── AnimatedHero component ───────────────────────────────────────────────────

const AnimatedHero = () => {
  const [current, setCurrent]     = useState(0);
  const [visible, setVisible]     = useState(true);
  const [typed,   setTyped]       = useState("");
  const [typing,  setTyping]      = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typeRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const slide = heroSlides[current];

  // Typing effect for the keyword
  useEffect(() => {
    setTyped("");
    setTyping(true);
    let i = 0;
    if (typeRef.current) clearInterval(typeRef.current);
    typeRef.current = setInterval(() => {
      i++;
      setTyped(slide.keyword.slice(0, i));
      if (i >= slide.keyword.length) {
        clearInterval(typeRef.current!);
        setTyping(false);
      }
    }, 55);
    return () => { if (typeRef.current) clearInterval(typeRef.current); };
  }, [current, slide.keyword]);

  // Rotate slides every 4.5 s with a fade transition
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(c => (c + 1) % heroSlides.length);
        setVisible(true);
      }, 400);
    }, 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className="text-center max-w-6xl mx-auto select-none">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-200/60 dark:border-slate-700/60 shadow-sm mb-8">
        <Zap className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Trusted by 500+ Universities Worldwide
        </span>
        <div className="flex">
          {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
        </div>
      </div>

      {/* Animated heading */}
      <div
        data-visible={visible}
        className="transition-[opacity,transform] duration-[380ms] ease-in-out data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 data-[visible=false]:opacity-0 data-[visible=false]:-translate-y-4"
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight mb-6 leading-tight">
          {/* Line 1 — prefix */}
          <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-100 dark:via-blue-100 dark:to-slate-100 bg-clip-text text-transparent block">
            {slide.prefix}
          </span>

          {/* Line 2 — animated keyword with typing cursor */}
          <span
            className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent block`}
          >
            {typed}
            {typing && (
              <span className="inline-block w-[2px] h-[0.85em] bg-current align-middle ml-0.5 animate-[blink_0.7s_step-end_infinite] opacity-90" />
            )}
          </span>

          {/* Line 3 — suffix */}
          <span className="bg-gradient-to-r from-slate-700 via-indigo-700 to-purple-700 dark:from-slate-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent block text-lg md:text-xl lg:text-2xl mt-1">
            {slide.suffix}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-2 max-w-3xl mx-auto leading-relaxed min-h-[3rem]">
          {slide.subtitle}
        </p>
      </div>

      {/* Slide indicator dots */}
      <div className="flex justify-center gap-2 mb-10 mt-4">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => { setVisible(false); setTimeout(() => { setCurrent(i); setVisible(true); }, 300); }}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500"
                : "w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
            }`}
          />
        ))}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
        <Link to="/student/register" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Rocket className="mr-3 h-5 w-5" />
            Start Your Journey — It's Free
          </Button>
        </Link>
        <Link to="/student/login" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full text-lg px-8 py-6 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105"
          >
            Existing Student
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
        {[
          { value: "10K+", label: "Active Students" },
          { value: "500+", label: "Universities"    },
          { value: "98%",  label: "Satisfaction"    },
          { value: "24/7", label: "Support"         },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Index = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Digital Logbook",
      description: "Replace paper with modern digital entries",
      benefits: ["Auto-save", "Cloud Backup", "Easy Editing"]
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Smart Review",
      description: "AI-powered workflow for supervisors",
      benefits: ["Quick Approval", "Smart Feedback", "Progress Tracking"]
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Real-time Chat",
      description: "Instant communication with supervisors",
      benefits: ["Live Notifications", "File Sharing", "Comment Threads"]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Track progress with detailed insights",
      benefits: ["Progress Reports", "Time Tracking", "Performance Metrics"]
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Smart Scheduling",
      description: "Never miss deadlines again",
      benefits: ["Reminders", "Task Management", "Deadline Alerts"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Compliant",
      description: "Enterprise-grade security",
      benefits: ["GDPR Compliant", "Data Encryption", "Secure Backups"]
    }
  ];

  const testimonials = [
    {
      name: "Jonas Japhet",
      role: "Computer Science Student",
      university: "IAA University",
      content: "Online Logbook transformed my internship experience. The interface is so intuitive and my supervisor's feedback comes instantly!",
      rating: 5
    },
    {
      name: "Dr. Darmian Francis",
      role: "Senior Supervisor",
      university: "UDSM",
      content: "Managing 40+ students used to be overwhelming. Now I can provide timely feedback and track everyone's progress effortlessly.",
      rating: 5
    },
    {
      name: "Adiliano Sindobewe",
      role: "Computer Science Student",
      university: "UDOM",
      content: "The real-time notifications and mobile access make it so easy to stay on top of my logbook entries during busy internship days.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Online Logbook
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400">Academic Excellence</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/student/login">
                <Button 
                  variant="ghost" 
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  For Students
                </Button>
              </Link>
              <Link to="/supervisor/login">
                <Button 
                  variant="ghost" 
                  className="text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  For Supervisors
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button 
                  variant="ghost" 
                  className="text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Admin
                </Button>
              </Link>
              <Link to="/student/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started Free
                  <Rocket className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-purple-500/10"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-4 py-24 relative">
          <AnimatedHero />
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <Badge variant="secondary" className="px-4 py-2 text-sm mb-4">
            ✨ Powerful Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Everything You Need for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block"> Modern Education</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Designed with students and supervisors in mind, our platform offers comprehensive tools for seamless academic documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-500 border-2 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-105"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <div className="text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-slate-900 dark:bg-slate-800 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="px-4 py-2 text-sm mb-4 bg-white/10 text-white">
              ❤️ Loved By Users
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Students & 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block"> Supervisors Worldwide</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="italic mb-6 text-white/90 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-white/70">{testimonial.role}</div>
                      <div className="text-xs text-white/50">{testimonial.university}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Academic Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students and supervisors who are already using Online Logbook to streamline their academic documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/student/register">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                >
                  <Rocket className="mr-3 h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link to="/student/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20 text-lg px-8 py-6 backdrop-blur-sm"
                >
                  Student Login
                </Button>
              </Link>
              <Link to="/supervisor/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20 text-lg px-8 py-6 backdrop-blur-sm"
                >
                  Supervisor Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Online Logbook</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Modern digital logbook platform for students and supervisors. Streamline your academic documentation today.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-lg">For Students</h4>
              <div className="space-y-3">
                <Link to="/student/login" className="block hover:text-white transition-colors">Student Login</Link>
                <Link to="/student/register" className="block hover:text-white transition-colors">Student Register</Link>
                <Link to="/student/dashboard" className="block hover:text-white transition-colors">Student Dashboard</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-lg">For Supervisors</h4>
              <div className="space-y-3">
                <Link to="/supervisor/login" className="block hover:text-white transition-colors">Supervisor Login</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-lg">Support</h4>
              <div className="space-y-3 text-slate-400">
                <div className="hover:text-white cursor-pointer transition-colors">Help Center</div>
                <div className="hover:text-white cursor-pointer transition-colors">Contact Us</div>
                <div className="hover:text-white cursor-pointer transition-colors">Documentation</div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-700 text-center">
            <p className="text-slate-400">
              &copy; 2024 Online Logbook. All rights reserved. Built with <Heart className="inline h-4 w-4 text-red-500" /> for education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;