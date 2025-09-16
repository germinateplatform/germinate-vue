import type { Page } from '@/plugins/types/Page'
import { UserType } from '@/plugins/types/germinate'

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
    path: '/projects/:id',
  }

  // ADMIN
  static userPermissions: Page = {
    name: 'userPermissions',
    path: '/admin/settings/user-permissions',
    required: UserType.ADMIN,
  }

  static germinateSettings: Page = {
    name: 'germinateSettings',
    path: '/admin/settings/germinate-settings',
    required: UserType.ADMIN,
  }

  static userFeedback: Page = {
    name: 'userFeedback',
    path: '/admin/settings/user-feedback',
    required: UserType.ADMIN,
  }

  static backup: Page = {
    name: 'backup',
    path: '/admin/settings/backup',
    required: UserType.ADMIN,
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
    path: '/data/germplasm/:id',
  }

  static climates: Page = {
    name: 'climates',
    path: '/data/climate/climates',
  }

  static climateDetails: Page = {
    name: 'climateDetails',
    path: '/data/climate/climates/:id',
  }

  static traits: Page = {
    name: 'traits',
    path: '/data/trials/traits',
  }

  static traitDetails: Page = {
    name: 'traitDetails',
    path: '/data/trials/traits/:id',
  }

  static trialCreation: Page = {
    name: 'trialCreation',
    path: '/data/trials/create',
    required: UserType.DATA_CURATOR,
  }

  static markers: Page = {
    name: 'markers',
    path: '/data/genotypes/markers',
  }

  static markerDetails: Page = {
    name: 'markerDetails',
    path: '/data/genotypes/markers/:id',
  }

  static maps: Page = {
    name: 'maps',
    path: '/data/genotypes/maps',
  }

  static mapDetails: Page = {
    name: 'mapDetails',
    path: '/data/genotypes/maps/:id',
  }

  static exportCrossComparison: Page = {
    name: 'exportCrossComparison',
    path: '/data/export/cross',
  }

  static export: Page = {
    name: 'export',
    path: '/data/export/:id',
  }

  static exportGenotypes: Page = {
    name: 'exportGenotypes',
    path: '/data/export/genotype/:id',
  }

  static exportClimates: Page = {
    name: 'exportClimates',
    path: '/data/export/climate/:id',
  }

  static exportTraits: Page = {
    name: 'exportTraits',
    path: '/data/export/trials/:id',
  }

  static taxonomies: Page = {
    name: 'taxonomies',
    path: '/data/taxonomies',
  }

  static taxonomyProviderDetails: Page = {
    name: 'taxonomyProviderDetails',
    path: '/data/taxonomies/:id/providers',
  }

  static exportAlleleFrequency: Page = {
    name: 'exportAlleleFrequency',
    path: '/data/export/allelefreq/:id',
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
    path: '/data/datasets/:id',
  }

  static experiments: Page = {
    name: 'experiments',
    path: '/data/experiments',
  }

  static experimentDetails: Page = {
    name: 'experimentDetails',
    path: '/data/experiment/:id',
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
    path: '/marked-items/:id',
  }

  // IMPORT
  static importUpload: Page = {
    name: 'importUpload',
    path: '/import/data-upload',
    required: UserType.DATA_CURATOR,
  }

  static importUploadType: Page = {
    name: 'importUploadType',
    path: '/import/data-upload:/id',
    required: UserType.DATA_CURATOR,
  }

  static search: Page = {
    name: 'search',
    path: '/search',
  }

  static searchQuery: Page = {
    name: 'searchQuery',
    path: '/search/:id',
  }

  static publications: Page = {
    name: 'publications',
    path: '/publications',
  }

  static publicationDetails: Page = {
    name: 'publicationDetails',
    path: '/publications/:id',
  }

  static stories: Page = {
    name: 'stories',
    path: '/stories',
  }

  static groups: Page = {
    name: 'groups',
    path: '/groups',
  }

  static groupDetails: Page = {
    name: 'groupDetails',
    path: '/groups/:id',
  }

  static groupUpload: Page = {
    name: 'groupUpload',
    path: '/groups/upload/:id',
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

  static aboutExportFormatsType: Page = {
    name: 'aboutExportFormatsType',
    path: '/about/export-formats/:id',
  }

  static getPath(page: Page, param: string): string {
    return page.path.replace(':id', param)
  }
}
