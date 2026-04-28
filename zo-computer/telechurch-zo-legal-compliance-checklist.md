# Telechurch Zo Legal and Compliance Checklist

Last updated: 2026-04-21
Status: Draft for legal review
Instance: `telechurch`
Space: `https://telechurch.zo.space`

This is not legal advice. It is an operating checklist for the Telechurch Zo Admin POC so builders do not wire risky behavior before legal review.

## Current Legal Routes

- `/legal`
- `/privacy`
- `/terms`
- `/consent`

These routes are draft notices only. They should not be treated as final policies until reviewed by counsel.

## Required Legal Gates Before Live Launch

### 1. Privacy Notice

Must disclose:

- what personal information is collected
- why it is collected
- whether Zo, Telechurch, or third-party providers process it
- retention expectations
- user choices and deletion/access request paths
- contact point for privacy questions
- whether minors are allowed

Build rule:

- Do not collect live profile/org/contact data from Zo until privacy notice is reviewed.

### 2. Terms of Use

Must cover:

- acceptable use
- ministry/admin responsibility for user-provided content
- account authority and role responsibility
- AI assistant limitations
- no guarantee that AI suggestions are error-free
- suspension/termination language
- dispute/venue/arbitration posture, if desired

Build rule:

- Treat AI output as assistant guidance, not legal, financial, pastoral, or professional advice.

### 3. Consent for Guided Setup

Must be explicit before:

- creating an organization
- updating a profile
- importing contacts
- sending welcome emails
- sending SMS
- inviting users
- changing billing/plan state
- publishing public content

Build rule:

- Every mutation needs a preview step and explicit confirmation.

### 4. Email Compliance

Before welcome/marketing emails:

- identify the sender accurately
- avoid misleading subject lines
- include a valid physical/postal contact where required
- include unsubscribe/opt-out where required
- honor opt-outs promptly

Build rule:

- Welcome email flow must remain draft-only until compliance copy and unsubscribe behavior are approved.

### 5. SMS / Phone Consent

Before SMS:

- capture clear consent for the identified sender and message category
- record consent source and timestamp
- support STOP/opt-out behavior
- separate transactional and promotional categories where needed

Build rule:

- No SMS route should be wired in the overnight build.

### 6. Minors / Children

Before allowing children or youth data:

- decide whether users under 13 are allowed
- if youth ministry/member data is collected, require a counsel-reviewed minors policy
- avoid child-directed data collection until COPPA posture is reviewed

Build rule:

- POC should assume admin users are adults and should not collect child member data.

### 7. Billing / Plan Changes

Before paid plan or billing:

- show plan price, renewal terms, cancellation terms, and who has authority
- require explicit billing confirmation
- record audit event

Build rule:

- Keep billing/upgrade flows educational only until payment terms are reviewed.

### 8. Audit Trail

Every live action should log:

- actor id
- tenant/org id
- role/scope
- action type
- before/after summary
- confirmation text/version
- source route
- correlation id
- timestamp

Build rule:

- No confirmed mutation without audit event design.

## Overnight AI Assistant Scope

Allowed:

- explain legal gates
- teach users why consent is needed
- draft copy for review
- identify missing policy decisions
- summarize what would happen before a mutation

Forbidden:

- presenting draft terms/privacy as final legal advice
- collecting real contact imports
- sending email/SMS
- executing paid upgrades
- processing children/youth data
- hiding AI involvement

## Official Reference Starting Points

- FTC CAN-SPAM business guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- FTC COPPA compliance plan: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- FTC COPPA FAQs: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- FCC TCPA consent revocation order: https://docs.fcc.gov/public/attachments/FCC-24-24A1.pdf

## Human Checkpoint

Before live launch, decide:

1. Who is the legal entity/operator for Telechurch Admin?
2. What sender identity is used for welcome emails?
3. Will SMS be supported in v1?
4. Are youth/minor profiles or children under 13 in scope?
5. What postal/contact address should appear in policy and email notices?
6. What jurisdiction/dispute language should Terms use?
