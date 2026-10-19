import { i18n } from '@/plugins/vuetify.ts'
import { Pages } from '@/plugins/pages'
import { getTemplateColor } from '@/plugins/util/colors'
import type { Page } from '@/plugins/types/Page'
import { MethodsMethodClass, TraitsTraitClass, UserType, type OverviewStatsField } from '@/plugins/types/germinate'
import { mdiAccount, mdiAccountCancel, mdiAccountQuestion, mdiAccountSearch, mdiAlert, mdiAlertCircleOutline, mdiAllergy, mdiAlphabetical, mdiBasketFill, mdiBookOpenPageVariant, mdiBug, mdiBugOutline, mdiCalculator, mdiCalendar, mdiCancel, mdiCardBulletedSettings, mdiChartSankey, mdiCheckCircle, mdiClipboardList, mdiContentDuplicate, mdiCounter, mdiCrystalBall, mdiDatabase, mdiDatabaseImport, mdiDesktopClassic, mdiDna, mdiEyedropper, mdiEyeOff, mdiFamilyTree, mdiFileDownload, mdiFileTree, mdiFlask, mdiFolderTable, mdiGift, mdiGrid, mdiGroup, mdiHammerWrench, mdiHelpBox, mdiHelpCircle, mdiHelpCircleOutline, mdiImageMarker, mdiImageMultiple, mdiLandFields, mdiLeaf, mdiLock, mdiLockOpenVariantOutline, mdiMagnifyExpand, mdiMapMarker, mdiMarker, mdiMessageTextFastOutline, mdiNewspaper, mdiNewspaperVariant, mdiNewspaperVariantOutline, mdiNumeric, mdiPassport, mdiPauseCircle, mdiProgressWrench, mdiPulse, mdiRefresh, mdiReorderVertical, mdiScale, mdiSeed, mdiShapeRectanglePlus, mdiShieldAccount, mdiShovel, mdiSpeedometer, mdiSpeedometerMedium, mdiSpeedometerSlow, mdiSprout, mdiTagText, mdiTagTextOutline, mdiTapeMeasure, mdiText, mdiWeatherPartlySnowyRainy, mdiWeatherSnowyRainy, mdiWrenchClock } from '@mdi/js'

export interface BaseType {
  shortName?: string
  path: string
  color: () => string
  text: string
}

export interface GroupType extends BaseType {
  id: string
  apiName: string
  itemType: string
  idColumn: string
  nameColumns: string[]
}

type UploadType = 'mcpd' | 'climate' | 'genotype' | 'trial' | 'pedigree' | 'images' | 'groups'

export interface IdState {
  id: number
}
export interface StringIdState {
  id: string
}
export interface PathState {
  path: string
}
export interface LinkState {
  link: string
}
export interface IsCountState {
  isCount: boolean
}
export interface ColorConstState {
  color: string
}
export interface ColorState {
  color: () => string
}
export interface TextState {
  text: string
}
export interface HelpState {
  help: string
}
export interface AcceptsState {
  accepts: string
}
export interface HelpUrlState {
  helpUrl: string
}
export interface GroupState {
  group: UploadType
}
export interface ValueState {
  value: string
}
export interface OverviewStatsState {
  value: OverviewStatsField
}
export interface FormatState {
  name: string
  logo: string
  text: string
  tags: string[]
  types: string[]
  link: string
  linkType: 'link' | 'download'
}

const newsTypes: { [key: string]: IdState & TextState & PathState & ColorState } = {
  Projects: {
    id: 4,
    text: 'widgetNewsTypeRelatedProject',
    path: mdiNewspaperVariantOutline,
    color: () => getTemplateColor(0),
  },
  Data: {
    id: 3,
    text: 'widgetNewsTypeDataChanges',
    path: mdiDatabase,
    color: () => getTemplateColor(1),
  },
  Updates: {
    id: 2,
    text: 'widgetNewsTypeGeneralUpdates',
    path: mdiRefresh,
    color: () => getTemplateColor(2),
  },
  General: {
    id: 1,
    text: 'widgetNewsTypeGeneralNews',
    path: mdiNewspaper,
    color: () => getTemplateColor(3),
  },
}

export interface Status {
  text: Function
  color: string
  path: string
}

const asyncJobStatus: { [key: string]: ColorConstState & PathState & TextState } = {
  running: {
    color: 'info',
    path: mdiProgressWrench,
    text: 'asyncJobStatusRunning',
  },
  failed: {
    color: 'error',
    path: mdiAlert,
    text: 'asyncJobStatusFailed',
  },
  completed: {
    color: 'success',
    path: mdiCheckCircle,
    text: 'asyncJobStatusCompleted',
  },
  waiting: {
    color: 'info',
    path: mdiPauseCircle,
    text: 'asyncJobStatusWaiting',
  },
  cancelled: {
    color: 'warning',
    path: mdiCancel,
    text: 'asyncJobStatusCancelled',
  },
}

const newsTypeImageFit: (TextState & ValueState)[] = [{
  value: 'cover',
  text: 'widgetNewsImageFitCover',
}, {
  value: 'contain',
  text: 'widgetNewsImageFitContain',
}]

const exportFormats: { [key: string]: FormatState } = {
  gridscore: {
    name: 'GridScore NEXT',
    logo: 'tools/gridscore.svg',
    text: 'pageExportFormatsGridScoreText',
    tags: ['phenotype'],
    types: ['receiver', 'provider'],
    link: 'https://gridscore.hutton.ac.uk',
    linkType: 'link',
  },
  helium: {
    name: 'Helium',
    logo: 'tools/helium.svg',
    text: 'pageExportFormatsHeliumText',
    tags: ['pedigree', 'phenotype'],
    types: ['receiver'],
    link: 'https://helium.hutton.ac.uk/',
    linkType: 'link',
  },
  flapjack: {
    name: 'Flapjack',
    logo: 'tools/flapjack.png',
    text: 'pageExportFormatsFlapjackText',
    tags: ['genotype', 'phenotype'],
    types: ['receiver'],
    link: 'https://ics.hutton.ac.uk/flapjack',
    linkType: 'download',
  },
  curlywhirly: {
    name: 'CurlyWhirly',
    logo: 'tools/curlywhirly.png',
    text: 'pageExportFormatsCurlyWhirlyText',
    tags: ['pca'],
    types: ['receiver'],
    link: 'https://ics.hutton.ac.uk/curlywhirly',
    linkType: 'download',
  },
  strudel: {
    name: 'Strudel',
    logo: 'tools/strudel.png',
    text: 'pageExportFormatsStrudelText',
    tags: ['genotype'],
    types: ['receiver'],
    link: 'https://ics.hutton.ac.uk/strudel',
    linkType: 'download',
  },
  excel: {
    name: 'Excel',
    logo: 'tools/excel.svg',
    text: 'pageExportFormatsExcelText',
    tags: ['genotype', 'phenotype'],
    types: ['receiver'],
    link: 'https://products.office.com/excel',
    linkType: 'download',
  },
  tassel: {
    name: 'Tassel',
    logo: 'tools/tassel.png',
    text: 'pageExportFormatsTasselText',
    tags: ['genotype'],
    types: ['receiver'],
    link: 'https://www.maizegenetics.net/tassel',
    linkType: 'download',
  },
}

const publicationTypes = {
  germplasm: {
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: 'publicationTypeGerminatebase',
  },
  group: {
    path: mdiGroup,
    color: () => getTemplateColor(1),
    text: 'publicationTypeGroup',
  },
  database: {
    path: '$germinate',
    color: () => getTemplateColor(2),
    text: 'publicationTypeDatabase',
  },
  dataset: {
    path: mdiDatabase,
    color: () => getTemplateColor(3),
    text: 'publicationTypeDataset',
  },
  experiment: {
    path: mdiFolderTable,
    color: () => getTemplateColor(4),
    text: 'publicationTypeExperiment',
  },
}

const dataTypes: { [key: string]: BaseType } = {
  numeric: {
    text: 'dataTypeNumeric',
    path: mdiNumeric,
    color: () => getTemplateColor(0),
  },
  text: {
    text: 'dataTypeText',
    path: mdiAlphabetical,
    color: () => getTemplateColor(1),
  },
  date: {
    text: 'dataTypeDate',
    path: mdiCalendar,
    color: () => getTemplateColor(2),
  },
  categorical: {
    text: 'dataTypeCategorical',
    path: mdiTagText,
    color: () => getTemplateColor(3),
  },
}

const entityTypes: { [key: string]: BaseType } = {
  Accession: {
    shortName: 'accession',
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: 'entityTypeAccession',
  },
  'Plant/Plot': {
    shortName: 'plantplot',
    path: mdiGrid,
    color: () => getTemplateColor(1),
    text: 'entityTypePlantPlot',
  },
  Sample: {
    shortName: 'sample',
    path: mdiLeaf,
    color: () => getTemplateColor(2),
    text: 'entityTypeSample',
  },
}

const traitClasses: { [key: string]: ColorState & PathState & TextState & ValueState } = {
  abiotic_tress: {
    path: mdiWeatherPartlySnowyRainy,
    color: () => getTemplateColor(0),
    text: 'traitClassAbioticStress',
    value: TraitsTraitClass.abiotic_stress,
  },
  agronomic: {
    path: mdiLandFields,
    color: () => getTemplateColor(1),
    text: 'traitClassAgronomic',
    value: TraitsTraitClass.agronomic,
  },
  biochemical: {
    path: mdiFlask,
    color: () => getTemplateColor(2),
    text: 'traitClassBiochemical',
    value: TraitsTraitClass.biochemical,
  },
  biotic_stress: {
    path: mdiBug,
    color: () => getTemplateColor(3),
    text: 'traitClassBioticStress',
    value: TraitsTraitClass.biotic_stress,
  },
  fertility: {
    path: mdiSeed,
    color: () => getTemplateColor(4),
    text: 'traitClassFertility',
    value: TraitsTraitClass.fertility,
  },
  morphological: {
    path: mdiSprout,
    color: () => getTemplateColor(5),
    text: 'traitClassMorphological',
    value: TraitsTraitClass.morphological,
  },
  phenological: {
    path: mdiMagnifyExpand,
    color: () => getTemplateColor(6),
    text: 'traitClassPhenological',
    value: TraitsTraitClass.phenological,
  },
  physiological: {
    path: mdiLeaf,
    color: () => getTemplateColor(7),
    text: 'traitClassPhysiological',
    value: TraitsTraitClass.physiological,
  },
  quality: {
    path: mdiScale,
    color: () => getTemplateColor(8),
    text: 'traitClassQuality',
    value: TraitsTraitClass.quality,
  },
  other: {
    path: mdiHelpCircle,
    color: () => getTemplateColor(0),
    text: 'traitClassOther',
    value: TraitsTraitClass.other,
  },
}

const methodClasses: { [key: string]: ColorState & PathState & TextState & ValueState } = {
  measurement: {
    path: mdiTapeMeasure,
    color: () => getTemplateColor(0),
    text: 'methodClassMeasurement',
    value: MethodsMethodClass.measurement,
  },
  estimation: {
    path: mdiCalculator,
    color: () => getTemplateColor(1),
    text: 'methodClassEstimation',
    value: MethodsMethodClass.estimation,
  },
  counting: {
    path: mdiCounter,
    color: () => getTemplateColor(2),
    text: 'methodClassCounting',
    value: MethodsMethodClass.counting,
  },
  computation: {
    path: mdiDesktopClassic,
    color: () => getTemplateColor(3),
    text: 'methodClassComputation',
    value: MethodsMethodClass.computation,
  },
  prediction: {
    path: mdiCrystalBall,
    color: () => getTemplateColor(4),
    text: 'methodClassPrediction',
    value: MethodsMethodClass.prediction,
  },
  description: {
    path: mdiText,
    color: () => getTemplateColor(5),
    text: 'methodClassDescription',
    value: MethodsMethodClass.description,
  },
  classification: {
    path: mdiFileTree,
    color: () => getTemplateColor(6),
    text: 'methodClassClassification',
    value: MethodsMethodClass.classification,
  },
  other: {
    path: mdiHelpCircle,
    color: () => getTemplateColor(7),
    text: 'methodClassOther',
    value: MethodsMethodClass.other,
  },
}

const groupTypes: { [key: string]: GroupType } = {
  germinatebase: {
    id: 'germinatebase',
    path: mdiSprout,
    apiName: 'germplasm',
    itemType: 'germplasm',
    idColumn: 'germplasmId',
    nameColumns: ['germplasmName', 'germplasmDisplayName'],
    color: () => getTemplateColor(0),
    text: 'groupTypeGerminatebase',
  },
  markers: {
    id: 'markers',
    path: mdiDna,
    apiName: 'marker',
    itemType: 'markers',
    idColumn: 'markerId',
    nameColumns: ['markerName'],
    color: () => getTemplateColor(1),
    text: 'groupTypeMarker',
  },
  locations: {
    id: 'locations',
    path: mdiMapMarker,
    apiName: 'location',
    itemType: 'locations',
    idColumn: 'locationId',
    nameColumns: ['locationName'],
    color: () => getTemplateColor(2),
    text: 'groupTypeLocation',
  },
}

const markedItemTypes: { [key: string]: PathState & ColorState & TextState } = {
  germplasm: {
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: 'groupTypeGerminatebase',
  },
  markers: {
    path: mdiDna,
    color: () => getTemplateColor(1),
    text: 'groupTypeMarker',
  },
  locations: {
    path: mdiMapMarker,
    color: () => getTemplateColor(2),
    text: 'groupTypeLocation',
  },
}

const imageTypes: { [key: string]: PathState & ColorState & TextState } = {
  germinatebase: {
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: 'imageTypeGerminatebase',
  },
  phenotypes: {
    path: mdiTagTextOutline,
    color: () => getTemplateColor(2),
    text: 'imageTypePhenotypes',
  },
  projects: {
    path: mdiClipboardList,
    color: () => getTemplateColor(3),
    text: 'imageTypeProjects',
  },
  storysteps: {
    path: mdiCardBulletedSettings,
    color: () => getTemplateColor(4),
    text: 'imageTypeStorySteps',
  },
}

const locationTypes: { [key: string]: BaseType } = {
  trialsite: {
    path: mdiShovel,
    color: () => getTemplateColor(0),
    text: 'locationTypeTrialsite',
  },
  collectingsites: {
    path: mdiBasketFill,
    color: () => getTemplateColor(1),
    text: 'locationTypeCollectingsite',
  },
  datasets: {
    path: mdiDatabase,
    color: () => getTemplateColor(2),
    text: 'locationTypeDataset',
  },
  undefined: {
    path: mdiMapMarker,
    color: () => getTemplateColor(3),
    text: 'N/A',
  },
}

export type TemplateImportType = StringIdState & PathState & ColorState & TextState & AcceptsState & HelpUrlState & GroupState

const templateImportTypes: { [key: string]: TemplateImportType } = {
  mcpd: {
    id: 'mcpd',
    path: mdiPassport,
    color: () => getTemplateColor(0),
    text: 'templateImportTypeMcpd',
    accepts: '.xlsx',
    group: 'mcpd',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/germplasm',
  },
  climate: {
    id: 'climate',
    path: mdiWeatherSnowyRainy,
    color: () => getTemplateColor(1),
    text: 'templateImportTypeClimate',
    accepts: '.xlsx',
    group: 'climate',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/environmental-data',
  },
  genotype: {
    id: 'genotype',
    path: mdiDna,
    color: () => getTemplateColor(2),
    text: 'templateImportTypeGenotype',
    accepts: '.xlsx, .txt, .hapmap',
    group: 'genotype',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/genotypic-data',
  },
  trial: {
    id: 'trial',
    path: mdiShovel,
    color: () => getTemplateColor(3),
    text: 'templateImportTypeTrial',
    accepts: '.xlsx',
    group: 'trial',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/trials-data',
  },
  shapefile: {
    id: 'shapefile',
    path: mdiShapeRectanglePlus,
    color: () => getTemplateColor(3),
    text: 'templateImportTypeShapefile',
    accepts: '.zip',
    group: 'trial',
    helpUrl: 'TODO',
  },
  geotiff: {
    id: 'geotiff',
    path: mdiImageMarker,
    color: () => getTemplateColor(7),
    text: 'templateImportTypeGeotiff',
    accepts: '.zip',
    group: 'trial',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/trials-geotiff',
  },
  pedigree: {
    id: 'pedigree',
    path: mdiFamilyTree,
    color: () => getTemplateColor(4),
    text: 'templateImportTypePedigree',
    accepts: '.xlsx',
    group: 'pedigree',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/pedigree-data',
  },
  images: {
    id: 'images',
    path: mdiImageMultiple,
    color: () => getTemplateColor(5),
    text: 'templateImportTypeImages',
    accepts: '.zip',
    group: 'images',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/images',
  },
  groups: {
    id: 'groups',
    path: mdiGroup,
    color: () => getTemplateColor(6),
    text: 'templateImportTypeGroups',
    accepts: '.xlsx',
    group: 'groups',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/groups',
  },
}

const commentTypes: { [key: string]: BaseType } = {
  germinatebase: {
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: 'Germplasm',
  },
  locations: {
    path: mdiMarker,
    color: () => getTemplateColor(1),
    text: 'Location',
  },
}

export type DatasetState = IdState & PathState & TextState & HelpState

const datasetStates: { [key: string]: DatasetState } = {
  public: {
    id: 1,
    path: mdiLockOpenVariantOutline,
    text: 'datasetStatePublic',
    help: 'datasetStateHelpPublic',
  },
  private: {
    id: 2,
    path: mdiLock,
    text: 'datasetStatePrivate',
    help: 'datasetStateHelpPrivate',
  },
  hidden: {
    id: 3,
    path: mdiEyeOff,
    text: 'datasetStateHidden',
    help: 'datasetStateHelpHidden',
  },
}

const dashboardSections: { [id: string]: ValueState & TextState & PathState } = {
  datastories: {
    value: 'datastories',
    text: 'dashboardSectionDataStories',
    path: mdiBookOpenPageVariant,
  },
  dataupdates: {
    value: 'dataupdates',
    text: 'dashboardSectionDataUpdates',
    path: mdiDatabaseImport,
  },
  news: {
    value: 'news',
    text: 'dashboardSectionNews',
    path: mdiNewspaper,
  },
  publications: {
    value: 'publications',
    text: 'dashboardSectionPublications',
    path: mdiNewspaperVariant,
  },
}

const statCategories: { [id: string]: OverviewStatsState & TextState & PathState & LinkState & IsCountState } = {
  germplasm: {
    value: 'germplasm',
    text: 'dashboardBannerGermplasm',
    path: mdiSprout,
    link: Pages.germplasm.path,
    isCount: true,
  },
  markers: {
    value: 'markers',
    text: 'dashboardBannerMarkers',
    path: mdiDna,
    link: Pages.markers.path,
    isCount: true,
  },
  maps: {
    value: 'maps',
    text: 'dashboardBannerMaps',
    path: mdiReorderVertical,
    link: Pages.maps.path,
    isCount: true,
  },
  traits: {
    value: 'traits',
    text: 'dashboardBannerTraits',
    path: mdiTagTextOutline,
    link: Pages.traits.path,
    isCount: true,
  },
  locations: {
    value: 'locations',
    text: 'dashboardBannerLocations',
    path: mdiMapMarker,
    link: Pages.locations.path,
    isCount: true,
  },
  datasets: {
    value: 'datasets',
    text: 'dashboardBannerDatasets',
    path: mdiDatabase,
    link: Pages.datasets.path,
    isCount: true,
  },
  datasetId: {
    value: 'datasets',
    text: 'dashboardBannerDatasets',
    path: mdiDatabase,
    link: Pages.datasets.path,
    isCount: false,
  },
  experiments: {
    value: 'experiments',
    text: 'dashboardBannerExperiments',
    path: mdiFolderTable,
    link: Pages.experiments.path,
    isCount: true,
  },
  datasetsAllelefreq: {
    value: 'datasetsAllelefreq',
    text: 'dashboardBannerDatasetsAllelefreq',
    path: mdiPulse,
    link: Pages.getPath(Pages.export, 'allelefreq'),
    isCount: true,
  },
  datasetsGenotype: {
    value: 'datasetsGenotype',
    text: 'dashboardBannerDatasetsGenotype',
    path: mdiDna,
    link: Pages.getPath(Pages.export, 'genotype'),
    isCount: true,
  },
  datasetsTrials: {
    value: 'datasetsTrials',
    text: 'dashboardBannerDatasetsTrials',
    path: mdiShovel,
    link: Pages.getPath(Pages.export, 'trials'),
    isCount: true,
  },
  datasetsClimate: {
    value: 'datasetsClimate',
    text: 'dashboardBannerDatasetsClimate',
    path: mdiChartSankey,
    link: Pages.getPath(Pages.export, 'climate'),
    isCount: true,
  },
  datasetsPedigree: {
    value: 'datasetsPedigree',
    text: 'dashboardBannerDatasetsPedigree',
    path: mdiFamilyTree,
    link: Pages.getPath(Pages.export, 'pedigree'),
    isCount: true,
  },
  groups: {
    value: 'groups',
    text: 'dashboardBannerGroups',
    path: mdiGroup,
    link: Pages.groups.path,
    isCount: true,
  },
  climates: {
    value: 'climates',
    text: 'dashboardBannerClimates',
    path: mdiWeatherSnowyRainy,
    link: Pages.climates.path,
    isCount: true,
  },
  images: {
    value: 'images',
    text: 'dashboardBannerImages',
    path: mdiImageMultiple,
    link: Pages.images.path,
    isCount: true,
  },
  fileresources: {
    value: 'fileresources',
    text: 'dashboardBannerFileResources',
    path: mdiFileDownload,
    link: Pages.dataResources.path,
    isCount: true,
  },
  fileResourceId: {
    value: 'fileresources',
    text: 'dashboardBannerFileResources',
    path: mdiFileDownload,
    link: Pages.dataResources.path,
    isCount: false,
  },
}

const germplasmInstitutionTypes: { [key: string]: PathState & ColorState & TextState } = {
  maintenance: {
    path: mdiWrenchClock,
    color: () => getTemplateColor(0),
    text: 'germplasmInstitutionTypesMaintenance',
  },
  breeding: {
    path: mdiEyedropper,
    color: () => getTemplateColor(1),
    text: 'germplasmInstitutionTypesBreeding',
  },
  collection: {
    path: mdiAllergy,
    color: () => getTemplateColor(2),
    text: 'germplasmInstitutionTypesCollection',
  },
  duplicate: {
    path: mdiContentDuplicate,
    color: () => getTemplateColor(3),
    text: 'germplasmInstitutionTypesDuplicate',
  },
  donor: {
    path: mdiGift,
    color: () => getTemplateColor(4),
    text: 'germplasmInstitutionTypesDonor',
  },
}

export interface DatasetType extends BaseType {
  id: number
  pageName?: Page
}

type DatasetTypeKey = 'climate' | 'genotype' | 'trials' | 'pedigree' | 'unknown'

const datasetTypes: Record<DatasetTypeKey, DatasetType> & { [key: string]: DatasetType } = {
  climate: {
    id: 5,
    path: mdiWeatherSnowyRainy,
    pageName: Pages.exportClimates,
    color: () => getTemplateColor(1),
    text: 'datasetTypeClimate',
  },
  genotype: {
    id: 1,
    path: mdiDna,
    pageName: Pages.exportGenotypes,
    color: () => getTemplateColor(2),
    text: 'datasetTypeGenotype',
  },
  trials: {
    id: 3,
    path: mdiShovel,
    pageName: Pages.exportTraits,
    color: () => getTemplateColor(3),
    text: 'datasetTypeTrials',
  },
  pedigree: {
    id: 7,
    path: mdiFamilyTree,
    pageName: Pages.exportPedigrees,
    color: () => getTemplateColor(4),
    text: 'datasetTypePedigree',
  },
  unknown: {
    id: -1,
    path: mdiHelpBox,
    color: () => getTemplateColor(6),
    text: 'datasetTypeUnknown',
  },
}

const userTypes: { [id: string]: ValueState & TextState & ColorState & PathState } = {
  ADMIN: {
    value: 'ADMIN',
    text: UserType.ADMIN,
    color: () => getTemplateColor(0),
    path: mdiShieldAccount,
  },
  DATA_CURATOR: {
    value: 'DATA_CURATOR',
    text: UserType.DATA_CURATOR,
    color: () => getTemplateColor(1),
    path: mdiAccountSearch,
  },
  AUTH_USER: {
    value: 'AUTH_USER',
    text: UserType.REGULAR_USER,
    color: () => getTemplateColor(2),
    path: mdiAccount,
  },
  SUSPENDED_USER: {
    value: 'SUSPENDED_USER',
    text: UserType.SUSPENDED_USER,
    color: () => getTemplateColor(3),
    path: mdiAccountCancel,
  },
  UNKNOWN: {
    value: 'UNKNOWN',
    text: UserType.UNKNOWN,
    color: () => getTemplateColor(4),
    path: mdiAccountQuestion,
  },
}

const userFeedbackTypes = [
  {
    id: 'bug',
    path: mdiBugOutline,
    color: () => getTemplateColor(0),
    text: 'userFeedbackTypesBug',
  },
  {
    id: 'data_error',
    path: mdiAlertCircleOutline,
    color: () => getTemplateColor(1),
    text: 'userFeedbackTypesDataError',
  },
  {
    id: 'feature_request',
    path: mdiHammerWrench,
    color: () => getTemplateColor(2),
    text: 'userFeedbackTypesFeatureRequest',
  },
  {
    id: 'general',
    path: mdiMessageTextFastOutline,
    color: () => getTemplateColor(3),
    text: 'userFeedbackTypesGeneral',
  },
  {
    id: 'question',
    path: mdiHelpCircleOutline,
    color: () => getTemplateColor(4),
    text: 'userFeedbackTypesQuestion',
  },
]

const userFeedbackSeverityTypes = {
  low: {
    id: 'low',
    path: mdiSpeedometerSlow,
    color: 'text-success',
    text: 'userFeedbackSeverityLow',
  },
  medium: {
    id: 'medium',
    path: mdiSpeedometerMedium,
    color: 'text-warning',
    text: 'userFeedbackSeverityMedium',
  },
  high: {
    id: 'high',
    path: mdiSpeedometer,
    color: 'text-danger',
    text: 'userFeedbackSeverityHigh',
  },
}

export {
  exportFormats,
  publicationTypes,
  dataTypes,
  entityTypes,
  newsTypes,
  groupTypes,
  methodClasses,
  traitClasses,
  markedItemTypes,
  imageTypes,
  locationTypes,
  templateImportTypes,
  commentTypes,
  datasetStates,
  userTypes,
  newsTypeImageFit,
  statCategories,
  asyncJobStatus,
  dashboardSections,
  germplasmInstitutionTypes,
  datasetTypes,
  userFeedbackTypes,
  userFeedbackSeverityTypes,
}
