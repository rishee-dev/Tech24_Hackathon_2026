import { Check, Circle, Clock, Loader2 } from 'lucide-react';
import { IssueStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusStepperProps {
  status: IssueStatus;
  compact?: boolean;
}

const steps = [
  { status: 'reported', label: 'Reported', icon: Clock },
  { status: 'accepted', label: 'Accepted', icon: Check },
  { status: 'in-progress', label: 'In Progress', icon: Loader2 },
  { status: 'resolved', label: 'Resolved', icon: Check },
] as const;

export function StatusStepper({ status, compact = false }: StatusStepperProps) {
  const currentIndex = steps.findIndex(s => s.status === status);

  return (
    <div className={cn("flex items-center", compact ? "gap-1" : "gap-2")}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all duration-300",
                  compact ? "w-6 h-6" : "w-8 h-8",
                  isCompleted && "bg-status-resolved text-white",
                  isCurrent && step.status === 'reported' && "bg-status-reported text-white",
                  isCurrent && step.status === 'accepted' && "bg-status-accepted text-white",
                  isCurrent && step.status === 'in-progress' && "bg-status-in-progress text-white animate-pulse",
                  isCurrent && step.status === 'resolved' && "bg-status-resolved text-white",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                ) : (
                  <Icon className={cn(compact ? "h-3 w-3" : "h-4 w-4", isCurrent && step.status === 'in-progress' && "animate-spin")} />
                )}
              </div>
              {!compact && (
                <span className={cn(
                  "text-xs mt-1 font-medium",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 transition-all duration-300",
                  compact ? "w-4 mx-0.5" : "w-8 mx-1",
                  isCompleted ? "bg-status-resolved" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
