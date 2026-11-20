# Atlas Rush Results and Progress Proposal

Save each finished game automatically in IndexedDB and give players a **My results** dashboard at `/games/atlas-rush/results/`. Let players add an optional display name after a round and share a single result through a link that opens on another device. The dashboard reads private history in the browser. Each shared result gets its own URL and renders as HTML on the server.

## After a round

1. Show the existing mission report immediately and save the result in the background. Save both completed and timed-out rounds, including rounds with zero guesses. Leaving an unfinished round keeps the existing game behavior and adds no history entry.
2. Offer an optional **Display name** field with a **Save name** button. The score is already being saved, so the player can skip the field and add or change the name later from the dashboard. Keep the name attached to this one result. Leave initial focus on the primary action so the keyboard stays closed on mobile until the player taps the field.
3. Offer **Share result** and **My results** alongside the existing **Play again** and **Start over** actions. Show **Saved on this device** after the write commits. If storage fails, offer **Retry save** and keep the current report and sharing available. In-app navigation should let the pending save settle and give the player a clear way to leave if it fails.

## My results dashboard

Link to **My results** from the Atlas Rush settings page and the mission report. Use the shared top bar and the Atlas Rush visual style. Let the page scroll naturally so a long history remains usable on small screens.

| Area             | Wide screens                                                                                  | Phones                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Progress summary | Show attempts, best coverage and fastest completion in a row.                                 | Wrap the metrics into a compact grid.                                                                        |
| Recent progress  | Plot coverage on a 0–100% scale for the last 10 comparable attempts, oldest to newest.        | Keep the same scale and show fewer axis labels. Include a short text summary.                                |
| History          | Show the latest results first in a table with date, region, difficulty, mode, score and time. | Use stacked cards with score and time near the top. Keep detail, share and delete actions within easy reach. |

History starts with all attempts and supports filtering by region, difficulty, Learning mode and answer mode. A **Progress for** selector switches the summary and chart between groups the player has played, starting with the group from their latest round. A group matches region, difficulty, Learning mode, full-name or prefix rules (including prefix length), and rules version. This keeps a faster Speed mode round from replacing a full-name personal best. Calculate fastest completion from completed rounds. With one comparable attempt, show its score and invite the player to play again to see a trend.

Each result opens a detail view with the display name, finish reason and full mission report. Include **Share result** and **Delete result**, with confirmation before deletion. Give the dashboard clear loading, empty and storage-unavailable states. In the empty state, offer **Start survey**.

## Local history and saving

The current `atlas-rush` database holds resumable sessions in a `sessions` store keyed by challenge. Repeated rounds on the same challenge need separate history entries. Upgrade the database to version 2, preserve the existing store and add a `results` store keyed by a unique attempt ID, with an index on completion time for the history list. Start collecting history with the first release. A resumed session from version 1 can receive its attempt ID when it is claimed. [Current database setup](../src/games/atlas-rush/infrastructure/persistence/database.ts)

Generate the attempt ID when a round starts and persist it with the session across refresh and resume. A replay gets a new ID even when it uses the same challenge seed. Store the existing `GameResults` snapshot, completion timestamp and optional display name. The snapshot already contains the challenge configuration, counts, elapsed time and finish reason. Retain its original target count so future changes to a map leave past scores meaningful. [Current results model](../src/games/atlas-rush/domain/types.ts)

For a saved session, have its owning tab write the final session state and result in one transaction. A retry with the same attempt ID should return the saved result and preserve any name edit. When a round starts in memory because storage is unavailable, retain its report for sharing and allow a save retry if storage comes back. History stays in the browser profile for this site. Clearing site data or browser eviction can remove it. [IndexedDB transactions](https://www.w3.org/TR/IndexedDB/#transaction), [Storage Standard](https://storage.spec.whatwg.org/#persistence)

## Server rendered result links

Use `/games/atlas-rush/results/shared/v1.<token>/`, with the result token in the URL path. When someone opens the link, Astro decodes and validates the token on the server and returns the full report in the initial HTML. The recipient can read it with JavaScript disabled and select **Try this challenge** to play with the original settings and seed when the rules version is supported. The response can include a result-specific title and score for link previews. Opening it leaves the recipient’s progress history intact.

Show a preview before **Copy link**. Share the region, difficulty, mode, correct and total counts, elapsed time, finish reason and challenge information. Start with **Include display name** off and keep names out of link-preview metadata. Keep the local attempt ID, exact completion timestamp and other rounds out of the token. Anyone with the link can read it, and the full path may appear in browser history or hosting logs. Editing or deleting the local result leaves existing links intact. Label shared scores **Unverified result**, since the score comes from the player’s browser and the token can be edited.

| Encoding                    | Trade-off                                                                                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JSON + base64url**        | Recommended for the first release. The browser puts one report in the path token. The server renders it directly, so sharing needs no server database. [Base64url specification](https://www.rfc-editor.org/rfc/rfc4648#section-5) |
| **MessagePack + base64url** | A more compact token with the same server-rendered flow. Consider it if sample links prove too long. [MessagePack format](https://msgpack.org/)                                                                                    |

If short or revocable links become a requirement, use a random ID in the path and have the server look up an explicitly shared report in a database. This adds an endpoint to publish the report and a way to manage or revoke it. The local history can still stay in IndexedDB.

Give the share format its own version, separate from the game rules. The server should cap the token length before decoding, validate the allowed fields, counts, time and name length, and render the name as plain text. Return a helpful error page with a link back to Atlas Rush if the token is malformed or the share format is unsupported. Keep the link visible for manual copying if clipboard access fails.

Atlas Rush currently builds as a static Astro site. Add a Cloudflare runtime through an Astro-compatible adapter and opt this route into on-demand rendering. The dashboard route can still ship as static HTML with React reading IndexedDB in the browser. On an Astro 5 Cloudflare Pages deployment, confirm the shared route reaches the server function in preview. [Current Astro config](../astro.config.mjs), [Astro 5 on-demand rendering](https://v5.docs.astro.build/en/guides/on-demand-rendering/), [Astro 5 Cloudflare routing](https://v5.docs.astro.build/en/guides/integrations-guide/cloudflare/#routing-on-cloudflare-pages)

## First implementation to review

Build the save and naming flow first, then the dashboard and progress view, then single-result sharing. The first visual review should cover a fresh dashboard, a history spanning several modes, the results report with the phone keyboard open, and a shared report opened in a separate browser profile. Check that refresh and resume produce one entry per attempt, repeated challenges produce separate entries, and the dashboard works at 320px wide without horizontal scrolling. For sharing, verify that the first HTTP response contains the score, the page works with JavaScript disabled, and a malformed link returns the error page.
