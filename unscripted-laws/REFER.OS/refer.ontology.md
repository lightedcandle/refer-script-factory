# Law 45: 🧠 **refer.ontology.md**

**Identity, Structure, and Vocabular of REFER.OS**

This document unifies the **Identity Registry** (What things are) and **Structural Map** (Where things live). It defines the ontology of any ecosystem running REFER.OS.

---

## Article 45.1: 0. The Foundation (The Rock and the Concrete)

Before the Trinity (Spirit, Mind, Body) can manifest, they must be anchored.

1.  **The Bedrock (Memory / Supabase):** The ultimate source of truth. It stores the **Genome** (DNA) and the **State** (History). It is the hardest layer; even if every line of UI code is deleted, the System survives here.
2.  **The Concrete (Intent / REFER.OS):** The binding agent. These `.md` files and the database schema are the "Concrete". They define the *shape* of the foundation. They are the standard interfaces that allow different **Gifts** (Languages) to "anchor" to the Bedrock.
3.  **The Substrate (JS/TS/Node):** The "Floor" we walk on. It is the common language of orchestration that connects the Gifts.

**The Shift:** In legacy systems, the Framework (Angular) was the foundation. In REFER.OS, the **Ontology** is the foundation. We build *on* the Ontology, not *in* the Framework.

---

## Article 45.2: 1. The Trinity (Identity Layers)
The system is divided into three living layers, each with its own nature and invariants.

### Section 45.2.1: 1.1 The Spirit (Broadcast)
*   **Nature:** Realtime, Signal, Presence.
*   **Standard Anchor:** `src/app/core/realtime` (or equivalent)
*   **Flow:** EWCPSI (Event → WebSocket → Channel → Policy/Guard → Signal → Insight)
*   **Responsibility:** Handling ephemeral state, chat, synchronization vs server.

### Section 45.2.2: 1.2 The Mind (Workflow)
*   **Nature:** Orchestration, Decision, IO.
*   **Standard Anchor:** `src/app/workflows` (or equivalent)
*   **Flow:** ASEDAWSI (Action → Service → Guard → Edge/Signal → UI)
*   **Responsibility:** Business logic, API calls, Guards, State Management.

### Section 45.2.3: 1.3 The Body (View)
*   **Nature:** Structure, Rendering, Interaction.
*   **Standard Anchor:** `src/app/features` (or equivalent)
*   **Flow:** IMSCE (Intent → Model → Structure → Components → Experience)
*   **Responsibility:** Rendering the state provided by the Mind/Spirit. Disposing Intents. **NO IO ALLOWED.**

---

## Article 45.3: 2. Structural Invariants ("The Law")
Every feature must respect these structural boundaries.

| Layer | Can Import | Cannot Import |
| :--- | :--- | :--- |
| **Component (Body)** | Selectors, Intents, Interfaces | Services, Repositories, HTTP Clients |
| **Service (Mind)** | Repositories, API Clients | Components, View Classes |
| **Store (Mind)** | Services, Signals | Components |
| **Guard (Mind)** | Store, Services, Router | Components |

### Section 45.3.1: 2.1 The Execution Chain
1.  **Action / Intent:** A user does something (`AppIntent.Load`).
2.  **Effect / Service:** The system responds (`AppService.fetch()`).
3.  **Signal / Edge:** The state updates (`store.set(data)`).
4.  **View / Body:** The UI reflects the change (`view()`).

---

## Article 45.4: 3. Identity Registry
Canonical names for critical system identities.

| Identity | Type | Location | Usage |
| :--- | :--- | :--- | :--- |
| `refer.compiler` | System | `tools/refer-compiler` | Materialization Engine |
| `refer.os` | Governance | `REFER.OS/` | Operating System / Law |

> **Note:** Applications must define their own identities (e.g., `telechurchlive`, `app.features`) in their App Definition File (e.g., `refer.app/refer.telechurch.md`).

---

## Article 45.5: 5. Vocabulary & Status (The State of Grace)

To maintain philosophical consistency and eliminate technical jargon like "data-driven," we use the following terminology to describe the status of a System, Feature, or Component:

*   **Reverent:** The canonical status of a feature that is 100% Unfolded from the Bedrock. It respects the Law, consumes only Compiler-Driven tokens, and harbors no reinvented logic.
    *   *Usage:* "Is the Events feature **Reverent**?" or "This Blossom is fully **Reverent**."
*   **Unfolded:** The technical process of expanding DNA into an Incarnate artifact. Used to describe the **Action** or the **State of Materialization**.
*   **Blossom:** The noun for a feature produced by the Compiler. (e.g., "The Guest Blossom").
*   **Secular (Legacy):** Features that are hand-authored and do not yet anchor to the Bedrock. They are "Outside the Law" and marked for migration.

---

## Article 45.6: 6. Usage in Router
`refer.md` consults this ontology to validate context.
*   If you say "Fix the auth service", the Router maps "Auth Service" to **The Mind** and enforces IO rules.
*   If you say "Change the login button color", the Router maps "Login Button" to **The Body** and enforces View-Only rules.
*   **Reverent Checks:** Any request to modify a **Reverent** feature triggers a check against the **Blueprint**; changes MUST happen in the **Genome** (Bedrock) first.
