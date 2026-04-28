# REFER Library Update Model

## Version Fields

Use these fields in library/install metadata:

- `library_version`
- `refer_version`
- `update_channel`
- `startup_binding_required`
- `startup_binding_version`
- `startup_binding_installed`

## Bootstrap Rule

A Zo machine is not fully REFER-bootstrapped unless:

1. required REFER skills are installed into `Zo Files/Skills/**`
2. local workspace binders exist or their absence is recorded
3. startup surfaces are patched or instructed to read `Zo Files/agent.md`, `Zo Files/AGENTS.md`, and `Zo Files/REFER.OS/**` before first substantive response

## Prompt Policy

Default update posture:
- prompt if behind
- do not force-update active work mid-session
- offer `update_now`, `remind_later`, `skip_this_version`
- reserve priority prompting for critical governance or security updates
