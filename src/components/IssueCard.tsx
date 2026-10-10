import { Issue } from '@/lib/types';
import { StatusBadge, PriorityBadge, CategoryBadge } from './StatusBadge';
import { MapPin, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  compact?: boolean;
}

export function IssueCard({ issue, onClick, compact = false }: IssueCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-card rounded-xl border border-border p-4 transition-all duration-300",
        "hover:shadow-card-hover hover:border-primary/20",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn(
            "font-display font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors",
            compact ? "text-sm" : "text-base"
          )}>
            {issue.title}
          </h3>
          <StatusBadge status={issue.status} />
        </div>

        {/* Image */}
        {!compact && issue.imageUrl && (
          <div className="relative overflow-hidden rounded-lg aspect-video bg-muted">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Description */}
        {!compact && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {issue.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <CategoryBadge category={issue.category} />
          <PriorityBadge priority={issue.priority} />
        </div>

        {/* Meta */}
        <div className={cn(
          "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
          compact ? "pt-1" : "pt-2 border-t border-border"
        )}>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {issue.location.address}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDistanceToNow(issue.reportedAt, { addSuffix: true })}
          </span>
          {!compact && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {issue.reportedBy}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
