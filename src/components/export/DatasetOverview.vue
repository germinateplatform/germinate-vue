<template>
  <div class="mb-3">
    <b-button v-b-toggle.collapse-datasets>{{ $t('widgetSelectedDatasetsTitle') }}</b-button>
    <b-collapse id="collapse-datasets" class="mt-3">
      <b-row v-if="datasets && datasets.length > 0">
        <!-- For each dataset -->
        <b-col cols=12 sm=4 xl=2 v-for="(dataset, index) in datasets" :key="`datasets-overview-${index}`">
          <b-card no-body>
            <b-card-header>
              <!-- Truncated name with tooltip -->
              <h6 class="mb-0"  v-b-tooltip.hover="dataset.datasetName">{{ dataset.datasetId + ' - ' + dataset.datasetName | truncateAfterWords(10) }}</h6>
            </b-card-header>
            <b-card-body v-if="dataset.datasetDescription">
              <!-- Truncated description with tooltip -->
              <b-card-text class="dataset-card" v-b-tooltip.hover="dataset.datasetDescription">{{ dataset.datasetDescription | truncateAfterWords(20) }}</b-card-text>
            </b-card-body>
            <b-card-footer v-if="dataset.locations">
              <div>
                <span v-for="country in getCountries(dataset.locations)" :key="`country-flag-${country}`" class="table-country text-nowrap mr-2" v-b-tooltip.hover :title="getCountryName(country)"><i :class="'flag-icon flag-icon-' + country.toLowerCase()" v-if="country"/></span>
              </div>
            </b-card-footer>
          </b-card>
        </b-col>
      </b-row>
    </b-collapse>
  </div>
</template>

<script>
const countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export default {
  props: {
    datasets: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getCountries: function (locations) {
      if (locations) {
        return [...new Set(locations.map(l => l.countryName))]
      } else {
        return []
      }
    },
    getCountryName: function (code2) {
      return countries.getName(code2, 'en')
    }
  }
}
</script>

<style>
.dataset-card {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
