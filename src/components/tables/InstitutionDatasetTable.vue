<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               primary-key="institutionId"
               v-bind="$props"
               ref="institutionDatasetTable"
               v-on="$listeners">
      <template v-slot:cell(institutionName)="data">
        <div v-if="data.item.institutionName">
          <a v-if="showLinks" href="#" @click.prevent="redirectToGermplasmPage(data.item)">{{ data.item.institutionName }}</a>
          <span v-else>{{ data.item.institutionName }}</span>
        </div>
      </template>
      <template v-slot:cell(institutionCode)="data">
        <div v-if="data.item.institutionCode">
          <a :href="`https://www.fao.org/wiews/data/organizations/en/?instcode=${data.item.institutionCode}`">{{ data.item.institutionCode }}</a>
        </div>
      </template>
      <template v-slot:cell(institutionAddress)="data">
        <div v-if="data.item.institutionAddress">
          <a :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.item.institutionAddress)}`">{{ data.item.institutionAddress }}</a>
        </div>
      </template>
      <template v-slot:cell(institutionType)="data">
        <b-badge v-if="data.item.institutionType" class="w-100" :style="`color: ${getHighContrastTextColor(germplasmInstitutionTypes[data.item.institutionType].color())}; background-color: ${germplasmInstitutionTypes[data.item.institutionType].color()};`"><MdiIcon :path="germplasmInstitutionTypes[data.item.institutionType].path" /> {{ germplasmInstitutionTypes[data.item.institutionType].text() }}</b-badge>
      </template>
      <!-- Country flag -->
      <template v-slot:cell(countryCode2)="data">
        <span class="table-country text-nowrap" v-b-tooltip.hover :title="data.item.countryName" v-if="data.item.countryCode2">
          <i :class="'fi fi-' + data.item.countryCode2.toLowerCase()"/> <span> {{ data.item.countryCode2 }}</span>
        </span>
        <span v-else>
          {{ data.item.countryName }}
        </span>
      </template>
      <template v-slot:cell(allDatasetIds)="data">
        <a href="#" class="text-decoration-none text-nowrap" @click="redirectToDatasets(data.item.allDatasetIds)" :style="`color: ${data.item.trialsDatasetIds ? getPrimaryColor() : 'grey'};`" v-b-tooltip.hover :title="$t('tableTooltipInstitutionDatasetsAll')"><MdiIcon :path="mdiDatabase" /> <span> {{ (data.item.allDatasetIds || []).length }}</span></a>
      </template>
      <template v-slot:cell(trialsDatasetIds)="data">
        <a href="#" class="text-decoration-none text-nowrap" @click="redirectToDatasets(data.item.trialsDatasetIds)" :style="`color: ${data.item.trialsDatasetIds ? datasetTypes.trials.color() : 'grey'};`" v-b-tooltip.hover :title="datasetTypes.trials.text()"><MdiIcon :path="datasetTypes.trials.path" /> <span> {{ (data.item.trialsDatasetIds || []).length }}</span></a>
      </template>
      <template v-slot:cell(genotypeDatasetIds)="data">
        <a href="#" class="text-decoration-none text-nowrap" @click="redirectToDatasets(data.item.genotypeDatasetIds)" :style="`color: ${data.item.genotypeDatasetIds ? datasetTypes.genotype.color() : 'grey'};`" v-b-tooltip.hover :title="datasetTypes.genotype.text()"><MdiIcon :path="datasetTypes.genotype.path" /> <span> {{ (data.item.genotypeDatasetIds || []).length }}</span></a>
      </template>
      <template v-slot:cell(pedigreeDatasetIds)="data">
        <a href="#" class="text-decoration-none text-nowrap" @click="redirectToDatasets(data.item.pedigreeDatasetIds)" :style="`color: ${data.item.pedigreeDatasetIds ? datasetTypes.pedigree.color() : 'grey'};`" v-b-tooltip.hover :title="datasetTypes.pedigree.text()"><MdiIcon :path="datasetTypes.pedigree.path" /> <span> {{ (data.item.pedigreeDatasetIds || []).length }}</span></a>
      </template>
      <template v-slot:cell(climateDatasetIds)="data">
        <a href="#" class="text-decoration-none text-nowrap" @click="redirectToDatasets(data.item.climateDatasetIds)" :style="`color: ${data.item.climateDatasetIds ? datasetTypes.climate.color() : 'grey'};`" v-b-tooltip.hover :title="datasetTypes.climate.text()"><MdiIcon :path="datasetTypes.climate.path" /> <span> {{ (data.item.climateDatasetIds || []).length }}</span></a>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { datasetTypes, germplasmInstitutionTypes } from '@/mixins/types'
import { getHighContrastTextColor, getPrimaryColor } from '@/mixins/colors'
import { mdiDatabase } from '@mdi/js'
import { Pages } from '@/mixins/pages'

export default {
  name: 'InstitutionDatasetTable',
  props: {
    ...defaultProps.BASE,
    showLinks: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      datasetTypes,
      mdiDatabase,
      germplasmInstitutionTypes,
      options: {
        idColumn: 'institutionId',
        tableName: 'institutiondatasets'
      }
    }
  },
  computed: {
    columns: function () {
      return [{
        key: 'institutionId',
        type: Number,
        class: 'text-right',
        sortable: true,
        label: this.$t('tableColumnInstitutionId')
      }, {
        key: 'institutionName',
        type: String,
        sortable: true,
        label: this.$t('tableColumnInstitutionName'),
        preferredSortingColumn: true
      }, {
        key: 'institutionAcronym',
        type: String,
        sortable: true,
        label: this.$t('tableColumnInstitutionAcronym')
      }, {
        key: 'institutionCode',
        type: String,
        sortable: true,
        label: this.$t('tableColumnInstitutionCode')
      }, {
        key: 'institutionType',
        type: String,
        sortable: true,
        label: this.$t('tableColumnInstitutionType')
      }, {
        key: 'institutionAddress',
        type: String,
        sortable: true,
        label: this.$t('tableColumnInstitutionAddress')
      }, {
        key: 'institutionEmail',
        type: String,
        sortable: true,
        label: this.$t('tableColumnInstitutionEmail')
      }, {
        key: 'institutionPhone',
        type: String,
        sortable: true,
        label: this.$t('tableColumnInstitutionPhone')
      }, {
        key: 'institutionContact',
        type: String,
        sortable: true,
        label: this.$t('tableColumnInstitutionContact')
      }, {
        key: 'countryCode2',
        type: String,
        sortable: true,
        label: this.$t('tableColumnInstitutionCountry')
      }, {
        key: 'allDatasetIds',
        type: undefined,
        sortable: false,
        class: 'px-1',
        label: ''
      }, {
        key: 'trialsDatasetIds',
        type: undefined,
        sortable: false,
        class: 'px-1',
        label: ''
      }, {
        key: 'genotypeDatasetIds',
        type: undefined,
        sortable: false,
        class: 'px-1',
        label: ''
      }, {
        key: 'pedigreeDatasetIds',
        type: undefined,
        sortable: false,
        class: 'px-1',
        label: ''
      }, {
        key: 'climateDatasetIds',
        type: undefined,
        sortable: false,
        class: 'px-1',
        label: ''
      }]
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  methods: {
    getPrimaryColor,
    getHighContrastTextColor,
    refresh: function () {
      this.$refs.institutionDatasetTable.refresh()
    },
    redirectToDatasets: function (datasetIds) {
      const filter = [{
        column: 'datasetId',
        comparator: 'inSet',
        operator: 'and',
        values: datasetIds
      }]

      this.$router.push({
        name: Pages.datasets,
        query: {
          'datasets-filter': JSON.stringify(filter)
        }
      })
    },
    redirectToGermplasmPage: function (institution) {
      const filter = []

      if (institution.institutionName) {
        filter.push({
          column: 'institutions',
          comparator: 'jsonSearch',
          operator: 'or',
          values: [institution.institutionName]
        })
      }
      if (institution.institutionCode) {
        filter.push({
          column: 'institutions',
          comparator: 'jsonSearch',
          operator: 'or',
          values: [institution.institutionCode]
        })
      }
      if (institution.institutionAddress) {
        filter.push({
          column: 'institutions',
          comparator: 'jsonSearch',
          operator: 'or',
          values: [institution.institutionAddress]
        })
      }

      if (filter.length > 0) {
        this.$router.push({
          name: 'germplasm',
          query: {
            'germplasm-filter': JSON.stringify(filter)
          }
        })
      }
    }
  }
}
</script>

<style>
</style>
