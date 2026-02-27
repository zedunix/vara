# PowerShell script to test the notification endpoint
# Replace TOKEN with your actual JWT token

param(
    [string]$Token = "your_jwt_token_here",
    [string]$ApiUrl = "http://localhost:5003/api"
)

Write-Host "Testing Notification Endpoint..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  API URL: $ApiUrl"
Write-Host "  Token: $($Token.Substring(0, 20))..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Making request to: GET $ApiUrl/admin/notifications/dashboard" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "$ApiUrl/admin/notifications/dashboard" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        } `
        -ErrorVariable httpError

    Write-Host "✅ Success! Response received:" -ForegroundColor Green
    Write-Host ""
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    Write-Host ""
    Write-Host "Data Summary:" -ForegroundColor Yellow
    Write-Host "  Upcoming Events: $($response.data.upcomingEvents.Count)" -ForegroundColor Cyan
    Write-Host "  Announcements: $($response.data.announcements.Count)" -ForegroundColor Cyan
    Write-Host "  Jobs: $($response.data.jobs.Count)" -ForegroundColor Cyan
    Write-Host "  Pending Members: $($response.data.pendingMembers.count ?? 'Not available')" -ForegroundColor Cyan
    Write-Host "  Draft Items: $($response.data.draftItems.total ?? 'Not available')" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    
    if ($httpError) {
        $statusCode = $httpError[0].Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        switch ($statusCode) {
            "Unauthorized" { Write-Host "Reason: Invalid or expired authentication token" -ForegroundColor Yellow }
            "NotFound" { Write-Host "Reason: Endpoint not found - check API URL and route" -ForegroundColor Yellow }
            "InternalServerError" { Write-Host "Reason: Server error - check backend logs" -ForegroundColor Yellow }
            default { Write-Host "Reason: $($httpError[0].Exception.Message)" -ForegroundColor Yellow }
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Ensure backend is running on port 5003" -ForegroundColor Cyan
    Write-Host "2. Verify the JWT token is valid and not expired" -ForegroundColor Cyan
    Write-Host "3. Check that you're logged in as a user with the correct role" -ForegroundColor Cyan
    Write-Host "4. Check backend logs for detailed error information" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green

# Usage instructions
Write-Host ""
Write-Host "Usage:" -ForegroundColor Yellow
Write-Host "  .\test-notification-endpoint.ps1 -Token 'your_token_here'" -ForegroundColor Cyan
Write-Host "  .\test-notification-endpoint.ps1 -Token 'your_token_here' -ApiUrl 'http://localhost:5003/api'" -ForegroundColor Cyan
