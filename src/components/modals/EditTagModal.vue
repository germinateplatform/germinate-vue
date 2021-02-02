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
    <VueTagsInput
      v-model="tempInput"
      :tags="newTags"
      :autocomplete-items="filteredItems"
      @tags-changed="addTags"
      class="tag-input"
      ref="focusThis" />
  </b-modal>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input'
import miscApi from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      tempInput: '',
      allTagNames: [],
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
  computed: {
    filteredItems () {
      return this.allTagNames.filter(i => {
        return i.text.toLowerCase().indexOf(this.tempInput.toLowerCase()) !== -1
      })
    }
  },
  watch: {
    allTags: function (newValue) {
      this.allTagNames = newValue.map(t => {
        return {
          text: t.tagName
        }
      })
    },
    prefilledTags: function (newValue) {
      this.newTags = newValue.map(t => {
        return {
          text: t.tagName,
          classes: 'bg-primary'
        }
      })
    }
  },
  components: {
    VueTagsInput
  },
  mixins: [ miscApi ],
  methods: {
    focus: function () {
      this.$nextTick(() => this.$refs.focusThis.focus())
    },
    addTags: function (addedTags) {
      this.newTags = addedTags.map(t => {
        return {
          text: t.text,
          classes: 'bg-primary'
        }
      })
    },
    handleOk: function (event) {
      event.preventDefault()

      const data = this.newTags.map(t => t.text)

      // Add new tags
      this.apiPutImageTags(this.imageId, data, () => {
        this.$emit('tags-changed')

        this.$nextTick(() => this.$refs.editTagModal.hide())
      })
    },
    hide: function () {
      this.$refs.editTagModal.hide()
    },
    show () {
      this.tempInput = ''
      this.newTags = this.prefilledTags.map(t => {
        return {
          text: t.tagName,
          classes: 'bg-primary'
        }
      })
      this.$nextTick(() => this.$refs.editTagModal.show())
    }
  },
  mounted: function () {
    this.newTags = this.prefilledTags.map(t => {
      return {
        text: t.tagName,
        classes: 'bg-primary'
      }
    })
  }
}
</script>

<style>
.tag-input.vue-tags-input {
  max-width: 100%;
}
</style>
