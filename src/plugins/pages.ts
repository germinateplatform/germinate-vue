import type { Page } from '@/plugins/types/Page'
import { mdiAccountKey, mdiApplicationBrackets, mdiBackupRestore, mdiBookOpenPageVariant, mdiChartAreaspline, mdiCheckboxMultipleMarked, mdiClipboardList, mdiCog, mdiCookie, mdiDatabase, mdiEarth, mdiExport, mdiFileDownload, mdiFolderTable, mdiFormatIndentIncrease, mdiGroup, mdiHome, mdiImageMultiple, mdiInformationOutline, mdiLan, mdiLandFields, mdiMagnify, mdiMap, mdiMapSearch, mdiNewspaper, mdiPeriodicTable, mdiReorderVertical, mdiSetMerge, mdiSprout, mdiTagTextOutline, mdiTextSearch, mdiUpload, mdiViewDashboard, mdiWeatherSnowyRainy } from '@mdi/js'

export class Pages {
  static home: Page = {
    name: 'home',
    i18n: 'pageDashboardTitle',
    icon: mdiHome,
    path: '/',
  }

  static login: Page = {
    name: 'login',
    path: '/login',
  }

  static projects: Page = {
    name: 'projects',
    path: '/projects',
    i18n: 'pageProjectsTitle',
    icon: mdiClipboardList,
  }

  static projectDetails: Page = {
    name: 'projectDetails',
    parent: 'projects',
    path: '/projects/[id]',
  }

  // ADMIN
  static userPermissions: Page = {
    name: 'userPermissions',
    path: '/admin/user/permissions',
    i18n: 'pageUserPermissionsTitle',
    icon: mdiAccountKey,
  }

  static germinateSettings: Page = {
    name: 'germinateSettings',
    path: '/admin/settings/germinate',
    i18n: 'pageGerminateSettingsTitle',
    icon: mdiCog,
  }

  // static userFeedback: Page = {
  //   name: 'userFeedback',
  //   path: '/admin/settings/user-feedback',
  // }

  static backup: Page = {
    name: 'backup',
    path: '/admin/settings/backup',
    i18n: 'pageBackupTitle',
    icon: mdiBackupRestore,
  }

  // DATA
  static germplasm: Page = {
    name: 'germplasm',
    i18n: 'pageGermplasmTitle',
    icon: mdiSprout,
    path: '/data/germplasm',
  }

  static germplasmMatch: Page = {
    name: 'germplasmMatch',
    i18n: 'pageGermplasmMatchTitle',
    icon: mdiTextSearch,
    path: '/data/germplasm/search',
  }

  static germplasmUnifier: Page = {
    name: 'germplasmUnifier',
    path: '/data/germplasm/unify',
    i18n: 'pageGermplasmUnifierTitle',
    icon: mdiSetMerge,
  }

  static passport: Page = {
    name: 'passport',
    parent: 'germplasm',
    path: '/data/germplasm/[id]',
  }

  static climateOverview: Page = {
    name: 'climate',
    path: '/data/climate/overview',
    i18n: 'pageClimatesOverviewTitle',
    icon: mdiEarth,
  }

  static climates: Page = {
    name: 'climates',
    path: '/data/climate/climates',
    i18n: 'pageClimatesTitle',
    icon: mdiWeatherSnowyRainy,
  }

  static climateDetails: Page = {
    name: 'climateDetails',
    path: '/data/climate/climates/[id]',
    parent: 'climates',
  }

  static trialsOverview: Page = {
    name: 'trials',
    path: '/data/trials/overview',
    i18n: 'pageTrialsOverviewTitle',
    icon: mdiLandFields,
  }

  static traits: Page = {
    name: 'traits',
    path: '/data/trials/traits',
    i18n: 'pageTraitsTitle',
    icon: mdiTagTextOutline,
  }

  static traitUnifier: Page = {
    name: 'traitUnifier',
    path: '/data/trials/traits/unify',
    i18n: 'pageTraitUnifierTitle',
    icon: mdiSetMerge,
  }

  static traitDetails: Page = {
    name: 'traitDetails',
    path: '/data/trials/traits/[id]',
    parent: 'traits',
  }

  // static trialCreation: Page = {
  //   name: 'trialCreation',
  //   path: '/data/trials/create',
  // }

  static genotypeOverview: Page = {
    name: 'genotypes',
    path: '/data/genotypes/overview',
    i18n: 'pageGenotypeOverviewTitle',
    icon: mdiViewDashboard,
  }

  static markers: Page = {
    name: 'markers',
    i18n: 'pageMarkersTitle',
    icon: mdiFormatIndentIncrease,
    iconRotate: 90,
    path: '/data/genotypes/markers',
  }

  static markerDetails: Page = {
    name: 'markerDetails',
    i18n: 'pageMarkerDetailsTitle',
    parent: 'markers',
    path: '/data/genotypes/markers/[id]',
  }

  static maps: Page = {
    name: 'maps',
    path: '/data/genotypes/maps',
    i18n: 'pageMapsTitle',
    icon: mdiReorderVertical,
  }

  static mapDetails: Page = {
    name: 'mapDetails',
    path: '/data/genotypes/maps/[id]',
    parent: 'maps',
  }

  static pedigrees: Page = {
    name: 'pedigrees',
    path: '/data/pedigrees',
    i18n: 'pagePedigreeDefinitionsTitle',
    icon: mdiPeriodicTable,
    iconRotate: 90,
  }

  // static exportCrossComparison: Page = {
  //   name: 'exportCrossComparison',
  //   path: '/data/export/cross',
  // }

  static export: Page = {
    name: 'export',
    path: '/data/export',
    i18n: 'menuExportData',
    icon: mdiExport,
  }

  static exportType: Page = {
    name: 'exportType',
    path: '/data/export/[id]',
    parent: 'export',
    i18n: 'menuExportData',
    icon: mdiExport,
  }

  static exportGenotypes: Page = {
    name: 'exportGenotypes',
    path: '/data/export/genotype/[datasetIds]',
    parent: 'export',
    i18n: 'pageGenotypesExportTitle',
  }

  static exportClimates: Page = {
    name: 'exportClimates',
    path: '/data/export/climate/[datasetIds]',
    parent: 'export',
    i18n: 'pageClimateExportTitle',
  }

  static exportPedigrees: Page = {
    name: 'exportPedigrees',
    path: '/data/export/pedigree/[datasetIds]',
    parent: 'export',
    i18n: 'pagePedigreeExportTitle',
  }

  static exportTraits: Page = {
    name: 'exportTraits',
    identifiers: ['export-trials'],
    path: '/data/export/trials/[datasetIds]',
    parent: 'export',
    i18n: 'pageTrialsExportTitle',
  }

  static taxonomies: Page = {
    name: 'taxonomies',
    path: '/data/taxonomies',
    i18n: 'pageTaxonomiesTitle',
    icon: mdiLan,
  }

  static taxonomyProviderDetails: Page = {
    name: 'taxonomyProviderDetails',
    path: '/data/taxonomies/[id]/providers',
    parent: 'taxonomies',
    i18n: 'pageTaxonomyProviderTitle',
  }

  static locations: Page = {
    name: 'locations',
    path: '/data/geography/locations',
    i18n: 'pageLocationsTitle',
    icon: mdiMap,
  }

  static geographicSearch: Page = {
    name: 'geographicSearch',
    path: '/data/geography/geographic-search',
    i18n: 'pageGeographicSearchTitle',
    icon: mdiMapSearch,
  }

  static datasets: Page = {
    name: 'datasets',
    path: '/data/datasets',
    i18n: 'pageDatasetsTitle',
    icon: mdiDatabase,
  }

  static datasetDetails: Page = {
    name: 'datasetDetails',
    path: '/data/datasets/[id]',
    i18n: 'pageDatasetsTitle',
    icon: mdiDatabase,
  }

  static experiments: Page = {
    name: 'experiments',
    path: '/data/experiments',
    i18n: 'pageExperimentsTitle',
    icon: mdiFolderTable,
  }

  static genesysRequest: Page = {
    name: 'genesysRequest',
    path: '/data/genesys-request',
    i18n: 'pageGenesysTitle',
    icon: '$genesys',
  }

  static dataResources: Page = {
    name: 'dataResources',
    path: '/data/data-resources',
    i18n: 'pageDataResourcesTitle',
    icon: mdiFileDownload,
  }

  static statistics: Page = {
    name: 'statistics',
    path: '/data/statistics',
    i18n: 'pageStatisticsTitle',
    icon: mdiChartAreaspline,
  }

  static images: Page = {
    name: 'images',
    path: '/images',
    i18n: 'pageImagesTitle',
    icon: mdiImageMultiple,
  }

  static markedItems: Page = {
    name: 'markedItems',
    path: '/marked-items',
    i18n: 'pageMarkedItemsTitle',
    icon: mdiCheckboxMultipleMarked,
  }

  static markedItemType: Page = {
    name: 'markedItemType',
    parent: 'markedItems',
    path: '/marked-items/[id]',
  }

  // IMPORT
  static importUpload: Page = {
    name: 'importUpload',
    path: '/data/upload',
    i18n: 'pageDataUploadTitle',
    icon: mdiUpload,
  }

  static importUploadType: Page = {
    name: 'importUploadType',
    path: '/import/data-upload:/id',
    parent: 'importUpload',
  }

  static search: Page = {
    name: 'search',
    path: '/search',
    i18n: 'pageSearchTitle',
    icon: mdiMagnify,
  }

  static searchQuery: Page = {
    name: 'searchQuery',
    path: '/search/[id]',
    i18n: 'pageSearchTitle',
    icon: mdiMagnify,
  }

  static publications: Page = {
    name: 'publications',
    path: '/publications',
    i18n: 'pagePublicationsTitle',
    icon: mdiNewspaper,
  }

  static publicationDetails: Page = {
    name: 'publicationDetails',
    path: '/publications/[id]',
    parent: 'publications',
  }

  static stories: Page = {
    name: 'stories',
    path: '/data/stories',
    i18n: 'pageStoriesTitle',
    icon: mdiBookOpenPageVariant,
  }

  static groups: Page = {
    name: 'groups',
    path: '/groups',
    i18n: 'pageGroupsTitle',
    icon: mdiGroup,
  }

  static groupDetails: Page = {
    name: 'groupDetails',
    path: '/groups/[id]',
    parent: 'groups',
  }

  // static groupUpload: Page = {
  //   name: 'groupUpload',
  //   path: '/groups/upload/[id]',
  // }

  static aboutGerminate: Page = {
    name: 'aboutGerminate',
    path: '/about/germinate',
    i18n: 'pageAboutGerminateTitle',
    icon: '$germinate',
  }

  static aboutProject: Page = {
    name: 'aboutProject',
    path: '/about/project',
    i18n: 'pageAboutProjectTitle',
    icon: mdiInformationOutline,
  }

  static aboutCookies: Page = {
    name: 'aboutCookies',
    path: '/about/cookie',
    i18n: 'pageCookiesTitle',
    icon: mdiCookie,
  }

  static aboutExportFormats: Page = {
    name: 'aboutExportFormats',
    path: '/about/export-formats',
    i18n: 'pageExportFormatsTitle',
    icon: mdiApplicationBrackets,
  }

  static getPath (page: Page, param: string): string {
    return page.path.replace('[id]', param)
      .replace('[datasetId]', param)
      .replace('[datasetIds]', param)
  }

  private static _byName: Map<string, Page> | null = null
  private static _byPath: Map<string, Page> | null = null

  private static buildIndexName (): Map<string, Page> {
    const map = new Map<string, Page>()
    for (const value of Object.values(Pages)) {
      if (value && typeof value === 'object' && 'name' in value && 'path' in value) {
        map.set((value as Page).name, value as Page)
      }
    }
    return map
  }

  private static buildIndexPath (): Map<string, Page> {
    const map = new Map<string, Page>()
    for (const value of Object.values(Pages)) {
      if (value && typeof value === 'object' && 'name' in value && 'path' in value) {
        map.set((value as Page).path, value as Page)
        map.set((value as Page).path + '/', value as Page)
      }
    }
    return map
  }

  static getByName (name: string): Page | undefined {
    if (!Pages._byName) {
      Pages._byName = Pages.buildIndexName()
    }
    if (!Pages._byPath) {
      Pages._byPath = Pages.buildIndexPath()
    }

    return Pages._byName.get(name) || Pages._byPath.get(name)
  }

  static isAvailable (page: Page): boolean {
    const store = useCoreStore()

    if (store.serverSettings && store.serverSettings.hiddenPages) {
      return !store.serverSettings.hiddenPages.includes(page.name) && !(page.identifiers || []).some(i => store.serverSettings?.hiddenPages?.includes(i))
    } else {
      return true
    }
  }

  private static _dynamic: { page: Page, regex: RegExp }[] | null = null

  static getByRoute (path: string): Page | undefined {
    const normalized = path.replace(/\/+$/, '') || '/'

    // 1. exact (static) matches win, e.g. /data/germplasm/search over /data/germplasm/[id]
    if (!Pages._byPath) {
      Pages.getByName('') // makes sure the indexes are built
    }
    const exact = Pages._byPath?.get(normalized)
    if (exact) {
      return exact
    }

    // 2. dynamic matches
    if (!Pages._dynamic) {
      Pages._dynamic = Object.values(Pages)
        .filter((v): v is Page => !!v && typeof v === 'object' && 'path' in v && v.path.includes('['))
        .map(page => ({
          page,
          regex: new RegExp('^' + page.path.replace(/\[[^\]]+\]/g, '[^/]+') + '$'),
        }))
    }
    return Pages._dynamic.find(d => d.regex.test(normalized))?.page
  }

  static fillPath (page: Page, params: Record<string, any>): string {
    return page.path.replace(/\[([^\]]+)\]/g, (_, key) => String(params[key] ?? ''))
  }
}
