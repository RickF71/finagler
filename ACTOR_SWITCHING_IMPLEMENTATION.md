# Actor Switching Implementation - SuperBar Test Harness

**Date:** November 15, 2025  
**Status:** ✅ Complete

## Overview

Implemented actor switching functionality in the SuperBar component to allow users to switch between different actors/seats in the DIS system. This is a test harness implementation for Phase 9C integration.

## Files Created

### 1. `src/hooks/useActiveActor.js`
Custom React hook for managing active actor state:
- **State**: `activeActor`, `loading`, `error`
- **Functions**:
  - `loadActiveActor()`: GET /api/me/active-actor
  - `setActiveActor(seatId, { onSuccess, onReload })`: POST /api/me/active-actor with {seat_id}
- **Features**:
  - Callbacks for success and reload actions
  - Error handling with user-friendly messages
  - Automatic state management

### 2. `src/hooks/useMe.js`
Custom React hook for user identity:
- **State**: `me`, `loading`, `error`
- **Functions**:
  - `loadMe()`: GET /api/me
- Returns: authenticated, bound, corporeal_domain_id, prime_seat_id, display_name

### 3. `src/hooks/useMeActors.js`
Custom React hook for listing all actors/seats:
- **State**: `actors`, `loading`, `error`
- **Functions**:
  - `loadActors()`: GET /api/me/actors
- Returns array of: seat_id, domain_id, domain_name, seat_type, is_prime, member_id, status

## Files Modified

### 1. `src/lib/api.js`
Added new API endpoints:
```javascript
export const getMe = () => request("/api/me");
export const getMeActors = () => request("/api/me/actors");
export const getActiveActor = () => request("/api/me/active-actor");
export const setActiveActor = (seatId) => 
  request("/api/me/active-actor", { method: "POST", body: { seat_id: seatId } });
export const getDomainResolvedCSS = (domainId) => 
  request(`/api/domain/${domainId}/css/resolved`);
```

### 2. `src/components/SuperBar.jsx`
**Imports Added:**
- `useActiveActor`, `useMe`, `useMeActors` hooks
- `getDomainResolvedCSS` from api.js

**State Added:**
- `actorSwitching` - loading state during actor switch

**Lifecycle:**
- Auto-loads me, actors, and active actor on mount when connected
- Integrated with existing domain loading

**New Handler:**
- `handleActorSwitch(seatId)` - Switches active actor with:
  - Ownership verification via backend
  - Reloads /api/me, /api/me/actors, domains
  - Reloads current domain context
  - Fetches and applies resolved CSS for active domain
  - Error handling with user alerts

**UI Changes:**
- Added Actor Switcher section between center label and domain selector
- Dropdown shows all available actors with:
  - 👑 icon for Prime Seats (is_prime)
  - Domain name
  - Seat type (prime/member)
- "switching..." indicator during actor change
- Disabled state during switching operation
- Only displays when actors are available

## Integration Flow

### On Actor Switch:
1. User selects actor from dropdown
2. `handleActorSwitch(seatId)` called
3. POST /api/me/active-actor with seat_id
4. Backend verifies ownership (VerifySeatOwnership)
5. Backend stores active actor in context
6. Frontend reloads:
   - User identity (/api/me)
   - Actors list (/api/me/actors)
   - Domains list (/api/domains)
7. If domain is active:
   - Reload domain context
   - Fetch resolved CSS (/api/domain/{id}/css/resolved)
   - Inject CSS into document via `<style id="dis-domain-css">`

### CSS Injection Pattern:
```javascript
let styleEl = document.getElementById('dis-domain-css');
if (!styleEl) {
  styleEl = document.createElement('style');
  styleEl.id = 'dis-domain-css';
  document.head.appendChild(styleEl);
}
styleEl.textContent = cssData.resolved_css;
```

## Backend Integration

### API Endpoints Used:
- **GET /api/me** - Returns current user identity
- **GET /api/me/actors** - Lists all seats/actors for user
- **GET /api/me/active-actor** - Returns current active actor
- **POST /api/me/active-actor** - Sets active actor (requires seat_id)
- **GET /api/domain/{id}/css/resolved** - Returns resolved CSS for domain

### Expected Response Formats:

#### /api/me/active-actor (GET)
```json
{
  "has_active_actor": true,
  "active_seat_id": "ce86d1ec-389d-4938-babf-247371eb6878"
}
```

#### /api/me/active-actor (POST)
```json
{
  "ok": true,
  "active_seat_id": "ce86d1ec-389d-4938-babf-247371eb6878",
  "message": "Active actor set successfully"
}
```

#### /api/me/actors
```json
{
  "actors": [
    {
      "seat_id": "ce86d1ec-389d-4938-babf-247371eb6878",
      "domain_id": "dom-123",
      "domain_name": "example.domain",
      "seat_type": "prime",
      "is_prime": true,
      "member_id": "human.testuser",
      "status": "active"
    }
  ]
}
```

## Key Features

✅ **Display-only implementation** - No actor creation UI  
✅ **Automatic loading** - Loads on mount and connection  
✅ **Error handling** - User-friendly error alerts  
✅ **Visual feedback** - Loading states and switching indicators  
✅ **Prime Seat indicators** - 👑 crown icon for prime seats  
✅ **CSS injection** - Automatic domain CSS reload and application  
✅ **Context integration** - Full integration with DomainContext  
✅ **Ownership verification** - Backend validates seat ownership  

## Build Status

```
✓ 1716 modules transformed
✓ built in 5.25s
dist/assets/index-BR7W_Tzh.js  292.59 kB │ gzip: 90.12 kB
```

## Testing Commands

### Start Backend:
```bash
cd /home/rick/dev/DIS/dis-core
./dis-core --schemas=schemas --domains=domains
```

### Start Frontend:
```bash
cd /home/rick/dev/DIS/finagler
npm run dev
```

### Test Flow:
1. Open browser to http://localhost:5173
2. Verify SuperBar displays "Actor:" dropdown when actors available
3. Select different actor from dropdown
4. Verify "switching..." indicator appears
5. Verify domain context reloads
6. Verify CSS updates (if domain is active)
7. Check browser console for logs:
   - `🎭 Switching to actor with seat ID: ...`
   - `✅ Actor switched successfully`
   - `✅ Resolved CSS applied for domain ...`

## Notes

- Actor switching is request-scoped in current implementation
- For persistent sessions, consider storing active actor in localStorage or session tokens
- Prime Seats are shown first in dropdown (backend sorts by is_prime)
- CSS injection uses single `<style>` element with id `dis-domain-css`
- All API calls include proper error handling and logging
- Actor dropdown only displays when connected and actors are loaded

## Phase 9C Integration Points

This implementation provides the frontend test harness for:
- Receipt verification workflows
- Actor-scoped authority checks
- Prime Seat sovereignty operations
- Domain CSS inheritance with actor context
- Provenance continuity tracking

## Future Enhancements

- [ ] Persistent actor selection across sessions
- [ ] Actor switching confirmation dialog
- [ ] Recent actors list
- [ ] Actor permissions preview before switch
- [ ] Session token integration for actor context
- [ ] Actor-specific UI themes
