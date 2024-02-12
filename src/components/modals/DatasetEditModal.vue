<template>
  <b-modal :ref="`datasetEditModal-${id}`" size="lg" :title="dataset ? dataset.datasetName : $t('modalTitleAddDataset')" :ok-title="$t(dataset ? 'buttonUpdate' : 'buttonUpload')" @ok.prevent="updateDataset" header-class="dataset-edit-modal-header">
    <b-form @submit.prevent="updateDataset" novalidate>
      <b-row>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-name" :label="$t('tableColumnDatasetName')">
            <b-form-input v-model="datasetName" id="dataset-name" :state="formState.name" autofocus />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-description" :label="$t('tableColumnDatasetDescription')">
            <b-form-textarea v-model="datasetDescription" id="dataset-description" />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-start-date" :label="$t('tableColumnDatasetStartDate')">
            <b-form-datepicker :value-as-date="true" v-model="datasetStartDate" id="dataset-start-date" />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-end-date" :label="$t('tableColumnDatasetEndDate')">
            <b-form-datepicker :value-as-date="true" v-model="datasetEndDate" id="dataset-end-date" />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-type" :label="$t('tableColumnDatasetDatasetType')">
            <b-form-select :options="datasetTypeOptions" v-model="selectedDatasetType" id="dataset-type" :disabled="isEdit" :state="formState.selectedDatasetType" />
          </b-form-group>
        </b-col>
        <b-col cols=12 lg=6>
          <b-form-group label-for="dataset-state" :label="$t('tableColumnDatasetState')">
            <b-form-select :options="datasetStateOptions" v-model="datasetState" id="dataset-state" :state="formState.datasetState" />
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
              <b-form-select :options="experimentOptions" v-model="experimentId" id="experiment" :state="formState.experimentId" />
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
        <b-col cols=12 lg=6>
          <b-form-group label-for="external" :label="$t('tableColumnDatasetExternal')">
            <b-form-checkbox switch v-model="isExternal" id="external" :disabled="isEdit" />
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>

    <p class="text-danger" v-if="formFeedback">{{ $t(formFeedback) }}</p>

    <LicenseCreationModal :license="selectedLicense" ref="licenseCreationModal" @license-updated="updateLicenses" @license-added="selectLicense" />
    <ExperimentCreationModal :experiment="experimentIsEdit ? selectedExperiment : null" ref="experimentCreationModal" @experiment-updated="updateExperiments" @experiment-added="selectExperiment" />
  </b-modal>
</template>

<script>
import LicenseCreationModal from '@/components/modals/LicenseCreationModal'
import ExperimentCreationModal from '@/components/modals/ExperimentCreationModal'
import MdiIcon from '@/components/icons/MdiIcon'
import { apiPatchDataset, apiPostDataset, apiGetLicenses, apiPostExperimentTable } from '@/mixins/api/dataset'
import { datasetStates, datasetTypes } from '@/mixins/types'
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
    },
    datasetType: {
      type: String,
      default: null
    }
  },
  data: function () {
    return {
      mdiPlusBox,
      mdiPencil,
      id: uuidv4(),
      datasetState: null,
      selectedDatasetType: null,
      datasetName: null,
      datasetDescription: null,
      datasetStartDate: null,
      datasetEndDate: null,
      isExternal: null,
      licenseId: null,
      licenses: [],
      experimentId: null,
      experiments: [],
      experimentIsEdit: true,
      formState: {
        name: null,
        experimentId: null,
        datasetState: null,
        selectedDatasetType: null
      },
      formFeedback: null
    }
  },
  computed: {
    isEdit: function () {
      return this.dataset !== undefined && this.dataset !== null
    },
    datasetStateOptions: function () {
      return Object.keys(datasetStates).map(s => {
        return {
          value: datasetStates[s].id,
          text: datasetStates[s].text()
        }
      })
    },
    datasetTypeOptions: function () {
      return Object.keys(datasetTypes).map(s => {
        return {
          value: datasetTypes[s].id,
          text: datasetTypes[s].text(),
          disabled: this.datasetType ? s !== this.datasetType : false
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
  watch: {
    dataset: function () {
      this.reset()
    }
  },
  methods: {
    reset: function () {
      this.formState = {
        name: null,
        experimentId: null,
        datasetState: null,
        selectedDatasetType: null
      }
      this.formFeedback = null

      if (this.dataset) {
        this.datasetState = datasetStates[this.dataset.datasetState].id
        this.selectedDatasetType = datasetTypes[this.dataset.datasetType].id
        this.datasetName = this.dataset.datasetName
        this.datasetDescription = this.dataset.datasetDescription
        this.isExternal = this.dataset.isExternal
        this.licenseId = this.dataset.licenseId || null
        this.experimentId = this.dataset.experimentId
        this.datasetStartDate = this.dataset.startDate ? new Date(this.dataset.startDate) : null
        this.datasetEndDate = this.dataset.endDate ? new Date(this.dataset.endDate) : null
      } else {
        this.datasetState = datasetStates.public.id
        this.selectedDatasetType = 3
        this.datasetName = null
        this.datasetDescription = null
        this.isExternal = false
        this.licenseId = null
        this.experimentId = null
        this.datasetStartDate = new Date()
        this.datasetEndDate = new Date()
      }

      this.updateExperiments()
    },
    show: function () {
      this.reset()

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
      this.formState = {
        name: this.datasetName !== undefined && this.datasetName !== null && this.datasetName.length > 0,
        experimentId: this.experimentId !== undefined && this.experimentId !== null,
        datasetState: this.datasetState !== undefined && this.datasetType !== null,
        selectedDatasetType: this.selectedDatasetType !== undefined && this.selectedDatasetType !== null
      }

      if (Object.keys(this.formState).some(k => this.formState[k] === false)) {
        this.formFeedback = 'formFeedbackInvalidForm'
        return
      } else {
        this.formFeedback = null
      }

      if (this.dataset) {
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
            this.$emit('changed', result)
            this.hide()
          }
        })
      } else {
        return apiPostDataset({
          name: this.datasetName,
          description: this.datasetDescription,
          dateStart: this.datasetStartDate,
          licenseId: this.licenseId,
          experimentId: this.experimentId,
          dateEnd: this.datasetEndDate,
          datasetStateId: this.datasetState,
          datasettypeId: this.selectedDatasetType,
          isExternal: this.isExternal
        }, (result) => {
          if (result) {
            this.$emit('changed', result)
            this.hide()
          }
        })
      }
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
