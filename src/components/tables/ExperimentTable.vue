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
        <router-link :to="{ name: Pages.datasets }" event="" @click.native.prevent="redirectToDatasets(data.item)">{{ data.item.experimentId }}</router-link>
      </template>
      <!-- Experiment name link -->
      <template v-slot:cell(experimentName)="data">
        <router-link :to="{ name: Pages.datasets }" event="" @click.native.prevent="redirectToDatasets(data.item)" :title="data.item.experimentName">{{ truncateAfterWords(data.item.experimentName, 10) }}</router-link>
      </template>
      <!-- Experiment description link -->
      <template v-slot:cell(experimentDescription)="data">
        <span :title="data.item.experimentDescription" v-if="data.item.experimentDescription">{{ truncateAfterWords(data.item.experimentDescription, 10) }}</span>
        <a href="#" class="table-icon-link" @click.prevent="showFullExperimentDescription(data.item.experimentDescription)" v-b-tooltip="$t('buttonReadMore')" v-if="isTruncatedAfter(data.item.experimentDescription, 10)" >&nbsp;
          <MdiIcon :path="mdiPageNext" />
        </a>
      </template>
      <!-- Experiment dataset types -->
      <template v-slot:cell(dataTypes)="data">
        <!-- Trials datasets -->
        <b-badge :to="{ name: Pages.datasets }" event="" :style="`color: ${getHighContrastTextColor(datasetTypes.trials.color())}; background-color: ${datasetTypes.trials.color()};`" @click.native.prevent="redirectToExport(data.item, 'trials')" v-if="data.item.trialsCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.trials.text()">
          <MdiIcon :path="datasetTypes.trials.path" /> {{ data.item.trialsCount }}
        </b-badge>
        <!-- Genotype datasets -->
        <b-badge :to="{ name: Pages.datasets }" event="" :style="`color: ${getHighContrastTextColor(datasetTypes.genotype.color())}; background-color: ${datasetTypes.genotype.color()};`" @click.native.prevent="redirectToExport(data.item, 'genotype')" v-if="data.item.genotypeCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.genotype.text()">
          <MdiIcon :path="datasetTypes.genotype.path" /> {{ data.item.genotypeCount }}
        </b-badge>
        <!-- Compound datasets -->
        <b-badge :to="{ name: Pages.datasets }" event="" :style="`color: ${getHighContrastTextColor(datasetTypes.compound.color())}; background-color: ${datasetTypes.compound.color()};`" @click.native.prevent="redirectToExport(data.item, 'compound')" v-if="data.item.compoundCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.compound.text()">
          <MdiIcon :path="datasetTypes.compound.path" /> {{ data.item.compoundCount }}
        </b-badge>
        <!-- Allelefreq datasets -->
        <b-badge :to="{ name: Pages.datasets }" event="" :style="`color: ${getHighContrastTextColor(datasetTypes.allelefreq.color())}; background-color: ${datasetTypes.allelefreq.color()};`" @click.native.prevent="redirectToExport(data.item, 'allelefreq')" v-if="data.item.alleleFreqCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.allelefreq.text()">
          <MdiIcon :path="datasetTypes.allelefreq.path" /> {{ data.item.alleleFreqCount }}
        </b-badge>
        <!-- Climate datasets -->
        <b-badge :to="{ name: Pages.datasets }" event="" :style="`color: ${getHighContrastTextColor(datasetTypes.climate.color())}; background-color: ${datasetTypes.climate.color()};`" @click.native.prevent="redirectToExport(data.item, 'climate')" v-if="data.item.climateCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.climate.text()">
          <MdiIcon :path="datasetTypes.climate.path" /> {{ data.item.climateCount }}
        </b-badge>
        <!-- Climate datasets -->
        <!-- <b-badge :to="{ name: Pages.datasets }" event="" :style="`color: ${getHighContrastTextColor(datasetTypes.pedigree.color())}; background-color: ${datasetTypes.pedigree.color()};`" @click.native.prevent="redirectToExport(data.item, 'pedigree')" v-if="data.item.pedigreeCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.pedigree.text()"> -->
        <b-badge :style="`color: ${getHighContrastTextColor(datasetTypes.pedigree.color())}; background-color: ${datasetTypes.pedigree.color()};`" v-if="data.item.pedigreeCount" class="table-icon-link text-nowrap mr-1" v-b-tooltip.bottom.hover :title="datasetTypes.pedigree.text()">
          <MdiIcon :path="datasetTypes.pedigree.path" /> {{ data.item.pedigreeCount }}
        </b-badge>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { datasetTypes } from '@/mixins/types'
import { getHighContrastTextColor } from '@/mixins/colors'
import { isTruncatedAfter, truncateAfterWords } from '@/mixins/formatting'

import { mdiPageNext } from '@mdi/js'
import { Pages } from '@/mixins/pages'

export default {
  name: 'ExperimentTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      Pages,
      datasetTypes,
      mdiPageNext,
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
          class: 'text-right',
          label: this.$t('tableColumnExperimentId')
        }, {
          key: 'experimentName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnExperimentName'),
          preferedSortingColumn: true
        }, {
          key: 'experimentDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnExperimentDescription')
        }, {
          key: 'experimentDate',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnExperimentDate'),
          formatter: value => value ? new Date(value).toLocaleDateString() : null
        }, {
          key: 'dataTypes',
          type: undefined,
          sortable: false,
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
  methods: {
    isTruncatedAfter,
    truncateAfterWords,
    getHighContrastTextColor,
    showFullExperimentDescription: function (description) {
      this.$bvModal.msgBoxOk(description, {
        title: this.$t('tableColumnExperimentDescription'),
        okTitle: this.$t('genericOk')
      })
    },
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
        name: Pages.export,
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
        name: Pages.datasets,
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
