#!/bin/bash

# Hivemind Protocol API Test Suite
# Automates backend API testing

API_URL=${API_URL:-"http://localhost:3000"}
FIXTURES_FILE="tests/fixtures.json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BOLD}Starting Hivemind Protocol API Tests...${NC}"
echo -e "Target: ${API_URL}\n"

PASS_COUNT=0
FAIL_COUNT=0

function assert_status() {
    local status=$1
    local expected=$2
    local name=$3
    if [ "$status" -eq "$expected" ]; then
        echo -e "  [${GREEN}PASS${NC}] $name (Status: $status)"
        PASS_COUNT=$((PASS_COUNT+1))
    else
        echo -e "  [${RED}FAIL${NC}] $name (Expected: $expected, Got: $status)"
        FAIL_COUNT=$((FAIL_COUNT+1))
    fi
}

# 1. Health Check
echo -e "${BOLD}1. Health Check Test${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL}/health)
assert_status "$HEALTH_RESPONSE" 200 "GET /health"

# 2. Pricing Endpoint
echo -e "\n${BOLD}2. Pricing Endpoint Test${NC}"
PRICING_DATA=$(curl -s ${API_URL}/pricing)
PRICING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL}/pricing)
assert_status "$PRICING_STATUS" 200 "GET /pricing"

MAGOS_FEE=$(echo $PRICING_DATA | jq -r '.pricing.magos.fee')
if [[ "$MAGOS_FEE" != "null" ]]; then
    echo -e "  [${GREEN}PASS${NC}] Pricing contains magos fee ($MAGOS_FEE)"
    PASS_COUNT=$((PASS_COUNT+1))
else
    echo -e "  [${RED}FAIL${NC}] Pricing missing magos fee"
    FAIL_COUNT=$((FAIL_COUNT+1))
fi

# 3. Specialist Dispatch Tests
echo -e "\n${BOLD}3. Specialist Dispatch Tests${NC}"

SPECIALISTS=("bankr" "magos" "aura")

for specialist in "${SPECIALISTS[@]}"; do
    PROMPT=$(jq -r ".$specialist.prompt" $FIXTURES_FILE)
    echo -e "Testing $specialist with prompt: \"$PROMPT\""
    
    RESPONSE=$(curl -s -X POST ${API_URL}/dispatch \
        -H "Content-Type: application/json" \
        -d "{\"prompt\": \"$PROMPT\"}")
    
    TASK_ID=$(echo $RESPONSE | jq -r '.taskId')
    
    if [[ "$TASK_ID" != "null" ]]; then
        echo -e "  [${GREEN}PASS${NC}] $specialist task created (ID: $TASK_ID)"
        PASS_COUNT=$((PASS_COUNT+1))
        
        # Wait for task to complete (polling)
        echo -n "  Waiting for task completion..."
        MAX_RETRIES=10
        RETRY=0
        while [ $RETRY -lt $MAX_RETRIES ]; do
            TASK_STATUS=$(curl -s ${API_URL}/status/$TASK_ID)
            STATE=$(echo $TASK_STATUS | jq -r '.status')
            if [[ "$STATE" == "completed" ]]; then
                echo -e " Done."
                break
            elif [[ "$STATE" == "failed" ]]; then
                echo -e " Failed."
                break
            fi
            echo -n "."
            sleep 1
            RETRY=$((RETRY+1))
        done
        
        # Verify specialist assignment
        ASSIGNED=$(echo $TASK_STATUS | jq -r '.specialist')
        if [[ "$ASSIGNED" == "$specialist" ]]; then
            echo -e "  [${GREEN}PASS${NC}] Task correctly routed to $specialist"
            PASS_COUNT=$((PASS_COUNT+1))
        else
            echo -e "  [${RED}FAIL${NC}] Task routed to $ASSIGNED instead of $specialist"
            FAIL_COUNT=$((FAIL_COUNT+1))
        fi
        
        # Verify x402 fee message
        HAS_FEE=$(echo "$TASK_STATUS" | jq '[.messages[] | select(.content != null and (.content | contains("x402 Fee")))] | length')
        if [[ $HAS_FEE -gt 0 ]]; then
            echo -e "  [${GREEN}PASS${NC}] x402 fee found in messages"
            PASS_COUNT=$((PASS_COUNT+1))
        else
            echo -e "  [${RED}FAIL${NC}] No x402 fee message found"
            FAIL_COUNT=$((FAIL_COUNT+1))
        fi

        # Verify response format correctness
        RESULT=$(echo $TASK_STATUS | jq '.result')
        if [[ "$RESULT" != "null" ]]; then
            echo -e "  [${GREEN}PASS${NC}] Result object present"
            PASS_COUNT=$((PASS_COUNT+1))
        else
            echo -e "  [${RED}FAIL${NC}] Result object missing"
            FAIL_COUNT=$((FAIL_COUNT+1))
        fi

    else
        echo -e "  [${RED}FAIL${NC}] Failed to create task for $specialist"
        FAIL_COUNT=$((FAIL_COUNT+1))
    fi
done

# 4. Edge Cases
echo -e "\n${BOLD}4. Edge Case Tests${NC}"

# Empty prompt
EMPTY_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${API_URL}/dispatch \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": \"\"}")
assert_status "$EMPTY_RES" 400 "Empty prompt rejected"

# Gibberish prompt (should still route somewhere, e.g. aura)
GIBBERISH=$(jq -r '.edge_cases[1].body.prompt' $FIXTURES_FILE)
GIBBERISH_RES=$(curl -s -X POST ${API_URL}/dispatch \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": \"$GIBBERISH\"}")
GIBBERISH_ID=$(echo $GIBBERISH_RES | jq -r '.taskId')
if [[ "$GIBBERISH_ID" != "null" ]]; then
    echo -e "  [${GREEN}PASS${NC}] Gibberish prompt accepted (taskId: $GIBBERISH_ID)"
    PASS_COUNT=$((PASS_COUNT+1))
else
    echo -e "  [${RED}FAIL${NC}] Gibberish prompt rejected"
    FAIL_COUNT=$((FAIL_COUNT+1))
fi

# Summary
echo -e "\n${BOLD}Test Results:${NC}"
echo -e "  ${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "  ${RED}Failed: $FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "\n${GREEN}${BOLD}ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "\n${RED}${BOLD}SOME TESTS FAILED!${NC}"
    exit 1
fi
