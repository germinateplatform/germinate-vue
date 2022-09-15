<template>
  <div>
    <b-modal :title="$t('modalTitleFileResource')"
            ref="modal"
            :ok-title="$t('buttonUpload')"
            :cancel-title="$t('buttonCancel')"
            @ok.prevent="handleOk">
      <b-form @submit.prevent :validated="formValidated">
        <b-form-group :label="$t('formLabelFileResourceType')" label-for="fileResourceType">
          <b-input-group>
            <template v-slot:append>
              <b-button @click="$refs.fileResourceTypeModal.show()" v-b-tooltip="$t('modalTitleFileResourceType')"><MdiIcon :path="mdiPlus" /></b-button>
            </template>
            <b-form-select v-model="type" :options="types" required :state="formState.type" />
          </b-input-group>
        </b-form-group>
        <b-form-group :label="$t('formLabelFileResourceName')" label-for="fileResourceName">
          <b-form-input id="fileResourceName" required v-model="name" :state="formState.name" />
        </b-form-group>
        <b-form-group :label="$t('formLabelFileResourceDescription')" label-for="fileResourceDescription">
          <b-form-textarea id="fileResourceDescription" v-model="description" />
        </b-form-group>
        <b-form-group :label="$t('formLabelFileResourceDatasets')" :description="$t('formDescriptionFileResourceDatasets')" label-for="fileResourceDatasets">
          <b-input-group>
            <b-form-input id="fileResourceDatasets" :value="datasetIdString" readonly />
            <b-input-group-append>
              <b-button v-b-modal.datasetModal v-b-tooltip="$t('modalTitleFileResourceDataset')"><MdiIcon :path="mdiDatabase" /></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group :label="$t('formLabelFileResourceFile')" label-for="fileResourceFile">
          <b-form-file id="fileResourceFile" v-model="file" required :state="formState.file" />
        </b-form-group>
      </b-form>
    </b-modal>
    <FileResourceTypeModal ref="fileResourceTypeModal" v-on:type-added="updateTypes" />
    <b-modal :title="$t('modalTitleFileResourceDataset')"
             :ok-title="$t('buttonOk')"
             :cancel-title="$t('buttonCancel')"
             @ok="extractDatasetIds"
             id="datasetModal"
             size="xl">
      <DatasetTable :getData="getDatasets"
                    :getIds="getDatasetIds"
                    :selectable="true"
                    :filterOn="datasetsFilter"
                    :clickHandler="handleDatasetClick"
                    ref="datasetTable" />
    </b-modal>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import DatasetTable from '@/components/tables/DatasetTable'
import FileResourceTypeModal from '@/components/modals/FileResourceTypeModal'

import { apiPostDatasetTable, apiPostDatasetTableIds, apiGetFileResourceTypes, apiPostFileresourceFile, apiPutFileresource } from '@/mixins/api/dataset'

import { mdiPlus, mdiDatabase } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      mdiPlus,
      mdiDatabase,
      name: null,
      description: null,
      types: [],
      type: null,
      file: null,
      datasetIds: null,
      formValidated: false,
      formState: {
        name: null,
        type: null,
        file: null
      },
      datasetsFilter: [{
        column: {
          name: 'isExternal',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [false],
        canBeChanged: false
      }]
    }
  },
  computed: {
    datasetIdString: function () {
      if (this.datasetIds) {
        return this.datasetIds.join(', ')
      } else {
        return null
      }
    }
  },
  components: {
    DatasetTable,
    FileResourceTypeModal,
    MdiIcon
  },
  methods: {
    getDatasets: function (data, callback) {
      return apiPostDatasetTable(data, callback)
    },
    getDatasetIds: function (data, callback) {
      return apiPostDatasetTableIds(data, callback)
    },
    extractDatasetIds: function () {
      const selectedIds = this.$refs.datasetTable.getSelected()
      if (selectedIds && selectedIds.length > 0) {
        this.datasetIds = selectedIds
      } else {
        this.datasetIds = null
      }
    },
    handleDatasetClick: function (dataset) {
      const id = dataset.datasetId
      let selected = this.$refs.datasetTable.getSelected()
      if (!selected) {
        selected = []
      }
      if (!selected.includes(id)) {
        selected.push(id)
        this.$refs.datasetTable.setSelectedItems(selected)
      } else {
        selected = selected.filter(s => s !== id)
        this.$refs.datasetTable.setSelectedItems(selected)
      }
    },
    show: function () {
      this.name = null
      this.description = null
      this.type = null
      this.types = []
      this.datasetIds = null
      this.file = null
      this.formValidated = false
      this.formState = {
        name: null,
        type: null,
        file: null
      }
      this.updateTypes()
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    },
    handleOk: function () {
      if (!this.name || this.name.length < 1 || !this.type || !this.file) {
        this.formValidated = true
        this.formState.name = this.name !== null && this.name.length > 0
        this.formState.type = this.type !== null
        this.formState.file = this.file !== null
        return
      }

      const formData = new FormData()
      formData.append('file', this.file)

      emitter.emit('show-loading', true)
      apiPostFileresourceFile(formData, result => {
        if (result) {
          apiPutFileresource({
            fileresourceName: this.name,
            fileresourcePath: result,
            fileresourceDescription: this.description,
            fileresourcetypeId: this.type,
            datasetIds: this.datasetIds
          }, () => {
            this.$emit('resource-added')
            emitter.emit('show-loading', false)
            emitter.emit('update-sidebar-menu')
            this.hide()
          })
        }
      })
    },
    updateTypes: function (toSelect) {
      apiGetFileResourceTypes(result => {
        if (result && result.length > 0) {
          this.types = result.map(r => {
            return {
              value: r.id,
              text: r.name + (r.description ? (' - ' + r.description) : '')
            }
          })

          if (toSelect) {
            this.type = toSelect
          } else {
            this.type = result[0].id
          }
        }
      })
    }
  },
  mounted: function () {
    this.updateTypes()
  }
}
</script>

<style>

</style>
