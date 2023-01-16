<template>
  <b-modal :ref="`datasetEditModal-${id}`" size="lg" :title="dataset.datasetName" :ok-title="$t('buttonUpdate')" @ok="updateDataset" header-class="dataset-edit-modal-header">
    <b-form @submit.prevent="updateDataset">
      <b-row>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-name" :label="$t('tableColumnDatasetName')">
            <b-form-input v-model="datasetName" id="dataset-name" />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-description" :label="$t('tableColumnDatasetDescription')">
            <b-form-textarea v-model="datasetDescription" id="dataset-description" />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-start-date" :label="$t('tableColumnDatasetStartDate')">
            <b-form-datepicker v-model="datasetStartDate" id="dataset-start-date" />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-end-date" :label="$t('tableColumnDatasetEndDate')">
            <b-form-datepicker v-model="datasetEndDate" id="dataset-end-date" />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-state" :label="$t('tableColumnDatasetState')">
            <b-form-select :options="datasetStateOptions" v-model="datasetState" id="dataset-state" />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="license" :label="$t('tableColumnDatasetLicenseName')">
            <b-input-group>
              <b-form-select :options="licenseOptions" v-model="licenseId" id="license" />
              <b-input-group-append>
                <b-button @click="$refs.licenseCreationModal.show()">
                  <MdiIcon :path="mdiPencil" v-if="licenseId" />
                  <MdiIcon :path="mdiPlusBox" v-else />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="experiment" :label="$t('tableColumnExperimentName')">
            <b-input-group>
              <b-form-select :options="experimentOptions" v-model="experimentId" id="experiment" />
              <b-input-group-append>
                <b-button-group>
                  <b-button @click="updateExperiment" v-if="experimentId" >
                    <MdiIcon :path="mdiPencil" />
                  </b-button>
                  <b-button @click="addExperiment">
                    <MdiIcon :path="mdiPlusBox" />
                  </b-button>
                </b-button-group>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>

    <LicenseCreationModal :license="selectedLicense" ref="licenseCreationModal" @license-updated="updateLicenses" @license-added="selectLicense" />
    <ExperimentCreationModal :experiment="experimentIsEdit ? selectedExperiment : null" ref="experimentCreationModal" @experiment-updated="updateExperiments" @experiment-added="selectExperiment" />
  </b-modal>
</template>

<script>
import LicenseCreationModal from '@/components/modals/LicenseCreationModal'
import ExperimentCreationModal from '@/components/modals/ExperimentCreationModal'
import MdiIcon from '@/components/icons/MdiIcon'
import { apiPatchDataset, apiGetLicenses, apiPostExperimentTable } from '@/mixins/api/dataset'
import { datasetStates } from '@/mixins/types'
import { uuidv4 } from '@/mixins/util'

import { mdiPlusBox, mdiPencil } from '@mdi/js'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

export default {
  components: {
    ExperimentCreationModal,
    LicenseCreationModal,
    MdiIcon
  },
  props: {
    dataset: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      mdiPlusBox,
      mdiPencil,
      id: uuidv4(),
      datasetState: null,
      datasetName: null,
      datasetDescription: null,
      datasetStartDate: null,
      datasetEndDate: null,
      licenseId: null,
      licenses: [],
      experimentId: null,
      experiments: [],
      experimentIsEdit: true
    }
  },
  computed: {
    datasetStateOptions: function () {
      return Object.keys(datasetStates).map(s => {
        return {
          value: datasetStates[s].id,
          text: datasetStates[s].text()
        }
      })
    },
    selectedLicense: function () {
      if (this.licenseId) {
        return this.licenses.find(l => l.licenseId === this.licenseId)
      } else {
        return null
      }
    },
    selectedExperiment: function () {
      if (this.experimentId) {
        return this.experiments.find(l => l.experimentId === this.experimentId)
      } else {
        return null
      }
    },
    experimentOptions: function () {
      if (this.experiments) {
        return this.experiments.map(e => {
          let text

          if (e.experimentDescription) {
            text = `${e.experimentName} (${e.experimentDescription})`
          } else {
            text = e.experimentName
          }

          return {
            value: e.experimentId,
            text: text
          }
        })
      } else {
        return []
      }
    },
    licenseOptions: function () {
      if (this.licenses) {
        const result = this.licenses.map(l => {
          let text

          if (l.licenseDescription) {
            text = `${l.licenseDescription} (${l.licenseName})`
          } else {
            text = l.licenseName
          }

          return {
            value: l.licenseId,
            text: text
          }
        })

        result.unshift({
          value: null,
          text: this.$t('formSelectOptionLicenseNone')
        })

        return result
      } else {
        return []
      }
    }
  },
  methods: {
    show: function () {
      this.datasetState = datasetStates[this.dataset.datasetState].id
      this.datasetName = this.dataset.datasetName
      this.datasetDescription = this.dataset.datasetDescription
      this.licenseId = this.dataset.licenseId || null
      this.experimentId = this.dataset.experimentId
      this.datasetStartDate = this.dataset.startDate ? new Date(this.dataset.startDate) : null
      this.datasetEndDate = this.dataset.endDate ? new Date(this.dataset.endDate) : null

      this.updateExperiments()

      if (!this.licenses || this.licenses.length < 1) {
        this.updateLicenses()
          .then(() => this.$refs['datasetEditModal-' + this.id].show())
      } else {
        this.$refs['datasetEditModal-' + this.id].show()
      }
    },
    hide: function () {
      this.$refs['datasetEditModal-' + this.id].hide()
    },
    addExperiment: function () {
      this.experimentIsEdit = false
      this.$nextTick(() => this.$refs.experimentCreationModal.show())
    },
    updateExperiment: function () {
      this.experimentIsEdit = true
      this.$nextTick(() => this.$refs.experimentCreationModal.show())
    },
    updateExperiments: function () {
      return apiPostExperimentTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        orderBy: 'experimentName',
        ascending: 1
      }, result => {
        this.experiments = result.data || []
      })
    },
    updateLicenses: function () {
      return apiGetLicenses(result => {
        this.licenses = result || []
      })
    },
    selectExperiment: function (experimentId) {
      this.updateExperiments()
        .then(() => {
          this.experimentId = experimentId
        })
    },
    selectLicense: function (licenseId) {
      this.updateLicenses()
        .then(() => {
          this.licenseId = licenseId
        })
    },
    updateDataset: function () {
      return apiPatchDataset(this.dataset.datasetId, {
        name: this.datasetName,
        description: this.datasetDescription,
        dateStart: this.datasetStartDate,
        licenseId: this.licenseId,
        experimentId: this.experimentId,
        dateEnd: this.datasetEndDate,
        datasetStateId: this.datasetState
      }, (result) => {
        if (result) {
          this.$emit('changed')
          this.hide()
        }
      })
    }
  }
}
</script>

<style>
.dataset-edit-modal-header .modal-title {
  white-space: nowrap;
  max-width: 100%;
  overflow-x: clip;
  text-overflow: ellipsis;
}
</style>
