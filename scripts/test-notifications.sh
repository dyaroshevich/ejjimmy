/**
 * Quick test notification via curl command
 * 
 * Run these commands in terminal:
 */

// Test via API endpoint
echo "Testing Broadcast via /api/notify-line..."
curl -X POST http://localhost:3001/api/notify-line \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'

echo ""
echo "Done!"