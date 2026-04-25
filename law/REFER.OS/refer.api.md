# refer.api.md

Purpose
- Provide a single index of API usage notes for local development.
- Record successful auth methods and known pitfalls without storing secrets.

Policy
- Do not store keys in this doc.
- Prefer .env.local for actual secrets; .env.master holds placeholders.
- If a method changes, update this doc and the relevant plan docs.

Index
- GovInfo (api.data.gov): see "GovInfo" below.
- YouTube OG metadata: see "YouTube (Open Graph metadata)" below.

GovInfo

Env vars
- GOVINFO_API_KEY: api.data.gov key used by GovInfo.
- GOVINFO_ACCOUNT_EMAIL: account email (optional reference only).
- GOVINFO_ACCOUNT_ID: account id (optional reference only).

Recommended auth method (works in local tests)
- Header: X-Api-Key

Sample request (PowerShell)
```
$key = (Get-Content .env.master | Where-Object { $_ -match '^GOVINFO_API_KEY=' } | Select-Object -First 1).Substring(15)
curl.exe -sS -D - -H "X-Api-Key: $key" "https://api.govinfo.gov/packages/FR-2018-08-03/summary"
```

Alternate method (query param)
```
$key = (Get-Content .env.master | Where-Object { $_ -match '^GOVINFO_API_KEY=' } | Select-Object -First 1).Substring(15)
curl.exe -sS -D - "https://api.govinfo.gov/packages/FR-2018-08-03/summary?api_key=$key"
```

Known limitations / pitfalls
- Unverified or disabled keys return 403.
- Rate limits apply (expect 429 if exceeded).
- PowerShell Invoke-WebRequest may fail silently in some environments; curl.exe is more reliable.

Preferred usage in code
- Use the X-Api-Key header for clarity and parity with other api.data.gov integrations.
- Keep the key in .env.local for dev; map to deployment secrets in CI/CD.

Change log
- Initial GovInfo guidance based on successful header auth test.

YouTube (Open Graph metadata)

Goal
- Extract Open Graph (OG) metadata from a YouTube URL without the YouTube Data API.

What you can expect (common OG fields)
- og:title
- og:description
- og:image
- og:url
- og:type
- og:video:url
- og:video:secure_url

Sample request (PowerShell)
```
$u = "https://www.youtube.com/watch?v=UX-CQ2sujDo"
$html = (Invoke-WebRequest -Uri $u -UseBasicParsing -Headers @{ "User-Agent" = "Mozilla/5.0" }).Content
[regex]::Matches($html, '<meta\s+property="og:([^"]+)"\s+content="([^"]*)"') |
  ForEach-Object { "{0} = {1}" -f $_.Groups[1].Value, $_.Groups[2].Value }
```

Sample request (Python stdlib)
```
import re
import urllib.request

url = "https://www.youtube.com/watch?v=UX-CQ2sujDo"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=10) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

for k, v in re.findall(r'<meta\\s+property="og:([^"]+)"\\s+content="([^"]*)"', html):
    print(f"og:{k}={v}")
```

Known limitations / pitfalls
- Private, unlisted, or region-restricted videos may return missing or generic OG tags.
- Some environments block automated fetches; set a User-Agent header.

Preferred usage in code
- Use OG tags for lightweight metadata during testing.
- Use the YouTube Data API only when you need guaranteed fields or access to private data.

Change log
- Added YouTube OG metadata extraction guidance.
