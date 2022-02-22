<template>
  <b-modal
    ref="imageUploadModal"
    :title="$t('modalTitleImageUpload')"
    :ok-title="$t('buttonUpdate')"
    :cancel-title="$t('buttonCancel')"
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    size="xl"
    @ok="notifyCaller">
    <p>{{ $t('modalTextImageUpload') }}</p>
    <UploadWidget accept="image/png,image/jpeg" :postAction="`${baseUrl}image/upload/${referenceTable}/${foreignId}`" name="imageFiles" />
  </b-modal>
</template>

<script>
import UploadWidget from '@/components/util/UploadWidget'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  components: {
    UploadWidget
  },
  props: {
    foreignId: {
      type: Number,
      default: null
    },
    referenceTable: {
      type: String,
      default: 'germinatebase'
    }
  },
  methods: {
    show: function () {
      this.$refs.imageUploadModal.show()
    },
    hide: function () {
      this.$refs.imageUploadModal.hide()
    },
    notifyCaller: function () {
      this.$emit('images-updated')
      EventBus.$emit('update-sidebar-menu')
    }
  }
}
</script>

<style>

</style>
