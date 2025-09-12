import { i18n } from '@/plugins/vuetify.ts'
import { Pages } from '@/plugins/pages'
import { getTemplateColor } from './colors'
import type { Page } from '@/plugins/types/Page'

const mdiGerminate = 'M 11.999836,0 C 5.384778,0 -3.9999998e-7,5.38515 0,12.00026 -3.9999998e-7,18.61531 5.384778,24.00011 11.999836,24.00011 18.614894,24.00011 24,18.61531 24,12.00026 24,5.38515 18.614894,0 11.999836,0 Z m 0,2.09227 c 5.484271,0 9.907984,4.42367 9.907984,9.90799 0,5.48425 -4.423713,9.90754 -9.907984,9.90754 -5.4842703,0 -9.9076558,-4.42329 -9.9076558,-9.90754 0,-5.48432 4.4233855,-9.90799 9.9076558,-9.90799 z M 9.5003025,5.50579 c -2.4997191,0 -2.4997043,0 -3.7494633,2.16472 L 4.500991,9.83539 c -1.2498943,2.16476 -1.2498943,2.16487 0,4.32945 l 1.2498482,2.16476 c 1.261759,2.16476 1.2617442,2.16476 3.7494633,2.16476 2.4996545,0 2.4997185,0 3.7495455,-2.16476 h -8.1e-5 c 1.249812,-2.16476 1.249787,-2.16469 0,-4.32934 v -1.1e-4 H 10.750152 8.2505363 l 1.2497662,2.16469 H 12 L 10.750152,16.3296 H 8.2505363 L 7.0006881,14.16484 5.7508392,12.00015 7.0006881,9.83539 8.2505363,7.67051 h 2.4996157 2.499696 L 12,5.50579 Z m 4.9993125,0 1.249849,2.16472 1.249848,2.16488 h -2.499697 l -1.249767,2.16476 h 2.499616 l 1.249848,2.16469 -1.249848,2.16476 -1.249849,2.16476 h 2.499697 l 1.249849,-2.16476 1.249766,-2.16476 c 1.249826,-2.16476 1.249826,-2.16469 0,-4.32945 L 18.249161,7.67051 16.999312,5.50579 Z'

export interface BaseType {
  shortName?: string
  path: string
  color: Function
  text: Function
}

export interface GroupType extends BaseType {
  id: string
  apiName: string
  itemType: string
  idColumn: string
  nameColumns: string[]
}

interface IdState {
  id: number
}
interface PathState {
  path: string
}
interface LinkState {
  link: string
}
interface ColorState {
  color: Function
}
interface TextState {
  text: Function
}
interface AcceptsState {
  accepts: string
}
interface ValueState {
  value: string
}
export interface FormatState {
  name: string
  logo: string
  text: Function
  tags: string[]
  types: string[]
  link: string
  linkType: 'link' | 'download'
}

const newsTypes: { [key: string]: IdState & TextState & PathState & ColorState } = {
  Projects: {
    id: 4,
    text: () => i18n.global.t('widgetNewsTypeRelatedProject'),
    path: 'mdi-newspaper-variant-outline',
    color: () => getTemplateColor(0),
  },
  Data: {
    id: 3,
    text: () => i18n.global.t('widgetNewsTypeDataChanges'),
    path: 'mdi-database',
    color: () => getTemplateColor(1),
  },
  Updates: {
    id: 2,
    text: () => i18n.global.t('widgetNewsTypeGeneralUpdates'),
    path: 'mdi-refresh',
    color: () => getTemplateColor(2),
  },
  General: {
    id: 1,
    text: () => i18n.global.t('widgetNewsTypeGeneralNews'),
    path: 'mdi-newspaper',
    color: () => getTemplateColor(3),
  },
}

export interface Status {
  text: Function
  color: string
  path: string
}

const asyncJobStatus: { [key: string]: Status } = {
  running: {
    color: 'info',
    path: 'mdi-progress-wrench',
    text: () => i18n.global.t('asyncJobStatusRunning'),
  },
  failed: {
    color: 'error',
    path: 'mdi-alert',
    text: () => i18n.global.t('asyncJobStatusFailed'),
  },
  completed: {
    color: 'success',
    path: 'mdi-check-circle',
    text: () => i18n.global.t('asyncJobStatusCompleted'),
  },
  waiting: {
    color: 'info',
    path: 'mdi-pause-circle',
    text: () => i18n.global.t('asyncJobStatusWaiting'),
  },
  cancelled: {
    color: 'warning',
    path: 'mdi-cancel',
    text: () => i18n.global.t('asyncJobStatusCancelled'),
  },
}

const newsTypeImageFit: (TextState & ValueState)[] = [{
  value: 'cover',
  text: () => i18n.global.t('widgetNewsImageFitCover'),
}, {
  value: 'contain',
  text: () => i18n.global.t('widgetNewsImageFitContain'),
}]

const exportFormats: { [key: string]: FormatState } = {
  gridscore: {
    name: 'GridScore NEXT',
    logo: 'tools/gridscore.svg',
    text: () => i18n.global.t('pageExportFormatsGridScoreText'),
    tags: ['phenotype'],
    types: ['receiver', 'provider'],
    link: 'https://gridscore.hutton.ac.uk',
    linkType: 'link',
  },
  helium: {
    name: 'Helium',
    logo: 'tools/helium.svg',
    text: () => i18n.global.t('pageExportFormatsHeliumText'),
    tags: ['pedigree', 'phenotype'],
    types: ['receiver'],
    link: 'https://helium.hutton.ac.uk/',
    linkType: 'link',
  },
  flapjack: {
    name: 'Flapjack',
    logo: 'tools/flapjack.png',
    text: () => i18n.global.t('pageExportFormatsFlapjackText'),
    tags: ['genotype', 'phenotype'],
    types: ['receiver'],
    link: 'https://ics.hutton.ac.uk/flapjack',
    linkType: 'download',
  },
  curlywhirly: {
    name: 'CurlyWhirly',
    logo: 'tools/curlywhirly.png',
    text: () => i18n.global.t('pageExportFormatsCurlyWhirlyText'),
    tags: ['pca'],
    types: ['receiver'],
    link: 'https://ics.hutton.ac.uk/curlywhirly',
    linkType: 'download',
  },
  strudel: {
    name: 'Strudel',
    logo: 'tools/strudel.png',
    text: () => i18n.global.t('pageExportFormatsStrudelText'),
    tags: ['genotype'],
    types: ['receiver'],
    link: 'https://ics.hutton.ac.uk/strudel',
    linkType: 'download',
  },
  excel: {
    name: 'Excel',
    logo: 'tools/excel.svg',
    text: () => i18n.global.t('pageExportFormatsExcelText'),
    tags: ['genotype', 'phenotype'],
    types: ['receiver'],
    link: 'https://products.office.com/excel',
    linkType: 'download',
  },
  tassel: {
    name: 'Tassel',
    logo: 'tools/tassel.png',
    text: () => i18n.global.t('pageExportFormatsTasselText'),
    tags: ['genotype'],
    types: ['receiver'],
    link: 'https://www.maizegenetics.net/tassel',
    linkType: 'download',
  },
}

const publicationTypes = {
  germplasm: {
    path: 'mdi-sprout',
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('publicationTypeGerminatebase'),
  },
  group: {
    path: 'mdi-group',
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('publicationTypeGroup'),
  },
  database: {
    path: '$germinate',
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('publicationTypeDatabase'),
  },
  dataset: {
    path: 'mdi-database',
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('publicationTypeDataset'),
  },
  experiment: {
    path: 'mdi-folder-table',
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('publicationTypeExperiment'),
  },
}

const dataTypes: { [key: string]: BaseType } = {
  numeric: {
    text: () => i18n.global.t('dataTypeNumeric'),
    path: 'mdi-numeric',
    color: () => getTemplateColor(0),
  },
  text: {
    text: () => i18n.global.t('dataTypeText'),
    path: 'mdi-alphabetical',
    color: () => getTemplateColor(1),
  },
  date: {
    text: () => i18n.global.t('dataTypeDate'),
    path: 'mdi-calendar',
    color: () => getTemplateColor(2),
  },
  categorical: {
    text: () => i18n.global.t('dataTypeCategorical'),
    path: 'mdi-tag-text',
    color: () => getTemplateColor(3),
  },
}

const entityTypes: { [key: string]: BaseType } = {
  Accession: {
    shortName: 'accession',
    path: 'mdi-sprout',
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('entityTypeAccession'),
  },
  'Plant/Plot': {
    shortName: 'plantplot',
    path: 'mdi-grid',
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('entityTypePlantPlot'),
  },
  Sample: {
    shortName: 'sample',
    path: 'mdi-leaf',
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('entityTypeSample'),
  },
}

const groupTypes: { [key: string]: GroupType } = {
  germinatebase: {
    id: 'germinatebase',
    path: 'mdi-sprout',
    apiName: 'germplasm',
    itemType: 'germplasm',
    idColumn: 'germplasmId',
    nameColumns: ['germplasmName', 'germplasmDisplayName'],
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('groupTypeGerminatebase'),
  },
  markers: {
    id: 'markers',
    path: 'mdi-dna',
    apiName: 'marker',
    itemType: 'markers',
    idColumn: 'markerId',
    nameColumns: ['markerName'],
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('groupTypeMarker'),
  },
  locations: {
    id: 'locations',
    path: 'mdi-map-marker',
    apiName: 'location',
    itemType: 'locations',
    idColumn: 'locationId',
    nameColumns: ['locationName'],
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('groupTypeLocation'),
  },
}

const markedItemTypes: { [key: string]: PathState & ColorState & TextState } = {
  germplasm: {
    path: 'mdi-sprout',
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('groupTypeGerminatebase'),
  },
  markers: {
    path: 'mdi-dna',
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('groupTypeMarker'),
  },
  locations: {
    path: 'mdi-map-marker',
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('groupTypeLocation'),
  },
}

const imageTypes: { [key: string]: PathState & ColorState & TextState } = {
  germinatebase: {
    path: 'mdi-sprout',
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('imageTypeGerminatebase'),
  },
  phenotypes: {
    path: 'mdi-tag-text-outline',
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('imageTypePhenotypes'),
  },
  projects: {
    path: 'mdi-clipboard-list',
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('imageTypeProjects'),
  },
  storysteps: {
    path: 'mdi-card-bulleted-settings',
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('imageTypeStorySteps'),
  },
}

const locationTypes: { [key: string]: BaseType } = {
  trialsite: {
    path: 'mdi-shovel',
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('locationTypeTrialsite'),
  },
  collectingsites: {
    path: 'mdi-basket-fill',
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('locationTypeCollectingsite'),
  },
  datasets: {
    path: 'mdi-database',
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('locationTypeDataset'),
  },
}

const templateImportTypes: { [key: string]: PathState & ColorState & TextState & AcceptsState } = {
  mcpd: {
    path: 'mdi-passport',
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('templateImportTypeMcpd'),
    accepts: '.xlsx',
  },
  climate: {
    path: 'mdi-weather-snowy-rainy',
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('templateImportTypeClimate'),
    accepts: '.xlsx',
  },
  genotype: {
    path: 'mdi-dna',
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('templateImportTypeGenotype'),
    accepts: '.xlsx, .txt, .hapmap',
  },
  trial: {
    path: 'mdi-shovel',
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('templateImportTypeTrial'),
    accepts: '.xlsx',
  },
  shapefile: {
    path: 'mdi-shape-rectangle-plus',
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('templateImportTypeShapefile'),
    accepts: '.zip',
  },
  geotiff: {
    path: 'mdi-image-marker',
    color: () => getTemplateColor(7),
    text: () => i18n.global.t('templateImportTypeGeotiff'),
    accepts: '.zip',
  },
  pedigree: {
    path: 'mdi-family-tree',
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('templateImportTypePedigree'),
    accepts: '.xlsx',
  },
  images: {
    path: 'mdi-image-multiple',
    color: () => getTemplateColor(5),
    text: () => i18n.global.t('templateImportTypeImages'),
    accepts: '.zip',
  },
  groups: {
    path: 'mdi-group',
    color: () => getTemplateColor(6),
    text: () => i18n.global.t('templateImportTypeGroups'),
    accepts: '.xlsx',
  },
}

const commentTypes = {
  germinatebase: {
    path: 'mdi-sprout',
    color: () => getTemplateColor(0),
    text: () => 'Germplasm',
  },
  locations: {
    path: 'mdi-marker',
    color: () => getTemplateColor(1),
    text: () => 'Location',
  },
}

const datasetStates: { [key: string]: IdState & PathState & TextState } = {
  public: {
    id: 1,
    path: 'mdi-lock-open-variant-outline',
    text: () => i18n.global.t('datasetStatePublic'),
  },
  private: {
    id: 2,
    path: 'mdi-lock',
    text: () => i18n.global.t('datasetStatePrivate'),
  },
  hidden: {
    id: 3,
    path: 'mdi-eye-off',
    text: () => i18n.global.t('datasetStateHidden'),
  },
}

const dashboardSections = [
  {
    value: 'datastories',
    textI18n: () => i18n.global.t('dashboardSectionDataStories'),
    text: i18n.global.t('dashboardSectionDataStories'),
  },
  {
    value: 'dataupdates',
    textI18n: () => i18n.global.t('dashboardSectionDataUpdates'),
    text: i18n.global.t('dashboardSectionDataUpdates'),
  },
  {
    value: 'news',
    textI18n: () => i18n.global.t('dashboardSectionNews'),
    text: i18n.global.t('dashboardSectionNews'),
  },
  {
    value: 'projects',
    textI18n: () => i18n.global.t('dashboardSectionProjects'),
    text: i18n.global.t('dashboardSectionProjects'),
  },
  {
    value: 'publications',
    textI18n: () => i18n.global.t('dashboardSectionPublications'),
    text: i18n.global.t('dashboardSectionPublications'),
  },
]

const statCategories: { [id: string]: ValueState & TextState & PathState & LinkState } = {
  germplasm: {
    value: 'germplasm',
    text: () => i18n.global.t('dashboardBannerGermplasm'),
    path: 'mdi-sprout',
    link: Pages.germplasm.path,
  },
  markers: {
    value: 'markers',
    text: () => i18n.global.t('dashboardBannerMarkers'),
    path: 'mdi-dna',
    link: Pages.markers.path,
  },
  maps: {
    value: 'maps',
    text: () => i18n.global.t('dashboardBannerMaps'),
    path: 'mdi-reorder-vertical',
    link: Pages.maps.path,
  },
  traits: {
    value: 'traits',
    text: () => i18n.global.t('dashboardBannerTraits'),
    path: 'mdi-tag-text-outline',
    link: Pages.traits.path,
  },
  locations: {
    value: 'locations',
    text: () => i18n.global.t('dashboardBannerLocations'),
    path: 'mdi-map-marker',
    link: Pages.locations.path,
  },
  datasets: {
    value: 'datasets',
    text: () => i18n.global.t('dashboardBannerDatasets'),
    path: 'mdi-database',
    link: Pages.datasets.path,
  },
  datasetId: {
    value: 'datasets',
    text: () => i18n.global.t('dashboardBannerDatasets'),
    path: 'mdi-database',
    link: Pages.datasets.path,
  },
  experiments: {
    value: 'experiments',
    text: () => i18n.global.t('dashboardBannerExperiments'),
    path: 'mdi-folder-table',
    link: Pages.experiments.path,
  },
  datasetsAllelefreq: {
    value: 'datasetsAllelefreq',
    text: () => i18n.global.t('dashboardBannerDatasetsAllelefreq'),
    path: 'mdi-pulse',
    link: Pages.getPath(Pages.export, 'allelefreq'),
  },
  datasetsGenotype: {
    value: 'datasetsGenotype',
    text: () => i18n.global.t('dashboardBannerDatasetsGenotype'),
    path: 'mdi-dna',
    link: Pages.getPath(Pages.export, 'genotype'),
  },
  datasetsTrials: {
    value: 'datasetsTrials',
    text: () => i18n.global.t('dashboardBannerDatasetsTrials'),
    path: 'mdi-shovel',
    link: Pages.getPath(Pages.export, 'trials'),
  },
  datasetsClimate: {
    value: 'datasetsClimate',
    text: () => i18n.global.t('dashboardBannerDatasetsClimate'),
    path: 'mdi-chart-sankey',
    link: Pages.getPath(Pages.export, 'climate'),
  },
  datasetsPedigree: {
    value: 'datasetsPedigree',
    text: () => i18n.global.t('dashboardBannerDatasetsPedigree'),
    path: 'mdi-family-tree',
    link: Pages.getPath(Pages.export, 'pedigree'),
  },
  groups: {
    value: 'groups',
    text: () => i18n.global.t('dashboardBannerGroups'),
    path: 'mdi-group',
    link: Pages.groups.path,
  },
  climates: {
    value: 'climates',
    text: () => i18n.global.t('dashboardBannerClimates'),
    path: 'mdi-weather-snowy-rainy',
    link: Pages.climates.path,
  },
  images: {
    value: 'images',
    text: () => i18n.global.t('dashboardBannerImages'),
    path: 'mdi-image-multiple',
    link: Pages.images.path,
  },
  fileresources: {
    value: 'fileresources',
    text: () => i18n.global.t('dashboardBannerFileResources'),
    path: 'mdi-file-download',
    link: Pages.dataResources.path,
  },
  fileResourceId: {
    value: 'fileresources',
    text: () => i18n.global.t('dashboardBannerFileResources'),
    path: 'mdi-file-download',
    link: Pages.dataResources.path,
  },
}

const germplasmInstitutionTypes: { [key: string]: PathState & ColorState & TextState } = {
  maintenance: {
    path: 'mdi-wrench-clock',
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('germplasmInstitutionTypesMaintenance'),
  },
  breeding: {
    path: 'mdi-eyedropper',
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('germplasmInstitutionTypesBreeding'),
  },
  collection: {
    path: 'mdi-allergy',
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('germplasmInstitutionTypesCollection'),
  },
  duplicate: {
    path: 'mdi-content-duplicate',
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('germplasmInstitutionTypesDuplicate'),
  },
  donor: {
    path: 'mdi-gift',
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('germplasmInstitutionTypesDonor'),
  },
}

export interface DatasetType extends BaseType {
  id: number
  pageName?: Page
}

const datasetTypes: { [key: string]: DatasetType } = {
  allelefreq: {
    id: 4,
    path: 'mdi-pulse',
    pageName: Pages.exportAlleleFrequency,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('datasetTypeAllelefreq'),
  },
  climate: {
    id: 5,
    path: 'mdi-weather-snowy-rainy',
    pageName: Pages.exportClimates,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('datasetTypeClimate'),
  },
  genotype: {
    id: 1,
    path: 'mdi-dna',
    pageName: Pages.exportGenotypes,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('datasetTypeGenotype'),
  },
  trials: {
    id: 3,
    path: 'mdi-shovel',
    pageName: Pages.exportTraits,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('datasetTypeTrials'),
  },
  pedigree: {
    id: 7,
    path: 'mdi-family-tree',
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('datasetTypePedigree'),
  },
  unknown: {
    id: -1,
    path: 'mdi-help-box',
    color: () => getTemplateColor(6),
    text: () => i18n.global.t('datasetTypeUnknown'),
  },
}

const userFeedbackTypes = [
  {
    id: 'bug',
    path: 'mdi-bug-outline',
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('userFeedbackTypesBug'),
  },
  {
    id: 'data_error',
    path: 'mdi-alert-circle-outline',
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('userFeedbackTypesDataError'),
  },
  {
    id: 'feature_request',
    path: 'mdi-hammer-wrench',
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('userFeedbackTypesFeatureRequest'),
  },
  {
    id: 'general',
    path: 'mdi-message-text-fast-outline',
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('userFeedbackTypesGeneral'),
  },
  {
    id: 'question',
    path: 'mdi-help-circle-outline',
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('userFeedbackTypesQuestion'),
  },
]

const userFeedbackSeverityTypes = {
  low: {
    id: 'low',
    path: 'mdi-speedometer-slow',
    color: 'text-success',
    text: () => i18n.global.t('userFeedbackSeverityLow'),
  },
  medium: {
    id: 'medium',
    path: 'mdi-speedometer-medium',
    color: 'text-warning',
    text: () => i18n.global.t('userFeedbackSeverityMedium'),
  },
  high: {
    id: 'high',
    path: 'mdi-speedometer',
    color: 'text-danger',
    text: () => i18n.global.t('userFeedbackSeverityHigh'),
  },
}

export {
  exportFormats,
  publicationTypes,
  dataTypes,
  entityTypes,
  newsTypes,
  groupTypes,
  markedItemTypes,
  imageTypes,
  locationTypes,
  templateImportTypes,
  commentTypes,
  datasetStates,
  newsTypeImageFit,
  statCategories,
  asyncJobStatus,
  dashboardSections,
  germplasmInstitutionTypes,
  datasetTypes,
  userFeedbackTypes,
  userFeedbackSeverityTypes,
}
