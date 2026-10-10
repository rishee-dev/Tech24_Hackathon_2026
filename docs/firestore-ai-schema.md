Firestore AI schema for issues

When `analyzeIssueWithAI` runs it writes an `aiAnalysis` object into the issue document at `issues/{issueId}`. The field is write-protected (only Cloud Functions / admins) and is not visible to non-admin users per `firestore.rules`.

aiAnalysis schema

- aiAnalysis.category: string
  - One of: `Road`, `Garbage`, `Water`, `Electricity`, `Safety`

- aiAnalysis.severity: string
  - One of: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

- aiAnalysis.urgencyScore: number
  - Integer 0–100

- aiAnalysis.confidence: number
  - Float 0–1

- aiAnalysis.aiSummary: string
  - 1–2 line human-readable summary

- aiAnalysis.recommendedAction: string
  - One of: `AUTO_ACCEPT`, `REVIEW`, `ESCALATE`

- aiAnalysis.analyzedAt: Firestore Timestamp
  - When the analysis was created

Accept flow writes additional fields into the issue document at accept time (admin action):

- aiSeverity: string
- aiConfidence: number
- adminOverride: boolean

Audit logs

- `audit_logs` entries document the AI recommendation and the admin final decision to provide clear human-in-the-loop traceability.

Security

- Only admins and Cloud Functions should be allowed to read/write `aiAnalysis` per `firestore.rules`.
- Clients and regular users must not see AI analysis fields.
