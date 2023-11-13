import store from '@/store'
import { i18n } from '@/plugins/i18n.js'

import { mdiMessageTextFastOutline, mdiHelpCircleOutline, mdiAlertCircleOutline, mdiBugOutline, mdiSprout, mdiDna, mdiGrid, mdiLeaf, mdiMapMarker, mdiPulse, mdiWeatherSnowyRainy, mdiShovel, mdiFamilyTree, mdiHelpBox, mdiBasketFill, mdiDatabase, mdiNumeric, mdiAlphabetical, mdiCalendar, mdiTagText, mdiReorderVertical, mdiTagTextOutline, mdiFolderTable, mdiChartSankey, mdiImageMultiple, mdiGroup, mdiFileDownload, mdiShapeRectanglePlus, mdiMarker, mdiLockOpenVariantOutline, mdiLock, mdiEyeOff, mdiPassport, mdiEyedropper, mdiAllergy, mdiContentDuplicate, mdiGift, mdiWrenchClock, mdiImageMarker, mdiHammerWrench, mdiSpeedometerSlow, mdiSpeedometerMedium, mdiSpeedometer } from '@mdi/js'
import { Pages } from './pages'

const mdiGerminate = 'M 11.999836,0 C 5.384778,0 -3.9999998e-7,5.38515 0,12.00026 -3.9999998e-7,18.61531 5.384778,24.00011 11.999836,24.00011 18.614894,24.00011 24,18.61531 24,12.00026 24,5.38515 18.614894,0 11.999836,0 Z m 0,2.09227 c 5.484271,0 9.907984,4.42367 9.907984,9.90799 0,5.48425 -4.423713,9.90754 -9.907984,9.90754 -5.4842703,0 -9.9076558,-4.42329 -9.9076558,-9.90754 0,-5.48432 4.4233855,-9.90799 9.9076558,-9.90799 z M 9.5003025,5.50579 c -2.4997191,0 -2.4997043,0 -3.7494633,2.16472 L 4.500991,9.83539 c -1.2498943,2.16476 -1.2498943,2.16487 0,4.32945 l 1.2498482,2.16476 c 1.261759,2.16476 1.2617442,2.16476 3.7494633,2.16476 2.4996545,0 2.4997185,0 3.7495455,-2.16476 h -8.1e-5 c 1.249812,-2.16476 1.249787,-2.16469 0,-4.32934 v -1.1e-4 H 10.750152 8.2505363 l 1.2497662,2.16469 H 12 L 10.750152,16.3296 H 8.2505363 L 7.0006881,14.16484 5.7508392,12.00015 7.0006881,9.83539 8.2505363,7.67051 h 2.4996157 2.499696 L 12,5.50579 Z m 4.9993125,0 1.249849,2.16472 1.249848,2.16488 h -2.499697 l -1.249767,2.16476 h 2.499616 l 1.249848,2.16469 -1.249848,2.16476 -1.249849,2.16476 h 2.499697 l 1.249849,-2.16476 1.249766,-2.16476 c 1.249826,-2.16476 1.249826,-2.16469 0,-4.32945 L 18.249161,7.67051 16.999312,5.50579 Z'

const exportFormats = {
  flapjack: {
    name: 'Flapjack',
    logo: 'tools/flapjack.png',
    text: () => i18n.t('pageExportFormatsFlapjackText'),
    tags: ['genotype', 'phenotype'],
    link: 'https://ics.hutton.ac.uk/flapjack',
    linkType: 'download'
  },
  helium: {
    name: 'Helium',
    logo: 'tools/helium.svg',
    text: () => i18n.t('pageExportFormatsHeliumText'),
    tags: ['pedigree', 'phenotype'],
    link: 'https://helium.hutton.ac.uk/',
    linkType: 'link'
  },
  curlywhirly: {
    name: 'CurlyWhirly',
    logo: 'tools/curlywhirly.png',
    text: () => i18n.t('pageExportFormatsCurlyWhirlyText'),
    tags: ['pca'],
    link: 'https://ics.hutton.ac.uk/curlywhirly',
    linkType: 'download'
  },
  strudel: {
    name: 'Strudel',
    logo: 'tools/strudel.png',
    text: () => i18n.t('pageExportFormatsStrudelText'),
    tags: ['genotype'],
    link: 'https://ics.hutton.ac.uk/strudel',
    linkType: 'download'
  },
  excel: {
    name: 'Excel',
    logo: 'tools/excel.svg',
    text: () => i18n.t('pageExportFormatsExcelText'),
    tags: ['genotype', 'phenotype'],
    link: 'https://products.office.com/excel',
    linkType: 'download'
  },
  tassel: {
    name: 'Tassel',
    logo: 'tools/tassel.png',
    text: () => i18n.t('pageExportFormatsTasselText'),
    tags: ['genotype'],
    link: 'https://www.maizegenetics.net/tassel',
    linkType: 'download'
  }
}

const publicationTypes = {
  germplasm: {
    path: mdiSprout,
    color: store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('publicationTypeGerminatebase')
  },
  group: {
    path: mdiGroup,
    color: store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('publicationTypeGroup')
  },
  database: {
    path: mdiGerminate,
    color: store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('publicationTypeDatabase')
  },
  dataset: {
    path: mdiDatabase,
    color: store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[3 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('publicationTypeDataset')
  },
  experiment: {
    path: mdiFolderTable,
    color: store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[4 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('publicationTypeExperiment')
  }
}

const dataTypes = {
  numeric: {
    text: () => i18n.t('dataTypeNumeric'),
    path: mdiNumeric,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null
  },
  text: {
    text: () => i18n.t('dataTypeText'),
    path: mdiAlphabetical,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null
  },
  date: {
    text: () => i18n.t('dataTypeDate'),
    path: mdiCalendar,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null
  },
  categorical: {
    text: () => i18n.t('dataTypeCategorical'),
    path: mdiTagText,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[3 % store.getters.storeServerSettings.colorsTemplate.length] : null
  }
}

const entityTypes = {
  Accession: {
    shortName: 'accession',
    path: mdiSprout,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('entityTypeAccession')
  },
  'Plant/Plot': {
    shortName: 'plantplot',
    path: mdiGrid,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('entityTypePlantPlot')
  },
  Sample: {
    shortName: 'sample',
    path: mdiLeaf,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('entityTypeSample')
  }
}

const groupTypes = {
  germinatebase: {
    path: mdiSprout,
    apiName: 'germplasm',
    itemType: 'germplasm',
    idColumn: 'germplasmId',
    nameColumn: 'germplasmName',
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('groupTypeGerminatebase')
  },
  markers: {
    path: mdiDna,
    apiName: 'marker',
    itemType: 'markers',
    idColumn: 'markerId',
    nameColumn: 'markerName',
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('groupTypeMarker')
  },
  locations: {
    path: mdiMapMarker,
    apiName: 'location',
    itemType: 'locations',
    idColumn: 'locationId',
    nameColumn: 'locationName',
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('groupTypeLocation')
  }
}

const markedItemTypes = {
  germplasm: {
    path: mdiSprout,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('groupTypeGerminatebase')
  },
  markers: {
    path: mdiDna,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('groupTypeMarker')
  },
  locations: {
    path: mdiMapMarker,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('groupTypeLocation')
  }
}

const imageTypes = {
  germinatebase: {
    path: mdiSprout,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('imageTypeGerminatebase')
  },
  phenotypes: {
    path: mdiTagTextOutline,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('imageTypePhenotypes')
  }
}

const locationTypes = {
  trialsite: {
    path: mdiShovel,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('locationTypeTrialsite')
  },
  collectingsites: {
    path: mdiBasketFill,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('locationTypeCollectingsite')
  },
  datasets: {
    path: mdiDatabase,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('locationTypeDataset')
  }
}

const templateImportTypes = {
  mcpd: {
    path: mdiPassport,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('templateImportTypeMcpd'),
    accepts: '.xlsx'
  },
  climate: {
    path: mdiWeatherSnowyRainy,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('templateImportTypeClimate'),
    accepts: '.xlsx'
  },
  genotype: {
    path: mdiDna,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('templateImportTypeGenotype'),
    accepts: '.xlsx, .txt, .hapmap'
  },
  trial: {
    path: mdiShovel,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[3 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('templateImportTypeTrial'),
    accepts: '.xlsx'
  },
  shapefile: {
    path: mdiShapeRectanglePlus,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[3 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('templateImportTypeShapefile'),
    accepts: '.zip'
  },
  geotiff: {
    path: mdiImageMarker,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[7 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('templateImportTypeGeotiff'),
    accepts: '.zip'
  },
  pedigree: {
    path: mdiFamilyTree,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[4 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('templateImportTypePedigree'),
    accepts: '.xlsx'
  },
  images: {
    path: mdiImageMultiple,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[5 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('templateImportTypeImages'),
    accepts: '.zip'
  },
  groups: {
    path: mdiGroup,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[6 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('templateImportTypeGroups'),
    accepts: '.xlsx'
  }
}

const commentTypes = {
  germinatebase: {
    path: mdiSprout,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => 'Germplasm'
  },
  locations: {
    path: mdiMarker,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => 'Location'
  }
}

const datasetStates = {
  public: {
    id: 1,
    path: mdiLockOpenVariantOutline,
    text: () => i18n.t('datasetStatePublic')
  },
  private: {
    id: 2,
    path: mdiLock,
    text: () => i18n.t('datasetStatePrivate')
  },
  hidden: {
    id: 3,
    path: mdiEyeOff,
    text: () => i18n.t('datasetStateHidden')
  }
}

const dashboardSections = [
  {
    value: 'datastories',
    textI18n: () => i18n.t('dashboardSectionDataStories'),
    text: i18n.t('dashboardSectionDataStories')
  },
  {
    value: 'dataupdates',
    textI18n: () => i18n.t('dashboardSectionDataUpdates'),
    text: i18n.t('dashboardSectionDataUpdates')
  },
  {
    value: 'news',
    textI18n: () => i18n.t('dashboardSectionNews'),
    text: i18n.t('dashboardSectionNews')
  },
  {
    value: 'projects',
    textI18n: () => i18n.t('dashboardSectionProjects'),
    text: i18n.t('dashboardSectionProjects')
  },
  {
    value: 'publications',
    textI18n: () => i18n.t('dashboardSectionPublications'),
    text: i18n.t('dashboardSectionPublications')
  }
]

const statCategories = [
  {
    value: 'germplasm',
    textI18n: () => i18n.t('dashboardBannerGermplasm'),
    text: i18n.t('dashboardBannerGermplasm'),
    path: mdiSprout,
    link: Pages.germplasm
  },
  {
    value: 'markers',
    textI18n: () => i18n.t('dashboardBannerMarkers'),
    text: i18n.t('dashboardBannerMarkers'),
    path: mdiDna,
    link: Pages.markers
  },
  {
    value: 'maps',
    textI18n: () => i18n.t('dashboardBannerMaps'),
    text: i18n.t('dashboardBannerMaps'),
    path: mdiReorderVertical,
    link: Pages.maps
  },
  {
    value: 'traits',
    textI18n: () => i18n.t('dashboardBannerTraits'),
    text: i18n.t('dashboardBannerTraits'),
    path: mdiTagTextOutline,
    link: Pages.traits
  },
  {
    value: 'locations',
    textI18n: () => i18n.t('dashboardBannerLocations'),
    text: i18n.t('dashboardBannerLocations'),
    path: mdiMapMarker,
    link: Pages.locations
  },
  {
    value: 'datasets',
    textI18n: () => i18n.t('dashboardBannerDatasets'),
    text: i18n.t('dashboardBannerDatasets'),
    path: mdiDatabase,
    link: Pages.datasets
  },
  {
    value: 'experiments',
    textI18n: () => i18n.t('dashboardBannerExperiments'),
    text: i18n.t('dashboardBannerExperiments'),
    path: mdiFolderTable,
    link: Pages.experiments
  },
  {
    value: 'datasetsAllelefreq',
    textI18n: () => i18n.t('dashboardBannerDatasetsAllelefreq'),
    text: i18n.t('dashboardBannerDatasetsAllelefreq'),
    path: mdiPulse,
    link: Pages.export,
    params: { datasetType: 'allelefreq' }
  },
  {
    value: 'datasetsGenotype',
    textI18n: () => i18n.t('dashboardBannerDatasetsGenotype'),
    text: i18n.t('dashboardBannerDatasetsGenotype'),
    path: mdiDna,
    link: Pages.export,
    params: { datasetType: 'genotype' }
  },
  {
    value: 'datasetsTrials',
    textI18n: () => i18n.t('dashboardBannerDatasetsTrials'),
    text: i18n.t('dashboardBannerDatasetsTrials'),
    path: mdiShovel,
    link: Pages.export,
    params: { datasetType: 'trials' }
  },
  {
    value: 'datasetsClimate',
    textI18n: () => i18n.t('dashboardBannerDatasetsClimate'),
    text: i18n.t('dashboardBannerDatasetsClimate'),
    path: mdiChartSankey,
    link: Pages.export,
    params: { datasetType: 'climate' }
  },
  {
    value: 'datasetsPedigree',
    textI18n: () => i18n.t('dashboardBannerDatasetsPedigree'),
    text: i18n.t('dashboardBannerDatasetsPedigree'),
    path: mdiFamilyTree,
    link: Pages.export,
    params: { datasetType: 'pedigree' }
  },
  {
    value: 'groups',
    textI18n: () => i18n.t('dashboardBannerGroups'),
    text: i18n.t('dashboardBannerGroups'),
    path: mdiGroup,
    link: Pages.groups
  },
  {
    value: 'climates',
    textI18n: () => i18n.t('dashboardBannerClimates'),
    text: i18n.t('dashboardBannerClimates'),
    path: mdiWeatherSnowyRainy,
    link: Pages.climates
  },
  {
    value: 'images',
    textI18n: () => i18n.t('dashboardBannerImages'),
    text: i18n.t('dashboardBannerImages'),
    path: mdiImageMultiple,
    link: Pages.images
  },
  {
    value: 'fileresources',
    textI18n: () => i18n.t('dashboardBannerFileResources'),
    text: i18n.t('dashboardBannerFileResources'),
    path: mdiFileDownload,
    link: Pages.dataResources
  }
]

const germplasmInstitutionTypes = {
  maintenance: {
    path: mdiWrenchClock,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('germplasmInstitutionTypesMaintenance')
  },
  breeding: {
    path: mdiEyedropper,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('germplasmInstitutionTypesBreeding')
  },
  collection: {
    path: mdiAllergy,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('germplasmInstitutionTypesCollection')
  },
  duplicate: {
    path: mdiContentDuplicate,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[3 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('germplasmInstitutionTypesDuplicate')
  },
  donor: {
    path: mdiGift,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[4 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('germplasmInstitutionTypesDonor')
  }
}

const datasetTypes = {
  allelefreq: {
    id: 4,
    path: mdiPulse,
    pageName: Pages.exportAlleleFrequency,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('datasetTypeAllelefreq')
  },
  climate: {
    id: 5,
    path: mdiWeatherSnowyRainy,
    pageName: Pages.exportClimate,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('datasetTypeClimate')
  },
  genotype: {
    id: 1,
    path: mdiDna,
    pageName: Pages.exportGenotypes,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('datasetTypeGenotype')
  },
  trials: {
    id: 3,
    path: mdiShovel,
    pageName: Pages.exportTraits,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[3 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('datasetTypeTrials')
  },
  pedigree: {
    id: 7,
    path: mdiFamilyTree,
    // pageName: Pages.export-pedigrees,
    pageName: null,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[4 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('datasetTypePedigree')
  },
  unknown: {
    id: -1,
    path: mdiHelpBox,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[6 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('datasetTypeUnknown')
  }
}

const userFeedbackTypes = [
  {
    id: 'bug',
    path: mdiBugOutline,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[0 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('userFeedbackTypesBug')
  },
  {
    id: 'data_error',
    path: mdiAlertCircleOutline,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('userFeedbackTypesDataError')
  },
  {
    id: 'feature_request',
    path: mdiHammerWrench,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[2 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('userFeedbackTypesFeatureRequest')
  },
  {
    id: 'general',
    path: mdiMessageTextFastOutline,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[3 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('userFeedbackTypesGeneral')
  },
  {
    id: 'question',
    path: mdiHelpCircleOutline,
    color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[4 % store.getters.storeServerSettings.colorsTemplate.length] : null,
    text: () => i18n.t('userFeedbackTypesQuestion')
  }
]

const userFeedbackSeverityTypes = {
  low: {
    id: 'low',
    path: mdiSpeedometerSlow,
    color: 'text-success',
    text: () => i18n.t('userFeedbackSeverityLow')
  },
  medium: {
    id: 'medium',
    path: mdiSpeedometerMedium,
    color: 'text-warning',
    text: () => i18n.t('userFeedbackSeverityMedium')
  },
  high: {
    id: 'high',
    path: mdiSpeedometer,
    color: 'text-danger',
    text: () => i18n.t('userFeedbackSeverityHigh')
  }
}

export {
  exportFormats,
  publicationTypes,
  dataTypes,
  entityTypes,
  groupTypes,
  markedItemTypes,
  imageTypes,
  locationTypes,
  templateImportTypes,
  commentTypes,
  datasetStates,
  statCategories,
  dashboardSections,
  germplasmInstitutionTypes,
  datasetTypes,
  userFeedbackTypes,
  userFeedbackSeverityTypes
}
