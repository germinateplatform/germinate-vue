import type { Page } from '@/plugins/types/Page'
import { coreStore } from '@/stores/app'

export class Pages {
  static home: Page = {
    name: 'home',
    path: '/',
  }

  static login: Page = {
    name: 'login',
    path: '/login',
  }

  static projects: Page = {
    name: 'projects',
    path: '/projects',
  }

  static projectDetails: Page = {
    name: 'projectDetails',
    path: '/projects/[id]',
  }

  // ADMIN
  static userPermissions: Page = {
    name: 'userPermissions',
    path: '/admin/settings/user-permissions',
  }

  static germinateSettings: Page = {
    name: 'germinateSettings',
    path: '/admin/settings/germinate',
  }

  static userFeedback: Page = {
    name: 'userFeedback',
    path: '/admin/settings/user-feedback',
  }

  static backup: Page = {
    name: 'backup',
    path: '/admin/settings/backup',
  }

  // DATA
  static germplasm: Page = {
    name: 'germplasm',
    path: '/data/germplasm',
  }

  static germplasmMatch: Page = {
    name: 'germplasmMatch',
    path: '/data/germplasm/germplasm-match',
  }

  static germplasmUnifier: Page = {
    name: 'germplasmUnifier',
    path: '/data/germplasm/germplasm-unifier',
  }

  static passport: Page = {
    name: 'passport',
    path: '/data/germplasm/[id]',
  }

  static climateOverview: Page = {
    name: 'climate',
    path: '/data/climate/overview',
  }

  static climates: Page = {
    name: 'climates',
    path: '/data/climate/climates',
  }

  static climateDetails: Page = {
    name: 'climateDetails',
    path: '/data/climate/climates/[id]',
  }

  static trialsOverview: Page = {
    name: 'trials',
    path: '/data/trials/overview',
  }

  static traits: Page = {
    name: 'traits',
    path: '/data/trials/traits',
  }

  static traitDetails: Page = {
    name: 'traitDetails',
    path: '/data/trials/traits/[id]',
  }

  static trialCreation: Page = {
    name: 'trialCreation',
    path: '/data/trials/create',
  }

  static genotypeOverview: Page = {
    name: 'genotypes',
    path: '/data/genotypes/overview',
  }

  static markers: Page = {
    name: 'markers',
    path: '/data/genotypes/markers',
  }

  static markerDetails: Page = {
    name: 'markerDetails',
    path: '/data/genotypes/markers/[id]',
  }

  static maps: Page = {
    name: 'maps',
    path: '/data/genotypes/maps',
  }

  static mapDetails: Page = {
    name: 'mapDetails',
    path: '/data/genotypes/maps/[id]',
  }

  static pedigrees: Page = {
    name: 'pedigrees',
    path: '/data/pedigrees',
  }

  static exportCrossComparison: Page = {
    name: 'exportCrossComparison',
    path: '/data/export/cross',
  }

  static export: Page = {
    name: 'export',
    path: '/data/export/[id]',
  }

  static exportGenotypes: Page = {
    name: 'exportGenotypes',
    path: '/data/export/genotype/[datasetIds]',
  }

  static exportClimates: Page = {
    name: 'exportClimates',
    path: '/data/export/climate/[datasetIds]',
  }

  static exportPedigrees: Page = {
    name: 'exportPedigrees',
    path: '/data/export/pedigree/[datasetIds]',
  }

  static exportTraits: Page = {
    name: 'exportTraits',
    identifiers: ['export-trials'],
    path: '/data/export/trials/[datasetIds]',
  }

  static taxonomies: Page = {
    name: 'taxonomies',
    path: '/data/taxonomies',
  }

  static taxonomyProviderDetails: Page = {
    name: 'taxonomyProviderDetails',
    path: '/data/taxonomies/[id]/providers',
  }

  static locations: Page = {
    name: 'locations',
    path: '/data/geography/locations',
  }

  static geographicSearch: Page = {
    name: 'geographicSearch',
    path: '/data/geography/geographic-search',
  }

  static datasets: Page = {
    name: 'datasets',
    path: '/data/datasets',
  }

  static datasetDetails: Page = {
    name: 'datasetDetails',
    path: '/data/datasets/[id]',
  }

  static experiments: Page = {
    name: 'experiments',
    path: '/data/experiments',
  }

  static genesysRequest: Page = {
    name: 'genesysRequest',
    path: '/data/genesys-request',
  }

  static dataResources: Page = {
    name: 'dataResources',
    path: '/data/data-resources',
  }

  static statistics: Page = {
    name: 'statistics',
    path: '/data/statistics',
  }

  static images: Page = {
    name: 'images',
    path: '/images',
  }

  static markedItems: Page = {
    name: 'markedItems',
    path: '/marked-items',
  }

  static markedItemType: Page = {
    name: 'markedItemType',
    path: '/marked-items/[id]',
  }

  // IMPORT
  static importUpload: Page = {
    name: 'importUpload',
    path: '/data/upload',
  }

  static importUploadType: Page = {
    name: 'importUploadType',
    path: '/import/data-upload:/id',
  }

  static search: Page = {
    name: 'search',
    path: '/search',
  }

  static searchQuery: Page = {
    name: 'searchQuery',
    path: '/search/[id]',
  }

  static publications: Page = {
    name: 'publications',
    path: '/publications',
  }

  static publicationDetails: Page = {
    name: 'publicationDetails',
    path: '/publications/[id]',
  }

  static stories: Page = {
    name: 'stories',
    path: '/data/stories',
  }

  static groups: Page = {
    name: 'groups',
    path: '/groups',
  }

  static groupDetails: Page = {
    name: 'groupDetails',
    path: '/groups/[id]',
  }

  static groupUpload: Page = {
    name: 'groupUpload',
    path: '/groups/upload/[id]',
  }

  static aboutGerminate: Page = {
    name: 'aboutGerminate',
    path: '/about/germinate',
  }

  static aboutProject: Page = {
    name: 'aboutProject',
    path: '/about/project',
  }

  static aboutExportFormats: Page = {
    name: 'aboutExportFormats',
    path: '/about/export-formats',
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

    console.log(name, Pages._byName, Pages._byPath)
    console.log(Pages._byName.get(name), Pages._byPath.get(name))

    return Pages._byName.get(name) || Pages._byPath.get(name)
  }

  static isAvailable (page: Page): boolean {
    const store = coreStore()

    if (store.serverSettings && store.serverSettings.hiddenPages) {
      return !store.serverSettings.hiddenPages.includes(page.name) && !(page.identifiers || []).some(i => store.serverSettings?.hiddenPages?.includes(i))
    } else {
      return true
    }
  }
}
