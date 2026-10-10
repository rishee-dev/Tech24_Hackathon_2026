import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  variant = 'default' 
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    primary: 'bg-primary/5 border-primary/20',
    success: 'bg-status-resolved/10 border-status-resolved/20',
    warning: 'bg-status-reported/10 border-status-reported/20',
    danger: 'bg-destructive/10 border-destructive/20',
  };

  const iconStyles = {
    default: 'bg-secondary text-secondary-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-status-resolved/20 text-status-resolved',
    warning: 'bg-status-reported/20 text-status-reported',
    danger: 'bg-destructive/20 text-destructive',
  };

  return (
    <div className={cn(
      "rounded-xl border p-5 transition-all duration-200 hover:shadow-card",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="font-display text-3xl font-bold text-foreground">{value}</span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend.positive ? "text-status-resolved" : "text-destructive"
            )}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </span>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
