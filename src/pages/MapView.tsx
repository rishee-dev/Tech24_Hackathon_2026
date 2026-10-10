import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { IssueMap } from '@/components/IssueMap';
import { IssueCard } from '@/components/IssueCard';
import { StatusStepper } from '@/components/StatusStepper';
import { AnimatedSection } from '@/components/AnimatedSection';
import { useIssues } from '@/context/IssuesContext';
import { Issue, IssueStatus, STATUS_LABELS } from '@/lib/types';
import { X, List, MapIcon, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
export default function MapView() {
  const { issues } = useIssues();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [showSidebar, setShowSidebar] = useState(true);

  const filteredIssues = statusFilter === 'all' 
    ? issues 
    : issues.filter(issue => issue.status === statusFilter);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={cn(
          "lg:w-96 border-r border-border bg-card flex flex-col transition-all duration-300",
          showSidebar ? "w-full lg:block" : "hidden lg:hidden"
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">
                Issues on Map
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'reported', 'in-progress', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    statusFilter === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {status === 'all' ? 'All' : STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Issues List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={cn(
                  "transition-all duration-200",
                  selectedIssue?.id === issue.id && "ring-2 ring-primary rounded-xl"
                )}
              >
                <IssueCard
                  issue={issue}
                  compact
                  onClick={() => setSelectedIssue(issue)}
                />
              </div>
            ))}
            {filteredIssues.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No issues match this filter
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {/* Mobile Toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="absolute top-4 left-4 z-[1000] lg:hidden shadow-lg"
          >
            {showSidebar ? (
              <>
                <MapIcon className="h-4 w-4 mr-2" />
                Show Map
              </>
            ) : (
              <>
                <List className="h-4 w-4 mr-2" />
                Show List
              </>
            )}
          </Button>

          <div className={cn(
            "h-[calc(100vh-4rem)]",
            showSidebar && "hidden lg:block"
          )}>
            <IssueMap
              issues={filteredIssues}
              selectedIssue={selectedIssue}
              onIssueClick={setSelectedIssue}
            />
          </div>
        </div>

        {/* Selected Issue Detail (Desktop) */}
        {selectedIssue && (
          <div className="hidden lg:block lg:w-80 border-l border-border bg-card p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">
                Issue Details
              </h3>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1.5 rounded-lg hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <IssueCard issue={selectedIssue} />
          </div>
        )}
      </main>
    </div>
  );
}
