<template>
  <b-modal :ref="`datasetEditModal-${id}`" :title="dataset.datasetName" :ok-title="$t('buttonUpdate')" @ok="updateDataset" header-class="dataset-edit-modal-header">
    <b-form @submit.prevent="updateDataset">
      <b-form-group label-for="dataset-name" :label="$t('tableColumnDatasetName')">
        <b-form-input v-model="datasetName" id="dataset-name" />
      </b-form-group>
      <b-form-group label-for="dataset-description" :label="$t('tableColumnDatasetDescription')">
        <b-form-textarea v-model="datasetDescription" id="dataset-description" />
      </b-form-group>
      <b-form-group label-for="dataset-start-date" :label="$t('tableColumnDatasetStartDate')">
        <b-form-datepicker v-model="datasetStartDate" id="dataset-start-date" />
      </b-form-group>
      <b-form-group label-for="dataset-end-date" :label="$t('tableColumnDatasetEndDate')">
        <b-form-datepicker v-model="datasetEndDate" id="dataset-end-date" />
      </b-form-group>
      <b-form-group label-for="dataset-state" :label="$t('tableColumnDatasetState')">
        <b-form-select :options="options" v-model="datasetState" id="dataset-state" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import datasetApi from '@/mixins/api/dataset.js'
import typesMixin from '@/mixins/types.js'

export default {
  props: {
    dataset: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      id: this.uuidv4(),
      datasetState: null,
      datasetName: null,
      datasetDescription: null,
      datasetStartDate: null,
      datasetEndDate: null
    }
  },
  computed: {
    options: function () {
      return Object.keys(this.datasetStates).map(s => {
        return {
          value: this.datasetStates[s].id,
          text: this.datasetStates[s].text()
        }
      })
    }
  },
  mixins: [ datasetApi, typesMixin ],
  methods: {
    show: function () {
      this.datasetState = this.datasetStates[this.dataset.datasetState].id
      this.datasetName = this.dataset.datasetName
      this.datasetDescription = this.dataset.datasetDescription
      this.datasetStartDate = this.dataset.startDate ? new Date(this.dataset.startDate) : null
      this.datasetEndDate = this.dataset.endDate ? new Date(this.dataset.endDate) : null
      this.$refs['datasetEditModal-' + this.id].show()
    },
    hide: function () {
      this.$refs['datasetEditModal-' + this.id].hide()
    },
    updateDataset: function () {
      return this.apiPatchDataset(this.dataset.datasetId, {
        name: this.datasetName,
        description: this.datasetDescription,
        dateStart: this.datasetStartDate,
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
