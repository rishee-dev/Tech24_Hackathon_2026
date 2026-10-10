import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatsCard } from '@/components/StatsCard';
import { AnimatedSection } from '@/components/AnimatedSection';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/StatusBadge';
import { useIssues } from '@/context/IssuesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ClipboardList,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  Issue, 
  IssueStatus, 
  IssueCategory, 
  STATUS_LABELS, 
  CATEGORY_LABELS,
  PRIORITY_LABELS 
} from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AcceptConfirmButton from '@/components/AcceptConfirmButton';
import AIAnalysisPanel from '@/components/AIAnalysisPanel';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { issues, updateIssueStatus } = useIssues();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [issueToAccept, setIssueToAccept] = useState<Issue | null>(null);

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h1>
            <p className="text-muted-foreground mb-6">
              You need admin privileges to access this dashboard. Please sign in with an admin account.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Sign In as Admin
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Stats
  const stats = {
    total: issues.length,
    reported: issues.filter(i => i.status === 'reported').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    highPriority: issues.filter(i => i.priority === 'high' && i.status !== 'resolved').length,
  };

  // Filtered issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = (issueId: string, newStatus: IssueStatus) => {
    updateIssueStatus(issueId, newStatus);
    toast({
      title: 'Status Updated',
      description: `Issue status changed to "${STATUS_LABELS[newStatus]}"`,
    });
  };

  // Chart data
  const statusChartData = [
    { name: 'Reported', value: stats.reported, color: 'hsl(38 92% 50%)' },
    { name: 'In Progress', value: stats.inProgress, color: 'hsl(199 89% 48%)' },
    { name: 'Resolved', value: stats.resolved, color: 'hsl(142 71% 45%)' },
  ];

  const categoryChartData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    name: label,
    value: issues.filter(i => i.category === key).length,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container py-8 flex-1">
        {/* Header */}
        <AnimatedSection className="mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            Administration
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and track all reported issues across the city.
          </p>
        </AnimatedSection>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <AnimatedSection delay={0}>
            <StatsCard title="Total Issues" value={stats.total} icon={ClipboardList} variant="primary" />
          </AnimatedSection>
          <AnimatedSection delay={50}>
            <StatsCard title="Reported" value={stats.reported} icon={Clock} variant="warning" />
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <StatsCard title="In Progress" value={stats.inProgress} icon={Loader2} variant="primary" />
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <StatsCard title="Resolved" value={stats.resolved} icon={CheckCircle2} variant="success" />
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <StatsCard title="High Priority" value={stats.highPriority} icon={AlertTriangle} variant="danger" />
          </AnimatedSection>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <AnimatedSection delay={100}>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Issues by Status</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {statusChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h3 className="font-display font-semibold text-foreground">Issues by Category</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(199 89% 48%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'all')}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | 'all')}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Issues Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-4">Issue</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Reported</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="group">
                {/* Main Row */}
                <div 
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer",
                    expandedIssue === issue.id && "bg-muted/30"
                  )}
                  onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                >
                  {/* Issue Info */}
                  <div className="lg:col-span-4 flex items-start gap-3">
                    {issue.imageUrl && (
                      <img
                        src={issue.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {issue.location.address}
                      </p>
                    </div>
                    <ChevronDown className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform lg:hidden ml-auto",
                      expandedIssue === issue.id && "rotate-180"
                    )} />
                  </div>

                  {/* Category - Desktop */}
                  <div className="hidden lg:flex lg:col-span-2 items-center">
                    <CategoryBadge category={issue.category} />
                  </div>

                  {/* Priority - Desktop */}
                  <div className="hidden lg:flex lg:col-span-1 items-center">
                    <PriorityBadge priority={issue.priority} />
                  </div>

                  {/* Status - Desktop */}
                  <div className="hidden lg:flex lg:col-span-2 items-center">
                    <StatusBadge status={issue.status} />
                  </div>

                  {/* Reported - Desktop */}
                  <div className="hidden lg:flex lg:col-span-2 items-center text-sm text-muted-foreground">
                    {formatDistanceToNow(issue.reportedAt, { addSuffix: true })}
                  </div>

                  {/* Actions - Desktop */}
                  <div className="hidden lg:flex lg:col-span-1 items-center">
                    {issue.status === 'reported' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIssueToAccept(issue);
                          setDialogOpen(true);
                        }}
                        className="mr-2"
                      >
                        Accept
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedIssue(expandedIssue === issue.id ? null : issue.id);
                      }}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile Badges */}
                  <div className="flex flex-wrap gap-2 lg:hidden">
                    <CategoryBadge category={issue.category} />
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                </div>

                {/* Expanded Row */}
                {expandedIssue === issue.id && (
                  <div className="p-4 pt-0 animate-fade-in">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                          
                          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>Reported by: <span className="text-foreground">{issue.reportedBy}</span></span>
                            <span>Updated: <span className="text-foreground">{formatDistanceToNow(issue.updatedAt, { addSuffix: true })}</span></span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Update Status</h4>
                          <div className="flex flex-wrap gap-2">
                            {(['reported', 'accepted', 'in-progress', 'resolved'] as IssueStatus[]).map((status) => (
                              <Button
                                key={status}
                                size="sm"
                                variant={issue.status === status ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(issue.id, status)}
                                className={cn(
                                  issue.status === status && 
                                  status === 'reported' && 'bg-status-reported hover:bg-status-reported/90',
                                  issue.status === status && 
                                  status === 'accepted' && 'bg-status-accepted hover:bg-status-accepted/90',
                                  issue.status === status && 
                                  status === 'in-progress' && 'bg-status-in-progress hover:bg-status-in-progress/90',
                                  issue.status === status && 
                                  status === 'resolved' && 'bg-status-resolved hover:bg-status-resolved/90'
                                )}
                              >
                                {STATUS_LABELS[status]}
                              </Button>
                            ))}
                          </div>
                        </div>
                        {user?.isAdmin && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">AI Analysis</h4>
                            <AIAnalysisPanel issueId={issue.id} initial={(issue as any).aiAnalysis} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredIssues.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No issues found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setIssueToAccept(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Issue</DialogTitle>
            <DialogDescription>Confirm accepting this report and notify relevant parties.</DialogDescription>
          </DialogHeader>

          {issueToAccept && (
            <div className="space-y-4 mt-2">
              <div>
                <h4 className="text-sm font-medium text-foreground">{issueToAccept.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{issueToAccept.description}</p>
              </div>

              <div className="text-sm text-muted-foreground">
                <div>Location: <span className="text-foreground">{issueToAccept.location.address}</span></div>
                <div>Reported by: <span className="text-foreground">{issueToAccept.reportedBy}</span></div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <AcceptConfirmButton
              issue={issueToAccept}
              onSuccess={(id) => {
                handleStatusChange(id, 'accepted');
              }}
              onClose={() => {
                setDialogOpen(false);
                setIssueToAccept(null);
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
