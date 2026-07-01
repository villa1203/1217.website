import { buildSitemapXML, fetchKirbyRoutes } from '../../shared/sitemap'
import type { SitemapEntry } from '../../shared/sitemap'

const SITE_URL = 'https://bureau1217.ch'

const staticRoutes: SitemapEntry[] = [
  { loc: '/',         changefreq: 'weekly',  priority: 1.0 },
  { loc: '/works',    changefreq: 'weekly',  priority: 0.9 },
  { loc: '/office',   changefreq: 'monthly', priority: 0.7 },
  { loc: '/research', changefreq: 'weekly',  priority: 0.8 },
]

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const cms = {
    cmsURL: config.public.apiBase as string,
    email: config.secret_API_AUTH_EMAIL as string,
    password: config.secret_API_AUTH_PASSWORD as string,
  }

  const projectRoutes = await fetchKirbyRoutes(cms, {
    // filterBy status:'listed' excludes both drafts (brouillons) and unlisted pages
    query: `page('projects').children.filterBy('status', 'listed')`,
    select: {
      slug: true,
      // needed to filter out coming_soon projects
      coming_soon: true,
    },
    pathPrefix: '/works/',
    changefreq: 'monthly',
    priority: 0.8,
    // Exclude projects marked as coming soon — not ready to be indexed
    filter: page => page.coming_soon !== 'true',
  })

  const xml = buildSitemapXML(SITE_URL, [...staticRoutes, ...projectRoutes])

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  // Cached 1h by CDN/browsers, so Google always gets reasonably fresh data
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return xml
})
