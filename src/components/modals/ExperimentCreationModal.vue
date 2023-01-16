<template>
  <b-modal ref="experimentCreationModal" :title="$t('modalTitleExperimentCreation')" @ok.prevent="handleOk">
    <b-form @submit.prevent="handleOk" :validated="formFeedback.name !== null">
      <b-form-group label-for="experiment-name" :label="$t('formLabelExperimentName')">
        <b-input v-model="experimentName" id="experiment-name" required :state="formFeedback.name" />
      </b-form-group>
      <b-form-group label-for="experiment-description" :label="$t('formLabelExperimentDescription')">
        <b-input v-model="experimentDescription" id="experiment-description" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPatchExperiment, apiPutExperiment } from '@/mixins/api/dataset'

export default {
  props: {
    experiment: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      experimentName: null,
      experimentDescription: null,
      formFeedback: {
        name: null
      }
    }
  },
  watch: {
    experiment: function () {
      this.update()
    }
  },
  methods: {
    update: function () {
      this.experimentName = this.experiment ? this.experiment.experimentName : null
      this.experimentDescription = this.experiment ? this.experiment.experimentDescription : null

      this.formFeedback = {
        name: null
      }
    },
    show: function () {
      this.update()
      this.$refs.experimentCreationModal.show()
    },
    hide: function () {
      this.$refs.experimentCreationModal.hide()
    },
    handleOk: function () {
      if (!this.experimentName || this.experimentName.trim().length < 1) {
        this.formFeedback.name = false
        return
      } else {
        this.formFeedback.name = true
      }

      if (this.experiment) {
        let hasChanged = false

        hasChanged ||= this.experiment.experimentName !== this.experimentName
        hasChanged ||= this.experiment.experimentDescription !== this.experimentDescription

        if (hasChanged) {
          // Update the experiment on the server
          apiPatchExperiment(this.experiment.experimentId, {
            experimentId: this.experiment.experimentId,
            experimentName: this.experimentName,
            experimentDescription: this.experimentDescription
          }, result => {
            if (result) {
              this.$emit('experiment-updated')
              this.hide()
            }
          })
        } else {
          this.hide()
        }
      } else {
        // Create a new experiment
        apiPutExperiment({
          experimentName: this.experimentName,
          experimentDescription: this.experimentDescription,
          experimentData: this.experimentData
        }, result => {
          if (result) {
            this.$emit('experiment-added', result)
            this.hide()
          }
        })
      }
    }
  }
}
</script>

<style scoped>
</style>
