import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { Button } from '@/components/ui/button';
import { IssueCard } from '@/components/IssueCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedSection } from '@/components/AnimatedSection';
import { 
  MapPin, 
  ClipboardList, 
  Map, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Shield,
  Eye,
  TrendingUp,
  AlertTriangle,
  Building2,
  Trash2,
  Lightbulb,
  TreePine,
  Car,
  ChevronRight,
  Play
} from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const { issues } = useIssues();

  const recentIssues = issues.slice(0, 3);
  const stats = {
    total: issues.length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
  };

  const problems = [
    {
      icon: Car,
      title: 'Road Hazards',
      description: 'Potholes, damaged roads, and traffic issues that endanger commuters daily.',
      color: 'text-category-roads',
      bgColor: 'bg-category-roads/10',
    },
    {
      icon: Trash2,
      title: 'Sanitation Issues',
      description: 'Garbage overflow, blocked drains, and waste management problems.',
      color: 'text-category-sanitation',
      bgColor: 'bg-category-sanitation/10',
    },
    {
      icon: Lightbulb,
      title: 'Utility Failures',
      description: 'Broken streetlights, water leaks, and power outages affecting neighborhoods.',
      color: 'text-category-utilities',
      bgColor: 'bg-category-utilities/10',
    },
    {
      icon: TreePine,
      title: 'Park Maintenance',
      description: 'Damaged equipment, overgrown areas, and safety concerns in public spaces.',
      color: 'text-category-parks',
      bgColor: 'bg-category-parks/10',
    },
  ];

  const benefits = [
    {
      title: 'For Citizens',
      icon: Users,
      items: [
        'Easy photo-based issue reporting',
        'Real-time status tracking',
        'Location-based issue discovery',
        'Community-driven improvements',
      ],
    },
    {
      title: 'For Authorities',
      icon: Building2,
      items: [
        'AI-powered categorization',
        'Priority-based task management',
        'Data-driven decision making',
        'Transparent accountability',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%230891b2%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2215%22%20r%3D%221.5%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container relative py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <Sparkles className="h-4 w-4" />
                AI-Powered Civic Issue Tracking
                <ChevronRight className="h-4 w-4" />
              </div>
            </AnimatedSection>
            
            {/* Main Headline */}
            <AnimatedSection delay={100}>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Smarter Cities.
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Faster Solutions.
                </span>
              </h1>
            </AnimatedSection>
            
            {/* Subheadline */}
            <AnimatedSection delay={200}>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Report local issues like potholes, broken streetlights, and sanitation problems. 
                Our AI automatically categorizes and prioritizes your reports for faster resolution.
              </p>
            </AnimatedSection>

            {/* CTA Buttons */}
            <AnimatedSection delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/report">
                  <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-base group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                    Report an Issue
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/map">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-14 text-base group">
                    <Play className="mr-2 h-5 w-5" />
                    Explore Live Map
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            {/* Trust Indicators */}
            <AnimatedSection delay={400}>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-status-resolved" />
                  <span>{stats.resolved} Issues Resolved</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>AI-Powered Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  <span>100% Transparent</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Issues Reported', value: stats.total, icon: ClipboardList, color: 'text-primary' },
              { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-status-in-progress' },
              { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-status-resolved' },
              { label: 'Active Citizens', value: '1.2K+', icon: Users, color: 'text-accent' },
            ].map((stat, index) => (
              <AnimatedSection key={stat.label} delay={index * 100} direction="up">
                <div className="text-center group">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border mx-auto mb-4 group-hover:shadow-lg group-hover:border-primary/20 transition-all ${stat.color}`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <div className="font-display text-4xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Simple Process
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Three simple steps to make your community better
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-primary to-accent" />
            
            {[
              {
                step: '01',
                icon: MapPin,
                title: 'Report an Issue',
                description: 'Snap a photo, describe the problem, and pin the exact location. It takes less than 60 seconds.',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'AI Categorizes',
                description: 'Our AI automatically categorizes your report and assigns priority for faster processing.',
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Track Resolution',
                description: 'Follow real-time status updates from "Reported" to "In Progress" to "Resolved".',
              },
            ].map((feature, index) => (
              <AnimatedSection 
                key={feature.title}
                delay={index * 150}
                className="relative"
              >
                <div className="group p-8 rounded-3xl bg-card border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-500 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/30">
                      {feature.step}
                    </span>
                  </div>
                  
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mb-6 group-hover:shadow-glow transition-shadow">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Problems We Solve Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
              The Challenge
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Problems We Solve
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Common urban issues that affect our daily lives
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, index) => (
              <AnimatedSection key={problem.title} delay={index * 100}>
                <div className="group p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-border transition-all duration-300 h-full">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${problem.bgColor} mb-4`}>
                    <problem.icon className={`h-6 w-6 ${problem.color}`} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {problem.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Impact & Benefits Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Mutual Benefits
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Impact & Benefits
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A win-win platform for citizens and city authorities
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={benefit.title} delay={index * 150} direction={index === 0 ? 'left' : 'right'}>
                <div className="p-8 rounded-3xl bg-card border border-border h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
                      <benefit.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      {benefit.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {benefit.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-status-resolved mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <AnimatedSection>
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Live Updates
              </span>
              <h2 className="font-display text-3xl font-bold text-foreground">
                Recent Issues
              </h2>
              <p className="text-muted-foreground mt-2">
                Latest reports from the community
              </p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <Link to="/issues">
                <Button variant="outline" className="group">
                  View All Issues
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </AnimatedSection>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentIssues.length > 0 ? (
              recentIssues.map((issue, index) => (
                <AnimatedSection key={issue.id} delay={index * 100}>
                  <IssueCard issue={issue} />
                </AnimatedSection>
              ))
            ) : (
              <AnimatedSection className="col-span-3 text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  No issues yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to report an issue in your community
                </p>
                <Link to="/report">
                  <Button>Report an Issue</Button>
                </Link>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 md:p-16">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
              
              {/* Floating Orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 max-w-2xl">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Ready to make a difference in your community?
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  Join thousands of active citizens who are helping improve their neighborhoods. 
                  Report issues, track progress, and see real change happen.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={user ? '/report' : '/auth'}>
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 h-14 text-base group">
                      {user ? 'Report an Issue' : 'Get Started Free'}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/map">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto px-8 h-14 text-base bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      View Live Map
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
