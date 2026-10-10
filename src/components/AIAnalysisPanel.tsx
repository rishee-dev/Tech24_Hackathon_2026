import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { analyzeIssueAPI } from '@/lib/api';

export default function AIAnalysisPanel({ issueId, initial }: { issueId: string; initial?: any }) {
  const [ai, setAi] = useState<any>(initial || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (ai) return; // already have analysis
      setLoading(true);
      try {
        const res = await analyzeIssueAPI(issueId);
        if (!mounted) return;
        setAi(res.aiAnalysis || res);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [issueId]);

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Analyzing with AI...</div>;
  if (error) return <div className="p-4 text-sm text-destructive">AI analysis failed: {error}</div>;
  if (!ai) return <div className="p-4 text-sm text-muted-foreground">No AI analysis available.</div>;

  const severityColor = ai.severity === 'CRITICAL' ? 'bg-destructive text-white' : ai.severity === 'HIGH' ? 'bg-amber-600 text-white' : ai.severity === 'MEDIUM' ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white';

  return (
    <div className="p-4 border border-border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${severityColor}`}>{ai.severity}</div>
          <div className="text-xs text-muted-foreground mt-2">Urgency: <span className="font-medium">{ai.urgencyScore}</span></div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-foreground font-medium">AI Summary</div>
          <div className="text-sm text-muted-foreground">{ai.aiSummary}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Confidence</div>
          <div className="font-medium">{Number(ai.confidence).toFixed(2)}</div>
          <div className="mt-2">
            <div className="text-xs text-muted-foreground">Recommended</div>
            <div className="font-medium">{ai.recommendedAction}</div>
          </div>
        </div>
      </div>

      {ai.severity === 'CRITICAL' && (
        <div className="mt-3 p-3 rounded-md bg-destructive/10 border border-destructive">
          <div className="text-sm font-semibold text-destructive">High priority issue detected by AI</div>
          <div className="text-xs text-muted-foreground">Please review and escalate immediately if necessary.</div>
        </div>
      )}
    </div>
  );
}
