<template>
  <b-row v-if="datasets && datasets.length > 0">
    <!-- For each dataset -->
    <b-col cols=12 sm=4 xl=2 v-for="(dataset, index) in datasets" :key="'datasets-overview-' + index">
      <b-card no-body>
        <b-card-body>
          <!-- Truncated name with tooltip -->
          <b-card-title title-tag="h5" v-b-tooltip.hover="dataset.datasetName">{{ dataset.datasetId + ' - ' + dataset.datasetName | truncateAfterWords(10) }}</b-card-title>
          <!-- Truncated description with tooltip -->
          <b-card-sub-title class="dataset-card" v-if="dataset.datasetDescription" v-b-tooltip.hover="dataset.datasetDescription">{{ dataset.datasetDescription | truncateAfterWords(20) }}</b-card-sub-title>
          <div v-if="dataset.locations">
            <span v-for="country in getCountries(dataset.locations)" :key="`country-flag-${country}`" class="table-country text-nowrap" v-b-tooltip.hover :title="getCountryName(country)"><i :class="'flag-icon flag-icon-' + country.toLowerCase()" v-if="country"/></span>
          </div>
        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
var countries = require('i18n-iso-countries')
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
