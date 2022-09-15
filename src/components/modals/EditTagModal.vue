<template>
  <b-modal v-if="imageId"
           :title="$t('modalTitleEditTags')"
           ref="editTagModal"
           :ok-title="$t('buttonUpdate')"
           :cancel-title="$t('buttonCancel')"
           @ok="handleOk"
           @shown="focus">
    <p>{{ $t('modalTextEditTags') }}</p>
    <!-- Tags input with autocomplete -->
    <b-form-tags v-model="newTags" add-on-change ref="focusThis" />
  </b-modal>
</template>

<script>
import { apiPutImageTags } from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      newTags: []
    }
  },
  props: {
    imageId: {
      type: Number,
      default: null
    },
    prefilledTags: {
      type: Array,
      default: () => []
    },
    allTags: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    prefilledTags: function (newValue) {
      this.newTags = newValue.map(t => t.tagName)
    }
  },
  methods: {
    focus: function () {
      this.$nextTick(() => this.$refs.focusThis.focus())
    },
    handleOk: function (event) {
      event.preventDefault()

      // Add new tags
      apiPutImageTags(this.imageId, this.newTags, () => {
        this.$emit('tags-changed')

        this.$nextTick(() => this.$refs.editTagModal.hide())
      })
    },
    hide: function () {
      this.$refs.editTagModal.hide()
    },
    show () {
      this.newTags = this.prefilledTags.map(t => t.tagName)
      this.$nextTick(() => this.$refs.editTagModal.show())
    }
  },
  mounted: function () {
    this.newTags = this.prefilledTags.map(t => t.tagName)
  }
}
</script>

<style>
</style>
