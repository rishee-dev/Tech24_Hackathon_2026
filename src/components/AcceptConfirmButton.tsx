import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Issue } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { acceptIssueAPI } from '@/lib/api';

export function AcceptConfirmButton({
  issue,
  onSuccess,
  onClose,
}: {
  issue: Issue | null;
  onSuccess: (issueId: string) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!issue) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      // include AI data and adminOverride flag when present
      const ai = (issue as any)?.aiAnalysis || null;
      const adminOverride = !!(ai && (ai.recommendedAction === 'REVIEW' || ai.recommendedAction === 'ESCALATE'));
      // If AI recommends ESCALATE, show confirm to the admin before proceeding
      if (ai && ai.recommendedAction === 'ESCALATE') {
        const ok = window.confirm(`AI suggests: ESCALATE. Do you want to accept?`);
        if (!ok) {
          setLoading(false);
          return;
        }
      }

      await acceptIssueAPI(issue.id, {
        aiSeverity: ai?.severity,
        aiConfidence: ai?.confidence,
        aiRecommendation: ai?.recommendedAction,
        aiSummary: ai?.aiSummary,
        adminOverride,
      });
      toast({ title: 'Issue accepted successfully' });
      onSuccess(issue.id);
      onClose();
    } catch (err: any) {
      toast({ title: 'Error accepting issue', description: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
      <Button onClick={handleAccept} className="ml-2" disabled={loading}>
        {loading ? 'Accepting...' : 'Confirm Accept'}
      </Button>
    </>
  );
}

export default AcceptConfirmButton;
