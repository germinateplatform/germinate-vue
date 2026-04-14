import { i18n } from '@/plugins/vuetify.ts'
import { Pages } from '@/plugins/pages'
import { getTemplateColor } from './colors'
import type { Page } from '@/plugins/types/Page'
import { MethodsMethodClass, TraitsTraitClass } from '@/plugins/types/germinate'
import { mdiAlert, mdiAlertCircleOutline, mdiAllergy, mdiAlphabetical, mdiBasketFill, mdiBug, mdiBugOutline, mdiCalculator, mdiCalendar, mdiCancel, mdiCardBulletedSettings, mdiChartSankey, mdiCheckCircle, mdiClipboardList, mdiContentDuplicate, mdiCounter, mdiCrystalBall, mdiDatabase, mdiDesktopClassic, mdiDna, mdiEyedropper, mdiEyeOff, mdiFamilyTree, mdiFileDownload, mdiFileTree, mdiFlask, mdiFolderTable, mdiGift, mdiGrid, mdiGroup, mdiHammerWrench, mdiHelpBox, mdiHelpCircle, mdiHelpCircleOutline, mdiImageMarker, mdiImageMultiple, mdiLandFields, mdiLeaf, mdiLock, mdiLockOpenVariantOutline, mdiMagnifyExpand, mdiMapMarker, mdiMarker, mdiMessageTextFastOutline, mdiNewspaper, mdiNewspaperVariantOutline, mdiNumeric, mdiPassport, mdiPauseCircle, mdiProgressWrench, mdiPulse, mdiRefresh, mdiReorderVertical, mdiScale, mdiSeed, mdiShapeRectanglePlus, mdiShovel, mdiSpeedometer, mdiSpeedometerMedium, mdiSpeedometerSlow, mdiSprout, mdiTagText, mdiTagTextOutline, mdiTapeMeasure, mdiText, mdiWeatherPartlySnowyRainy, mdiWeatherSnowyRainy, mdiWrenchClock } from '@mdi/js'

const mdiGerminate = 'M 11.999836,0 C 5.384778,0 -3.9999998e-7,5.38515 0,12.00026 -3.9999998e-7,18.61531 5.384778,24.00011 11.999836,24.00011 18.614894,24.00011 24,18.61531 24,12.00026 24,5.38515 18.614894,0 11.999836,0 Z m 0,2.09227 c 5.484271,0 9.907984,4.42367 9.907984,9.90799 0,5.48425 -4.423713,9.90754 -9.907984,9.90754 -5.4842703,0 -9.9076558,-4.42329 -9.9076558,-9.90754 0,-5.48432 4.4233855,-9.90799 9.9076558,-9.90799 z M 9.5003025,5.50579 c -2.4997191,0 -2.4997043,0 -3.7494633,2.16472 L 4.500991,9.83539 c -1.2498943,2.16476 -1.2498943,2.16487 0,4.32945 l 1.2498482,2.16476 c 1.261759,2.16476 1.2617442,2.16476 3.7494633,2.16476 2.4996545,0 2.4997185,0 3.7495455,-2.16476 h -8.1e-5 c 1.249812,-2.16476 1.249787,-2.16469 0,-4.32934 v -1.1e-4 H 10.750152 8.2505363 l 1.2497662,2.16469 H 12 L 10.750152,16.3296 H 8.2505363 L 7.0006881,14.16484 5.7508392,12.00015 7.0006881,9.83539 8.2505363,7.67051 h 2.4996157 2.499696 L 12,5.50579 Z m 4.9993125,0 1.249849,2.16472 1.249848,2.16488 h -2.499697 l -1.249767,2.16476 h 2.499616 l 1.249848,2.16469 -1.249848,2.16476 -1.249849,2.16476 h 2.499697 l 1.249849,-2.16476 1.249766,-2.16476 c 1.249826,-2.16476 1.249826,-2.16469 0,-4.32945 L 18.249161,7.67051 16.999312,5.50579 Z'

export interface BaseType {
  shortName?: string
  path: string
  color: () => string
  text: () => string
}

export interface GroupType extends BaseType {
  id: string
  apiName: string
  itemType: string
  idColumn: string
  nameColumns: string[]
}

type UploadType = 'mcpd' | 'climate' | 'genotype' | 'trial' | 'pedigree' | 'images' | 'groups'

interface IdState {
  id: number
}
interface StringIdState {
  id: string
}
interface PathState {
  path: string
}
interface LinkState {
  link: string
}
interface IsCountState {
  isCount: boolean
}
interface ColorState {
  color: () => string
}
interface TextState {
  text: () => string
}
interface HelpState {
  help: () => string
}
interface AcceptsState {
  accepts: string
}
interface HelpUrlState {
  helpUrl: string
}
interface GroupState {
  group: UploadType
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
    path: mdiNewspaperVariantOutline,
    color: () => getTemplateColor(0),
  },
  Data: {
    id: 3,
    text: () => i18n.global.t('widgetNewsTypeDataChanges'),
    path: mdiDatabase,
    color: () => getTemplateColor(1),
  },
  Updates: {
    id: 2,
    text: () => i18n.global.t('widgetNewsTypeGeneralUpdates'),
    path: mdiRefresh,
    color: () => getTemplateColor(2),
  },
  General: {
    id: 1,
    text: () => i18n.global.t('widgetNewsTypeGeneralNews'),
    path: mdiNewspaper,
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
    path: mdiProgressWrench,
    text: () => i18n.global.t('asyncJobStatusRunning'),
  },
  failed: {
    color: 'error',
    path: mdiAlert,
    text: () => i18n.global.t('asyncJobStatusFailed'),
  },
  completed: {
    color: 'success',
    path: mdiCheckCircle,
    text: () => i18n.global.t('asyncJobStatusCompleted'),
  },
  waiting: {
    color: 'info',
    path: mdiPauseCircle,
    text: () => i18n.global.t('asyncJobStatusWaiting'),
  },
  cancelled: {
    color: 'warning',
    path: mdiCancel,
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
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('publicationTypeGerminatebase'),
  },
  group: {
    path: mdiGroup,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('publicationTypeGroup'),
  },
  database: {
    path: '$germinate',
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('publicationTypeDatabase'),
  },
  dataset: {
    path: mdiDatabase,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('publicationTypeDataset'),
  },
  experiment: {
    path: mdiFolderTable,
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('publicationTypeExperiment'),
  },
}

const dataTypes: { [key: string]: BaseType } = {
  numeric: {
    text: () => i18n.global.t('dataTypeNumeric'),
    path: mdiNumeric,
    color: () => getTemplateColor(0),
  },
  text: {
    text: () => i18n.global.t('dataTypeText'),
    path: mdiAlphabetical,
    color: () => getTemplateColor(1),
  },
  date: {
    text: () => i18n.global.t('dataTypeDate'),
    path: mdiCalendar,
    color: () => getTemplateColor(2),
  },
  categorical: {
    text: () => i18n.global.t('dataTypeCategorical'),
    path: mdiTagText,
    color: () => getTemplateColor(3),
  },
}

const entityTypes: { [key: string]: BaseType } = {
  Accession: {
    shortName: 'accession',
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('entityTypeAccession'),
  },
  'Plant/Plot': {
    shortName: 'plantplot',
    path: mdiGrid,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('entityTypePlantPlot'),
  },
  Sample: {
    shortName: 'sample',
    path: mdiLeaf,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('entityTypeSample'),
  },
}

const traitClasses: { [key: string]: ColorState & PathState & TextState & ValueState } = {
  abiotic_tress: {
    path: mdiWeatherPartlySnowyRainy,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('traitClassAbioticStress'),
    value: TraitsTraitClass.abiotic_stress,
  },
  agronomic: {
    path: mdiLandFields,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('traitClassAgronomic'),
    value: TraitsTraitClass.agronomic,
  },
  biochemical: {
    path: mdiFlask,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('traitClassBiochemical'),
    value: TraitsTraitClass.biochemical,
  },
  biotic_stress: {
    path: mdiBug,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('traitClassBioticStress'),
    value: TraitsTraitClass.biotic_stress,
  },
  fertility: {
    path: mdiSeed,
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('traitClassFertility'),
    value: TraitsTraitClass.fertility,
  },
  morphological: {
    path: mdiSprout,
    color: () => getTemplateColor(5),
    text: () => i18n.global.t('traitClassMorphological'),
    value: TraitsTraitClass.morphological,
  },
  phenological: {
    path: mdiMagnifyExpand,
    color: () => getTemplateColor(6),
    text: () => i18n.global.t('traitClassPhenological'),
    value: TraitsTraitClass.phenological,
  },
  physiological: {
    path: mdiLeaf,
    color: () => getTemplateColor(7),
    text: () => i18n.global.t('traitClassPhysiological'),
    value: TraitsTraitClass.physiological,
  },
  quality: {
    path: mdiScale,
    color: () => getTemplateColor(8),
    text: () => i18n.global.t('traitClassQuality'),
    value: TraitsTraitClass.quality,
  },
  other: {
    path: mdiHelpCircle,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('traitClassOther'),
    value: TraitsTraitClass.other,
  },
}

const methodClasses: { [key: string]: ColorState & PathState & TextState & ValueState } = {
  measurement: {
    path: mdiTapeMeasure,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('methodClassMeasurement'),
    value: MethodsMethodClass.measurement,
  },
  estimation: {
    path: mdiCalculator,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('methodClassEstimation'),
    value: MethodsMethodClass.estimation,
  },
  counting: {
    path: mdiCounter,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('methodClassCounting'),
    value: MethodsMethodClass.counting,
  },
  computation: {
    path: mdiDesktopClassic,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('methodClassComputation'),
    value: MethodsMethodClass.computation,
  },
  prediction: {
    path: mdiCrystalBall,
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('methodClassPrediction'),
    value: MethodsMethodClass.prediction,
  },
  description: {
    path: mdiText,
    color: () => getTemplateColor(5),
    text: () => i18n.global.t('methodClassDescription'),
    value: MethodsMethodClass.description,
  },
  classification: {
    path: mdiFileTree,
    color: () => getTemplateColor(6),
    text: () => i18n.global.t('methodClassClassification'),
    value: MethodsMethodClass.classification,
  },
  other: {
    path: mdiHelpCircle,
    color: () => getTemplateColor(7),
    text: () => i18n.global.t('methodClassOther'),
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
    text: () => i18n.global.t('groupTypeGerminatebase'),
  },
  markers: {
    id: 'markers',
    path: mdiDna,
    apiName: 'marker',
    itemType: 'markers',
    idColumn: 'markerId',
    nameColumns: ['markerName'],
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('groupTypeMarker'),
  },
  locations: {
    id: 'locations',
    path: mdiMapMarker,
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
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('groupTypeGerminatebase'),
  },
  markers: {
    path: mdiDna,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('groupTypeMarker'),
  },
  locations: {
    path: mdiMapMarker,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('groupTypeLocation'),
  },
}

const imageTypes: { [key: string]: PathState & ColorState & TextState } = {
  germinatebase: {
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('imageTypeGerminatebase'),
  },
  phenotypes: {
    path: mdiTagTextOutline,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('imageTypePhenotypes'),
  },
  projects: {
    path: mdiClipboardList,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('imageTypeProjects'),
  },
  storysteps: {
    path: mdiCardBulletedSettings,
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('imageTypeStorySteps'),
  },
}

const locationTypes: { [key: string]: BaseType } = {
  trialsite: {
    path: mdiShovel,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('locationTypeTrialsite'),
  },
  collectingsites: {
    path: mdiBasketFill,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('locationTypeCollectingsite'),
  },
  datasets: {
    path: mdiDatabase,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('locationTypeDataset'),
  },
}

export type TemplateImportType = StringIdState & PathState & ColorState & TextState & AcceptsState & HelpUrlState & GroupState

const templateImportTypes: { [key: string]: TemplateImportType } = {
  mcpd: {
    id: 'mcpd',
    path: mdiPassport,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('templateImportTypeMcpd'),
    accepts: '.xlsx',
    group: 'mcpd',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/germplasm',
  },
  climate: {
    id: 'climate',
    path: mdiWeatherSnowyRainy,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('templateImportTypeClimate'),
    accepts: '.xlsx',
    group: 'climate',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/environmental-data',
  },
  genotype: {
    id: 'genotype',
    path: mdiDna,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('templateImportTypeGenotype'),
    accepts: '.xlsx, .txt, .hapmap',
    group: 'genotype',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/genotypic-data',
  },
  trial: {
    id: 'trial',
    path: mdiShovel,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('templateImportTypeTrial'),
    accepts: '.xlsx',
    group: 'trial',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/trials-data',
  },
  shapefile: {
    id: 'shapefile',
    path: mdiShapeRectanglePlus,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('templateImportTypeShapefile'),
    accepts: '.zip',
    group: 'trial',
    helpUrl: 'TODO',
  },
  geotiff: {
    id: 'geotiff',
    path: mdiImageMarker,
    color: () => getTemplateColor(7),
    text: () => i18n.global.t('templateImportTypeGeotiff'),
    accepts: '.zip',
    group: 'trial',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/trials-geotiff',
  },
  pedigree: {
    id: 'pedigree',
    path: mdiFamilyTree,
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('templateImportTypePedigree'),
    accepts: '.xlsx',
    group: 'pedigree',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/pedigree-data',
  },
  images: {
    id: 'images',
    path: mdiImageMultiple,
    color: () => getTemplateColor(5),
    text: () => i18n.global.t('templateImportTypeImages'),
    accepts: '.zip',
    group: 'images',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/images',
  },
  groups: {
    id: 'groups',
    path: mdiGroup,
    color: () => getTemplateColor(6),
    text: () => i18n.global.t('templateImportTypeGroups'),
    accepts: '.xlsx',
    group: 'groups',
    helpUrl: 'https://github.com/germinateplatform/germinate-data-templates/tree/master/groups',
  },
}

const commentTypes = {
  germinatebase: {
    path: mdiSprout,
    color: () => getTemplateColor(0),
    text: () => 'Germplasm',
  },
  locations: {
    path: mdiMarker,
    color: () => getTemplateColor(1),
    text: () => 'Location',
  },
}

export type DatasetState = IdState & PathState & TextState & HelpState

const datasetStates: { [key: string]: DatasetState } = {
  public: {
    id: 1,
    path: mdiLockOpenVariantOutline,
    text: () => i18n.global.t('datasetStatePublic'),
    help: () => i18n.global.t('datasetStateHelpPublic'),
  },
  private: {
    id: 2,
    path: mdiLock,
    text: () => i18n.global.t('datasetStatePrivate'),
    help: () => i18n.global.t('datasetStateHelpPrivate'),
  },
  hidden: {
    id: 3,
    path: mdiEyeOff,
    text: () => i18n.global.t('datasetStateHidden'),
    help: () => i18n.global.t('datasetStateHelpHidden'),
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

const statCategories: { [id: string]: ValueState & TextState & PathState & LinkState & IsCountState } = {
  germplasm: {
    value: 'germplasm',
    text: () => i18n.global.t('dashboardBannerGermplasm'),
    path: mdiSprout,
    link: Pages.germplasm.path,
    isCount: true,
  },
  markers: {
    value: 'markers',
    text: () => i18n.global.t('dashboardBannerMarkers'),
    path: mdiDna,
    link: Pages.markers.path,
    isCount: true,
  },
  maps: {
    value: 'maps',
    text: () => i18n.global.t('dashboardBannerMaps'),
    path: mdiReorderVertical,
    link: Pages.maps.path,
    isCount: true,
  },
  traits: {
    value: 'traits',
    text: () => i18n.global.t('dashboardBannerTraits'),
    path: mdiTagTextOutline,
    link: Pages.traits.path,
    isCount: true,
  },
  locations: {
    value: 'locations',
    text: () => i18n.global.t('dashboardBannerLocations'),
    path: mdiMapMarker,
    link: Pages.locations.path,
    isCount: true,
  },
  datasets: {
    value: 'datasets',
    text: () => i18n.global.t('dashboardBannerDatasets'),
    path: mdiDatabase,
    link: Pages.datasets.path,
    isCount: true,
  },
  datasetId: {
    value: 'datasets',
    text: () => i18n.global.t('dashboardBannerDatasets'),
    path: mdiDatabase,
    link: Pages.datasets.path,
    isCount: false,
  },
  experiments: {
    value: 'experiments',
    text: () => i18n.global.t('dashboardBannerExperiments'),
    path: mdiFolderTable,
    link: Pages.experiments.path,
    isCount: true,
  },
  datasetsAllelefreq: {
    value: 'datasetsAllelefreq',
    text: () => i18n.global.t('dashboardBannerDatasetsAllelefreq'),
    path: mdiPulse,
    link: Pages.getPath(Pages.export, 'allelefreq'),
    isCount: false,
  },
  datasetsGenotype: {
    value: 'datasetsGenotype',
    text: () => i18n.global.t('dashboardBannerDatasetsGenotype'),
    path: mdiDna,
    link: Pages.getPath(Pages.export, 'genotype'),
    isCount: false,
  },
  datasetsTrials: {
    value: 'datasetsTrials',
    text: () => i18n.global.t('dashboardBannerDatasetsTrials'),
    path: mdiShovel,
    link: Pages.getPath(Pages.export, 'trials'),
    isCount: false,
  },
  datasetsClimate: {
    value: 'datasetsClimate',
    text: () => i18n.global.t('dashboardBannerDatasetsClimate'),
    path: mdiChartSankey,
    link: Pages.getPath(Pages.export, 'climate'),
    isCount: false,
  },
  datasetsPedigree: {
    value: 'datasetsPedigree',
    text: () => i18n.global.t('dashboardBannerDatasetsPedigree'),
    path: mdiFamilyTree,
    link: Pages.getPath(Pages.export, 'pedigree'),
    isCount: false,
  },
  groups: {
    value: 'groups',
    text: () => i18n.global.t('dashboardBannerGroups'),
    path: mdiGroup,
    link: Pages.groups.path,
    isCount: true,
  },
  climates: {
    value: 'climates',
    text: () => i18n.global.t('dashboardBannerClimates'),
    path: mdiWeatherSnowyRainy,
    link: Pages.climates.path,
    isCount: true,
  },
  images: {
    value: 'images',
    text: () => i18n.global.t('dashboardBannerImages'),
    path: mdiImageMultiple,
    link: Pages.images.path,
    isCount: true,
  },
  fileresources: {
    value: 'fileresources',
    text: () => i18n.global.t('dashboardBannerFileResources'),
    path: mdiFileDownload,
    link: Pages.dataResources.path,
    isCount: true,
  },
  fileResourceId: {
    value: 'fileresources',
    text: () => i18n.global.t('dashboardBannerFileResources'),
    path: mdiFileDownload,
    link: Pages.dataResources.path,
    isCount: false,
  },
}

const germplasmInstitutionTypes: { [key: string]: PathState & ColorState & TextState } = {
  maintenance: {
    path: mdiWrenchClock,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('germplasmInstitutionTypesMaintenance'),
  },
  breeding: {
    path: mdiEyedropper,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('germplasmInstitutionTypesBreeding'),
  },
  collection: {
    path: mdiAllergy,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('germplasmInstitutionTypesCollection'),
  },
  duplicate: {
    path: mdiContentDuplicate,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('germplasmInstitutionTypesDuplicate'),
  },
  donor: {
    path: mdiGift,
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
    path: mdiPulse,
    pageName: Pages.exportAlleleFrequency,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('datasetTypeAllelefreq'),
  },
  climate: {
    id: 5,
    path: mdiWeatherSnowyRainy,
    pageName: Pages.exportClimates,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('datasetTypeClimate'),
  },
  genotype: {
    id: 1,
    path: mdiDna,
    pageName: Pages.exportGenotypes,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('datasetTypeGenotype'),
  },
  trials: {
    id: 3,
    path: mdiShovel,
    pageName: Pages.exportTraits,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('datasetTypeTrials'),
  },
  pedigree: {
    id: 7,
    path: mdiFamilyTree,
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('datasetTypePedigree'),
  },
  unknown: {
    id: -1,
    path: mdiHelpBox,
    color: () => getTemplateColor(6),
    text: () => i18n.global.t('datasetTypeUnknown'),
  },
}

const userFeedbackTypes = [
  {
    id: 'bug',
    path: mdiBugOutline,
    color: () => getTemplateColor(0),
    text: () => i18n.global.t('userFeedbackTypesBug'),
  },
  {
    id: 'data_error',
    path: mdiAlertCircleOutline,
    color: () => getTemplateColor(1),
    text: () => i18n.global.t('userFeedbackTypesDataError'),
  },
  {
    id: 'feature_request',
    path: mdiHammerWrench,
    color: () => getTemplateColor(2),
    text: () => i18n.global.t('userFeedbackTypesFeatureRequest'),
  },
  {
    id: 'general',
    path: mdiMessageTextFastOutline,
    color: () => getTemplateColor(3),
    text: () => i18n.global.t('userFeedbackTypesGeneral'),
  },
  {
    id: 'question',
    path: mdiHelpCircleOutline,
    color: () => getTemplateColor(4),
    text: () => i18n.global.t('userFeedbackTypesQuestion'),
  },
]

const userFeedbackSeverityTypes = {
  low: {
    id: 'low',
    path: mdiSpeedometerSlow,
    color: 'text-success',
    text: () => i18n.global.t('userFeedbackSeverityLow'),
  },
  medium: {
    id: 'medium',
    path: mdiSpeedometerMedium,
    color: 'text-warning',
    text: () => i18n.global.t('userFeedbackSeverityMedium'),
  },
  high: {
    id: 'high',
    path: mdiSpeedometer,
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
  methodClasses,
  traitClasses,
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
