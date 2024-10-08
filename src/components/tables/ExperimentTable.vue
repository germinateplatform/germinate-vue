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
        <a href="#" class="table-icon-link" @click.prevent="showFullExperimentDescription(data.item.experimentDescription)" v-b-tooltip="$t('buttonReadMore')" v-if="isTruncatedAfterWords(data.item.experimentDescription, 10)" >&nbsp;
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

      <!-- Edit dataset -->
      <template v-slot:cell(edit)="data">
        <a href="#" class="text-decoration-none" @click.prevent="onExperimentEditClicked(data.item)" v-if="storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_DATA_CURATOR)">
          <span v-b-tooltip.hover :title="$t('tableTooltipExperimentEdit')"><MdiIcon :path="mdiSquareEditOutline"/></span>
        </a>
      </template>

      <!-- Delete experiment -->
      <template v-slot:cell(delete)="data">
        <a href="#" class="text-decoration-none" @click.prevent="onExperimentDeleteClicked(data.item)" v-if="storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_DATA_CURATOR)">
          <span v-b-tooltip.hover :title="$t('tableTooltipExperimentDelete')"><MdiIcon className="text-danger" :path="mdiDelete"/></span>
        </a>
      </template>
    </BaseTable>

    <ExperimentCreationModal :experiment="selectedExperiment" ref="experimentCreationModal" @experiment-updated="refresh()" @experiment-added="refresh()" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import ExperimentCreationModal from '@/components/modals/ExperimentCreationModal'
import { datasetTypes } from '@/mixins/types'
import { getHighContrastTextColor } from '@/mixins/colors'
import { isTruncatedAfterWords, truncateAfterWords } from '@/mixins/formatting'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR } from '@/mixins/api/auth'

import { mdiPageNext, mdiSquareEditOutline, mdiDelete } from '@mdi/js'
import { Pages } from '@/mixins/pages'
import { apiDeleteExperiment } from '@/mixins/api/dataset'

export default {
  components: {
    ExperimentCreationModal,
    BaseTable,
    MdiIcon
  },
  name: 'ExperimentTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      Pages,
      datasetTypes,
      mdiPageNext,
      mdiSquareEditOutline,
      mdiDelete,
      options: {
        idColumn: 'experimentId',
        tableName: 'experiments'
      },
      selectedExperiment: null,
      USER_TYPE_DATA_CURATOR
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeSelectedProjects'
    ]),
    columns: function () {
      const result = [
        {
          key: 'projectId',
          type: Number,
          sortable: false,
          class: 'd-none text-right',
          label: this.$t('tableColumnProjectId')
        }, {
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
          preferredSortingColumn: true
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

      if (this.storeToken && userIsAtLeast(this.storeToken.userType, USER_TYPE_DATA_CURATOR)) {
        result.push({
          key: 'edit',
          type: undefined,
          sortable: false,
          class: 'px-1',
          label: ''
        })

        result.push({
          key: 'delete',
          type: undefined,
          sortable: false,
          class: 'px-1',
          label: ''
        })
      }

      return result
    }
  },
  watch: {
    storeSelectedProjects: function () {
      this.$refs.experimentTable.refresh()
    }
  },
  methods: {
    isTruncatedAfterWords,
    truncateAfterWords,
    getHighContrastTextColor,
    userIsAtLeast,
    onExperimentEditClicked: function (experiment) {
      this.selectedExperiment = experiment

      this.$nextTick(() => this.$refs.experimentCreationModal.show())
    },
    onExperimentDeleteClicked: function (experiment) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTextExperimentDelete'), {
        title: this.$t('modalTitleSure'),
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            // Delete the image
            apiDeleteExperiment(experiment.experimentId, result => {
              if (result) {
                this.refresh()
              }
            })
          }
        })
    },
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
      this.selectedExperiment = null
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
