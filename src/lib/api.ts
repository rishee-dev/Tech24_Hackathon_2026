export async function acceptIssueAPI(issueId: string, extras?: Record<string, any>): Promise<{ success: boolean; message?: string }> {
  // Try to get Firebase ID token if firebase client is available
  let idToken: string | undefined = undefined;
  // Try a developer-provided global token getter to avoid bundler imports in this repo.
  // In production you should initialize Firebase in the client and expose a function
  // `window.getFirebaseIdToken()` that returns the current user's ID token string.
  try {
    const w: any = window as any;
    if (typeof w.getFirebaseIdToken === 'function') {
      idToken = await w.getFirebaseIdToken();
    }
  } catch (e) {
    // ignore — backend will enforce auth
  }

  const base = (import.meta.env.VITE_FUNCTIONS_BASE_URL as string) || '/api';
  const res = await fetch(`${base}/acceptIssue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ issueId, ...(extras || {}) }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to accept issue');
  }

  return res.json();
}

export async function analyzeIssueAPI(issueId: string): Promise<any> {
  let idToken: string | undefined = undefined;
  try {
    const w: any = window as any;
    if (typeof w.getFirebaseIdToken === 'function') {
      idToken = await w.getFirebaseIdToken();
    }
  } catch (e) {}

  const base = (import.meta.env.VITE_FUNCTIONS_BASE_URL as string) || '/api';
  const res = await fetch(`${base}/analyzeIssue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ issueId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to analyze issue');
  }

  return res.json();
}

export async function getRouteAPI(params: { origin: string; destination: string; transportMode?: string; [key: string]: any }): Promise<any> {
  const res = await fetch('/api/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch route');
  }

  return res.json();
}
