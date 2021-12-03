<template>
  <b-modal :title="$t('modalTitleGenotypeExport')"
           ref="modal"
           :ok-title="$t('buttonExport')"
           :cancel-title="$t('buttonCancel')"
           @ok.prevent="handleSubmit">
    <b-form @submit.prevent="handleSubmit">
      <b-form-group :label="$t('modalTextGenotypeExport')" label-for="formats">
        <b-form-checkbox-group
          id="formats"
          v-model="selected"
          stacked
          :options="options"/>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  data: function () {
    return {
      selected: []
    }
  },
  computed: {
    options: function () {
      return [
        { text: this.$t('pageGenotypesExportEnableFlatFileTitle'), value: 'flat'},
        { text: this.$t('pageGenotypesExportEnableFlapjackTitle'), value: 'flapjack' },
        { text: this.$t('pageGenotypesExportEnableHapmapTitle'), value: 'hapmap' }
      ]
    }
  },
  methods: {
    show: function () {
      this.selected = []
      this.$nextTick(() => this.$refs.modal.show())
    },
    hide: function () {
      this.$nextTick(() => this.$refs.modal.hide())
    },
    handleSubmit: function () {
      this.$emit('formats-selected', this.selected)
    }
  }
}
</script>
