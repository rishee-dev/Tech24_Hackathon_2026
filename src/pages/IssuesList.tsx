import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { IssueCard } from '@/components/IssueCard';
import { StatusStepper } from '@/components/StatusStepper';
import { EmptyState } from '@/components/EmptyState';
import { AnimatedSection } from '@/components/AnimatedSection';
import { IssueCardSkeleton } from '@/components/LoadingSkeleton';
import { useIssues } from '@/context/IssuesContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';
import { IssueStatus, IssueCategory, IssuePriority, STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function IssuesList() {
  const { issues } = useIssues();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const statusCounts = {
    all: issues.length,
    reported: issues.filter(i => i.status === 'reported').length,
    'in-progress': issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all';

  const activeFilterCount = [
    statusFilter !== 'all',
    categoryFilter !== 'all',
    priorityFilter !== 'all',
    searchQuery.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container py-8 flex-1">
        {/* Header */}
        <AnimatedSection className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              Community Reports
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Reported Issues
            </h1>
            <p className="text-muted-foreground mt-2">
              {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'} found
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'grid' ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'list' ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'border-primary text-primary bg-primary/5')}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </AnimatedSection>

        {/* Status Tabs */}
        <AnimatedSection delay={50} className="mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'reported', 'in-progress', 'resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card border border-border text-foreground hover:bg-secondary hover:border-primary/20"
                )}
              >
                {status === 'all' ? 'All Issues' : STATUS_LABELS[status]}
                <span className={cn(
                  "ml-2 px-2 py-0.5 rounded-lg text-xs",
                  statusFilter === status ? "bg-primary-foreground/20" : "bg-secondary"
                )}>
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Filter Chips */}
        <AnimatedSection delay={100} className="mb-6">
          <div className="flex flex-wrap gap-2">
            {/* Category Chips */}
            {(Object.entries(CATEGORY_LABELS) as [IssueCategory, string][]).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setCategoryFilter(categoryFilter === value ? 'all' : value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  categoryFilter === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Priority Chips */}
        <AnimatedSection delay={150} className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium mr-1">Priority:</span>
            {(Object.entries(PRIORITY_LABELS) as [IssuePriority, string][]).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setPriorityFilter(priorityFilter === value ? 'all' : value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  priorityFilter === value
                    ? value === 'high' ? "bg-priority-high text-white border-priority-high" :
                      value === 'medium' ? "bg-priority-medium text-white border-priority-medium" :
                      "bg-priority-low text-white border-priority-low"
                    : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>
        </AnimatedSection>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <AnimatedSection className="mb-6">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, description, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="sm:w-48">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | 'all')}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="sm:w-40">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as IssuePriority | 'all')}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Priorities</option>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Issues Grid */}
        {isLoading ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {[...Array(6)].map((_, i) => (
              <IssueCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredIssues.length > 0 ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredIssues.map((issue, index) => (
              <AnimatedSection 
                key={issue.id} 
                delay={Math.min(index * 50, 300)}
              >
                <div className="relative">
                  {/* Status Stepper Overlay for Grid View */}
                  {viewMode === 'grid' && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-card/95 backdrop-blur rounded-lg px-2 py-1 border border-border shadow-sm">
                        <StatusStepper status={issue.status} compact />
                      </div>
                    </div>
                  )}
                  <IssueCard issue={issue} />
                </div>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="search"
            title="No issues found"
            description={hasActiveFilters 
              ? "Try adjusting your filters to see more results."
              : "No issues have been reported yet. Be the first to report an issue!"}
            action={hasActiveFilters ? undefined : { label: "Report an Issue", to: "/report" }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
