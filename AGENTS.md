<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Imported site pages keep their markup and interactions in their own route file, with retained source CSS in `src/styles/site.css`; edit them in place so the clone stays traceable to `.site-import/`.
- Keep one root session subscriber and inline student access on project actions so public browsing stays available and session state stays consistent.
- Create private student profiles through the Auth signup trigger and enforce owner-only reads and updates with RLS so signup and profile creation remain atomic.
- Preserve each additional imported page in its route with page-scoped retained CSS; remove captured modal-lock state and restore controls in place to keep source comparisons traceable.
- Store product detail pages render from one catalogue module through a single dynamic store route outside the store list layout, so every product link resolves without one route file per product.
- Keep the shopping cart in one browser-storage module read through a shared hook, so every page header and cart panel show the same items after hydration.
