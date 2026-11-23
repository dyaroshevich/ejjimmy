$ErrorActionPreference = 'Stop'
$envPath = 'K:/code/tawanpower/.env.local'
$text = [System.IO.File]::ReadAllText($envPath).TrimStart([char]0xFEFF)
$sr = ($text.Split([char]10) | Select-String 'SUPABASE_SERVICE_ROLE_KEY\s*=' | Select-Object -First 1).Line.Trim().Split('=',2)[1].Trim()
$baseUrl = 'https://gfdbmxhtvhivoztgckit.supabase.co'
$url = "$baseUrl/auth/v1/users?select=id,email,email_confirmed_at,created_at,last_sign_in_at,app_metadata"
$headers = @{ 'apikey' = $sr }
try {
  $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
  Write-Output 'USERS:'
  if ($resp -is [array]) {
    $resp | ForEach-Object {
      $role = if ($_.app_metadata) { $_.app_metadata.role -join ',' } else { '(none)' }
      Write-Output "$($_.email) -> confirmed=$($_.email_confirmed_at) created=$($_.created_at) last=$($_.last_sign_in_at) role=$role"
    }
  } else {
    Write-Output ($resp | ConvertTo-Json -Depth 4)
  }
} catch {
  Write-Output 'ERR: ' + $_.Exception.Message
  if ($_.ErrorDetails) { Write-Output $_.ErrorDetails.Message }
}
