param(
  [string]$EnvFile = "E:\Telechurch-e2e-v2\.env.master",
  [string]$Instance = "refer"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $EnvFile)) {
  throw "Zo env file not found: $EnvFile"
}

$vars = @{}
Get-Content -LiteralPath $EnvFile | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    $key = $matches[1].Trim()
    $value = $matches[2].Trim().Trim('"').Trim("'")
    $vars[$key] = $value
  }
}

$normalizedInstance = $Instance.Trim().ToLowerInvariant()
if ($normalizedInstance -eq "telechurch") {
  $token = $vars["ZO_COMPUTER_TELECHURCH"]
  $tokenName = "ZO_COMPUTER_TELECHURCH"
} elseif ($normalizedInstance -eq "refer") {
  $token = $vars["ZO_COMPUTER_REFER"]
  $tokenName = "ZO_COMPUTER_REFER"
  if (-not $token) {
    $token = $vars["ZO_ACCESS_TOKEN"]
    $tokenName = "ZO_ACCESS_TOKEN"
  }
  if (-not $token) {
    $token = $vars["ZO_COMPUTER"]
    $tokenName = "ZO_COMPUTER"
  }
} else {
  $tokenName = "ZO_COMPUTER_" + ($normalizedInstance.ToUpperInvariant() -replace '[^A-Z0-9_]', '_')
  $token = $vars[$tokenName]
}

if (-not $token) {
  throw "Missing Zo token. Set $tokenName in $EnvFile."
}

& npx -y mcp-remote https://api.zo.computer/mcp --header "Authorization:Bearer $token" --transport http-only
exit $LASTEXITCODE
