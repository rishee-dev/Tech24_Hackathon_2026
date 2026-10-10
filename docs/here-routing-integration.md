Integration guide: HERE Routing API

Overview
This project now includes a server-side proxy endpoint at `POST /api/route` implemented in Cloud Functions. The proxy calls the HERE Routing API on behalf of the client so the HERE API key is never exposed in the browser.

How it works
- Frontend calls `getRouteAPI({ origin, destination, transportMode })`.
- Backend `/api/route` reads `process.env.HERE_API_KEY` and forwards the request to `https://router.hereapi.com/v8/routes`.

Setup
1. Store your HERE API key in the Functions environment:
   - Locally with emulator: set the environment variable before starting the emulator, or use `firebase functions:config:set here.key="YOUR_KEY"` and `firebase deploy --only functions`.
   - In production: set `HERE_API_KEY` in your cloud Functions environment or use Firebase project config.

Examples
Frontend call using the helper:

```ts
import { getRouteAPI } from '@/lib/api';

const res = await getRouteAPI({
  origin: '52.5160,13.3779',
  destination: '52.5206,13.3862',
  transportMode: 'car',
  // optional: additional HERE query params like 'return', 'routingMode'
});
console.log(res);
```

Security
- Do NOT store `HERE_API_KEY` in client-side env vars. Use the server-side config only.

Notes
- The proxy supports additional query params; check `router_api.yaml` for supported parameters and pass them in the body.
