<template>
  <div>
    <BaseTable v-bind="$props"
              :columns="columns"
              :options="options"
              class="experiment-table"
              ref="experimentTable"
              v-on="$listeners">
      <template v-slot:cell(experimentId)="data">
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToDatasets(data.item)">{{ data.item.experimentId }}</router-link>
      </template>
      <template v-slot:cell(experimentName)="data">
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToDatasets(data.item)" :title="data.item.experimentName">{{ data.item.experimentName | truncateAfterWords(10) }}</router-link>
      </template>
      <template v-slot:cell(experimentDescription)="data">
        <span :title="data.item.experimentDescription">{{ data.item.experimentDescription | truncateAfterWords(20) }}</span>
      </template>

      <template v-slot:cell(dataTypes)="data">
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'trials')" v-if="data.item.trialsCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.trials.text()">
          <i :class="`mdi mdi-18px ${datasetTypes.trials.icon}`" :style="`color: ${datasetTypes.trials.color()};`" />
          <span> {{ data.item.trialsCount }}</span>
        </router-link>
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'genotype')" v-if="data.item.genotypeCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.genotype.text()">
          <i :class="`mdi mdi-18px ${datasetTypes.genotype.icon}`" :style="`color: ${datasetTypes.genotype.color()};`" />
          <span> {{ data.item.genotypeCount }}</span>
        </router-link>
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'compound')" v-if="data.item.compoundCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.compound.text()">
          <i :class="`mdi mdi-18px ${datasetTypes.compound.icon}`" :style="`color: ${datasetTypes.compound.color()};`" />
          <span> {{ data.item.compoundCount }}</span>
        </router-link>
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'allelefreq')" v-if="data.item.alleleFreqCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.allelefreq.text()">
          <i :class="`mdi mdi-18px ${datasetTypes.allelefreq.icon}`" :style="`color: ${datasetTypes.allelefreq.color()};`" />
          <span> {{ data.item.alleleFreqCount }}</span>
        </router-link>
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'climate')" v-if="data.item.climateCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.climate.text()">
          <i :class="`mdi mdi-18px ${datasetTypes.climate.icon}`" :style="`color: ${datasetTypes.climate.color()};`" />
          <span> {{ data.item.climateCount }}</span>
        </router-link>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  name: 'ExperimentTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      options: {
        idColumn: 'experimentId',
        tableName: 'experiments'
      }
    }
  },
  computed: {
    columns: function () {
      var result = [
        {
          key: 'experimentId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'experimentId')}`,
          label: this.$t('tableColumnExperimentId')
        }, {
          key: 'experimentName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'experimentName')}`,
          label: this.$t('tableColumnExperimentName')
        }, {
          key: 'experimentDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'experimentDescription')}`,
          label: this.$t('tableColumnExperimentDescription')
        }, {
          key: 'experimentDate',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'experimentDate')}`,
          label: this.$t('tableColumnExperimentDate'),
          formatter: this.$options.filters.toDate
        }, {
          key: 'dataTypes',
          type: undefined,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'dataTypes')}`,
          label: this.$t('tableColumnExperimentDataTypes')
        }
      ]

      return result
    }
  },
  components: {
    BaseTable
  },
  mixins: [ datasetApi ],
  methods: {
    redirectToExport: function (experiment, datasetType) {
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'experimentId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [experiment.experimentId]
      }])
      this.$router.push({ name: 'export', params: { datasetType: datasetType } })
    },
    redirectToDatasets: function (experiment) {
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'experimentId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [experiment.experimentId]
      }])
      this.$router.push({ name: 'datasets' })
    },
    refresh: function () {
      this.$refs.experimentTable.refresh()
    }
  }
}
</script>

<style>
.table-icon-link:hover,
.table-icon-link a:hover {
  text-decoration: none;
}
</style>
