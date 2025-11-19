# None-Space Auth Bootstrap Implementation

**Date:** November 15, 2025  
**Status:** ✅ Complete

## Overview

Implements a pre-Finagler "None Space" identity selector that authenticates users with DIS-Core **before** the Finagler app mounts. After identity is validated, Finagler loads normally and drops the user into their corporeal domain.

This creates a clear separation between:
- **None Space** - Outside DIS sovereignty (unauthenticated realm)
- **DIS Universe** - Inside DIS (authenticated, bound to corporeal domain)

## Architecture Flow

```
Cold Open
    ↓
  /api/me → 401
    ↓
Redirect to /none (None Space)
    ↓
User selects identity
    ↓
POST /api/auth/dev-login {user_id}
    ↓
Store user_id in localStorage
    ↓
Redirect to / with X-External-User header
    ↓
/api/me → 200 (authenticated)
    ↓
Finagler loads fully
    ↓
User placed in corporeal domain
```

## Frontend Changes (Finagler)

### 1. `/src/lib/api.js` - Enhanced with Auth

**New Functions:**
```javascript
function getDevUserId() - Retrieves stored user ID from localStorage
export function setDevUserId(userId) - Stores/removes user ID
```

**Enhanced request() function:**
- Adds `credentials: "include"` for cookie support
- Reads `dis_dev_user_id` from localStorage
- Automatically adds `X-External-User` header to all requests
- Global 401 interceptor redirects to `/none` and clears stored user
- `skipAuthCheck` flag for auth endpoints

**New Endpoints:**
```javascript
export const getDevUsers = () => request("/api/auth/dev-users", { skipAuthCheck: true });
export const devLogin = (userId) => 
  request("/api/auth/dev-login", { 
    method: "POST", 
    body: { user_id: userId },
    skipAuthCheck: true 
  });
```

### 2. `/src/routes/NoneSpace.jsx` - Identity Selector

**Purpose:** Pre-authentication UI for selecting a dev user identity

**Features:**
- Fetches available dev users from `/api/auth/dev-users`
- Displays user list with interactive selection
- Calls `/api/auth/dev-login` on selection
- Stores user ID in localStorage via `setDevUserId()`
- Redirects to `/` after successful login
- Dark theme with orange accents
- Loading and error states
- Disabled interaction during login

**UI Elements:**
- Title: "You Are Outside DIS"
- Subtitle: "Select an identity to enter the DIS universe"
- User cards with hover effects
- Loading state: "Logging in as {name}…"
- Footer: "🌌 None Space — The realm outside DIS sovereignty"

### 3. `/src/hooks/useAuthBootstrap.js` - Auth Guard Hook

**Purpose:** Check authentication before mounting main app

**Returns:**
- `booting: boolean` - Initial auth check in progress
- `authed: boolean` - Whether user is authenticated

**Flow:**
1. Calls `/api/me` on mount
2. If 200: User is authenticated
3. If 401: User is not authenticated (redirect handled by api.js)
4. Sets `booting: false` when check completes

### 4. `/src/main.jsx` - Auth Gate & Router

**New Components:**

**AuthGate:**
- Guards the main app from rendering until authenticated
- Shows "Booting DIS…" while checking auth
- Shows `<NoneSpace />` if not authenticated
- Renders `<App />` if authenticated

**Router Setup:**
```jsx
<Router>
  <Routes>
    <Route path="/none" element={<NoneSpace />} />
    <Route path="/*" element={<AuthGate />} />
  </Routes>
</Router>
```

## Backend Changes (dis-core)

### 1. `/internal/auth/dev_handlers.go` - New File

**HandleDevUsers:**
- Endpoint: `GET /api/auth/dev-users`
- Returns list of available dev users
- Hardcoded list: testuser, rick, alice, bob
- Response: `{ users: [{ id, name }] }`
- Header: `X-Dev-Only: true`

**HandleDevLogin:**
- Endpoint: `POST /api/auth/dev-login`
- Request: `{ user_id: string }`
- Validates user_id against allowed list
- Response: `{ ok: true, user_id, message }`
- Does NOT set cookies (uses X-External-User header)

**Dev Users List:**
```go
[]DevUser{
  {ID: "testuser", Name: "Test User"},
  {ID: "rick", Name: "Rick (Admin)"},
  {ID: "alice", Name: "Alice (Developer)"},
  {ID: "bob", Name: "Bob (Viewer)"},
}
```

### 2. `/internal/api/routes.go` - Registered Routes

Added routes after existing auth endpoints:
```go
r.Get("/api/auth/dev-users", auth.HandleDevUsers)   // DEV ONLY: List available dev users
r.Post("/api/auth/dev-login", auth.HandleDevLogin)  // DEV ONLY: Validate dev login
```

## Authentication Flow Details

### Phase 1: Cold Start (Unauthenticated)
1. User opens `http://localhost:5173`
2. `AuthGate` component mounts
3. `useAuthBootstrap()` calls `/api/me`
4. Backend returns 401 (no X-External-User header)
5. Frontend redirects to `/none` (None Space)

### Phase 2: Identity Selection
1. `NoneSpace` component mounts
2. Calls `/api/auth/dev-users` (with `skipAuthCheck: true`)
3. Displays list of dev users
4. User clicks on identity (e.g., "testuser")

### Phase 3: Login & Storage
1. Frontend calls `POST /api/auth/dev-login { user_id: "testuser" }`
2. Backend validates user_id is in allowed list
3. Backend returns `{ ok: true, user_id: "testuser" }`
4. Frontend calls `setDevUserId("testuser")`
5. User ID stored in `localStorage.dis_dev_user_id`
6. Frontend redirects to `/`

### Phase 4: Authenticated App Load
1. `AuthGate` mounts again
2. `useAuthBootstrap()` calls `/api/me`
3. `request()` reads `localStorage.dis_dev_user_id = "testuser"`
4. Adds header: `X-External-User: testuser`
5. Backend middleware reads header, creates ActiveUser
6. Backend resolves corporeal domain binding
7. `/api/me` returns 200 with user identity
8. `AuthGate` renders `<App />` (authenticated)
9. User is placed in corporeal domain

### Phase 5: Subsequent Requests
- All API calls automatically include `X-External-User: testuser` header
- Backend treats requests as authenticated
- If 401 occurs, localStorage is cleared and user redirected to `/none`

## Local Storage

**Key:** `dis_dev_user_id`

**Values:**
- `null` or missing: Not authenticated
- `"testuser"`, `"rick"`, `"alice"`, `"bob"`: Authenticated as that user

**Lifecycle:**
- Set: On successful `/api/auth/dev-login`
- Used: On every API request via `X-External-User` header
- Cleared: On 401 response

## Security Notes

⚠️ **DEV ONLY IMPLEMENTATION**

This is a development-mode authentication system with intentional limitations:

1. **No Real Security:** User IDs stored in localStorage, sent as plain headers
2. **No Encryption:** X-External-User header is unencrypted
3. **No Session Tokens:** No JWT, no secure cookies, no token rotation
4. **Hardcoded Users:** Fixed list of dev users in source code
5. **No Passwords:** No authentication challenge, just user selection

**Production Requirements:**
- Replace with OAuth2/OIDC
- Use secure session cookies with HttpOnly, Secure flags
- Implement JWT with refresh tokens
- Add CSRF protection
- Use proper password hashing if local auth
- Remove `/api/auth/dev-*` endpoints
- Remove `X-Dev-Only` headers

## Visual Design

**None Space Theme:**
- Background: `#000` (pure black)
- Text: `#eee` (light gray)
- Accents: `#ff6b35` (orange)
- Borders: `#444` (dark gray)
- Cards: `#111` (very dark gray)
- Hover: `#1a1a1a` + orange border

**Loading States:**
- "Booting DIS…" with ⚡ icon
- "Loading users…"
- "Logging in as {name}…" (orange text)

**Typography:**
- Headings: 2.5em
- Body: 1.2em
- Cards: 1.1em
- Font: System sans-serif

## Build Status

### Backend (dis-core):
```bash
✓ Build successful: dis-core-auth-bootstrap
✓ New files: internal/auth/dev_handlers.go
✓ Modified: internal/api/routes.go
```

### Frontend (Finagler):
```bash
✓ 1730 modules transformed
✓ built in 6.05s
dist/assets/index-CAF0sZAO.js  327.91 kB │ gzip: 102.69 kB

New files:
- src/routes/NoneSpace.jsx
- src/hooks/useAuthBootstrap.js

Modified:
- src/lib/api.js
- src/main.jsx
```

## Testing

### Start Backend:
```bash
cd /home/rick/dev/DIS/dis-core
./dis-core-auth-bootstrap --schemas=schemas --domains=domains
```

### Start Frontend:
```bash
cd /home/rick/dev/DIS/finagler
npm run dev
```

### Test Flow:
1. Open `http://localhost:5173`
2. Should auto-redirect to `/none` (401 from /api/me)
3. See "You Are Outside DIS" page
4. Click on "Test User (testuser)"
5. Should see "Logging in as Test User…"
6. Should redirect to `/`
7. Finagler app loads fully
8. Check browser DevTools:
   - localStorage: `dis_dev_user_id = "testuser"`
   - Network tab: All requests include `X-External-User: testuser` header

### Test 401 Handling:
1. While logged in, clear localStorage: `localStorage.removeItem("dis_dev_user_id")`
2. Refresh page
3. Should auto-redirect to `/none`

### Test API Endpoints:
```bash
# List dev users (no auth required)
curl http://localhost:8080/api/auth/dev-users

# Expected:
# {"users":[{"id":"testuser","name":"Test User"},{"id":"rick","name":"Rick (Admin)"},...]}

# Dev login (no auth required)
curl -X POST -H "Content-Type: application/json" \
  -d '{"user_id":"testuser"}' \
  http://localhost:8080/api/auth/dev-login

# Expected:
# {"ok":true,"user_id":"testuser","message":"Dev login successful - use X-External-User header"}

# Test authenticated endpoint
curl -H "X-External-User: testuser" http://localhost:8080/api/me

# Expected:
# {"authenticated":true,"bound":true,"corporeal_domain_id":"...","prime_seat_id":"..."}
```

## API Reference

### GET /api/auth/dev-users

**Purpose:** List available development users for None Space selection

**Request:** None

**Response:**
```json
{
  "users": [
    { "id": "testuser", "name": "Test User" },
    { "id": "rick", "name": "Rick (Admin)" },
    { "id": "alice", "name": "Alice (Developer)" },
    { "id": "bob", "name": "Bob (Viewer)" }
  ]
}
```

**Headers:** `X-Dev-Only: true`

**Status Codes:**
- `200 OK`: Success

### POST /api/auth/dev-login

**Purpose:** Validate dev user login (returns success, no session created)

**Request:**
```json
{
  "user_id": "testuser"
}
```

**Response:**
```json
{
  "ok": true,
  "user_id": "testuser",
  "message": "Dev login successful - use X-External-User header"
}
```

**Headers:** `X-Dev-Only: true`

**Status Codes:**
- `200 OK`: Valid user_id
- `400 Bad Request`: Invalid user_id or malformed request

## Integration Points

### With Existing /api/me Endpoint:
- `/api/me` returns user identity when X-External-User header present
- Returns 401 when header missing or invalid
- Auth bootstrap calls this to check authentication status

### With Actor Switching:
- Actor switching works after authentication
- Active actor stored in context (not localStorage)
- X-External-User header identifies the user
- Active actor selected from user's available seats

### With Domain Context:
- After authentication, user loaded into corporeal domain
- Domain CSS and payload loaded normally
- ActAs authority model works as before
- SuperBar displays actor switcher when authenticated

## Future Enhancements

- [ ] Session token system replacing X-External-User header
- [ ] OAuth2/OIDC integration for production
- [ ] Persistent sessions across browser restarts
- [ ] Remember last selected identity
- [ ] User avatars in None Space
- [ ] Recent identities list
- [ ] Multi-factor authentication
- [ ] Audit log for identity switches
- [ ] Rate limiting on login attempts
- [ ] Production user management UI

## Known Limitations

1. **No Session Persistence:** User must re-select identity on browser restart
2. **No Logout UI:** Must clear localStorage manually to "logout"
3. **No User Management:** Hardcoded user list
4. **No Password Protection:** Anyone can select any identity
5. **Local Storage Only:** No server-side session tracking
6. **Header-Based Auth:** X-External-User can be spoofed in dev mode
7. **No CORS Handling:** Assumes same-origin requests

## Related Documentation

- `/finagler/ACTOR_SWITCHING_IMPLEMENTATION.md` - Actor switching UI
- `/dis-core/internal/auth/activeuser.go` - ActiveUser context model
- `/dis-core/internal/auth/middleware.go` - Auth middleware flow
- `/dis-core/internal/auth/handlers.go` - WhoAmI endpoints
