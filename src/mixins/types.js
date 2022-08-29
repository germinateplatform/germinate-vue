import { mapGetters } from 'vuex'

import { mdiSprout, mdiDna, mdiGrid, mdiLeaf, mdiMapMarker, mdiPulse, mdiWeatherSnowyRainy, mdiFlask, mdiShovel, mdiFamilyTree, mdiHelpBox, mdiBasketFill, mdiDatabase, mdiNumeric, mdiAlphabetical, mdiCalendar, mdiTagText, mdiReorderVertical, mdiTagTextOutline, mdiFolderTable, mdiChartSankey, mdiImageMultiple, mdiGroup, mdiAtom, mdiFileDownload, mdiMarker, mdiLockOpenVariantOutline, mdiLock, mdiEyeOff, mdiPassport, mdiEyedropper, mdiAllergy, mdiContentDuplicate, mdiGift, mdiWrenchClock } from '@mdi/js'

const mdiGerminate = 'M 11.999836,0 C 5.384778,0 -3.9999998e-7,5.38515 0,12.00026 -3.9999998e-7,18.61531 5.384778,24.00011 11.999836,24.00011 18.614894,24.00011 24,18.61531 24,12.00026 24,5.38515 18.614894,0 11.999836,0 Z m 0,2.09227 c 5.484271,0 9.907984,4.42367 9.907984,9.90799 0,5.48425 -4.423713,9.90754 -9.907984,9.90754 -5.4842703,0 -9.9076558,-4.42329 -9.9076558,-9.90754 0,-5.48432 4.4233855,-9.90799 9.9076558,-9.90799 z M 9.5003025,5.50579 c -2.4997191,0 -2.4997043,0 -3.7494633,2.16472 L 4.500991,9.83539 c -1.2498943,2.16476 -1.2498943,2.16487 0,4.32945 l 1.2498482,2.16476 c 1.261759,2.16476 1.2617442,2.16476 3.7494633,2.16476 2.4996545,0 2.4997185,0 3.7495455,-2.16476 h -8.1e-5 c 1.249812,-2.16476 1.249787,-2.16469 0,-4.32934 v -1.1e-4 H 10.750152 8.2505363 l 1.2497662,2.16469 H 12 L 10.750152,16.3296 H 8.2505363 L 7.0006881,14.16484 5.7508392,12.00015 7.0006881,9.83539 8.2505363,7.67051 h 2.4996157 2.499696 L 12,5.50579 Z m 4.9993125,0 1.249849,2.16472 1.249848,2.16488 h -2.499697 l -1.249767,2.16476 h 2.499616 l 1.249848,2.16469 -1.249848,2.16476 -1.249849,2.16476 h 2.499697 l 1.249849,-2.16476 1.249766,-2.16476 c 1.249826,-2.16476 1.249826,-2.16469 0,-4.32945 L 18.249161,7.67051 16.999312,5.50579 Z'

export default {
  computed: {
    ...mapGetters([
      'storeServerSettings'
    ]),
    exportFormats: function () {
      return {
        flapjack: {
          name: 'Flapjack',
          logo: 'tools/flapjack.png',
          text: this.$t('pageExportFormatsFlapjackText'),
          tags: ['genotype', 'phenotype'],
          link: 'https://ics.hutton.ac.uk/flapjack'
        },
        helium: {
          name: 'Helium',
          logo: 'tools/helium.png',
          text: this.$t('pageExportFormatsHeliumText'),
          tags: ['pedigree', 'phenotype'],
          link: 'https://ics.hutton.ac.uk/helium'
        },
        curlywhirly: {
          name: 'CurlyWhirly',
          logo: 'tools/curlywhirly.png',
          text: this.$t('pageExportFormatsCurlyWhirlyText'),
          tags: ['pca'],
          link: 'https://ics.hutton.ac.uk/curlywhirly'
        },
        strudel: {
          name: 'Strudel',
          logo: 'tools/strudel.png',
          text: this.$t('pageExportFormatsStrudelText'),
          tags: ['genotype'],
          link: 'https://ics.hutton.ac.uk/strudel'
        },
        excel: {
          name: 'Excel',
          logo: 'tools/excel.svg',
          text: this.$t('pageExportFormatsExcelText'),
          tags: ['genotype', 'phenotype'],
          link: 'https://products.office.com/excel'
        },
        tassel: {
          name: 'Tassel',
          logo: 'tools/tassel.png',
          text: this.$t('pageExportFormatsTasselText'),
          tags: ['genotype'],
          link: 'https://www.maizegenetics.net/tassel'
        }
      }
    },
    publicationTypes: function () {
      return {
        germplasm: {
          path: mdiSprout,
          color: this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeGerminatebase')
        },
        group: {
          path: mdiGroup,
          color: this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeGroup')
        },
        database: {
          path: mdiGerminate,
          color: this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeDatabase')
        },
        dataset: {
          path: mdiDatabase,
          color: this.storeServerSettings ? this.storeServerSettings.colorsTemplate[3 % this.storeServerSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeDataset')
        },
        experiment: {
          path: mdiFolderTable,
          color: this.storeServerSettings ? this.storeServerSettings.colorsTemplate[4 % this.storeServerSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeExperiment')
        }
      }
    }
  },
  data: function () {
    return {
      dataTypes: {
        numeric: {
          text: () => this.$t('dataTypeNumeric'),
          path: mdiNumeric,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null
        },
        text: {
          text: () => this.$t('dataTypeText'),
          path: mdiAlphabetical,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null
        },
        date: {
          text: () => this.$t('dataTypeDate'),
          path: mdiCalendar,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null
        },
        categorical: {
          text: () => this.$t('dataTypeCategorical'),
          path: mdiTagText,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[3 % this.storeServerSettings.colorsTemplate.length] : null
        }
      },
      entityTypes: {
        Accession: {
          shortName: 'accession',
          path: mdiSprout,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('entityTypeAccession')
        },
        'Plant/Plot': {
          shortName: 'plantplot',
          path: mdiGrid,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('entityTypePlantPlot')
        },
        Sample: {
          shortName: 'sample',
          path: mdiLeaf,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('entityTypeSample')
        }
      },
      groupTypes: {
        germinatebase: {
          path: mdiSprout,
          apiName: 'germplasm',
          itemType: 'germplasm',
          idColumn: 'germplasmId',
          nameColumn: 'germplasmName',
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          path: mdiDna,
          apiName: 'marker',
          itemType: 'markers',
          idColumn: 'markerId',
          nameColumn: 'markerName',
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          path: mdiMapMarker,
          apiName: 'location',
          itemType: 'locations',
          idColumn: 'locationId',
          nameColumn: 'locationName',
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('groupTypeLocation')
        }
      },
      markedItemTypes: {
        germplasm: {
          path: mdiSprout,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          path: mdiDna,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          path: mdiMapMarker,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('groupTypeLocation')
        }
      },
      imageTypes: {
        germinatebase: {
          path: mdiSprout,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('imageTypeGerminatebase')
        },
        compounds: {
          path: mdiAtom,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('imageTypeCompounds')
        },
        phenotypes: {
          path: mdiTagTextOutline,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('imageTypePhenotypes')
        }
      },
      locationTypes: {
        trialsite: {
          path: mdiShovel,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('locationTypeTrialsite')
        },
        collectingsites: {
          path: mdiBasketFill,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('locationTypeCollectingsite')
        },
        datasets: {
          path: mdiDatabase,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('locationTypeDataset')
        }
      },
      templateImportTypes: {
        mcpd: {
          path: mdiPassport,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('templateImportTypeMcpd'),
          accepts: '.xlsx'
        },
        genotype: {
          path: mdiDna,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('templateImportTypeGenotype'),
          accepts: '.xlsx, .txt, .hapmap'
        },
        trial: {
          path: mdiShovel,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('templateImportTypeTrial'),
          accepts: '.xlsx'
        },
        climate: {
          path: mdiWeatherSnowyRainy,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[3 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('templateImportTypeClimate'),
          accepts: '.xlsx'
        },
        compound: {
          path: mdiFlask,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[4 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('templateImportTypeCompound'),
          accepts: '.xlsx'
        },
        pedigree: {
          path: mdiFamilyTree,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[5 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('templateImportTypePedigree'),
          accepts: '.xlsx'
        },
        groups: {
          path: mdiGroup,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[6 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('templateImportTypeGroups'),
          accepts: '.xlsx'
        },
        images: {
          path: mdiImageMultiple,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[7 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('templateImportTypeImages'),
          accepts: '.zip'
        }
      },
      commentTypes: {
        germinatebase: {
          path: mdiSprout,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => 'Germplasm'
        },
        locations: {
          path: mdiMarker,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => 'Location'
        }
      },
      datasetStates: {
        public: {
          id: 1,
          path: mdiLockOpenVariantOutline,
          text: () => this.$t('datasetStatePublic')
        },
        private: {
          id: 2,
          path: mdiLock,
          text: () => this.$t('datasetStatePrivate')
        },
        hidden: {
          id: 3,
          path: mdiEyeOff,
          text: () => this.$t('datasetStateHidden')
        }
      },
      statCategories: [
        {
          value: 'germplasm',
          textI18n: () => this.$t('dashboardBannerGermplasm'),
          text: this.$t('dashboardBannerGermplasm'),
          path: mdiSprout,
          link: 'germplasm'
        },
        {
          value: 'markers',
          textI18n: () => this.$t('dashboardBannerMarkers'),
          text: this.$t('dashboardBannerMarkers'),
          path: mdiDna,
          link: 'markers'
        },
        {
          value: 'maps',
          textI18n: () => this.$t('dashboardBannerMaps'),
          text: this.$t('dashboardBannerMaps'),
          path: mdiReorderVertical,
          link: 'maps'
        },
        {
          value: 'traits',
          textI18n: () => this.$t('dashboardBannerTraits'),
          text: this.$t('dashboardBannerTraits'),
          path: mdiTagTextOutline,
          link: 'traits'
        },
        {
          value: 'locations',
          textI18n: () => this.$t('dashboardBannerLocations'),
          text: this.$t('dashboardBannerLocations'),
          path: mdiMapMarker,
          link: 'locations'
        },
        {
          value: 'datasets',
          textI18n: () => this.$t('dashboardBannerDatasets'),
          text: this.$t('dashboardBannerDatasets'),
          path: mdiDatabase,
          link: 'datasets'
        },
        {
          value: 'experiments',
          textI18n: () => this.$t('dashboardBannerExperiments'),
          text: this.$t('dashboardBannerExperiments'),
          path: mdiFolderTable,
          link: 'experiments'
        },
        {
          value: 'datasetsAllelefreq',
          textI18n: () => this.$t('dashboardBannerDatasetsAllelefreq'),
          text: this.$t('dashboardBannerDatasetsAllelefreq'),
          path: mdiPulse,
          link: 'export',
          params: { datasetType: 'allelefreq' }
        },
        {
          value: 'datasetsGenotype',
          textI18n: () => this.$t('dashboardBannerDatasetsGenotype'),
          text: this.$t('dashboardBannerDatasetsGenotype'),
          path: mdiDna,
          link: 'export',
          params: { datasetType: 'genotype' }
        },
        {
          value: 'datasetsTrials',
          textI18n: () => this.$t('dashboardBannerDatasetsTrials'),
          text: this.$t('dashboardBannerDatasetsTrials'),
          path: mdiShovel,
          link: 'export',
          params: { datasetType: 'trials' }
        },
        {
          value: 'datasetsClimate',
          textI18n: () => this.$t('dashboardBannerDatasetsClimate'),
          text: this.$t('dashboardBannerDatasetsClimate'),
          path: mdiChartSankey,
          link: 'export',
          params: { datasetType: 'climate' }
        },
        {
          value: 'datasetsCompound',
          textI18n: () => this.$t('dashboardBannerDatasetsCompound'),
          text: this.$t('dashboardBannerDatasetsCompound'),
          path: mdiFlask,
          link: 'export',
          params: { datasetType: 'compound' }
        },
        {
          value: 'datasetsPedigree',
          textI18n: () => this.$t('dashboardBannerDatasetsPedigree'),
          text: this.$t('dashboardBannerDatasetsPedigree'),
          path: mdiFamilyTree,
          link: 'export',
          params: { datasetType: 'pedigree' }
        },
        {
          value: 'groups',
          textI18n: () => this.$t('dashboardBannerGroups'),
          text: this.$t('dashboardBannerGroups'),
          path: mdiGroup,
          link: 'groups'
        },
        {
          value: 'climates',
          textI18n: () => this.$t('dashboardBannerClimates'),
          text: this.$t('dashboardBannerClimates'),
          path: mdiWeatherSnowyRainy,
          link: 'climates'
        },
        {
          value: 'compounds',
          textI18n: () => this.$t('dashboardBannerCompounds'),
          text: this.$t('dashboardBannerCompounds'),
          path: mdiAtom,
          link: 'compounds'
        },
        {
          value: 'images',
          textI18n: () => this.$t('dashboardBannerImages'),
          text: this.$t('dashboardBannerImages'),
          path: mdiImageMultiple,
          link: 'images'
        },
        {
          value: 'fileresources',
          textI18n: () => this.$t('dashboardBannerFileResources'),
          text: this.$t('dashboardBannerFileResources'),
          path: mdiFileDownload,
          link: 'data-resources'
        }
      ],
      germplasmInstitutionTypes: {
        maintenance: {
          path: mdiWrenchClock,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('germplasmInstitutionTypesMaintenance')
        },
        breeding: {
          path: mdiEyedropper,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('germplasmInstitutionTypesBreeding')
        },
        collection: {
          path: mdiAllergy,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('germplasmInstitutionTypesCollection')
        },
        duplicate: {
          path: mdiContentDuplicate,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[3 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('germplasmInstitutionTypesDuplicate')
        },
        donor: {
          path: mdiGift,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[4 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('germplasmInstitutionTypesDonor')
        }
      },
      datasetTypes: {
        allelefreq: {
          id: 4,
          path: mdiPulse,
          pageName: 'export-allelefrequency',
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('datasetTypeAllelefreq')
        },
        climate: {
          id: 5,
          path: mdiWeatherSnowyRainy,
          pageName: 'export-climate',
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('datasetTypeClimate')
        },
        compound: {
          id: 6,
          path: mdiFlask,
          pageName: 'export-compounds',
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('datasetTypeCompound')
        },
        genotype: {
          id: 1,
          path: mdiDna,
          pageName: 'export-genotypes',
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[3 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('datasetTypeGenotype')
        },
        trials: {
          id: 3,
          path: mdiShovel,
          pageName: 'export-trials',
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[4 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('datasetTypeTrials')
        },
        pedigree: {
          id: 7,
          path: mdiFamilyTree,
          // pageName: 'export-pedigrees',
          pageName: null,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[5 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('datasetTypePedigree')
        },
        unknown: {
          id: -1,
          path: mdiHelpBox,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[6 % this.storeServerSettings.colorsTemplate.length] : null,
          text: () => this.$t('datasetTypeUnknown')
        }
      }
    }
  }
}
