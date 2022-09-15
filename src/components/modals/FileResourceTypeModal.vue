<template>
  <b-modal :title="$t('modalTitleFileResourceType')"
           ref="modal"
           :ok-title="$t('buttonSubmit')"
           :cancel-title="$t('buttonCancel')"
           @ok.prevent="handleOk">
    <b-form @submit.prevent :validated="formValidated">
      <b-form-group :label="$t('formLabelFileResourceTypeName')" label-for="fileResourceTypeName">
        <b-form-input id="fileResourceTypeName" required v-model="name" :state="formState.name" />
      </b-form-group>
      <b-form-group :label="$t('formLabelFileResourceTypeDescription')" label-for="fileResourceTypeDescription">
        <b-form-textarea id="fileResourceTypeDescription" v-model="description" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPostFileresourceType } from '@/mixins/api/dataset'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      name: null,
      description: null,
      formValidated: false,
      formState: {
        name: null
      }
    }
  },
  methods: {
    show: function () {
      this.name = null
      this.description = null
      this.formValidated = false
      this.formState = {
        name: null
      }
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    },
    handleOk: function () {
      if (!this.name || this.name.length < 1) {
        this.formValidated = true
        this.formState.name = this.name !== null && this.name.length > 0
        return
      }

      emitter.emit('show-loading', true)
      apiPostFileresourceType({
        name: this.name,
        description: this.description
      }, result => {
        emitter.emit('show-loading', false)
        if (result) {
          this.$emit('type-added', result)
          this.hide()
        }
      })
    }
  }
}
</script>

<style>

</style>
