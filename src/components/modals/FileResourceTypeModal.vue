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
import { EventBus } from '@/plugins/event-bus.js'
import datasetApi from '@/mixins/api/dataset'

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
  mixins: [ datasetApi ],
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

      EventBus.$emit('show-loading', true)
      this.apiPostFileresourceType({
        name: this.name,
        description: this.description
      }, result => {
        EventBus.$emit('show-loading', false)
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
