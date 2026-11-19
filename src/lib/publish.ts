/**
 * Scheduled publishing rule (pure, no Astro imports so it can be unit tested).
 *
 * A post is live once its frontmatter `date` has arrived. Dates parse as UTC
 * midnight, so a post dated Tuesday goes live on the first build that runs on
 * or after 00:00 UTC Tuesday. Future-dated posts are left out of every build
 * output (pages, tag pages, RSS, llms.txt, sitemap) until then.
 *
 * `includeFuture` lets dev servers and PR preview builds render drafts that
 * are dated for a later publish day. Production builds never set it.
 */
export function isPublished(date: Date, now: Date, includeFuture = false): boolean {
  if (includeFuture) return true;
  return date.valueOf() <= now.valueOf();
}
