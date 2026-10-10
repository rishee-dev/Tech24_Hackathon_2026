const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

async function callGemini(prompt) {
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse && tokenResponse.token;
  if (!accessToken) throw new Error('Unable to obtain access token for Gemini API');
  const model = 'models/gemini-1.5-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta2/${model}:generateText`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: { text: prompt }, maxOutputTokens: 512 }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${txt}`);
  }
  const json = await res.json();
  const cand = json && json.candidates && json.candidates[0];
  const output = (cand && (cand.output || cand.content || (cand.message && cand.message.content && cand.message.content[0] && cand.message.content[0].text))) || JSON.stringify(json);
  return output;
}

async function analyzeIssueNow(issueId) {
  const issueRef = db.collection('issues').doc(issueId);
  const snap = await issueRef.get();
  if (!snap.exists) return null;
  const data = snap.data();
  const existing = data && data.aiAnalysis;
  const now = Date.now();
  if (existing && existing.analyzedAt) {
    try {
      const analyzedAtMs = existing.analyzedAt.toMillis ? existing.analyzedAt.toMillis() : new Date(existing.analyzedAt).getTime();
      if (now - analyzedAtMs < 1000 * 60 * 60 * 24 * 7) return existing;
    } catch (e) {}
  }
  const title = data && data.title || '';
  const description = data && data.description || '';
  const imageUrl = data && data.imageUrl || '';
  const location = data && data.location || {};
  const prompt = `You are an assistant for a civic issue triage system. Analyze the following report and return ONLY valid JSON with keys: category (one of Road / Garbage / Water / Electricity / Safety), severity (LOW|MEDIUM|HIGH|CRITICAL), urgencyScore (0-100 integer), confidence (0-1 number), aiSummary (1-2 short sentences), recommendedAction (AUTO_ACCEPT|REVIEW|ESCALATE).\n\nReport:\nTitle: ${title}\nDescription: ${description}\nLocation: ${JSON.stringify(location)}\nImage: ${imageUrl || 'none'}\n\nRespond strictly with JSON.`;
  let outputText = '';
  try {
    outputText = await callGemini(prompt);
  } catch (e) {
    console.error('callGemini error', e);
    outputText = '' + (e && e.message || '');
  }
  let parsed = null;
  try {
    const first = outputText.indexOf('{');
    const last = outputText.lastIndexOf('}');
    const jsonText = first >= 0 && last >= 0 ? outputText.slice(first, last + 1) : outputText;
    parsed = JSON.parse(jsonText);
  } catch (e) {
    parsed = { category: 'Road', severity: 'MEDIUM', urgencyScore: 50, confidence: 0.2, aiSummary: (outputText || '').slice(0,200), recommendedAction: 'REVIEW' };
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
  await issueRef.set({ aiAnalysis }, { merge: true });
  await db.collection('audit_logs').add({ action: 'AI_ANALYSIS', issueId, aiAnalysis, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return aiAnalysis;
}

app.post('/acceptIssue', async (req, res) => {
  try {
    const authHeader = req.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const role = (decoded && decoded.role) || (decoded && decoded.admin) ? 'ADMIN' : 'USER';
    if (role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden: admin required' });
    const { issueId, aiSeverity, aiConfidence, adminOverride, aiRecommendation, aiSummary } = req.body;
    if (!issueId) return res.status(400).json({ error: 'Missing issueId' });
    const issueRef = db.collection('issues').doc(issueId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(issueRef);
      if (!snap.exists) throw { code: 404, message: 'Issue not found' };
      const data = snap.data();
      const status = data && data.status;
      if (!(status === 'reported' || status === 'pending')) throw { code: 400, message: 'Issue not in pending state' };
      tx.update(issueRef, { status: 'accepted', acceptedBy: decoded.uid, acceptedAt: admin.firestore.FieldValue.serverTimestamp(), aiSeverity: aiSeverity || admin.firestore.FieldValue.delete(), aiConfidence: typeof aiConfidence === 'number' ? aiConfidence : admin.firestore.FieldValue.delete(), adminOverride: !!adminOverride });
      const auditRef = db.collection('audit_logs').doc();
      tx.set(auditRef, { action: 'ACCEPT_ISSUE', issueId, performedBy: decoded.uid, performedAt: admin.firestore.FieldValue.serverTimestamp(), aiRecommendation: aiRecommendation || null, aiSummary: aiSummary || null, aiSeverity: aiSeverity || null, aiConfidence: aiConfidence || null, adminOverride: !!adminOverride });
      const reporterUid = data && data.reportedByUid || null;
      if (reporterUid) {
        const notifRef = db.collection('notifications').doc();
        tx.set(notifRef, { to: reporterUid, issueId, title: 'Your issue has been accepted by authorities', message: `Your issue "${data && data.title}" has been accepted by the city.`, createdAt: admin.firestore.FieldValue.serverTimestamp(), read: false });
      }
    });
    return res.json({ success: true });
  } catch (err) {
    if (err && err.code === 404) return res.status(404).json({ error: err.message });
    if (err && err.code === 400) return res.status(400).json({ error: err.message });
    console.error('acceptIssue error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const api = functions.https.onRequest(app);

exports.api = api;

exports.onIssueCreate = functions.firestore.document('issues/{issueId}').onCreate(async (snap, ctx) => {
  try { await analyzeIssueNow(ctx.params.issueId); } catch (e) { console.error('onIssueCreate analyze error', e); }
});

app.post('/analyzeIssue', async (req, res) => {
  try {
    const { issueId } = req.body;
    if (!issueId) return res.status(400).json({ error: 'Missing issueId' });
    const authHeader = req.get('Authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(idToken);
      const role = (decoded && decoded.role) || (decoded && decoded.admin) ? 'ADMIN' : 'USER';
      if (role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden: admin required' });
    }
    const ai = await analyzeIssueNow(issueId);
    return res.json({ aiAnalysis: ai });
  } catch (err) {
    console.error('analyzeIssue error', err);
    return res.status(500).json({ error: err && err.message || 'Internal error' });
  }
});
