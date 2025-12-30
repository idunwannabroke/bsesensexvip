Create a **Deep Technical Snapshot** of the current project state.

**INSTRUCTIONS:**
1.  **Capture the "NOW":** Record the exact current status of the codebase, including the Tech Stack, Directory Structure, and key Architecture Decisions (e.g., Service Pattern, Feature-based Frontend).
2.  **Include Recent Fixes:** Specifically mention critical fixes applied (e.g., Clerk Proxy vs Middleware, Serialization fixes, Environment loading).
3.  **No Fluff:** Do NOT include future plans, roadmaps, or "next steps". Only record what effectively *exists* and *works* right now.
4.  **Format:** Return ONLY the content block below.

Format exactly like this:

--- MEMORY START ---
[Insert compressed technical state here including Stack, Architecture, File Structure changes, and Current Functionality]
--- MEMORY END ---

Then, save the result into a file named:
`/memorys/[Project Name]-YYYYMMDD.md`
(Replace `YYYYMMDD` with today's date)

The result must be usable as direct input for a new session to restore the exact development context.