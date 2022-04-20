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
    <UploadWidget accept="image/png,image/jpeg" :postAction="`${storeBaseUrl}image/upload/${referenceTable}/${foreignId}`" name="imageFiles" />
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import UploadWidget from '@/components/util/UploadWidget'
const emitter = require('tiny-emitter/instance')

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
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ])
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
      emitter.emit('update-sidebar-menu')
    }
  }
}
</script>

<style>

</style>
