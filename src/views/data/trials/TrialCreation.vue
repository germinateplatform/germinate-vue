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

    <hr v-if="tabIndex !== null" />

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
            <DatasetEditModal datasetType="trials" :dataset="dataset" @changed="onDatasetCreated" ref="datasetEditModal" />
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

              <p class="text-danger" v-if="formFeedback">{{ formFeedback }}</p>
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
      <b-card class="gridscore-card">
        <b-row>
          <b-col cols=12 md=4 class="text-center text-md-right" order="1" order-md="2">
            <b-img fluid src="img/tools/gridscore.svg" alt="GridScore logo" />
          </b-col>
          <b-col cols=12 md=8 order="2" order-md="1" class="d-flex flex-column">
            <b-card-title>{{ $t('pageTrialCreationGridScoreTitle') }}</b-card-title>
            <b-card-sub-title class="mb-3">{{ $t('pageTrialCreationGridScoreText') }}</b-card-sub-title>
            <b-card-text class="mt-auto" v-if="dataset && layout && success"><span v-html="$t('pageTrialCreationGridScoreLink', { gridscore: gridscoreTrialUrl })"/></b-card-text>
          </b-col>
        </b-row>
      </b-card>
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
import { apiPostTrialCreation } from '@/mixins/api/trait'

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
      layout: null,
      formFeedback: null,
      success: false
    }
  },
  computed: {
    ...mapGetters([
      'storeMarkedGermplasm',
      'storeServerSettings',
      'storeToken',
      'storeBaseUrl'
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
    gridscoreTrialUrl: function () {
      if (this.dataset && this.layout && this.success) {
        const gf = {
          datasetId: this.dataset.datasetId,
          brapiConfig: {
            token: this.storeToken.token,
            url: `${this.storeBaseUrl}brapi/v2/`
          }
        }

        return `${this.gridscoreUrl}/#/trial-setup?germinateConfig=${encodeURIComponent(JSON.stringify(gf))}`
      } else {
        return this.gridscoreUrl
      }
    },
    buttonDisabled: function () {
      return !this.storeMarkedGermplasm || this.storeMarkedGermplasm.length < 1
    }
  },
  methods: {
    createTrial: function () {
      this.formFeedback = null
      this.success = false
      apiPostTrialCreation({
        datasetId: this.dataset.datasetId,
        plots: this.layout
      }, () => {
        this.success = true
        this.tabIndex = 2
        window.scrollTo({
          left: 0,
          top: 0,
          behavior: 'smooth'
        })
      }, {
        codes: [400, 403],
        callback: (e) => {
          if (e.status === 400) {
            this.formFeedback = this.$t('formErrorTrialCreationInvalidPayload', { error: e.data })
          } else if (e.status === 403) {
            this.formFeedback = this.$t('formErrorTrialCreationForbiddenDataset')
          } else {
            this.formFeedback = e.data
          }
        }
      })
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
        // We force .csv here, because FielDHub will not accept .txt files even if they have valid .csv content.
        forcedFileExtension: 'csv',
        filter: [{ // TODO: Convert to filter groups
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

.gridscore-card img {
  max-height: 125px;
}

@media (min-width: 768px) {
  .gridscore-card img {
    max-height: 150px;
  }
}
</style>
