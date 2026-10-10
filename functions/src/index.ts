import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleAuth } from 'google-auth-library';
import express from 'express';
import cors from 'cors';

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Helper: call Google Generative API (Gemini) via service account access token
async function callGemini(prompt: string) {
  // Get access token from metadata via GoogleAuth
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;

  if (!accessToken) throw new Error('Unable to obtain access token for Gemini API');

  // Use Vertex Generative Language REST API
  const model = 'models/gemini-1.5-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta2/${model}:generateText`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: {
        text: prompt,
      },
      // limit tokens
      maxOutputTokens: 512,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${txt}`);
  }

  const json: any = await res.json();
  // Try to extract text from response
  const output = json?.candidates?.[0]?.output || json?.candidates?.[0]?.content || json?.candidates?.[0]?.message?.content?.[0]?.text || JSON.stringify(json);
  return output;
}

// Analyze helper
async function analyzeIssueNow(issueId: string) {
  const issueRef = db.collection('issues').doc(issueId);
  const snap = await issueRef.get();
  if (!snap.exists) return null;
  const data = snap.data();

  // Cache: if aiAnalysis exists and was created less than 7 days ago, return existing
  const existing = data?.aiAnalysis;
  const now = Date.now();
  if (existing && existing.analyzedAt && (now - existing.analyzedAt.toMillis ? existing.analyzedAt.toMillis() : new Date(existing.analyzedAt).getTime()) < 1000 * 60 * 60 * 24 * 7) {
    return existing;
  }

  // Build prompt
  const title = data?.title || '';
  const description = data?.description || '';
  const imageUrl = data?.imageUrl || '';
  const location = data?.location || {};

  const prompt = `You are an assistant for a civic issue triage system. Analyze the following report and return ONLY valid JSON with keys: category (one of Road / Garbage / Water / Electricity / Safety), severity (LOW|MEDIUM|HIGH|CRITICAL), urgencyScore (0-100 integer), confidence (0-1 number), aiSummary (1-2 short sentences), recommendedAction (AUTO_ACCEPT|REVIEW|ESCALATE).\n\nReport:\nTitle: ${title}\nDescription: ${description}\nLocation: ${JSON.stringify(location)}\nImage: ${imageUrl || 'none'}\n\nRespond strictly with JSON.`;

  const outputText = await callGemini(prompt);

  // Try to parse JSON from outputText
  let parsed = null;
  try {
    // find first { to last }
    const first = outputText.indexOf('{');
    const last = outputText.lastIndexOf('}');
    const jsonText = first >= 0 && last >= 0 ? outputText.slice(first, last + 1) : outputText;
    parsed = JSON.parse(jsonText);
  } catch (e) {
    // fallback: create low-confidence review recommendation
    parsed = {
      category: 'Road',
      severity: 'MEDIUM',
      urgencyScore: 50,
      confidence: 0.2,
      aiSummary: outputText.slice(0, 200),
      recommendedAction: 'REVIEW',
    };
  }

  const aiAnalysis = {
    category: parsed.category,
    severity: parsed.severity,
    urgencyScore: Number(parsed.urgencyScore || 0),
    confidence: Number(parsed.confidence || 0),
    aiSummary: String(parsed.aiSummary || parsed.summary || ''),
    recommendedAction: parsed.recommendedAction || 'REVIEW',
    analyzedAt: admin.firestore.Timestamp.now(),
  };

  // Save to Firestore
  await issueRef.set({ aiAnalysis }, { merge: true });

  // Audit log
  await db.collection('audit_logs').add({
    action: 'AI_ANALYSIS',
    issueId,
    aiAnalysis,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return aiAnalysis;
}
// POST /acceptIssue
app.post('/acceptIssue', async (req, res) => {
  try {
    const authHeader = req.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Role check: prefer custom claim 'role' === 'ADMIN' or admin === true
    const role = (decoded as any).role || (decoded as any).admin ? 'ADMIN' : 'USER';
    if (role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: admin required' });
    }

    const { issueId, aiSeverity, aiConfidence, adminOverride, aiRecommendation, aiSummary } = req.body;
    if (!issueId) return res.status(400).json({ error: 'Missing issueId' });

    const issueRef = db.collection('issues').doc(issueId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(issueRef);
      if (!snap.exists) {
        throw { code: 404, message: 'Issue not found' };
      }
      const data = snap.data();
      const status = data?.status;
      // Accept only if status is 'reported' or 'pending'
      if (!(status === 'reported' || status === 'pending')) {
        throw { code: 400, message: 'Issue not in pending state' };
      }

      tx.update(issueRef, {
        status: 'accepted',
        acceptedBy: decoded.uid,
        acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        aiSeverity: aiSeverity || admin.firestore.FieldValue.delete(),
        aiConfidence: typeof aiConfidence === 'number' ? aiConfidence : admin.firestore.FieldValue.delete(),
        adminOverride: !!adminOverride,
      });

      // Audit log
      const auditRef = db.collection('audit_logs').doc();
      tx.set(auditRef, {
        action: 'ACCEPT_ISSUE',
        issueId,
        performedBy: decoded.uid,
        performedAt: admin.firestore.FieldValue.serverTimestamp(),
        aiRecommendation: aiRecommendation || null,
        aiSummary: aiSummary || null,
        aiSeverity: aiSeverity || null,
        aiConfidence: aiConfidence || null,
        adminOverride: !!adminOverride,
      });

      // Notify reporter (write a notification document)
      const reporterUid = data?.reportedByUid || null;
      if (reporterUid) {
        const notifRef = db.collection('notifications').doc();
        tx.set(notifRef, {
          to: reporterUid,
          issueId,
          title: 'Your issue has been accepted by authorities',
          message: `Your issue "${data?.title}" has been accepted by the city.`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
        });
      }
    });

    return res.json({ success: true });
  } catch (err: any) {
    if (err?.code === 404) return res.status(404).json({ error: err.message });
    if (err?.code === 400) return res.status(400).json({ error: err.message });
    console.error('acceptIssue error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const api = functions.https.onRequest(app);

// Firestore trigger: analyze when issue is created
export const onIssueCreate = functions.firestore.document('issues/{issueId}').onCreate(async (snap, ctx) => {
  const issueId = ctx.params.issueId;
  try {
    await analyzeIssueNow(issueId);
  } catch (e) {
    console.error('onIssueCreate analyze error', e);
  }
});

// HTTP endpoint to analyze on-demand (e.g., when admin opens issue details)
app.post('/analyzeIssue', async (req, res) => {
  try {
    const { issueId } = req.body;
    if (!issueId) return res.status(400).json({ error: 'Missing issueId' });

    // Optional auth: if token provided, verify admin role for on-demand
    const authHeader = req.get('Authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(idToken);
      const role = (decoded as any).role || (decoded as any).admin ? 'ADMIN' : 'USER';
      if (role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden: admin required' });
    }

    const ai = await analyzeIssueNow(issueId);
    return res.json({ aiAnalysis: ai });
  } catch (err: any) {
    console.error('analyzeIssue error', err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
});

// Proxy route to HERE Routing API: POST /route
// Expects JSON body with `origin`, `destination`, and optional `transportMode` and other query params.
app.post('/route', async (req, res) => {
  try {
    const { origin, destination, transportMode = 'car', ...rest } = req.body || {};
    if (!origin || !destination) return res.status(400).json({ error: 'origin and destination required' });

    // Use HERE API key from environment (set in Firebase Functions config or env)
    const apiKey = process.env.HERE_API_KEY || process.env.VITE_HERE_API_KEY || '';
    if (!apiKey) return res.status(500).json({ error: 'HERE_API_KEY not configured on server' });

    // Build URL
    const base = 'https://router.hereapi.com/v8/routes';
    const params = new URLSearchParams();
    params.set('transportMode', transportMode);
    params.set('origin', origin);
    params.set('destination', destination);
    // copy any additional accepted parameters
    Object.entries(rest || {}).forEach(([k, v]) => {
      if (v == null) return;
      if (Array.isArray(v)) params.set(k, v.join(','));
      else params.set(k, String(v));
    });
    params.set('apiKey', apiKey);

    const url = `${base}?${params.toString()}`;

    const r = await fetch(url, { method: 'GET' });
    const json = await r.json();
    return res.status(r.status).json(json);
  } catch (err: any) {
    console.error('route proxy error', err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
});
