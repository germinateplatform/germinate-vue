<template>
  <div>
    <Collapse :icon="mdiFilter" :title="$t('widgetGermplasmTableFilterToggle')" :visible="false" :showLoading="false" class="mb-2" @toggle="collapseVisible = !collapseVisible">
      <template v-slot:content>
        <b-row>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3>
            <h6>{{ $t('tableColumnEntityType') }}</h6>
            <!-- These buttons are for switching between different entity types. They make switching very convenient. -->
            <b-button-group class="flex-wrap">
              <b-button class="mb-2" @click="onEntityTypeSelected(null)" variant="outline-primary">
                <MdiIcon :path="mdiCheckAll" /><span> {{$t('buttonAll')}}</span> <b-badge>{{ allGermplasmCount }}</b-badge>
              </b-button>
              <b-button class="mb-2" v-for="entityType in entityTypeOptions"
                      :key="entityType.id"
                      :disabled="entityType.disabled"
                      :variant="entityType.disabled ? 'outline-secondary' : 'outline-primary'"
                      @click="onEntityTypeSelected(entityType)">
                <MdiIcon :path="entityType.path" /><span> {{ entityType.text() }} <b-badge>{{ getNumberWithSuffix(entityType.count, 2) }}</b-badge></span>
              </b-button>
            </b-button-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="locationOptions && locationOptions.length > 2">
            <h6>{{ $t('widgetGermplasmTableFilterHasData') }}</h6>
            <b-button-group class="mr-2">
              <b-button class="mb-2 text-dark" variant="outline-secondary" @click="onHasImagesClicked" v-b-tooltip="$t('widgetGermplasmTableFilterHasImages')"><MdiIcon :path="mdiCamera" /></b-button>
            </b-button-group>
            <b-button-group class="flex-wrap">
              <b-button class="mb-2" variant="outline-secondary" @click="onHasTraitDataClicked" v-b-tooltip="datasetTypes.trials.text()" :style="`color: ${datasetTypes.trials.color()};`"><MdiIcon :path="datasetTypes.trials.path" /></b-button>
              <b-button class="mb-2" variant="outline-secondary" @click="onHasGenotypicDataClicked" v-b-tooltip="datasetTypes.genotype.text()" :style="`color: ${datasetTypes.genotype.color()};`"><MdiIcon :path="datasetTypes.genotype.path" /></b-button>
              <b-button class="mb-2" variant="outline-secondary" @click="onHasPedigreeDataClicked" v-b-tooltip="datasetTypes.pedigree.text()" :style="`color: ${datasetTypes.pedigree.color()};`"><MdiIcon :path="datasetTypes.pedigree.path" /></b-button>
              <b-button class="mb-2" variant="outline-secondary" @click="onHasCompoundDataClicked" v-b-tooltip="datasetTypes.compound.text()" :style="`color: ${datasetTypes.compound.color()};`"><MdiIcon :path="datasetTypes.compound.path" /></b-button>
              <b-button class="mb-2" variant="outline-secondary" @click="onHasAllelefreqDataClicked" v-b-tooltip="datasetTypes.allelefreq.text()" :style="`color: ${datasetTypes.allelefreq.color()};`"><MdiIcon :path="datasetTypes.allelefreq.path" /></b-button>
            </b-button-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="genusOptions && genusOptions.length > 2">
            <h6>{{ $t('tableColumnGenus') }}</h6>
            <b-form-select :options="genusOptions" v-model="selectedGenus" />
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="speciesOptions && speciesOptions.length > 2">
            <h6>{{ $t('tableColumnSpecies') }}</h6>
            <b-form-select :options="speciesOptions" v-model="selectedSpecies" />
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="subtaxaOptions && subtaxaOptions.length > 2">
            <h6>{{ $t('tableColumnSubtaxa') }}</h6>
            <b-form-select :options="subtaxaOptions" v-model="selectedSubtaxa" />
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="locationOptions && locationOptions.length > 2">
            <h6>{{ $t('tableColumnCountryName') }}</h6>
            <b-form-select :options="locationOptions" v-model="selectedLocation" />
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="biologicalStatusOptions && biologicalStatusOptions.length > 2">
            <h6>{{ $t('tableColumnBiologicalStatus') }}</h6>
            <b-form-select :options="biologicalStatusOptions" v-model="selectedBiologicalStatus" />
          </b-col>
        </b-row>
      </template>
    </Collapse>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import Collapse from '@/components/util/Collapse'

import germplasmApi from '@/mixins/api/germplasm.js'
import typesMixin from '@/mixins/types.js'
import formattingMixin from '@/mixins/formatting'

import { mdiFilter, mdiCamera, mdiCheckAll } from '@mdi/js'

export default {
  components: {
    Collapse,
    MdiIcon
  },
  data: function () {
    return {
      mdiFilter,
      mdiCamera,
      mdiCheckAll,
      collapseVisible: false,
      selectedGenus: null,
      selectedSpecies: null,
      selectedSubtaxa: null,
      selectedLocation: null,
      selectedBiologicalStatus: null,
      biologicalStatus: null,
      locations: null,
      entities: {
        total: 0,
        accession: 0,
        plantplot: 0,
        sample: 0
      },
      taxonomy: {
        genus: null,
        species: null,
        subtaxa: null
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeEntityTypeStats'
    ]),
    allGermplasmCount: function () {
      return this.getNumberWithSuffix(this.entityTypeOptions.map(o => o.count).reduce((a, b) => a + b), 2)
    },
    genusOptions: function () {
      if (this.taxonomy.genus) {
        return [{
          value: null,
          text: `${this.$t('tableColumnGenus')} (${this.taxonomy.genus.length})`
        }].concat(this.taxonomy.genus.map(g => {
          return {
            value: g.taxonomy,
            text: `${g.taxonomy} (${this.getNumberWithSuffix(g.count, 2)})`
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
          text: `${this.$t('tableColumnSpecies')} (${this.taxonomy.species.length})`
        }].concat(this.taxonomy.species.map(g => {
          return {
            value: g.taxonomy,
            text: `${g.taxonomy} (${this.getNumberWithSuffix(g.count, 2)})`
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
          text: `${this.$t('tableColumnSubtaxa')} (${this.taxonomy.subtaxa.length})`
        }].concat(this.taxonomy.subtaxa.map(g => {
          return {
            value: g.taxonomy,
            text: `${g.taxonomy} (${this.getNumberWithSuffix(g.count, 2)})`
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
        }].concat(this.locations.filter(g => g.count > 0).map(g => {
          return {
            value: g.key,
            text: `${g.key} (${this.getNumberWithSuffix(g.count, 2)})`
          }
        }))
      } else {
        return null
      }
    },
    biologicalStatusOptions: function () {
      if (this.biologicalStatus) {
        return [{
          value: null,
          text: this.$t('tableColumnBiologicalStatus')
        }].concat(this.biologicalStatus.filter(g => g.count > 0).map(g => {
          return {
            value: g.key,
            text: `${g.key} (${this.getNumberWithSuffix(g.count, 2)})`
          }
        }))
      } else {
        return null
      }
    },
    entityTypeOptions: function () {
      return Object.keys(this.entityTypes).map(e => {
        const stats = this.storeEntityTypeStats.filter(es => es.entityTypeName === e)
        const enabled = stats && stats.length > 0 && stats[0].count > 0
        const count = stats && stats.length > 0 ? stats[0].count : 0

        return {
          id: e,
          icon: this.entityTypes[e].icon,
          path: this.entityTypes[e].path,
          disabled: !enabled,
          count: count,
          text: () => this.entityTypes[e].text()
        }
      })
    }
  },
  mixins: [formattingMixin, germplasmApi, typesMixin],
  watch: {
    collapseVisible: function (newValue) {
      if (newValue) {
        if (!this.taxonomy.genus && !this.taxonomy.species && !this.taxonomy.subtaxa) {
          this.apiGetTaxonomyData(result => { this.taxonomy = result })
        }
        if (!this.locations) {
          this.apiGetLocationData(result => { this.locations = result })
        }
        if (!this.biologicalStatus) {
          this.apiGetBiologicalStatusData(result => { this.biologicalStatus = result })
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
    },
    selectedBiologicalStatus: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', 'biologicalStatusName', String, newValue)
        this.$nextTick(() => { this.selectedBiologicalStatus = null })
      }
    }
  },
  methods: {
    onHasImagesClicked: function () {
      this.$emit('filtering-changed', 'imageCount', Number, 0, 'greaterThan')
    },
    onHasTraitDataClicked: function () {
      this.$emit('filtering-changed', 'hasTrialsData', Boolean, 1)
    },
    onHasPedigreeDataClicked: function () {
      this.$emit('filtering-changed', 'hasPedigreeData', Boolean, 1)
    },
    onHasGenotypicDataClicked: function () {
      this.$emit('filtering-changed', 'hasGenotypicData', Boolean, 1)
    },
    onHasCompoundDataClicked: function () {
      this.$emit('filtering-changed', 'hasCompoundData', Boolean, 1)
    },
    onHasAllelefreqDataClicked: function () {
      this.$emit('filtering-changed', 'hasAllelefreqData', Boolean, 1)
    },
    onEntityTypeSelected: function (type) {
      this.$emit('filtering-changed', 'entityTypeName', 'entityType', type ? type.id : null)
    }
  }
}
</script>

<style>

</style>
