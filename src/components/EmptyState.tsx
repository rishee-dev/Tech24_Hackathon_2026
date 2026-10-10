import { LucideIcon, FileQuestion, MapPin, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    to: string;
  };
  variant?: 'default' | 'search' | 'map';
}

const illustrations = {
  default: (
    <div className="relative">
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border">
        <ClipboardList className="h-10 w-10 text-primary" />
      </div>
    </div>
  ),
  search: (
    <div className="relative">
      <div className="absolute inset-0 bg-muted rounded-full blur-2xl" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 border border-border">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
    </div>
  ),
  map: (
    <div className="relative">
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border">
        <MapPin className="h-10 w-10 text-primary" />
      </div>
    </div>
  ),
};

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  variant = 'default' 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6">
        {Icon ? (
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </div>
        ) : (
          illustrations[variant]
        )}
      </div>
      
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      
      {action && (
        <Link to={action.to}>
          <Button>
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
