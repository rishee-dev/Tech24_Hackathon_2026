"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onIssueCreate = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const google_auth_library_1 = require("google-auth-library");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
admin.initializeApp();
const db = admin.firestore();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Helper: call Google Generative API (Gemini) via service account access token
async function callGemini(prompt) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    // Get access token from metadata via GoogleAuth
    const auth = new google_auth_library_1.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse === null || tokenResponse === void 0 ? void 0 : tokenResponse.token;
    if (!accessToken)
        throw new Error('Unable to obtain access token for Gemini API');
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
    const json = await res.json();
    // Try to extract text from response
    const output = ((_b = (_a = json === null || json === void 0 ? void 0 : json.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.output) || ((_d = (_c = json === null || json === void 0 ? void 0 : json.candidates) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.content) || ((_j = (_h = (_g = (_f = (_e = json === null || json === void 0 ? void 0 : json.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.message) === null || _g === void 0 ? void 0 : _g.content) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.text) || JSON.stringify(json);
    return output;
}
// Analyze helper
async function analyzeIssueNow(issueId) {
    const issueRef = db.collection('issues').doc(issueId);
    const snap = await issueRef.get();
    if (!snap.exists)
        return null;
    const data = snap.data();
    // Cache: if aiAnalysis exists and was created less than 7 days ago, return existing
    const existing = data === null || data === void 0 ? void 0 : data.aiAnalysis;
    const now = Date.now();
    if (existing && existing.analyzedAt && (now - existing.analyzedAt.toMillis ? existing.analyzedAt.toMillis() : new Date(existing.analyzedAt).getTime()) < 1000 * 60 * 60 * 24 * 7) {
        return existing;
    }
    // Build prompt
    const title = (data === null || data === void 0 ? void 0 : data.title) || '';
    const description = (data === null || data === void 0 ? void 0 : data.description) || '';
    const imageUrl = (data === null || data === void 0 ? void 0 : data.imageUrl) || '';
    const location = (data === null || data === void 0 ? void 0 : data.location) || {};
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
    }
    catch (e) {
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
        const role = decoded.role || decoded.admin ? 'ADMIN' : 'USER';
        if (role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: admin required' });
        }
        const { issueId, aiSeverity, aiConfidence, adminOverride, aiRecommendation, aiSummary } = req.body;
        if (!issueId)
            return res.status(400).json({ error: 'Missing issueId' });
        const issueRef = db.collection('issues').doc(issueId);
        await db.runTransaction(async (tx) => {
            const snap = await tx.get(issueRef);
            if (!snap.exists) {
                throw { code: 404, message: 'Issue not found' };
            }
            const data = snap.data();
            const status = data === null || data === void 0 ? void 0 : data.status;
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
            const reporterUid = (data === null || data === void 0 ? void 0 : data.reportedByUid) || null;
            if (reporterUid) {
                const notifRef = db.collection('notifications').doc();
                tx.set(notifRef, {
                    to: reporterUid,
                    issueId,
                    title: 'Your issue has been accepted by authorities',
                    message: `Your issue "${data === null || data === void 0 ? void 0 : data.title}" has been accepted by the city.`,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    read: false,
                });
            }
        });
        return res.json({ success: true });
    }
    catch (err) {
        if ((err === null || err === void 0 ? void 0 : err.code) === 404)
            return res.status(404).json({ error: err.message });
        if ((err === null || err === void 0 ? void 0 : err.code) === 400)
            return res.status(400).json({ error: err.message });
        console.error('acceptIssue error', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.api = functions.https.onRequest(app);
// Firestore trigger: analyze when issue is created
exports.onIssueCreate = functions.firestore.document('issues/{issueId}').onCreate(async (snap, ctx) => {
    const issueId = ctx.params.issueId;
    try {
        await analyzeIssueNow(issueId);
    }
    catch (e) {
        console.error('onIssueCreate analyze error', e);
    }
});
// HTTP endpoint to analyze on-demand (e.g., when admin opens issue details)
app.post('/analyzeIssue', async (req, res) => {
    try {
        const { issueId } = req.body;
        if (!issueId)
            return res.status(400).json({ error: 'Missing issueId' });
        // Optional auth: if token provided, verify admin role for on-demand
        const authHeader = req.get('Authorization') || '';
        if (authHeader.startsWith('Bearer ')) {
            const idToken = authHeader.split('Bearer ')[1];
            const decoded = await admin.auth().verifyIdToken(idToken);
            const role = decoded.role || decoded.admin ? 'ADMIN' : 'USER';
            if (role !== 'ADMIN')
                return res.status(403).json({ error: 'Forbidden: admin required' });
        }
        const ai = await analyzeIssueNow(issueId);
        return res.json({ aiAnalysis: ai });
    }
    catch (err) {
        console.error('analyzeIssue error', err);
        return res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Internal error' });
    }
});
// Proxy route to HERE Routing API: POST /route
// Expects JSON body with `origin`, `destination`, and optional `transportMode` and other query params.
app.post('/route', async (req, res) => {
    try {
        const { origin, destination, transportMode = 'car', ...rest } = req.body || {};
        if (!origin || !destination)
            return res.status(400).json({ error: 'origin and destination required' });
        // Use HERE API key from environment (set in Firebase Functions config or env)
        const apiKey = process.env.HERE_API_KEY || process.env.VITE_HERE_API_KEY || '';
        if (!apiKey)
            return res.status(500).json({ error: 'HERE_API_KEY not configured on server' });
        // Build URL
        const base = 'https://router.hereapi.com/v8/routes';
        const params = new URLSearchParams();
        params.set('transportMode', transportMode);
        params.set('origin', origin);
        params.set('destination', destination);
        // copy any additional accepted parameters
        Object.entries(rest || {}).forEach(([k, v]) => {
            if (v == null)
                return;
            if (Array.isArray(v))
                params.set(k, v.join(','));
            else
                params.set(k, String(v));
        });
        params.set('apiKey', apiKey);
        const url = `${base}?${params.toString()}`;
        const r = await fetch(url, { method: 'GET' });
        const json = await r.json();
        return res.status(r.status).json(json);
    }
    catch (err) {
        console.error('route proxy error', err);
        return res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Internal error' });
    }
});
