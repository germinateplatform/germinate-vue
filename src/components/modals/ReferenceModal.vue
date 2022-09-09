<template>
  <b-modal :title="$t('widgetPublicationModalTitle')"
           ref="referenceModal"
           :ok-title="$t('buttonClose')"
           ok-only
           v-if="publication">
    <b-form-group :label="$t('formLabelReferenceTemplate')" label-for="referenceStyle">
      <b-form-select id="referenceStyle" :options="templates" v-model="selectedTemplate" />
    </b-form-group>
    <p v-html="html" />
  </b-modal>
</template>

<script>
const Cite = require('citation-js')

export default {
  props: {
    publication: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      templates: ['apa', 'vancouver', 'harvard1'],
      selectedTemplate: 'apa'
    }
  },
  computed: {
    citation: function () {
      if (this.publication) {
        return new Cite(this.publication.publicationFallbackCache || this.publication.publicationDoi)
      } else {
        return null
      }
    },
    html: function () {
      if (this.citation) {
        return this.citation.format('bibliography', { format: 'html', template: this.selectedTemplate })
      } else {
        return null
      }
    }
  },
  methods: {
    hide: function () {
      this.$refs.referenceModal.hide()
    },
    show () {
      this.$nextTick(() => this.$refs.referenceModal.show())
    }
  }
}
</script>

<style>
</style>
