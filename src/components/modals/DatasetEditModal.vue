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
      </b-row>
    </b-form>

    <LicenseCreationModal :license="selectedLicense" ref="licenseCreationModal" @license-updated="updateLicenses" @license-added="selectLicense" />
  </b-modal>
</template>

<script>
import LicenseCreationModal from '@/components/modals/LicenseCreationModal'
import MdiIcon from '@/components/icons/MdiIcon'
import { apiPatchDataset, apiGetLicenses } from '@/mixins/api/dataset'
import { datasetStates } from '@/mixins/types'
import { uuidv4 } from '@/mixins/util'

import { mdiPlusBox, mdiPencil } from '@mdi/js'

export default {
  components: {
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
      licenses: []
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
      this.datasetStartDate = this.dataset.startDate ? new Date(this.dataset.startDate) : null
      this.datasetEndDate = this.dataset.endDate ? new Date(this.dataset.endDate) : null

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
    updateLicenses: function () {
      return apiGetLicenses(result => {
        this.licenses = result || []
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
