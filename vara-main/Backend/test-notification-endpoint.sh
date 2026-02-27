#!/bin/bash

# Test script for notification endpoint
# This script tests if the backend notification endpoint is working correctly

echo "Testing Notification Endpoint..."
echo "================================"

# Replace these variables with actual values
TOKEN="your_jwt_token_here"
API_URL="http://localhost:5003/api"

echo "1. Testing endpoint with authentication:"
echo "GET $API_URL/admin/notifications/dashboard"
echo ""

# Test with token
curl -X GET "${API_URL}/admin/notifications/dashboard" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "================================"
echo "If you see a 200 status with notification data, the endpoint is working!"
echo "If you see a 401, the token is invalid or missing"
echo "If you see a 500, there's a server error"
echo ""
echo "Expected response format:"
echo '{
  "success": true,
  "data": {
    "upcomingEvents": [...],
    "announcements": [...],
    "jobs": [...],
    "pendingMembers": null,
    "draftItems": null
  }
}'
