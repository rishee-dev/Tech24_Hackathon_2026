import { cn } from '@/lib/utils';
import { IssueStatus, IssuePriority, IssueCategory, STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from '@/lib/types';
import { 
  Clock, 
  Loader2, 
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Construction,
  Trash2,
  Zap,
  Shield,
  Trees,
  HelpCircle
} from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    reported: {
      icon: Clock,
      className: 'status-reported',
    },
    accepted: {
      icon: CheckCircle2,
      className: 'status-accepted',
    },
    'in-progress': {
      icon: Loader2,
      className: 'status-in-progress',
    },
    resolved: {
      icon: CheckCircle2,
      className: 'status-resolved',
    },
  };

  const { icon: Icon, className: statusClass } = config[status];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      statusClass,
      className
    )}>
      <Icon className={cn('h-3.5 w-3.5', status === 'in-progress' && 'animate-spin')} />
      {STATUS_LABELS[status]}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = {
    low: {
      icon: Info,
      className: 'priority-low',
    },
    medium: {
      icon: AlertCircle,
      className: 'priority-medium',
    },
    high: {
      icon: AlertTriangle,
      className: 'priority-high',
    },
  };

  const { icon: Icon, className: priorityClass } = config[priority];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      priorityClass,
      className
    )}>
      <Icon className="h-3.5 w-3.5" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

interface CategoryBadgeProps {
  category: IssueCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const icons: Record<IssueCategory, React.ComponentType<{ className?: string }>> = {
    roads: Construction,
    sanitation: Trash2,
    utilities: Zap,
    'public-safety': Shield,
    parks: Trees,
    other: HelpCircle,
  };

  const Icon = icons[category];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground',
      className
    )}>
      <Icon className="h-3.5 w-3.5" />
      {CATEGORY_LABELS[category]}
    </span>
  );
}
