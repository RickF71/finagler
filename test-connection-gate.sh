#!/usr/bin/env bash
# test-connection-gate.sh
# Test Finagler's connection monitoring and offline detection
set -e

echo "=== CONNECTION GATE TESTING ==="
echo

echo "Step 1: Start dis-core in background"
echo "  cd /home/rick/dev/DIS/dis-core"
echo "  source .env.postgres"
echo "  ./dis-core-connection-gate &"
echo "  DIS_PID=\$!"
echo

echo "Step 2: Start Finagler dev server"
echo "  cd /home/rick/dev/DIS/finagler"
echo "  npm run dev &"
echo "  FINAGLER_PID=\$!"
echo

echo "Step 3: Open browser to http://localhost:5173"
echo "  Watch browser console for connection logs:"
echo "    - [useDisConnection] Pinging dis-core..."
echo "    - [useDisConnection] Online"
echo

echo "Step 4: Kill dis-core to simulate offline"
echo "  kill \$DIS_PID"
echo "  Wait 5-10 seconds..."
echo "  Check browser console:"
echo "    - [useDisConnection] Offline"
echo "    - [PostAuthInit] DIS-Core offline. Waiting for connection..."
echo

echo "Step 5: Restart dis-core"
echo "  ./dis-core-connection-gate &"
echo "  DIS_PID=\$!"
echo "  Wait 5-10 seconds..."
echo "  Check browser console:"
echo "    - [useDisConnection] Online"
echo "    - [PostAuthInit] Fetching authenticated user identity..."
echo

echo "=== MANUAL TESTING ==="
echo
echo "Test 1: /api/ping responds"
curl -s http://localhost:8080/api/ping | jq .

echo
echo "Test 2: Browser console shows heartbeat"
echo "  Open: http://localhost:5173"
echo "  Console: Look for ping attempts every 5 seconds"
echo

echo "Test 3: Offline detection works"
echo "  Stop dis-core: kill \$DIS_PID"
echo "  Console: Should show 'DIS-Core offline'"
echo "  Network requests should be suppressed"
echo

echo "Test 4: Recovery after reconnection"
echo "  Start dis-core: ./dis-core-connection-gate &"
echo "  Console: Should show 'DIS-Core online'"
echo "  PostAuthInit should automatically retry /api/me"
echo

echo "=== EXPECTED BEHAVIOR ==="
echo
echo "✅ Heartbeat every 5 seconds when online"
echo "✅ No network requests when offline"
echo "✅ Automatic reconnection detection"
echo "✅ PostAuthInit waits for connection"
echo "✅ disFetch() rejects requests when offline"
echo

echo "=== CLEANUP ==="
echo "  kill \$DIS_PID \$FINAGLER_PID"
