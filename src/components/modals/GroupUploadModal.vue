<template>
  <b-modal
    ref="groupUploadModal"
    :title="$t('modalTitleGroupUpload')"
    :ok-title="$t('buttonUpload')"
    :cancel-title="$t('buttonCancel')"
    @shown="$refs.itemList.focus()"
    @ok="$emit('ok', $refs.itemList.getContent())">
    <!-- Drop file to upload to group -->
    <DropFilePreview ref="itemList" placeholder="widgetDropFileGroupUploadPlaceholder" />
  </b-modal>
</template>

<script>
import DropFilePreview from '@/components/util/DropFilePreview'

export default {
  components: {
    DropFilePreview
  },
  methods: {
    show: function () {
      this.$refs.groupUploadModal.show()
    },
    hide: function () {
      this.$refs.groupUploadModal.hide()
    }
  }
}
</script>

<style>

</style>
