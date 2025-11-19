# Connection Gate Implementation

## Overview
The Connection Gate system monitors DIS-Core connectivity and prevents network requests when the backend is offline. This prevents cascading errors, improves user experience, and enables graceful degradation.

## Architecture

### Components

#### 1. **useDisConnection Hook**
File: `src/hooks/useDisConnection.js`

Monitors backend health via periodic ping:
```javascript
const { offline, lastPing, ping } = useDisConnection();
```

**Features:**
- Pings `/api/ping` every 5 seconds
- Validates JSON response (not just HTTP 200)
- Updates `offline` state automatically
- Exposes `lastPing` timestamp
- Manual `ping()` function for on-demand checks

#### 2. **ConnectionGateProvider**
File: `src/context/ConnectionGateProvider.jsx`

Global context that wraps entire app:
```javascript
<ConnectionGateProvider>
  <App />
</ConnectionGateProvider>
```

**Provides:**
- `offline` (boolean) - Is DIS-Core unreachable?
- `allowRequests` (boolean) - Should network requests proceed?

#### 3. **disFetch Wrapper**
File: `src/utils/disFetch.js`

Replaces `fetch()` for all DIS-Core requests:
```javascript
import { disFetch } from '../utils/disFetch';

// Instead of:
fetch('/api/me', { credentials: 'include' });

// Use:
disFetch('/api/me', { credentials: 'include' });
```

**Behavior:**
- If `allowRequests === false`, immediately rejects with error
- If `allowRequests === true`, forwards to normal `fetch()`
- Automatically includes `credentials: "include"`

#### 4. **PostAuthInitializer**
File: `src/components/auth/PostAuthInitializer.jsx`

Updated to respect connection state:
```javascript
const { offline } = useConnectionGate();

useEffect(() => {
  if (offline) {
    console.warn("[PostAuthInit] DIS-Core offline. Waiting...");
    return; // DO NOT attempt /api/me
  }
  // ... proceed with initialization
}, [offline]);
```

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Finagler App Start                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ ConnectionGateProvider wraps entire app                     │
│ - Starts useDisConnection hook                              │
│ - Pings /api/ping every 5 seconds                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                 ┌──────────┴──────────┐
                 │                     │
        ┌────────▼────────┐   ┌───────▼────────┐
        │   Online        │   │   Offline      │
        │   (200 OK)      │   │   (timeout)    │
        └────────┬────────┘   └───────┬────────┘
                 │                     │
                 ▼                     ▼
        offline = false       offline = true
        allowRequests = true  allowRequests = false
                 │                     │
                 ▼                     ▼
        PostAuthInit runs    PostAuthInit waits
        /api/me called       No requests sent
                 │                     │
                 ▼                     ▼
        User state loaded    Heartbeat continues
        Navigate to domain   Waiting for recovery
```

## Integration Points

### 1. Main App Entry (`main.jsx`)
```javascript
import { ConnectionGateProvider } from "./context/ConnectionGateProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConnectionGateProvider>
      <Router>
        <Routes>
          <Route path="/none" element={<NoneSpace />} />
          <Route path="/*" element={<AuthGate />} />
        </Routes>
      </Router>
    </ConnectionGateProvider>
  </React.StrictMode>
);
```

### 2. PostAuthInitializer
```javascript
import { useConnectionGate } from "../../context/ConnectionGateProvider";

const { offline } = useConnectionGate();

useEffect(() => {
  if (offline) {
    console.warn("⚠️ [PostAuthInit] DIS-Core offline. Waiting...");
    return;
  }
  // ... initialization logic
}, [offline]);
```

### 3. Any Component Making Requests
```javascript
import { disFetch } from "../utils/disFetch";
import { useConnectionGate } from "../context/ConnectionGateProvider";

function MyComponent() {
  const { offline } = useConnectionGate();

  async function loadData() {
    if (offline) {
      console.warn("Cannot load data: DIS-Core offline");
      return;
    }

    const res = await disFetch("/api/my-data");
    // ...
  }
}
```

## Configuration

### Environment Variables
```bash
# .env or .env.local
VITE_API_BASE=http://localhost:8080
```

If not set, defaults to `http://localhost:8080`.

### Ping Interval
Edit `src/hooks/useDisConnection.js`:
```javascript
// Change from 5000 (5 seconds) to desired interval
const t = setInterval(ping, 5000);
```

### Timeout Settings
The `fetch()` API doesn't support native timeouts. To add timeout:
```javascript
// In useDisConnection.js
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

const res = await fetch(`${API_BASE}/api/ping`, {
  method: "GET",
  signal: controller.signal
});
```

## Testing

### Manual Testing
1. **Start dis-core:**
   ```bash
   cd /home/rick/dev/DIS/dis-core
   source .env.postgres
   ./dis-core-connection-gate
   ```

2. **Start Finagler:**
   ```bash
   cd /home/rick/dev/DIS/finagler
   npm run dev
   ```

3. **Open browser:**
   - Navigate to http://localhost:5173
   - Open DevTools console
   - Look for heartbeat logs

4. **Test offline detection:**
   - Stop dis-core (Ctrl+C)
   - Wait 5-10 seconds
   - Console should show: `"DIS-Core offline"`

5. **Test recovery:**
   - Restart dis-core
   - Wait 5-10 seconds
   - Console should show: `"DIS-Core online"`

### Automated Testing
```bash
cd /home/rick/dev/DIS/finagler
./test-connection-gate.sh
```

## Console Logs

### Online State
```
🔐 [useDisConnection] Pinging dis-core...
✅ [useDisConnection] Online (latency: 15ms)
🔐 [PostAuthInit] Fetching authenticated user identity...
✅ [PostAuthInit] User identity loaded: {...}
```

### Offline State
```
❌ [useDisConnection] Ping failed: fetch timeout
⚠️ [useDisConnection] Offline
⚠️ [PostAuthInit] DIS-Core offline. Waiting for connection...
⚠️ [disFetch] Request suppressed: DIS-Core offline
```

### Recovery
```
🔐 [useDisConnection] Pinging dis-core...
✅ [useDisConnection] Reconnected! (offline for 23s)
✅ [useDisConnection] Online
🔐 [PostAuthInit] Connection restored. Resuming initialization...
```

## Security Considerations

### CORS Headers
The `/api/ping` endpoint requires proper CORS configuration:
```go
// internal/cors/middleware.go
w.Header().Set("Access-Control-Allow-Origin", origin)
w.Header().Set("Access-Control-Allow-Credentials", "true")
```

### Rate Limiting
Current ping rate: **5 seconds**

For production, consider:
- Increasing interval to 10-30 seconds
- Exponential backoff when offline
- Pause pinging during user inactivity

### Error Handling
```javascript
try {
  const res = await disFetch('/api/data');
  // ...
} catch (err) {
  if (err.message === "DIS-Core offline: request suppressed") {
    // Show offline UI
  } else {
    // Handle other errors
  }
}
```

## Migration Guide

### Before (Old Pattern)
```javascript
// Direct fetch calls
const res = await fetch('/api/me', { credentials: 'include' });
const data = await res.json();
```

### After (Connection Gate)
```javascript
import { disFetch } from '../utils/disFetch';
import { useConnectionGate } from '../context/ConnectionGateProvider';

const { offline } = useConnectionGate();

if (offline) {
  // Show offline UI
  return <div>DIS-Core offline...</div>;
}

const res = await disFetch('/api/me');
const data = await res.json();
```

## Future Enhancements

- [ ] Exponential backoff for ping retries
- [ ] Offline queue for mutations (retry when online)
- [ ] WebSocket fallback for real-time updates
- [ ] Service Worker for offline caching
- [ ] Network quality indicator (latency, jitter)
- [ ] Automatic retry with configurable limits
- [ ] Toast notifications for connection state changes
- [ ] Metrics dashboard (uptime, latency, failures)

## Related Files

**Frontend:**
- `src/hooks/useDisConnection.js` - Heartbeat monitoring
- `src/context/ConnectionGateProvider.jsx` - Global context
- `src/utils/disFetch.js` - Request wrapper
- `src/components/auth/PostAuthInitializer.jsx` - Updated to respect offline state
- `src/main.jsx` - Provider setup

**Backend:**
- `internal/api/connection.go` - `/api/ping` endpoint
- `internal/api/routes.go` - Route registration
- `internal/cors/middleware.go` - CORS configuration

**Documentation:**
- `test-connection-gate.sh` - Testing guide
- `CONNECTION_GATE.md` - This file

## Troubleshooting

### Ping Always Fails
1. Check dis-core is running: `curl http://localhost:8080/api/ping`
2. Check CORS headers: `./dis-cors-diagnostics.sh`
3. Check VITE_API_BASE environment variable
4. Check browser console for errors

### PostAuthInit Stuck
1. Verify ConnectionGateProvider wraps entire app
2. Check `offline` state in React DevTools
3. Verify useConnectionGate() hook is imported correctly
4. Check dependency array in useEffect includes `offline`

### Requests Still Sent When Offline
1. Ensure all fetch() calls replaced with disFetch()
2. Check useConnectionGate() is called in component
3. Verify ConnectionGateProvider is mounted
4. Check React DevTools for provider hierarchy

## Changelog

### v1.0.0 (2025-11-17)
- Initial Connection Gate implementation
- useDisConnection hook with 5-second heartbeat
- ConnectionGateProvider global context
- disFetch() request wrapper
- PostAuthInitializer offline detection
- Comprehensive documentation and tests
