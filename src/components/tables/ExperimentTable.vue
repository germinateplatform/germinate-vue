<template>
  <div>
    <BaseTable v-bind="$props"
              :columns="columns"
              :options="options"
              primary-key="experimentId"
              class="experiment-table"
              ref="experimentTable"
              v-on="$listeners">
      <!-- Experiment id link -->
      <template v-slot:cell(experimentId)="data">
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToDatasets(data.item)">{{ data.item.experimentId }}</router-link>
      </template>
      <!-- Experiment name link -->
      <template v-slot:cell(experimentName)="data">
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToDatasets(data.item)" :title="data.item.experimentName">{{ truncateAfterWords(data.item.experimentName, 10) }}</router-link>
      </template>
      <!-- Experiment description link -->
      <template v-slot:cell(experimentDescription)="data">
        <span :title="data.item.experimentDescription">{{ truncateAfterWords(data.item.experimentDescription, 20) }}</span>
      </template>
      <!-- Experiment dataset types -->
      <template v-slot:cell(dataTypes)="data">
        <!-- Trials datasets -->
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'trials')" v-if="data.item.trialsCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.trials.text()">
          <span :style="`color: ${datasetTypes.trials.color()};`"><MdiIcon :path="datasetTypes.trials.path" /></span>
          <span> {{ data.item.trialsCount }}</span>
        </router-link>
        <!-- Genotype datasets -->
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'genotype')" v-if="data.item.genotypeCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.genotype.text()">
          <span :style="`color: ${datasetTypes.genotype.color()};`"><MdiIcon :path="datasetTypes.genotype.path" /></span>
          <span> {{ data.item.genotypeCount }}</span>
        </router-link>
        <!-- Compound datasets -->
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'compound')" v-if="data.item.compoundCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.compound.text()">
          <span :style="`color: ${datasetTypes.compound.color()};`"><MdiIcon :path="datasetTypes.compound.path" /></span>
          <span> {{ data.item.compoundCount }}</span>
        </router-link>
        <!-- Allelefreq datasets -->
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'allelefreq')" v-if="data.item.alleleFreqCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.allelefreq.text()">
          <span :style="`color: ${datasetTypes.allelefreq.color()};`"><MdiIcon :path="datasetTypes.allelefreq.path" /></span>
          <span> {{ data.item.alleleFreqCount }}</span>
        </router-link>
        <!-- Climate datasets -->
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'climate')" v-if="data.item.climateCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.climate.text()">
          <span :style="`color: ${datasetTypes.climate.color()};`"><MdiIcon :path="datasetTypes.climate.path" /></span>
          <span> {{ data.item.climateCount }}</span>
        </router-link>
        <!-- Climate datasets -->
        <router-link :to="{ name: 'datasets' }" event="" @click.native.prevent="redirectToExport(data.item, 'pedigree')" v-if="data.item.pedigreeCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.pedigree.text()">
          <span :style="`color: ${datasetTypes.pedigree.color()};`"><MdiIcon :path="datasetTypes.pedigree.path" /></span>
          <span> {{ data.item.pedigreeCount }}</span>
        </router-link>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import datasetApi from '@/mixins/api/dataset'
import typesMixin from '@/mixins/types'
import utilMixin from '@/mixins/util'
import formattingMixin from '@/mixins/formatting'

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
      const result = [
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
          label: this.$t('tableColumnExperimentName'),
          preferedSortingColumn: true
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
          formatter: value => value ? new Date(value).toLocaleDateString() : null
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
    BaseTable,
    MdiIcon
  },
  mixins: [datasetApi, typesMixin, utilMixin, formattingMixin],
  methods: {
    redirectToExport: function (experiment, datasetType) {
      // Set up the filter
      const filter = [{
        column: 'experimentId',
        comparator: 'equals',
        operator: 'and',
        values: [experiment.experimentId]
      }]
      // Then redirect to the export page
      this.$router.push({
        name: 'export',
        params: {
          datasetType: datasetType
        },
        query: {
          'datasets-filter': JSON.stringify(filter)
        }
      })
    },
    redirectToDatasets: function (experiment) {
      // Set up the filter
      const filter = [{
        column: 'experimentId',
        comparator: 'equals',
        operator: 'and',
        values: [experiment.experimentId]
      }]
      // Then redirect to the datasets page
      this.$router.push({
        name: 'datasets',
        query: {
          'datasets-filter': JSON.stringify(filter)
        }
      })
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
