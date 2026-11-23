$body = @{ messages = @(@{ role = "user"; content = "สวัสดีครับ" }) } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3001/api/chat" -Method POST -Body $body -ContentType "application/json"