import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Clock, Calendar, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background landing-theme">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-accent/20 rotate-45 rounded-lg"></div>
          <div className="absolute bottom-40 right-32 w-24 h-24 bg-primary/20 rotate-12 rounded-lg"></div>
        </div>
        <div className="relative">
          <div className="container mx-auto px-4 py-24">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-12">
                <div className="inline-flex items-center justify-center p-4 bg-primary/20 border border-primary/30 rounded-2xl mb-6">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-6xl font-semibold mb-8 text-foreground tracking-tight">
                  DeskControl
                </h1>
                <p className="text-xl text-foreground/80 mb-12 leading-relaxed max-w-2xl mx-auto">
                  Comprehensive management system for Service Desk analysts. 
                  Manage absences, assign tasks and supervise your team efficiently.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button asChild size="lg" className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link to="/auth">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 border-primary/50 text-foreground hover:bg-primary/10 font-semibold">
                  <Link to="/auth">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-semibold mb-6 text-foreground">Main Features</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            A complete solution for Service Desk team management with specialized 
            tools for analysts and leads.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="cognizant-card hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="p-8">
              <div className="h-14 w-14 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">Absence Management</CardTitle>
              <CardDescription className="text-foreground/70 leading-relaxed">
                Request and approve absences efficiently with a commenting and tracking system.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cognizant-card hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="p-8">
              <div className="h-14 w-14 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">Task Assignment</CardTitle>
              <CardDescription className="text-foreground/70 leading-relaxed">
                Assign and supervise team tasks with priorities, deadlines and progress tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cognizant-card hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="p-8">
              <div className="h-14 w-14 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">Shift Control</CardTitle>
              <CardDescription className="text-foreground/70 leading-relaxed">
                Manage schedules, work modalities (office/home) and visualize team status.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Roles Section */}
      <div className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-semibold mb-6 text-foreground">Specialized Dashboards</h2>
            <p className="text-foreground/70 text-lg">
              Different interfaces optimized for each role in your team.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="cognizant-card p-10 hover:border-primary/60 transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-semibold mb-4 text-foreground">Analyst Dashboard</CardTitle>
                <CardDescription className="text-foreground/70 text-base">
                  Tools to manage your daily work efficiently.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    View absence requests
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Manage assigned tasks
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    See current shift and modality
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Real-time team status
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="cognizant-card p-10 hover:border-primary/60 transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-semibold mb-4 text-foreground">Lead Dashboard</CardTitle>
                <CardDescription className="text-foreground/70 text-base">
                  Complete control to supervise and manage your team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Approve/reject absences
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Assign tasks to analysts
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Manage team schedules
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Absence calendar
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-semibold mb-6 text-foreground">Ready to optimize your Service Desk?</h2>
          <p className="text-foreground/70 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
            Start using DeskControl today and transform your team management with 
            professional tools and an intuitive interface.
          </p>
          <Button asChild size="lg" className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link to="/auth">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
