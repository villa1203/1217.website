import type {CMS_API_Page_projet} from "#shared/cms_api.ts";

export function getProjectBySector(sector_slug: string, projects: CMS_API_Page_projet[]): CMS_API_Page_projet[] {
  return projects.filter(project => {

    const test: { title: string; slug: string }[] = project.sectors.filter(sector => {
      return sector.slug === sector_slug
    })

    return test.length > 0
  })
}
