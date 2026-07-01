/**
 * Reusable sitemap utilities for Kirby CMS + Nuxt projects.
 * Copy this file to any Nuxt/Kirby project and wire it to a server route.
 */

export type SitemapChangeFreq =
  | 'always' | 'hourly' | 'daily' | 'weekly'
  | 'monthly' | 'yearly' | 'never'

export type SitemapEntry = {
  /** URL path, e.g. '/works/my-project' */
  loc: string
  /** ISO date string, e.g. '2024-01-15' */
  lastmod?: string
  changefreq?: SitemapChangeFreq
  /** 0.0 to 1.0 */
  priority?: number
}

export type KirbyFetchConfig = {
  /** Kirby CMS base URL, e.g. 'https://cms.example.com' */
  cmsURL: string
  email: string
  password: string
}

export type KirbyRouteConfig = {
  /**
   * KQL query returning a page collection.
   * e.g. "page('projects').children.filterBy('status', 'listed')"
   */
  query: string
  /**
   * KQL select fields. Always include 'slug: true'.
   * Add any extra fields needed by the filter callback.
   */
  select?: Record<string, unknown>
  /** URL prefix applied to each slug, e.g. '/works/' */
  pathPrefix?: string
  changefreq?: SitemapChangeFreq
  priority?: number
  /**
   * Optional post-fetch filter. Return false to exclude a page.
   * Receives the raw page data from the CMS (all selected fields).
   */
  filter?: (page: Record<string, unknown>) => boolean
}

/** Builds a complete sitemap XML string from a list of entries. */
export function buildSitemapXML(siteURL: string, entries: SitemapEntry[]): string {
  const urls = entries.map(entry => {
    const parts = [
      `<loc>${escapeXML(siteURL + entry.loc)}</loc>`,
      entry.lastmod    ? `<lastmod>${entry.lastmod}</lastmod>`                           : '',
      entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>`                 : '',
      entry.priority !== undefined ? `<priority>${entry.priority.toFixed(1)}</priority>` : '',
    ].filter(Boolean)
    return `  <url>\n    ${parts.join('\n    ')}\n  </url>`
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n')
}

/**
 * Fetches a Kirby CMS page collection via KQL and maps it to SitemapEntry[].
 * Handles Basic auth, optional post-fetch filtering, and slug → URL path mapping.
 */
export async function fetchKirbyRoutes(
  cms: KirbyFetchConfig,
  config: KirbyRouteConfig,
): Promise<SitemapEntry[]> {
  const auth = btoa(`${cms.email}:${cms.password}`)

  const res = await fetch(`${cms.cmsURL}/api/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: config.query,
      select: config.select ?? { slug: true },
    }),
  })

  if (!res.ok) {
    throw new Error(`Kirby CMS sitemap fetch failed: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()
  const pages: Array<Record<string, unknown>> = json?.result?.data ?? []
  const filtered = config.filter ? pages.filter(config.filter) : pages
  const prefix = config.pathPrefix ?? '/'

  return filtered.map(page => ({
    loc: `${prefix}${page.slug as string}`,
    lastmod: typeof page.modified === 'string' ? normalizeDate(page.modified) : undefined,
    changefreq: config.changefreq,
    priority: config.priority,
  }))
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function normalizeDate(raw: string): string {
  const d = new Date(raw)
  return isNaN(d.getTime()) ? '' : d.toISOString().substring(0, 10)
}
