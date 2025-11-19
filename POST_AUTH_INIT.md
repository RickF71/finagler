# Post-Auth Initialization Flow

## Overview

After a user authenticates via QR code or dev mode in NoneSpace, Finagler needs to:
1. Fetch the authenticated user's identity from `/api/me`
2. Extract corporeal domain and actor bindings
3. Initialize the application state
4. Navigate to the user's corporeal domain

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
└─────────────────────────────────────────────────────────────┘

1. User visits Finagler
   └─> AuthGate checks authentication (useAuthBootstrap)
       └─> If not authed: Show NoneSpace
       └─> If authed: Mount <App />

2. <App /> mounts with contexts + PostAuthInitializer
   └─> ActiveUserProvider (new)
   └─> DomainProvider
   └─> PostAuthInitializer (new)
       └─> Fetches /api/me
       └─> Stores user in ActiveUserContext
       └─> Sets activeDomainId to corporeal_domain_id
       └─> Navigates to /domain/{corporeal_domain_id}

3. DomainContext auto-loads domain when activeDomainId changes
   └─> Loads domain payload (CSS, files, metadata)
   └─> useDomainCSS hook injects resolved CSS

4. User is now inside DIS with their identity bound
```

## New Files

### `/src/context/ActiveUserContext.jsx`
Context for storing the authenticated user identity.

**API:**
- `user` - Full user object from `/api/me`
- `setActiveUser(u)` - Store user object
- `clearUser()` - Clear user on logout
- `loading`, `error` - State tracking

**User Object Shape:**
```json
{
  "authenticated": true,
  "bound": true,
  "corporeal_domain_id": "uuid",
  "prime_seat_id": "uuid",
  "display_name": "User Name",
  "member_id": "uuid"
}
```

### `/src/components/auth/PostAuthInitializer.jsx`
Component that runs once after successful authentication to initialize app state.

**Flow:**
1. Fetch `/api/me` with credentials
2. Store user in `ActiveUserContext`
3. Extract `corporeal_domain_id` (required)
4. Call `loadDomains()` to populate domains list
5. Set `activeDomainId` to corporeal domain
6. Navigate to `/domain/{corporeal_domain_id}`

**Error Handling:**
- If `/api/me` fails → logs error, sets error state
- If no corporeal domain → warns user, doesn't navigate
- Prevents duplicate initialization with `initialized` flag

## Modified Files

### `/src/app/App.jsx`
Added `ActiveUserProvider` wrapper and `PostAuthInitializer` component.

```jsx
<ActiveUserProvider>
  <FinaglerProvider>
    <DomainProvider>
      <PostAuthInitializer />  {/* Runs once on mount */}
      <DisCorePayloadView />
    </DomainProvider>
  </FinaglerProvider>
</ActiveUserProvider>
```

## Usage

### In Components - Access User Identity

```jsx
import { useActiveUser } from "../context/ActiveUserContext";

function MyComponent() {
  const { user, loading, error } = useActiveUser();
  
  if (loading) return <div>Loading user...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return (
    <div>
      <h1>Welcome, {user.display_name}</h1>
      <p>Corporeal Domain: {user.corporeal_domain_id}</p>
      <p>Prime Seat: {user.prime_seat_id}</p>
    </div>
  );
}
```

### Logout Flow

```jsx
import { useActiveUser } from "../context/ActiveUserContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { clearUser } = useActiveUser();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    clearUser();
    // Clear session cookie via backend endpoint
    fetch("/api/auth/logout", { method: "POST" });
    navigate("/none");
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

## Testing

### Dev Server
```bash
cd /home/rick/dev/DIS/finagler
npm run dev
```

### Test Flow
1. Open `http://localhost:5173`
2. Should redirect to NoneSpace (not authenticated)
3. Use dev mode or QR auth to authenticate
4. After auth success, should:
   - Fetch `/api/me`
   - Store user in context
   - Navigate to corporeal domain
   - Load domain CSS and files
5. Check console for logs:
   ```
   🔐 [PostAuthInit] Fetching authenticated user identity...
   ✅ [PostAuthInit] User identity loaded: {...}
   🔐 [PostAuthInit] Corporeal domain: <uuid>
   ✅ [PostAuthInit] Active domain set to: <uuid>
   ✅ [PostAuthInit] Navigated to corporeal domain
   ```

### Check User State
Open React DevTools and inspect `ActiveUserContext` provider to see stored user object.

## Benefits

✅ **Proper Initialization** - User state loaded before app renders
✅ **Context Separation** - User identity separated from domain state  
✅ **Automatic Navigation** - User lands in their corporeal domain
✅ **Error Handling** - Graceful fallback if initialization fails
✅ **No Manual Setup** - Works automatically after authentication
✅ **Extensible** - Easy to add actor switching, preferences, etc.

## Future Enhancements

- Actor context for multi-seat users
- User preferences (theme, layout)
- Recent domains list
- Notification subscriptions
- WebSocket connection for live updates
