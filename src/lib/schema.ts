/**
 * Shared JSON-LD entities for structured data (SEO/AIO/GEO).
 *
 * The Person entity is the canonical machine-readable identity for the
 * site's single author. Every BlogPosting references it by @id so AI
 * engines and Google can connect each article to a real, verifiable
 * person (see /about for the human-readable version).
 */

export const SITE_URL = 'https://probl.me';
export const SITE_NAME = 'probl.me';
export const SITE_DESCRIPTION =
  'Building software in public — PM craft, AI-assisted development, and tech tools.';
export const PERSON_ID = `${SITE_URL}/about/#richard`;

export const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Richard Muffler',
  url: `${SITE_URL}/about/`,
  image: `${SITE_URL}/assets/richard.webp`,
  jobTitle: 'Director of Product Management',
  worksFor: {
    '@type': 'Organization',
    name: 'ReversingLabs',
  },
  description:
    'Cybersecurity and SaaS product manager with a decade in security (ReversingLabs, SentinelOne, Secureworks, Cylance). Building probl.me and Celly in public.',
  sameAs: [
    'https://www.linkedin.com/in/richardmuffler/',
    'https://github.com/rustymuffler',
  ],
};

/** Minimal reference to the Person entity for embedding in other schemas. */
export const personRef = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Richard Muffler',
  url: `${SITE_URL}/about/`,
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  author: personRef,
};
