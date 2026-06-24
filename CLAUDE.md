@AGENTS.md

---

## ⚠️ CONTEXT MANAGEMENT — REQUIRED BEHAVIOUR

When context usage reaches approximately **90%**, you MUST automatically:

1. Create a versioned handoff document at:
   `HANDOFF-YYYY-MM-DD-HHMM.md`
   (use current date/time, 24h format, e.g. `HANDOFF-2026-06-22-1400.md`)

2. The handoff document must include:
   - **Current date/time**
   - **Task type** (code session or content session)
   - **Complete list of every file created or modified** this session
   - **What is fully complete**
   - **What is in progress or partially done**
   - **Exact next steps** with enough detail for a cold session to continue without re-reading the conversation
   - **Critical invariants** that must never be violated (copy from the most recent handoff)
   - **Key decisions made** this session
   - **Commands needed to resume** (if a code session)

3. Tell the user: "Context is near limit — handoff document created at `HANDOFF-YYYY-MM-DD-HHMM.md`. Start a fresh session and open that file to resume."

4. Do NOT wait to be asked. Do NOT summarise verbally instead. Write the file.

This instruction applies to every session on the probl.me project — whether the session is writing code, drafting content, or doing design work.
