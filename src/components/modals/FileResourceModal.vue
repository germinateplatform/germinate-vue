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
              <b-button @click="$refs.fileResourceTypeModal.show()" v-b-tooltip="$t('modalTitleFileResourceType')"><i class="mdi mdi-plus" /></b-button>
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
        <b-form-group :label="$t('formLabelFileResourceFile')" label-for="fileResourceFile">
          <b-form-file id="fileResourceFile" v-model="file" required :state="formState.file" />
        </b-form-group>
      </b-form>
    </b-modal>
    <FileResourceTypeModal ref="fileResourceTypeModal" v-on:type-added="updateTypes" />
  </div>
</template>

<script>
import FileResourceTypeModal from '@/components/modals/FileResourceTypeModal'

import datasetApi from '@/mixins/api/dataset'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      name: null,
      description: null,
      types: [],
      type: null,
      file: null,
      formValidated: false,
      formState: {
        name: null,
        type: null,
        file: null
      }
    }
  },
  components: {
    FileResourceTypeModal
  },
  mixins: [ datasetApi ],
  methods: {
    show: function () {
      this.name = null
      this.description = null
      this.type = null
      this.types = []
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

      let formData = new FormData()
      formData.append('file', this.file)

      emitter.emit('show-loading', true)
      this.apiPostFileresourceFile(formData, result => {
        if (result) {
          this.apiPutFileresource({
            fileresourceName: this.name,
            fileresourcePath: result,
            fileresourceDescription: this.description,
            fileresourcetypeId: this.type
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
      this.apiGetFileResourceTypes(result => {
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
