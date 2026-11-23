$ErrorActionPreference = 'Stop'
$envPath = 'K:/code/tawanpower/.env.local'
$text = [System.IO.File]::ReadAllText($envPath).TrimStart([char]0xFEFF)
$url = ($text.Split([char]10) | Select-String 'NEXT_PUBLIC_SUPABASE_URL\s*=' | Select-Object -First 1).Line.Trim().Split('=',2)[1].Trim()
$anon = ($text.Split([char]10) | Select-String 'NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=' | Select-Object -First 1).Line.Trim().Split('=',2)[1].Trim()
$sr = ($text.Split([char]10) | Select-String 'SUPABASE_SERVICE_ROLE_KEY\s*=' | Select-Object -First 1).Line.Trim().Split('=',2)[1].Trim()
$headers = @{ 'apikey' = $sr }
$uri = "https://gfdbmxhtvhivoztgckit.supabase.co/auth/v1/users?select=id,email,email_confirmed_at,created_at,last_sign_in_at,app_metadata"
try {
  $resp = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -ContentType 'application/json'
  Write-Output "USERS:"
  $resp | ForEach-Object { Write-Output ($_.email + ' -> confirmed=' + $_.email_confirmed_at + ' created=' + $_.created_at + ' last=' + $_.last_sign_in_at + ' role=' + ($_.app_metadata.role -join ',')) }
} catch {
  Write-Output "ERR: " + ($_.Exception.Message)
  Write-Output ($_.ErrorDetails.Message)
}
