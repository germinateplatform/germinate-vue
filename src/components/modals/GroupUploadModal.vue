<template>
  <b-modal
    ref="groupUploadModal"
    :title="$t('modalTitleGroupUpload')"
    :ok-title="$t('buttonUpload')"
    :cancel-title="$t('buttonCancel')"
    @ok="okPressed">
    <DropFilePreview ref="itemList" />
  </b-modal>
</template>

<script>
import DropFilePreview from '@/components/util/DropFilePreview'

export default {
  components: {
    DropFilePreview
  },
  methods: {
    okPressed: function () {
      this.$emit('ok', this.$refs.itemList.getContent())
    },
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
