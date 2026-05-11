# Alliance Android SMS Bridge

This is a local-first Android bridge for sending SMS from the Alliance system through a phone you control.

End-to-end Alliance SMS profile flow authority:

```text
../docs/alliance-sms-profile-flow.md
../docs/alliance-journey-build-plan.md
```

The live Alliance relay uses the Script Factory `Smart Intake` pattern for registered-user SMS that does not yet have a deterministic handler. Registered users receive the current Alliance action menu instead of another profile creation prompt, and repeated needs can still be saved as gaps/candidates by the Hub scripts.

The phone runs a small authenticated HTTP server. Local Alliance services can call the phone bridge, and the bridge uses Android `SmsManager` to send the text message.

## First API Contract

Base URL while the app is running:

```text
http://PHONE_LAN_IP:8787
```

Health:

```http
GET /health
```

Send SMS:

```http
POST /sms/send
X-Bridge-Token: generated-token-shown-in-app
Content-Type: application/json

{
  "to": "+15551234567",
  "message": "Alliance update text"
}
```

Response:

```json
{ "ok": true, "status": "queued" }
```

Read latest inbound SMS:

```http
GET /sms/latest?from=9379854448
X-Bridge-Token: generated-token-shown-in-app
```

Response:

```json
{
  "ok": true,
  "message": {
    "from": "+19379854448",
    "body": "Reply text",
    "date": 1770000000000
  }
}
```

## Security Rules

- Keep this bridge on a trusted Wi-Fi network or VPN.
- Do not expose port `8787` directly to the public internet.
- Every send request requires `X-Bridge-Token`.
- Every SMS read request requires `X-Bridge-Token`.
- Treat this as a controlled transport adapter, not a bulk texting system.
- Respect explicit opt-in, STOP requests, church policy, and carrier rules.
- Keep production service-role keys outside the Android app.

## Development

Open this folder in Android Studio:

```text
alliance-android-sms-bridge/
```

Build and install the app on the phone, grant SMS permission, then press **Start Bridge**. The screen shows the local API URL and bridge token.

When **Start Bridge** is pressed, the app runs as a foreground service with a persistent notification. The screen does not need to stay on, and the app interface does not need to remain open. It keeps the SMS API available while the screen is off and remembers that the bridge was enabled so it can restart after phone reboot.

Set **Bridge phone number** in the app before enabling cloud relay. The cloud relay ignores inbound inbox rows from that number so the bridge does not process its own messages and accidentally create an SMS loop.

If Google Voice is linked to the same Android phone, keep three identities separate:

- `Bridge number`: the SIM/transport number in this Android app.
- `Admin/test number`: your personal or Google Voice number.
- `User number`: the person being onboarded.

Do not run profile intake for the bridge number. The app also suppresses recent outbound echoes by matching the last sent body, destination, and timestamp, which helps when Google Voice or carrier sync mirrors sent messages back into the SMS inbox.

Hub is the authority for active profile status. The bridge may cache local profile setup state for its own session bookkeeping, but it must not override Hub registration truth with local context when Hub says a profile is active or inactive.

Regex lane messages are test-only. For the configured pilot phone, the bridge now checks the regex lane before event/profile menu routing so the Hub test path can win first without becoming the primary lane for everyone else.

On Samsung devices, disable battery sleeping/optimization for **Alliance SMS Bridge** if Android later pauses the service in the background.

In the app, use **Keep Bridge Always On** to open Android's battery optimization exemption prompt.

CLI build, once `JAVA_HOME` and the Android SDK are available:

```powershell
.\gradlew.bat assembleDebug
```

Install to a USB-connected device:

```powershell
adb devices -l
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

If `adb devices -l` shows no device, enable Developer Options and USB debugging on the phone, unlock the screen, accept the RSA authorization prompt, and make sure the cable supports data transfer.

Local USB health test after pressing **Start Bridge**:

```powershell
adb forward tcp:8787 tcp:8787
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8787/health
```

Expected response:

```json
{"ok":true,"service":"alliance-sms-bridge"}
```

Screen-off verification:

```powershell
adb shell input keyevent KEYCODE_SLEEP
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8787/health
adb shell input keyevent KEYCODE_WAKEUP
```

## Local Dispatcher And Supabase

The Android app should not call Supabase directly. The local dispatcher calls the phone bridge, then writes SMS events through the existing Supabase Edge Function:

```text
Local API
  -> Android SMS Bridge
  -> Supabase Edge Function: alliance-record-write
  -> Supabase alliance_records
```

Required local environment:

```powershell
$env:ALLIANCE_SMS_BRIDGE_TOKEN='token-shown-in-app'
$env:ALLIANCE_DISPATCHER_TOKEN='long-random-dispatcher-token'
```

Optional overrides:

```powershell
$env:ALLIANCE_SMS_BRIDGE_URL='http://127.0.0.1:8787'
$env:ALLIANCE_SUPABASE_ENV='E:\telechurch-e2e\.env.master'
```

Check bridge and Edge Function config:

```powershell
npm run bridge:status
```

Persist the latest inbound SMS through the Edge Function:

```powershell
npm run bridge:latest -- --from 9379854448
```

Start the local dispatcher API:

```powershell
npm run bridge:server
```

Dispatcher endpoints:

```http
GET http://127.0.0.1:8788/health
GET http://127.0.0.1:8788/sms/latest?from=9379854448
X-Dispatcher-Token: long-random-dispatcher-token

POST http://127.0.0.1:8788/sms/send
X-Dispatcher-Token: long-random-dispatcher-token
Content-Type: application/json

{
  "to": "9379854448",
  "message": "Alliance bridge checking in."
}
```

## Cloudflare Tunnel

Expose the dispatcher, not the phone bridge:

```text
Cloudflare public URL
  -> cloudflared
  -> Local dispatcher :8788
  -> Android SMS Bridge :8787
```

Development quick tunnel:

```powershell
cloudflared tunnel --url http://localhost:8788
```

Cloudflare will print a temporary `https://*.trycloudflare.com` URL. Use the dispatcher token on all SMS endpoints:

```powershell
Invoke-WebRequest `
  -UseBasicParsing `
  -Uri 'https://example.trycloudflare.com/sms/latest?from=9379854448' `
  -Headers @{ 'X-Dispatcher-Token' = $env:ALLIANCE_DISPATCHER_TOKEN }
```

For a permanent production URL, create a named Cloudflare Tunnel and route a hostname to `http://localhost:8788`.

Runtime state for the current dev tunnel:

```text
Dispatcher: http://127.0.0.1:8788
Tunnel type: Cloudflare quick tunnel
Public health: /health
Public SMS endpoints: require X-Dispatcher-Token
```

Detached relay mode:

```text
Cloudflare public URL
  -> Dispatcher queues outbound SMS
  -> Phone polls /phone/next over outbound HTTPS
  -> Phone sends SMS locally
  -> Phone reports status to /phone/report
  -> Phone pushes inbound SMS to /phone/inbound
```

Queue an outbound SMS for phone polling:

```powershell
Invoke-WebRequest `
  -UseBasicParsing `
  -Method Post `
  -Uri 'https://example.trycloudflare.com/sms/send?relay=true' `
  -Headers @{ 'X-Dispatcher-Token' = $env:ALLIANCE_DISPATCHER_TOKEN } `
  -ContentType 'application/json' `
  -Body '{"to":"9379854448","message":"Alliance detached relay test"}'
```

Read the latest inbound message pushed by the phone relay:

```powershell
Invoke-WebRequest `
  -UseBasicParsing `
  -Uri 'https://example.trycloudflare.com/sms/latest?from=9379854448&relay=true' `
  -Headers @{ 'X-Dispatcher-Token' = $env:ALLIANCE_DISPATCHER_TOKEN }
```

## Supabase Edge Relay

The computerless path uses Supabase Edge Functions instead of the local dispatcher:

```text
Alliance / API caller
  -> Supabase Edge Function: alliance-sms-relay
  -> alliance_sms_outbox
  -> phone polls /phone/next over outbound HTTPS
  -> phone sends SMS
  -> phone reports /phone/report
  -> phone pushes inbound replies to /phone/inbound
```

Current function:

```text
https://skqmzcdmfaijxpbvcdal.supabase.co/functions/v1/alliance-sms-relay
```

Queue SMS directly in the cloud:

```powershell
Invoke-WebRequest `
  -UseBasicParsing `
  -Method Post `
  -Uri 'https://skqmzcdmfaijxpbvcdal.supabase.co/functions/v1/alliance-sms-relay/sms/send' `
  -Headers @{ 'X-Dispatcher-Token' = $env:ALLIANCE_DISPATCHER_TOKEN } `
  -ContentType 'application/json' `
  -Body '{"to":"9379854448","message":"Alliance cloud relay test"}'
```

Once the phone has been configured with this function URL, the computer, local dispatcher, Cloudflare quick tunnel, LAN, and ADB forward are not required for outbound SMS relay.

## Alliance Cloudflare profile form

First-time Alliance profile intake now routes through the dedicated Cloudflare Pages app:

```text
https://alliance.telechurchlive.com/profile/{signed-token}
```

The SMS relay signs the token with the sender phone number attached. The form shows that phone number as read-only, collects first name, last name, optional email, optional image URL, distinction, and SMS authorization, then writes the profile and completed SMS context to Supabase.

Deployment commands from the workspace root:

```powershell
npm run alliance:forms-check
npm run alliance:forms-deploy
npm --prefix refer-zo-bootstrap run alliance:sms-relay-deploy -- --deploy
```

## Deterministic Profile Intake

The first reusable SMS script is `alliance.profile_setup.sms.v1`. It runs under one durable phone context, but it does not collect names by SMS. It queues a signed Cloudflare form link through the Supabase SMS relay and stores local execution state in:

```text
.alliance-sms/profile-contexts.json
```

That file is ignored by git because it can contain phone numbers and profile details.

Registered users are handled differently from first-time users:

- texting `Profile` returns the saved member profile link;
- unknown or ambiguous text returns the current action menu with Home, About, Profile, and available SMS commands;
- profile creation is not restarted unless the user sends `RESET`.

Inspect the script contract:

```powershell
npm run profile:script
```

Start profile setup for a phone number and queue the first outbound prompt through the Supabase relay:

```powershell
npm run profile:start -- --to 6788292740
```

Dry-run the same command without sending SMS:

```powershell
npm run profile:start -- --to 6788292740 --send false
```

`--send false` keeps the transition local and skips both outbound SMS delivery and Supabase record writes.

The registration flow starts on any inbound SMS from a phone number that does not have a completed profile context. The first inbound message creates the phone context and sends the Cloudflare profile form link:

```powershell
npm run profile:reply -- --from 6788292740 --message "Any first message"
```

In the live Supabase relay, `/phone/inbound` now performs the same route automatically: it records the inbound SMS, persists `sms_profile_context` in `alliance_records`, queues the next outbound prompt in `alliance_sms_outbox`, and pauses repeated prompts after the third request until the profile form is completed.

Users can text `RESET` to clear their current profile setup attempt, restart the prompt count, receive a fresh registration link, and invalidate the previous registration link.

The outbound copy is deterministic:

```text
Hi, got your message. Please register here so your message can be passed on to the admin.
https://alliance.telechurchlive.com/profile/{signed-token}
```

Registered phones are not prompted again; their inbound SMS is recorded for admin handling.
After a profile is saved, the registration link is treated as used and is rejected by the Cloudflare form. The member profile page can request an `Edit Profile` SMS; that edit link expires after 30 minutes and is single-use.

Check persisted phone context:

```powershell
npm run profile:context -- --phone 6788292740
```

Supported states:

```text
awaiting_start
awaiting_first_name
awaiting_last_name
awaiting_image
completed
cancelled
```

The profile intake script is deterministic. It validates names, sends an upload link, accepts `DONE`, `SKIP`, or a public `http(s)` image link for the image step, and treats `STOP` or `CANCEL` as cancellation.

Profile and upload links default to `https://telechurchlive.com/allianceprofile`. Override them when a dedicated Alliance subdomain is ready:

```powershell
$env:ALLIANCE_PROFILE_BASE_URL='https://alliance.telechurchlive.com/profile'
$env:ALLIANCE_PROFILE_UPLOAD_BASE_URL='https://alliance.telechurchlive.com/profile/upload'
```

## Alliance Fit

This maps to the Alliance vocabulary as:

- `Android Bridge`: the phone-side transport adapter.
- `Conversation Intake`: future inbound replies and command parsing.
- `Personal Link`: future user-specific action URLs sent by text.
- `STOP Policy`: required guardrail before broad rollout.
