#!/bin/bash
# Test post-auth initialization flow

set -e

echo "🧪 Testing Post-Auth Initialization Flow"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dis-core is running
echo "1️⃣  Checking if dis-core is running..."
if lsof -i :8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ dis-core is running on port 8080${NC}"
else
    echo -e "${RED}❌ dis-core is not running${NC}"
    echo "   Start it with: cd /home/rick/dev/DIS/dis-core && source .env.postgres && ./dis-core-qr-auth &"
    exit 1
fi

echo ""
echo "2️⃣  Testing /api/me endpoint (unauthenticated)..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8080/api/me)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Correctly returns 401 for unauthenticated request${NC}"
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${YELLOW}⚠️  Got 200 OK (dev mode or existing session?)${NC}"
    echo "   Response: $BODY"
else
    echo -e "${RED}❌ Unexpected status: $HTTP_CODE${NC}"
    echo "   Response: $BODY"
fi

echo ""
echo "3️⃣  Testing /api/me endpoint with dev header..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "X-External-User: test-user-001" \
  http://localhost:8080/api/me)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Got 200 OK with dev header${NC}"
    echo "   Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Expected 200, got: $HTTP_CODE${NC}"
    echo "   Response: $BODY"
fi

echo ""
echo "4️⃣  Testing /api/me/actors endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "X-External-User: test-user-001" \
  http://localhost:8080/api/me/actors)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Got 200 OK${NC}"
    ACTOR_COUNT=$(echo "$BODY" | jq '.actors | length' 2>/dev/null || echo "0")
    echo "   Found $ACTOR_COUNT actors"
else
    echo -e "${RED}❌ Expected 200, got: $HTTP_CODE${NC}"
fi

echo ""
echo "5️⃣  Testing /api/domains endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8080/api/domains)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Got 200 OK${NC}"
    DOMAIN_COUNT=$(echo "$BODY" | jq '. | length' 2>/dev/null || echo "0")
    echo "   Found $DOMAIN_COUNT domains"
else
    echo -e "${RED}❌ Expected 200, got: $HTTP_CODE${NC}"
fi

echo ""
echo "6️⃣  Testing auth challenge creation..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Origin: http://localhost:5173" \
  http://localhost:8080/api/auth/challenge)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Challenge created successfully${NC}"
    CHALLENGE_ID=$(echo "$BODY" | jq -r '.challenge_id' 2>/dev/null)
    echo "   Challenge ID: $CHALLENGE_ID"
else
    echo -e "${RED}❌ Expected 200, got: $HTTP_CODE${NC}"
    echo "   Response: $BODY"
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Post-Auth Flow Tests Complete${NC}"
echo ""
echo "Next steps:"
echo "  1. Start Finagler: cd /home/rick/dev/DIS/finagler && npm run dev"
echo "  2. Open http://localhost:5173"
echo "  3. Authenticate via QR or dev mode"
echo "  4. Check browser console for PostAuthInit logs"
echo "  5. Verify navigation to corporeal domain"
