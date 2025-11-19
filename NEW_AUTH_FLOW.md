# New Authentication Flow (AuthGate + useMe)

## Overview
Replaced the old PostAuthInitializer pattern with a cleaner AuthGate component that uses the useMe hook for automatic authentication state management.

## Architecture

### Components

#### 1. **useMe Hook**
File: `src/hooks/useMe.js`

Automatically fetches user identity from `/api/me` when online:
```javascript
const { me, loading, error } = useMe(offline);
```

**Features:**
- Automatic fetch on mount
- Respects `offline` state (waits for connection)
- Handles 401 (not authenticated) gracefully
- Returns `{ authenticated: false }` for unauthenticated users
- Cleanup on unmount (prevents memory leaks)

**States:**
- `me` - User object or `{ authenticated: false }`
- `loading` - Boolean (true while fetching)
- `error` - Error object if fetch fails

#### 2. **AuthGate Component**
File: `src/components/auth/AuthGate.jsx`

Central authentication guard that orchestrates the entire auth flow:

**Decision Tree:**
```
offline?          → DisconnectedView (show offline message)
loading || !me?   → LoadingScreen (show loading spinner)
error?            → NoneSpace (authentication UI)
!authenticated?   → NoneSpace (authentication UI)
authenticated?    → DisCorePayloadView (main app)
```

**Responsibilities:**
- Check connection state (via ConnectionGate)
- Fetch user identity (via useMe)
- Set active user in context
- Load domains list
- Set corporeal domain as active
- Navigate to corporeal domain
- Render appropriate view based on state

#### 3. **Status Components**

**DisconnectedView** (`src/components/status/DisconnectedView.jsx`)
- Shown when DIS-Core is offline
- Displays "DIS-Core Offline" message
- Pulsing animation indicator

**LoadingScreen** (`src/components/status/LoadingScreen.jsx`)
- Shown while loading user identity
- Simple "Loading DIS..." message
- Lightning bolt icon

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ App Mounts                                                   │
│ - ConnectionGateProvider starts ping loop                   │
│ - All contexts initialized (ActiveUser, Domain, etc.)       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ AuthGate Renders                                             │
│ - Gets offline state from ConnectionGate                    │
│ - Calls useMe(offline)                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
       ┌────────▼────────┐    ┌────────▼────────┐
       │ offline = true  │    │ offline = false │
       └────────┬────────┘    └────────┬────────┘
                │                       │
                ▼                       ▼
        DisconnectedView        useMe fetches /api/me
                                        │
                          ┌─────────────┴─────────────┐
                          │                           │
                 ┌────────▼────────┐        ┌────────▼────────┐
                 │ 401 Unauthorized│        │ 200 OK          │
                 │ authenticated:  │        │ User data       │
                 │ false           │        │ returned        │
                 └────────┬────────┘        └────────┬────────┘
                          │                           │
                          ▼                           ▼
                     NoneSpace               AuthGate useEffect
                     (login UI)              - setActiveUser(me)
                                            - loadDomains()
                                            - setActiveDomainId()
                                            - navigate to domain
                                                      │
                                                      ▼
                                            DisCorePayloadView
                                            (main app)
```

## Migration from Old Pattern

### Before (PostAuthInitializer)
```javascript
// App.jsx
<PostAuthInitializer />
<DisCorePayloadView />

// PostAuthInitializer.jsx
useEffect(() => {
  if (offline) return;
  // manual fetch logic
  fetch("/api/me")...
}, [offline]);
```

### After (AuthGate + useMe)
```javascript
// App.jsx
<AuthGate />

// AuthGate.jsx
const { me, loading, error } = useMe(offline);
// declarative rendering based on state
```

## Benefits

### 1. **Cleaner Separation of Concerns**
- `useMe` - Data fetching
- `AuthGate` - Routing/rendering logic
- Status components - UI presentation

### 2. **Better Error Handling**
- Explicit error state in useMe
- Graceful fallback to NoneSpace on error
- Offline detection prevents failed requests

### 3. **Automatic Reactivity**
- useMe automatically re-fetches when `offline` changes
- No manual dependency tracking
- Cleanup on unmount prevents memory leaks

### 4. **Simpler Testing**
- useMe hook can be tested in isolation
- AuthGate logic is pure (no side effects in render)
- Status components are simple presentational

### 5. **Better UX**
- Explicit offline state (DisconnectedView)
- Loading state while fetching (LoadingScreen)
- Immediate feedback on authentication status

## Code Structure

```
src/
├── hooks/
│   └── useMe.js              (automatic /api/me fetching)
├── components/
│   ├── auth/
│   │   └── AuthGate.jsx      (central auth orchestration)
│   └── status/
│       ├── DisconnectedView.jsx
│       └── LoadingScreen.jsx
├── context/
│   ├── ConnectionGateProvider.jsx  (offline detection)
│   ├── ActiveUserContext.jsx       (user state)
│   └── DomainContext.jsx           (domain state)
└── app/
    └── App.jsx               (context providers + AuthGate)
```

## Usage Example

### Basic Auth Check
```javascript
import { useMe } from "../hooks/useMe";
import { useConnectionGate } from "../context/ConnectionGateProvider";

function MyComponent() {
  const { offline } = useConnectionGate();
  const { me, loading } = useMe(offline);

  if (loading) return <div>Loading...</div>;
  if (!me?.authenticated) return <div>Please log in</div>;

  return <div>Hello, {me.display_name}!</div>;
}
```

### Protected Route
```javascript
function ProtectedRoute({ children }) {
  const { offline } = useConnectionGate();
  const { me } = useMe(offline);

  if (!me?.authenticated) {
    return <Navigate to="/none" />;
  }

  return children;
}
```

## Testing

### Manual Testing
1. **Start servers:**
   ```bash
   # Terminal 1
   cd /home/rick/dev/DIS/dis-core
   source .env.postgres
   ./dis-core-connection-gate

   # Terminal 2
   cd /home/rick/dev/DIS/finagler
   npm run dev
   ```

2. **Test offline detection:**
   - Stop dis-core (Ctrl+C)
   - Browser should show DisconnectedView
   - Restart dis-core
   - Should auto-recover and show LoadingScreen → main app

3. **Test authentication:**
   - Clear cookies (DevTools → Application → Cookies)
   - Reload page
   - Should show NoneSpace (login UI)
   - Log in via dev mode
   - Should navigate to corporeal domain

### Console Logs
```
🔐 [useDisConnection] Pinging dis-core...
✅ [useDisConnection] Online
⏳ [AuthGate] Loading user identity...
✅ [AuthGate] User authenticated: { authenticated: true, ... }
🔐 [AuthGate] Loading domains...
🔐 [AuthGate] Setting active domain: abc-123-def
🔐 [AuthGate] Navigating to domain...
✅ [AuthGate] Authenticated, showing main app
```

## Configuration

### Ping Interval
Edit `src/hooks/useDisConnection.js`:
```javascript
const t = setInterval(ping, 5000); // 5 seconds
```

### Retry Logic
Edit `src/hooks/useMe.js` to add retries:
```javascript
const maxRetries = 3;
let retries = 0;

async function fetchMe() {
  try {
    // ... fetch logic
  } catch (err) {
    if (retries < maxRetries) {
      retries++;
      setTimeout(fetchMe, 1000 * retries); // exponential backoff
    } else {
      setError(err);
    }
  }
}
```

## Troubleshooting

### useMe Always Returns Loading
1. Check dis-core is running: `curl http://localhost:8080/api/ping`
2. Check CORS headers: `./dis-cors-diagnostics.sh`
3. Check browser console for errors
4. Verify ConnectionGate is mounted

### AuthGate Stuck in Loading State
1. Verify `offline` prop is false
2. Check `/api/me` returns 200: `curl -i http://localhost:8080/api/me`
3. Verify useMe hook is called with correct `offline` value
4. Check React DevTools for component state

### Navigation Not Working
1. Verify `corporeal_domain_id` exists in user object
2. Check `loadDomains()` succeeds (console logs)
3. Verify `react-router-dom` is installed and Router wraps app
4. Check navigate function from useNavigate is available

## Future Enhancements

- [ ] Automatic retry with exponential backoff
- [ ] Refresh token support
- [ ] Multi-factor authentication
- [ ] Session timeout detection
- [ ] Background token refresh
- [ ] Remember me / persistent login
- [ ] OAuth integration
- [ ] SSO support

## Related Files

**Hooks:**
- `src/hooks/useMe.js`
- `src/hooks/useDisConnection.js`

**Components:**
- `src/components/auth/AuthGate.jsx`
- `src/components/status/DisconnectedView.jsx`
- `src/components/status/LoadingScreen.jsx`
- `src/routes/NoneSpace.jsx`

**Context:**
- `src/context/ConnectionGateProvider.jsx`
- `src/context/ActiveUserContext.jsx`
- `src/context/DomainContext.jsx`

**Documentation:**
- `NEW_AUTH_FLOW.md` (this file)
- `CONNECTION_GATE.md`
- `POST_AUTH_INIT.md` (deprecated)

## Changelog

### v2.0.0 (2025-11-17)
- ✅ Replaced PostAuthInitializer with AuthGate + useMe pattern
- ✅ Created DisconnectedView and LoadingScreen components
- ✅ Automatic offline detection and recovery
- ✅ Cleaner separation of concerns
- ✅ Better error handling
- ✅ Simplified authentication flow
- ✅ Build successful: 351.66 kB (gzip: 110.56 kB)
