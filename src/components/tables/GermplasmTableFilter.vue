<template>
  <div>
    <b-button variant="primary"
              :class="collapseVisible ? null : 'collapsed'"
              :aria-expanded="collapseVisible ? 'true' : 'false'"
              aria-controls="germplasm-filter"
              @click="collapseVisible = !collapseVisible">
      <i class="mdi mdi-18px fix-alignment mdi-filter" /> {{ $t('widgetGermplasmTableFilterToggle') }}
    </b-button>
    <b-collapse id="germplasm-filter" v-model="collapseVisible" class="mt-2" >
      <b-row>
        <b-col xs=12 sm=6 md=3 lg=2 v-if="genusOptions && genusOptions.length > 2">
          <h6>{{ $t('tableColumnGenus') }}</h6>
          <b-form-select :options="genusOptions" v-model="selectedGenus"></b-form-select>
        </b-col>
        <b-col xs=12 sm=6 md=3 lg=2 v-if="speciesOptions && speciesOptions.length > 2">
          <h6>{{ $t('tableColumnSpecies') }}</h6>
          <b-form-select :options="speciesOptions" v-model="selectedSpecies"></b-form-select>
        </b-col>
        <b-col xs=12 sm=6 md=3 lg=2 v-if="subtaxaOptions && subtaxaOptions.length > 2">
          <h6>{{ $t('tableColumnSubtaxa') }}</h6>
          <b-form-select :options="subtaxaOptions" v-model="selectedSubtaxa"></b-form-select>
        </b-col>
        <b-col xs=12 sm=6 md=3 lg=2 v-if="locationOptions && locationOptions.length > 2">
          <h6>{{ $t('tableColumnCountryName') }}</h6>
          <b-form-select :options="locationOptions" v-model="selectedLocation"></b-form-select>
        </b-col>
      </b-row>
    </b-collapse>
  </div>
</template>

<script>
import germplasmApi from '@/mixins/api/germplasm.js'

export default {
  data: function () {
    return {
      collapseVisible: false,
      selectedGenus: null,
      selectedSpecies: null,
      selectedSubtaxa: null,
      selectedLocation: null,
      locations: null,
      taxonomy: {
        genus: null,
        species: null,
        subtaxa: null
      }
    }
  },
  computed: {
    genusOptions: function () {
      if (this.taxonomy.genus) {
        return [{
          value: null,
          text: this.$t('tableColumnGenus')
        }].concat(this.taxonomy.genus.map(g => {
          return {
            value: g.taxonomy,
            text: `${g.taxonomy} (${g.count})`
          }
        }))
      } else {
        return null
      }
    },
    speciesOptions: function () {
      if (this.taxonomy.species) {
        return [{
          value: null,
          text: this.$t('tableColumnSpecies')
        }].concat(this.taxonomy.species.map(g => {
          return {
            value: g.taxonomy,
            text: `${g.taxonomy} (${g.count})`
          }
        }))
      } else {
        return null
      }
    },
    subtaxaOptions: function () {
      if (this.taxonomy.subtaxa) {
        return [{
          value: null,
          text: this.$t('tableColumnSubtaxa')
        }].concat(this.taxonomy.subtaxa.map(g => {
          return {
            value: g.taxonomy,
            text: `${g.taxonomy} (${g.count})`
          }
        }))
      } else {
        return null
      }
    },
    locationOptions: function () {
      if (this.locations) {
        return [{
          value: null,
          text: this.$t('tableColumnCountryName')
        }].concat(this.locations.map(g => {
          return {
            value: g.key,
            text: `${g.key} (${g.count})`
          }
        }))
      } else {
        return null
      }
    }
  },
  mixins: [ germplasmApi ],
  watch: {
    collapseVisible: function (newValue) {
      if (newValue) {
        if (!this.taxonomy.genus && !this.taxonomy.species && !this.taxonomy.subtaxa) {
          this.apiGetTaxonomyData(result => { this.taxonomy = result })
        }

        if (!this.locations) {
          this.apiGetLocationData(result => { this.locations = result })
        }
      }
    },
    selectedGenus: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', 'genus', String, newValue)
        this.$nextTick(() => { this.selectedGenus = null })
      }
    },
    selectedSpecies: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', 'species', String, newValue)
        this.$nextTick(() => { this.selectedSpecies = null })
      }
    },
    selectedSubtaxa: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', 'subtaxa', String, newValue)
        this.$nextTick(() => { this.selectedSubtaxa = null })
      }
    },
    selectedLocation: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', 'countryName', String, newValue)
        this.$nextTick(() => { this.selectedLocation = null })
      }
    }
  }
}
</script>

<style>

</style>
