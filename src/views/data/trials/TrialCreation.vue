<template>
  <div>
    <h1>{{ $t('pageTrialCreationTitle') }}</h1>
    <hr />
    <p v-html="$t('pageTrialCreationText', { gridscore: gridscoreUrl, fieldhub: fieldhubUrl })" />

    <b-row class="mb-3">
      <b-col cols=12 md=6 lg=4>
        <b-card no-body class="trial-creation-card h-100">
          <b-card-body>
            <b-img :src="require('@/assets/img/germplasm-selection.svg')" class="p-3 card-img" />
            <b-card-title>{{ $t('pageTrialCreationGermplasmListCardTitle') }}</b-card-title>
            <b-card-text>{{ $t('pageTrialCreationGermplasmListCardText') }}</b-card-text>
          </b-card-body>
          <b-button :variant="tabIndex === 0 ? 'primary' : 'secondary'" @click="tabIndex = 0">{{ $t('buttonSelect') }}</b-button>
        </b-card>
      </b-col>
      <b-col cols=12 md=6 lg=4>
        <b-card no-body class="trial-creation-card h-100">
          <b-card-body>
            <b-img :src="require('@/assets/img/layout-design.svg')" class="p-3 card-img" />
            <b-card-title>{{ $t('pageTrialCreationFieldhubListCardTitle') }}</b-card-title>
            <b-card-text>{{ $t('pageTrialCreationFieldhubListCardText') }}</b-card-text>
          </b-card-body>
          <b-button :variant="tabIndex === 1 ? 'primary' : 'secondary'" @click="tabIndex = 1">{{ $t('buttonSelect') }}</b-button>
        </b-card>
      </b-col>
      <b-col cols=12 md=6 lg=4>
        <b-card no-body class="trial-creation-card h-100">
          <b-card-body>
            <b-img :src="require('@/assets/img/data-collection.svg')" class="p-3 card-img" />
            <b-card-title>{{ $t('pageTrialCreationGridScoreListCardTitle') }}</b-card-title>
            <b-card-text>{{ $t('pageTrialCreationGridScoreListCardText') }}</b-card-text>
          </b-card-body>
          <b-button :variant="tabIndex === 2 ? 'primary' : 'secondary'" @click="tabIndex = 2">{{ $t('buttonSelect') }}</b-button>
        </b-card>
      </b-col>
    </b-row>

    <div v-show="tabIndex === 0">
      <h3>{{ $t('pageTrialCreationGermplasmTitle') }}</h3>
      <p v-html="$t('pageTrialCreationGermplasmText')" />

      <GermplasmTableComponent :download="onDownload" ref="germplasmTable" />

      <b-button variant="primary" :disabled="buttonDisabled" @click="onDownloadClicked"><MdiIcon :path="mdiDownload" /> {{ $t('buttonDownload') }}</b-button>
    </div>
    <div v-show="tabIndex === 1">
      <h3>{{ $t('pageTrialCreationFieldHubTitle') }}</h3>
      <p v-html="$t('pageTrialCreationFieldHubText', { fieldhub: fieldhubUrl })" />

      <b-row>
        <b-col cols=12 md=4 class="mb-3">
          <b-card class="h-100">
            <b-card-title>{{ $t('pageTrialCreationSetupDatasetTitle') }}</b-card-title>
            <b-card-text>{{ $t('pageTrialCreationSetupDatasetText') }}</b-card-text>

            <IndividualDatasetWidget :dataset="dataset" class="mb-3" />

            <b-button variant="primary" @click="$refs.datasetEditModal.show()"><MdiIcon :path="mdiPencil" /> {{ $t(dataset ? 'buttonChange' : 'buttonCreateDataset') }}</b-button>
            <DatasetEditModal datasetType="trials" @changed="onDatasetCreated" ref="datasetEditModal" />
          </b-card>
        </b-col>
        <b-col cols=12 md=8 class="mb-3" v-if="dataset">
          <b-card class="h-100">
            <b-card-title>{{ $t('pageTrialCreationSetupDesignTitle') }}</b-card-title>
            <b-card-text><span v-html="$t('pageTrialCreationSetupDesignText', { fieldhub: fieldhubUrl })" /></b-card-text>

            <TrialFieldbookImportComponent @change="onLayoutUpdated" />
          </b-card>
        </b-col>
        <b-col cols=12 md=4 class="mb-3" v-if="dataset && layout">
          <b-card class="h-100" no-body>
            <b-card-body>
              <b-card-title>{{ $t('pageTrialCreationSetupCreateTitle') }}</b-card-title>
              <b-card-text>{{ $t('pageTrialCreationSetupCreateText') }}</b-card-text>

              <b-button variant="primary" @click="createTrial"><MdiIcon :path="mdiCheckerboardPlus" /> {{ $t('buttonCreateTrial') }}</b-button>
            </b-card-body>
            <b-card-body class="bg-dark text-center text-light">
              <b-row>
                <b-col cols=6 md=3>
                  <h1>{{ counts.germplasm }}</h1>
                  <span>{{ $t('pageTrialCreationSetupGermplasmCount') }}</span>
                </b-col>
                <b-col cols=6 md=3>
                  <h1>{{ counts.rep }}</h1>
                  <span>{{ $t('pageTrialCreationSetupRepCount') }}</span>
                </b-col>
                <b-col cols=6 md=3>
                  <h1>{{ counts.row }}</h1>
                  <span>{{ $t('pageTrialCreationSetupRowCount') }}</span>
                </b-col>
                <b-col cols=6 md=3>
                  <h1>{{ counts.column }}</h1>
                  <span>{{ $t('pageTrialCreationSetupColumnCount') }}</span>
                </b-col>
              </b-row>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </div>
    <div v-show="tabIndex === 2">
      <h3>{{ $t('pageTrialCreationGridScoreTitle') }}</h3>
      <p v-html="$t('pageTrialCreationGridScoreText')" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GermplasmTableComponent from '@/components/germplasm/GermplasmTableComponent'
import TrialFieldbookImportComponent from '@/components/TrialFieldbookImportComponent'
import DatasetEditModal from '@/components/modals/DatasetEditModal'
import IndividualDatasetWidget from '@/components/export/IndividualDatasetWidget'
import MdiIcon from '@/components/icons/MdiIcon'
import { apiPostTableExport } from '@/mixins/api/misc'

import { mdiDownload, mdiPencil, mdiCheckerboardPlus } from '@mdi/js'
import { apiPostDatasetTable } from '@/mixins/api/dataset'

export default {
  components: {
    DatasetEditModal,
    GermplasmTableComponent,
    TrialFieldbookImportComponent,
    IndividualDatasetWidget,
    MdiIcon
  },
  data: function () {
    return {
      tabIndex: null,
      mdiDownload,
      mdiPencil,
      mdiCheckerboardPlus,
      dataset: null,
      layout: null
    }
  },
  computed: {
    ...mapGetters([
      'storeMarkedGermplasm',
      'storeServerSettings'
    ]),
    counts: function () {
      if (this.layout) {
        const germplasm = new Set()
        const rep = new Set()
        const row = new Set()
        const column = new Set()

        this.layout.forEach(c => {
          if (c.germplasm) {
            germplasm.add(c.germplasm)
          }
          if (c.rep) {
            rep.add(c.rep)
          }
          if (c.row) {
            row.add(c.row)
          }
          if (c.column) {
            column.add(c.column)
          }
        })

        return {
          germplasm: germplasm.size,
          row: row.size,
          column: column.size,
          rep: rep.size
        }
      } else {
        return {
          germplasm: 0,
          row: 0,
          column: 0,
          rep: 0
        }
      }
    },
    fieldhubUrl: function () {
      return this.storeServerSettings.fieldhubUrl || 'https://ics.hutton.ac.uk/fieldhub/'
    },
    gridscoreUrl: function () {
      return this.storeServerSettings.gridscoreUrl || 'https://gridscore.hutton.ac.uk'
    },
    buttonDisabled: function () {
      return !this.storeMarkedGermplasm || this.storeMarkedGermplasm.length < 1
    }
  },
  methods: {
    createTrial: function () {
      // TODO
    },
    onLayoutUpdated: function (newLayout) {
      this.layout = newLayout
    },
    onDatasetCreated: function (newDataset) {
      this.dataset = newDataset
    },
    onDownloadClicked: function () {
      this.$refs.germplasmTable.onDownloadTableClicked()
    },
    onDownload: function (data, callback) {
      return apiPostTableExport({
        columnNameMapping: { germplasmName: 'TREATMENT' },
        filter: [{
          column: 'germplasmId',
          comparator: 'inSet',
          operator: 'and',
          values: this.$store.getters.storeMarkedGermplasm
        }]
      }, 'germplasm', callback)
    },
    getDatasets: function (data, callback) {
      // Always filter for just the current dataset type
      const additional = [{
        column: 'datasetType',
        comparator: 'equals',
        operator: 'and',
        values: ['trials']
      }, {
        column: 'isExternal',
        comparator: 'equals',
        operator: 'and',
        values: [0]
      }]

      if (!data.filter) {
        data.filter = additional
      } else {
        data.filter = additional.concat(data.filter)
      }

      return apiPostDatasetTable(data, callback)
    }
  },
  beforeRouteLeave: function (to, from, next) {
    // Ask for confirmation
    this.$bvModal.msgBoxConfirm(this.$t('modalTextLeaveTrialCreation'), {
      title: this.$t('modalTitleLeaveTrialCreation'),
      okTitle: this.$t('genericYes'),
      okVariant: 'danger',
      cancelTitle: this.$t('genericNo')
    }).then(value => {
      if (value) {
        next()
      }
    })
  }
}
</script>

<style scoped>
.trial-creation-card .card-img {
  width: 100%;
  height: 200px;
  object-fit: contain;
}
</style>
