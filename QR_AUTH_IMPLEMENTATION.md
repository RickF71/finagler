# DIS QR Auth Flow Implementation

**Date:** November 15, 2025  
**Status:** ✅ Complete

## Overview

Implements a **Finagler-agnostic** QR-based challenge/response authentication flow. The browser displays a QR code, the user scans it with their phone (or any external agent), and authentication completes out-of-band. Finagler never knows or cares *how* authentication happened—it just waits for DIS-Core to mark the session as authenticated.

## Key Principle: Auth-Method Agnostic

From Finagler's perspective:
1. Call `/api/auth/challenge` → get `challenge_id` + `qr_payload`
2. Display QR code (or any UI representation)
3. Poll `/api/auth/challenge/:id/status` until `status === "authenticated"`
4. Redirect to app when authenticated

**How the challenge is fulfilled is irrelevant to Finagler:**
- QR scan on phone
- Hardware token
- Biometric auth
- Password + PAIN
- Invite flow
- Any future auth method

## Architecture

```
┌─────────────┐                    ┌─────────────┐
│   Browser   │                    │  DIS-Core   │
│  (Finagler) │                    │   Backend   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ 1. POST /api/auth/challenge      │
       │─────────────────────────────────>│
       │                                  │
       │ {challenge_id, qr_payload}       │
       │<─────────────────────────────────│
       │                                  │
       │ 2. Display QR Code               │
       │    + Start Polling               │
       │                                  │
       │                           ┌──────┴──────┐
       │                           │    Phone    │
       │                           │  (External) │
       │                           └──────┬──────┘
       │                                  │
       │                  3. Scan QR      │
       │                  4. Authenticate │
       │                  5. POST /qr-complete
       │                                  │
       │                           {challenge_id, user_id}
       │                                  │
       │<─────────────────────────────────┤
       │  Status polling returns:         │
       │  "authenticated"                 │
       │                                  │
       │ 6. Redirect to /                 │
       │ 7. GET /api/me → 200             │
       │ 8. Load Finagler app             │
       │                                  │
```

## Database Schema

### Table: `auth_challenges`

```sql
CREATE TABLE auth_challenges (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    browser_session_id  TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'pending' 
                        CHECK (status IN ('pending', 'authenticated', 'expired')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at          TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
    redeemed_by         TEXT,
    payload             JSONB DEFAULT '{}'::jsonb
);
```

**Indexes:**
- `idx_auth_challenges_browser_session` on `browser_session_id`
- `idx_auth_challenges_status` on `status`
- `idx_auth_challenges_expires_at` on `expires_at`

**Purpose:**
- Tracks authentication challenges for QR flow
- Links browser sessions to auth challenges
- Expires challenges after 10 minutes
- Records which user completed each challenge

## Backend Implementation (dis-core)

### Files Created

#### 1. `db/migrations/20251115_add_auth_challenges.sql`
- Creates `auth_challenges` table
- Adds indexes for performance
- Comments document Phase 9C integration

#### 2. `internal/auth/challenge.go`
**Models:**
- `AuthChallenge` - Challenge data structure
- `ChallengeStatus` - Status response

**Functions:**
```go
CreateAuthChallenge(ctx, db, browserSessionID) (*AuthChallenge, error)
GetChallengeStatus(ctx, db, challengeID) (*ChallengeStatus, error)
CompleteChallenge(ctx, db, challengeID, userID) error
GetAuthenticatedUser(ctx, db, browserSessionID) (string, bool, error)
```

**QR Payload Format:**
```
dis-auth://challenge/<uuid>
```

**Auto-Expiration:**
- Checks `expires_at` when polling status
- Auto-marks expired challenges

#### 3. `internal/auth/challenge_handlers.go`
**Handlers:**
- `HandleCreateChallenge(db)` - POST /api/auth/challenge
- `HandleChallengeStatus(db)` - GET /api/auth/challenge/:id/status
- `HandleCompleteChallenge(db)` - POST /api/auth/qr-complete

**Session Management:**
- `getBrowserSessionID(r, w)` - Get or create session cookie
- Sets `dis_browser_session` cookie (7 day expiry)
- HttpOnly, SameSite=Lax for security

### Files Modified

#### 1. `internal/auth/middleware.go`
**Enhanced `ExternalAuthMiddleware`:**
- Now accepts `db *pgxpool.Pool` parameter
- Checks X-External-User header (dev mode)
- Falls back to `dis_browser_session` cookie (QR mode)
- Calls `GetAuthenticatedUser()` to resolve session

**Flow:**
```go
1. Try X-External-User header
2. If not found, check dis_browser_session cookie
3. If cookie exists, lookup authenticated challenge
4. Set ActiveUser with resolved user_id
5. Continue to ActiveUserResolverMiddleware
```

#### 2. `internal/api/routes.go`
**New Routes:**
```go
r.Post("/api/auth/challenge", auth.HandleCreateChallenge(s.db))
r.Get("/api/auth/challenge/{id}/status", auth.HandleChallengeStatus(s.db))
r.Post("/api/auth/qr-complete", auth.HandleCompleteChallenge(s.db))
```

#### 3. `internal/api/middleware/chain.go`
**Updated Middleware Registration:**
```go
r.Use(auth.ExternalAuthMiddleware(pool)) // Now passes db
r.Use(auth.ActiveUserResolverMiddleware(pool))
```

## Frontend Implementation (Finagler)

### Files Modified

#### 1. `src/lib/api.js`
**New Functions:**
```javascript
export const createAuthChallenge = () => 
  request("/api/auth/challenge", { method: "POST", skipAuthCheck: true });

export const getChallengeStatus = (challengeId) => 
  request(`/api/auth/challenge/${challengeId}/status`, { skipAuthCheck: true });

export const completeChallenge = (challengeId, userId) => 
  request("/api/auth/qr-complete", { 
    method: "POST", 
    body: { challenge_id: challengeId, user_id: userId },
    skipAuthCheck: true 
  });
```

#### 2. `src/routes/NoneSpace.jsx`
**Complete Rewrite:**
- Two modes: `"qr"` (default) and `"dev-users"` (fallback)
- QR mode: Creates challenge, displays QR, polls status
- Dev mode: Original user selection UI (for testing)
- Mode switcher button for convenience

**QR Mode Flow:**
1. `createAuthChallenge()` on mount
2. Display QR code with `<QRCodeSVG>`
3. Poll `getChallengeStatus()` every 3 seconds
4. Show success animation when authenticated
5. Redirect to `/` after 1 second

**Visual States:**
- Pending: QR code + pulsing indicator
- Authenticated: ✅ + success message
- Expired: Error message + retry button

### Package Added

```bash
npm install qrcode.react
```

**Usage:**
```jsx
import { QRCodeSVG } from "qrcode.react";

<QRCodeSVG value={qrPayload} size={256} />
```

## API Reference

### POST /api/auth/challenge

**Purpose:** Create a new authentication challenge

**Request:** Empty body `{}`

**Response:**
```json
{
  "challenge_id": "550e8400-e29b-41d4-a716-446655440000",
  "qr_payload": "dis-auth://challenge/550e8400-e29b-41d4-a716-446655440000"
}
```

**Side Effects:**
- Creates challenge in database
- Sets `dis_browser_session` cookie if not exists
- Challenge expires in 10 minutes

### GET /api/auth/challenge/:id/status

**Purpose:** Poll challenge authentication status

**Parameters:**
- `:id` - Challenge UUID

**Response:**
```json
{
  "status": "pending" | "authenticated" | "expired"
}
```

**Behavior:**
- Returns current status
- Auto-marks expired if past `expires_at`
- Poll interval: Every 3 seconds (recommended)

### POST /api/auth/qr-complete

**Purpose:** Complete challenge (called by phone/external agent)

**Request:**
```json
{
  "challenge_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "testuser"
}
```

**Response:**
```json
{
  "ok": true
}
```

**Validation:**
- Challenge must exist
- Challenge must be `pending` (not already used)
- Challenge must not be expired
- `user_id` must be provided (TODO: validate against DIS users)

**Side Effects:**
- Marks challenge as `authenticated`
- Sets `redeemed_by` to `user_id`
- Browser session now bound to `user_id`

## Testing

### Start Backend:
```bash
cd /home/rick/dev/DIS/dis-core
./dis-core-qr-auth --schemas=schemas --domains=domains
```

### Start Frontend:
```bash
cd /home/rick/dev/DIS/finagler
npm run dev
```

### Test QR Flow (Manual):

1. **Open browser:** http://localhost:5173
2. **See QR code** displayed in None Space
3. **Open browser console** and find challenge_id (logged)
4. **Simulate phone scan** with test script:
   ```bash
   ./test_qr_auth_complete.sh <challenge_id> testuser
   ```
5. **Browser auto-detects** authentication within 3 seconds
6. **Success animation** plays
7. **Redirects to Finagler** app

### Test Script: `test_qr_auth_complete.sh`

```bash
# Usage
./test_qr_auth_complete.sh <challenge_id> [user_id]

# Example
./test_qr_auth_complete.sh 550e8400-e29b-41d4-a716-446655440000 testuser
```

**Output:**
```
📱 Simulating Phone-Side QR Auth Completion
============================================

Challenge ID: 550e8400-e29b-41d4-a716-446655440000
User ID: testuser

🔐 Completing auth challenge...
Response: {"ok":true}

✅ Challenge completed successfully!

The browser should now:
  1. Detect authenticated status
  2. Show success message
  3. Redirect to Finagler app

Browser session is now bound to user: testuser
```

### Test Dev Mode Fallback:

1. In None Space, click **"Dev Mode: Manual Login"**
2. Select user from list (e.g., "Test User (testuser)")
3. Logs in using X-External-User header (old flow)
4. Redirects to Finagler app

## Session Management

### Browser Session Cookie

**Name:** `dis_browser_session`  
**Value:** UUID (generated on first challenge creation)  
**Attributes:**
- `Path=/`
- `MaxAge=604800` (7 days)
- `HttpOnly=true`
- `SameSite=Lax`

**Purpose:**
- Links browser to auth challenges
- Persists across page reloads
- Enables session-based authentication

### Authentication Modes

**Mode 1: X-External-User Header (Dev)**
- Explicit user ID in header
- Used by dev mode login
- No session cookie required
- User ID stored in localStorage

**Mode 2: Session Cookie (QR)**
- Browser session bound to challenge
- User ID resolved from authenticated challenge
- No localStorage needed
- Cookie persists for 7 days

**Priority:** Header takes precedence over cookie

## Security Considerations

### Current Implementation (Dev Mode)

⚠️ **Not Production-Ready**

- No CSRF protection on challenge endpoints
- Session cookies not Secure-flagged (allow HTTP)
- No rate limiting on challenge creation
- No user validation on `qr-complete`
- Challenges expire after 10 minutes (configurable)
- No audit logging

### Production Requirements

- [ ] Add HTTPS/Secure cookie flag
- [ ] Implement CSRF tokens
- [ ] Rate limit challenge creation (per IP)
- [ ] Validate user_id exists in DIS
- [ ] Add audit log for auth events
- [ ] Implement challenge attempt limits
- [ ] Add device fingerprinting
- [ ] Encrypt QR payload
- [ ] Add challenge signatures
- [ ] Implement session rotation

## Integration with Existing Systems

### Compatible with Dev Auth:
- X-External-User header still works
- localStorage-based dev login preserved
- Mode switcher allows fallback

### Compatible with Actor Switching:
- After QR auth, user has valid session
- Actor switching works normally
- Active actor stored in context (not cookie)

### Compatible with /api/me:
- Session-based auth resolves to X-External-User equivalent
- ActiveUserResolverMiddleware works unchanged
- Corporeal domain binding works normally

## Phone App Integration (Conceptual)

**QR Payload Format:**
```
dis-auth://challenge/<uuid>
```

**Phone App Flow:**
1. Scan QR code
2. Parse challenge UUID from payload
3. Authenticate user (password, PAIN, biometric, etc.)
4. Get user_id from phone's auth system
5. POST to `/api/auth/qr-complete`:
   ```json
   {
     "challenge_id": "<uuid>",
     "user_id": "<authenticated-user-id>"
   }
   ```
6. Show success message
7. Browser completes automatically

**Phone App Responsibilities:**
- QR scanning/parsing
- User authentication (out of scope for Finagler)
- HTTP request to DIS-Core
- Error handling (expired, invalid, etc.)

## Build Status

### Backend:
```bash
✓ dis-core-qr-auth built successfully
✓ New files: internal/auth/challenge.go, challenge_handlers.go
✓ Migration: db/migrations/20251115_add_auth_challenges.sql
```

### Frontend:
```bash
✓ 1731 modules transformed
✓ built in 18.29s
dist/assets/index-D05qCKmH.js  348.25 kB │ gzip: 109.73 kB

Package added:
- qrcode.react@^3.1.0
```

## Future Enhancements

- [ ] Challenge reuse prevention (one-time tokens)
- [ ] Multiple challenge types (email, SMS, push notification)
- [ ] Challenge metadata (device info, location)
- [ ] Challenge history/audit trail
- [ ] Refresh challenge if expired (auto-regenerate QR)
- [ ] WebSocket for real-time status updates (no polling)
- [ ] Challenge encryption/signing
- [ ] Time-based OTP (TOTP) alternative
- [ ] Hardware token support (WebAuthn)
- [ ] Biometric authentication bridge

## Related Documentation

- `/finagler/NONE_SPACE_AUTH_BOOTSTRAP.md` - Dev auth flow
- `/finagler/ACTOR_SWITCHING_IMPLEMENTATION.md` - Actor management
- `/dis-core/internal/auth/activeuser.go` - User context
- `/dis-core/internal/auth/middleware.go` - Auth middleware

## Summary

✅ **QR Auth Flow Complete:**
- Challenge/response architecture
- Browser session management
- Phone-side completion endpoint
- Real-time status polling
- Visual QR code display
- Success/error states
- Dev mode fallback
- Finagler-agnostic design
- Test harness included

**Ready for integration testing with actual phone app!**
