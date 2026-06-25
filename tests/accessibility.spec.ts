import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run a full axe-core WCAG 2.1 AA scan on the current page and assert zero
 * violations. Violations are printed to the test output on failure so that
 * the exact rule, impact level, and node can be diagnosed without a browser.
 */
async function checkA11y(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  if (results.violations.length > 0) {
    const summary = results.violations
      .map((v) => {
        const nodes = v.nodes
          .map((n) => `    - ${n.html}`)
          .join('\n');
        return `[${v.impact}] ${v.id}: ${v.description}\n${nodes}`;
      })
      .join('\n\n');
    throw new Error(
      `axe found ${results.violations.length} accessibility violation(s):\n\n${summary}`,
    );
  }
}

/**
 * Assert that all <img> elements on the page have a non-empty alt attribute.
 * Images with role="presentation" or aria-hidden="true" are permitted to have
 * an empty alt, as that is the correct pattern for decorative images.
 */
async function checkImageAlt(page: Page): Promise<void> {
  const violations = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
    return imgs
      .filter((img) => {
        const isDecorative =
          img.getAttribute('role') === 'presentation' ||
          img.getAttribute('aria-hidden') === 'true';
        if (isDecorative) return false;
        const alt = img.getAttribute('alt');
        return alt === null || alt.trim() === '';
      })
      .map((img) => img.outerHTML.slice(0, 200));
  });

  expect(
    violations,
    `Found img elements with missing or empty alt text:\n${violations.join('\n')}`,
  ).toHaveLength(0);
}

/**
 * Smoke-check that the page stylesheet includes :focus-visible rules.
 * This confirms the design system ships focus styles rather than stripping
 * them with `outline: none` globally. A full visual check requires Playwright
 * visual comparisons and is out of scope for this run.
 */
async function checkFocusVisible(page: Page): Promise<void> {
  const hasFocusVisible = await page.evaluate(() => {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule.cssText.includes(':focus-visible')) return true;
        }
      } catch {
        // Cross-origin stylesheets throw on cssRules access -- skip them
      }
    }
    return false;
  });

  expect(
    hasFocusVisible,
    'No :focus-visible rules found in page stylesheets. ' +
      'Ensure the design system exposes visible focus indicators.',
  ).toBe(true);
}

/**
 * Assert that the page has exactly one <h1> element.
 */
async function checkSingleH1(page: Page): Promise<void> {
  const h1Count = await page.locator('h1').count();
  expect(h1Count, `Expected exactly 1 <h1> but found ${h1Count}`).toBe(1);
}

/**
 * Assert that heading levels do not skip (e.g. h1 -> h3 with no h2 in
 * between). Checks that every heading level present has the previous level
 * present somewhere above it in the DOM order.
 */
async function checkHeadingOrder(page: Page): Promise<void> {
  const skips = await page.evaluate(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('h1,h2,h3,h4,h5,h6'),
    );
    const issues: string[] = [];
    let prevLevel = 0;

    for (const el of headings) {
      const level = parseInt(el.tagName[1]!, 10);
      // A jump of more than one level (e.g. h1 -> h3) is a skip
      if (level > prevLevel + 1) {
        issues.push(
          `Heading skips from h${prevLevel} to h${level}: "${el.textContent?.trim()}"`,
        );
      }
      prevLevel = level;
    }
    return issues;
  });

  expect(
    skips,
    `Heading levels skip in the DOM:\n${skips.join('\n')}`,
  ).toHaveLength(0);
}

// ---------------------------------------------------------------------------
// Shared assertion runner applied to every tested route
// ---------------------------------------------------------------------------

async function runAllChecks(page: Page): Promise<void> {
  await checkA11y(page);
  await checkImageAlt(page);
  await checkFocusVisible(page);
  await checkSingleH1(page);
  await checkHeadingOrder(page);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Accessibility: homepage (/)', () => {
  test('passes all a11y checks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await runAllChecks(page);
  });
});

test.describe('Accessibility: about page (/about)', () => {
  test('passes all a11y checks', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    await runAllChecks(page);
  });
});

test.describe('Accessibility: blog index (/blog)', () => {
  test('passes all a11y checks', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    await runAllChecks(page);
  });

  test('empty state renders a single h1 when no posts exist', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    // The blog index always renders exactly one h1 regardless of post count
    const h1Count = await page.locator('h1').count();
    expect(h1Count, 'Blog index must have exactly one h1 even with zero posts').toBe(1);
  });

  test('filter pills are all keyboard focusable', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    const pills = page.locator('[data-pill]');
    const count = await pills.count();
    // Must have at least the four category pills defined in the markup
    expect(count, 'Expected at least 4 filter pills').toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) {
      const pill = pills.nth(i);
      // Each pill is an <a> tag so it must be in the tab order
      await expect(pill).toHaveAttribute('href');
    }
  });
});

test.describe('Accessibility: blog post (/blog/[slug])', () => {
  /**
   * This test is skipped when the content collection is empty because
   * Astro generates no static routes for blog/[slug] with zero posts.
   * Once the first post is published, the test will automatically detect
   * the available slug and run.
   */
  test('passes all a11y checks on the first available post', async ({ page }) => {
    // Fetch the blog index page and look for any post link
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Find the first link that points to a blog post URL (/blog/<slug>).
    // Use count() first -- it returns immediately without waiting, unlike
    // getAttribute() which blocks until an element appears (and times out
    // when the content collection is empty).
    const postLinks = page.locator('a[href^="/blog/"]');
    if (await postLinks.count() === 0) {
      // No posts exist yet -- skip gracefully rather than failing
      test.skip();
      return;
    }
    const firstPostLink = await postLinks.first().getAttribute('href');
    if (!firstPostLink) return;

    await page.goto(firstPostLink);
    await page.waitForLoadState('networkidle');
    await runAllChecks(page);
  });
});
