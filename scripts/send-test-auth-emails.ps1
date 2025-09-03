param([Parameter(Mandatory=$true)][string]$Email)
$ErrorActionPreference = 'Stop'

# Config
$SupabaseUrl = 'https://ttumoijdqryptsnojubl.supabase.co'
$AnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dW1vaWpkcXJ5cHRzbm9qdWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Nzc2ODYsImV4cCI6MjA2OTU1MzY4Nn0.3oxWY0BP4HthpQw7q258ot2ph29U1kWT-Ti_WV2cb1I'

# 1) Sign in as QA user to get a JWT (for invoking edge function with verify_jwt)
$authHeaders = @{ 'apikey'=$AnonKey; 'Content-Type'='application/json' }
$bodySignIn = @{ email='qa-studio@buxtax.test'; password='BuxTax_Studio_!234' } | ConvertTo-Json
$authResponse = Invoke-RestMethod -Method Post -Uri ($SupabaseUrl + '/auth/v1/token?grant_type=password') -Headers $authHeaders -Body $bodySignIn
$token = $authResponse.access_token
if (-not $token) { throw 'Failed to obtain Supabase JWT for QA user.' }

# 2) Call the test function to send all four emails
$fnHeaders = @{ 'Content-Type'='application/json'; 'Authorization'=('Bearer ' + $token); 'apikey'=$AnonKey }
$body = @{ email=$Email; modes=@('invite','confirmation','magic_link','recovery') } | ConvertTo-Json
$result = Invoke-RestMethod -Method Post -Uri ($SupabaseUrl + '/functions/v1/send-test-auth-emails') -Headers $fnHeaders -Body $body

$result | ConvertTo-Json -Depth 6


