export default {
  computed: {
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
          icon: 'mdi-sprout',
          color: this.serverSettings ? this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeGerminatebase')
        },
        group: {
          icon: 'mdi-group',
          color: this.serverSettings ? this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeGroup')
        },
        database: {
          icon: 'icon-germinate',
          color: this.serverSettings ? this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeDatabase')
        },
        dataset: {
          icon: 'mdi-database',
          color: this.serverSettings ? this.serverSettings.colorsTemplate[3 % this.serverSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeDataset')
        },
        experiment: {
          icon: 'mdi-folder-table',
          color: this.serverSettings ? this.serverSettings.colorsTemplate[4 % this.serverSettings.colorsTemplate.length] : null,
          text: this.$t('publicationTypeExperiment')
        }
      }
    }
  },
  data: function () {
    return {
      dataTypes: {
        'numeric': {
          text: () => this.$t('dataTypeNumeric'),
          icon: 'mdi-numeric',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length]
        },
        'text': {
          text: () => this.$t('dataTypeText'),
          icon: 'mdi-alphabetical',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length]
        },
        'date': {
          text: () => this.$t('dataTypeDate'),
          icon: 'mdi-calendar',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length]
        },
        'categorical': {
          text: () => this.$t('dataTypeCategorical'),
          icon: 'mdi-tag-text',
          color: () => this.serverSettings.colorsTemplate[3 % this.serverSettings.colorsTemplate.length]
        }
      },
      entityTypes: {
        'Accession': {
          shortName: 'accession',
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('entityTypeAccession')
        },
        'Plant/Plot': {
          shortName: 'plantplot',
          icon: 'mdi-grid',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('entityTypePlantPlot')
        },
        'Sample': {
          shortName: 'sample',
          icon: 'mdi-leaf',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('entityTypeSample')
        }
      },
      groupTypes: {
        germinatebase: {
          icon: 'mdi-sprout',
          apiName: 'germplasm',
          itemType: 'germplasm',
          idColumn: 'germplasmId',
          nameColumn: 'germplasmName',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          icon: 'mdi-dna',
          apiName: 'marker',
          itemType: 'markers',
          idColumn: 'markerId',
          nameColumn: 'markerName',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          icon: 'mdi-map-marker',
          apiName: 'location',
          itemType: 'locations',
          idColumn: 'locationId',
          nameColumn: 'locationName',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeLocation')
        }
      },
      markedItemTypes: {
        germplasm: {
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          icon: 'mdi-dna',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          icon: 'mdi-map-marker',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeLocation')
        }
      },
      imageTypes: {
        germinatebase: {
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('imageTypeGerminatebase')
        },
        compounds: {
          icon: 'mdi-flask',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('imageTypeCompounds')
        },
        phenotypes: {
          icon: 'mdi-tag-text-outline',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('imageTypePhenotypes')
        }
      },
      locationTypes: {
        trialsite: {
          icon: 'mdi-shovel',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('locationTypeTrialsite')
        },
        collectingsites: {
          icon: 'mdi-basket-fill',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('locationTypeCollectingsite')
        },
        datasets: {
          icon: 'mdi-database',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('locationTypeDataset')
        }
      },
      templateImportTypes: {
        mcpd: {
          icon: 'mdi-passport',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('templateImportTypeMcpd'),
          accepts: '.xlsx'
        },
        genotype: {
          icon: 'mdi-dna',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('templateImportTypeGenotype'),
          accepts: '.xlsx, .txt, .hapmap'
        },
        trial: {
          icon: 'mdi-shovel',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('templateImportTypeTrial'),
          accepts: '.xlsx'
        },
        climate: {
          icon: 'mdi-weather-snowy-rainy',
          color: () => this.serverSettings.colorsTemplate[3 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('templateImportTypeClimate'),
          accepts: '.xlsx'
        },
        compound: {
          icon: 'mdi-flask',
          color: () => this.serverSettings.colorsTemplate[4 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('templateImportTypeCompound'),
          accepts: '.xlsx'
        },
        pedigree: {
          icon: 'mdi-family-tree mdi-rotate-180',
          color: () => this.serverSettings.colorsTemplate[5 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('templateImportTypePedigree'),
          accepts: '.xlsx'
        },
        groups: {
          icon: 'mdi-group',
          color: () => this.serverSettings.colorsTemplate[6 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('templateImportTypeGroups'),
          accepts: '.xlsx'
        }
      },
      commentTypes: {
        germinatebase: {
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => 'Germplasm'
        },
        locations: {
          icon: 'mdi-marker',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => 'Location'
        }
      },
      datasetStates: {
        public: {
          id: 1,
          icon: 'mdi-lock-open-variant-outline',
          text: () => this.$t('datasetStatePublic')
        },
        private: {
          id: 2,
          icon: 'mdi-lock',
          text: () => this.$t('datasetStatePrivate')
        },
        hidden: {
          id: 3,
          icon: 'mdi-eye-off text-primary',
          text: () => this.$t('datasetStateHidden')
        }
      },
      statCategories: [
        {
          value: 'germplasm',
          textI18n: () => this.$t('dashboardBannerGermplasm'),
          text: this.$t('dashboardBannerGermplasm'),
          icon: 'mdi-sprout',
          link: 'germplasm'
        },
        {
          value: 'markers',
          textI18n: () => this.$t('dashboardBannerMarkers'),
          text: this.$t('dashboardBannerMarkers'),
          icon: 'mdi-dna',
          link: 'markers'
        },
        {
          value: 'maps',
          textI18n: () => this.$t('dashboardBannerMaps'),
          text: this.$t('dashboardBannerMaps'),
          icon: 'mdi-reorder-vertical',
          link: 'maps'
        },
        {
          value: 'traits',
          textI18n: () => this.$t('dashboardBannerTraits'),
          text: this.$t('dashboardBannerTraits'),
          icon: 'mdi-tag-text-outline',
          link: 'traits'
        },
        {
          value: 'locations',
          textI18n: () => this.$t('dashboardBannerLocations'),
          text: this.$t('dashboardBannerLocations'),
          icon: 'mdi-map-marker',
          link: 'locations'
        },
        {
          value: 'datasets',
          textI18n: () => this.$t('dashboardBannerDatasets'),
          text: this.$t('dashboardBannerDatasets'),
          icon: 'mdi-database',
          link: 'datasets'
        },
        {
          value: 'experiments',
          textI18n: () => this.$t('dashboardBannerExperiments'),
          text: this.$t('dashboardBannerExperiments'),
          icon: 'mdi-folder-table',
          link: 'experiments'
        },
        {
          value: 'datasetsAllelefreq',
          textI18n: () => this.$t('dashboardBannerDatasetsAllelefreq'),
          text: this.$t('dashboardBannerDatasetsAllelefreq'),
          icon: 'mdi-pulse',
          link: 'export',
          params: { datasetType: 'allelefreq' }
        },
        {
          value: 'datasetsGenotype',
          textI18n: () => this.$t('dashboardBannerDatasetsGenotype'),
          text: this.$t('dashboardBannerDatasetsGenotype'),
          icon: 'mdi-dna',
          link: 'export',
          params: { datasetType: 'genotype' }
        },
        {
          value: 'datasetsTrials',
          textI18n: () => this.$t('dashboardBannerDatasetsTrials'),
          text: this.$t('dashboardBannerDatasetsTrials'),
          icon: 'mdi-shovel',
          link: 'export',
          params: { datasetType: 'trials' }
        },
        {
          value: 'datasetsClimate',
          textI18n: () => this.$t('dashboardBannerDatasetsClimate'),
          text: this.$t('dashboardBannerDatasetsClimate'),
          icon: 'mdi-chart-sankey',
          link: 'export',
          params: { datasetType: 'climate' }
        },
        {
          value: 'datasetsCompound',
          textI18n: () => this.$t('dashboardBannerDatasetsCompound'),
          text: this.$t('dashboardBannerDatasetsCompound'),
          icon: 'mdi-flask',
          link: 'export',
          params: { datasetType: 'compound' }
        },
        {
          value: 'datasetsPedigree',
          textI18n: () => this.$t('dashboardBannerDatasetsPedigree'),
          text: this.$t('dashboardBannerDatasetsPedigree'),
          icon: 'mdi-family-tree mdi-rotate-180',
          link: 'export',
          params: { datasetType: 'pedigree' }
        },
        {
          value: 'groups',
          textI18n: () => this.$t('dashboardBannerGroups'),
          text: this.$t('dashboardBannerGroups'),
          icon: 'mdi-group',
          link: 'groups'
        },
        {
          value: 'climates',
          textI18n: () => this.$t('dashboardBannerClimates'),
          text: this.$t('dashboardBannerClimates'),
          icon: 'mdi-weather-snowy-rainy',
          link: 'climates'
        },
        {
          value: 'compounds',
          textI18n: () => this.$t('dashboardBannerCompounds'),
          text: this.$t('dashboardBannerCompounds'),
          icon: 'mdi-atom',
          link: 'compounds'
        },
        {
          value: 'images',
          textI18n: () => this.$t('dashboardBannerImages'),
          text: this.$t('dashboardBannerImages'),
          icon: 'mdi-image-multiple',
          link: 'images'
        },
        {
          value: 'fileresources',
          textI18n: () => this.$t('dashboardBannerFileResources'),
          text: this.$t('dashboardBannerFileResources'),
          icon: 'mdi-file-download',
          link: 'data-resources'
        }
      ],
      datasetTypes: {
        allelefreq: {
          id: 4,
          icon: 'mdi-pulse',
          pageName: 'export-allelefrequency',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeAllelefreq')
        },
        climate: {
          id: 5,
          icon: 'mdi-weather-snowy-rainy',
          pageName: 'export-climate',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeClimate')
        },
        compound: {
          id: 6,
          icon: 'mdi-flask',
          pageName: 'export-compounds',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeCompound')
        },
        genotype: {
          id: 1,
          icon: 'mdi-dna',
          pageName: 'export-genotypes',
          color: () => this.serverSettings.colorsTemplate[3 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeGenotype')
        },
        trials: {
          id: 3,
          icon: 'mdi-shovel',
          pageName: 'export-trials',
          color: () => this.serverSettings.colorsTemplate[4 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeTrials')
        },
        pedigree: {
          id: 7,
          icon: 'mdi-family-tree mdi-rotate-180',
          // pageName: 'export-pedigrees',
          pageName: null,
          color: () => this.serverSettings.colorsTemplate[5 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypePedigree')
        },
        unknown: {
          id: -1,
          icon: 'mdi-help-box',
          color: () => this.serverSettings.colorsTemplate[6 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeUnknown')
        }
      }
    }
  }
}
