<template>
  <b-card no-body v-if="dataset">
    <b-card-header>
      <!-- Truncated name with tooltip -->
      <h6 class="mb-0"  v-b-tooltip.hover.bottom="dataset.datasetName">{{ dataset.datasetId + ' - ' + dataset.datasetName | truncateAfterWords(10) }}</h6>
    </b-card-header>
    <b-card-body v-if="dataset.datasetDescription">
      <!-- Truncated description with tooltip -->
      <b-card-text class="dataset-card">
        <template v-if="datasetDescriptionLength > lengthLimit && collapsed">
          {{ dataset.datasetDescription | truncateAfterWords(lengthLimit) }}
        </template>
        <template v-else>
          {{ dataset.datasetDescription }}
        </template>
      </b-card-text>
      <b-button @click="collapsed = !collapsed" v-if="datasetDescriptionLength > lengthLimit">
        {{ collapsed ? $t('buttonReadMore') : $t('buttonReadLess') }}
      </b-button>
    </b-card-body>
    <b-card-footer v-if="dataset.locations">
      <div>
        <span v-for="country in countries" :key="`country-flag-${country}`" class="table-country text-nowrap mr-2" v-b-tooltip.hover :title="getCountryName(country)"><i :class="'flag-icon flag-icon-' + country.toLowerCase()" v-if="country"/></span>
      </div>
    </b-card-footer>
  </b-card>
</template>

<script>
const countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export default {
  props: {
    dataset: {
      type: Object,
      default: () => null
    },
    lengthLimit: {
      type: Number,
      default: 20
    }
  },
  data: function () {
    return {
      collapsed: true
    }
  },
  computed: {
    countries: function () {
      if (this.dataset && this.dataset.locations) {
        return [...new Set(this.dataset.locations.map(l => l.countryName))]
      } else {
        return []
      }
    },
    datasetDescriptionLength: function () {
      if (!this.dataset || !this.dataset.datasetDescription) {
        return 0
      }

      return this.dataset.datasetDescription.split(' ').length
    }
  },
  methods: {
    getCountryName: function (code2) {
      return countries.getName(code2, 'en')
    }
  }
}
</script>

<style>

</style>
