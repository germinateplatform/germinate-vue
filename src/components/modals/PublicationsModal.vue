<template>
  <b-modal :title="$t('modalTitlePublications')"
           ref="publicationsModal"
           :ok-title="$t('buttonClose')"
           size="xl"
           ok-only>
    <PublicationsWidget :referenceType="referenceType" :referencingId="referencingId" />
  </b-modal>
</template>

<script>
import PublicationsWidget from '@/components/util/PublicationsWidget'

export default {
  components: {
    PublicationsWidget
  },
  props: {
    referenceType: {
      type: String,
      default: 'database'
    },
    referencingId: {
      type: Number,
      default: null
    }
  },
  data: function () {
  },
  methods: {
    hide: function () {
      this.$refs.publicationsModal.hide()
    },
    show () {
      this.$nextTick(() => this.$refs.publicationsModal.show())
    }
  }
}
</script>

<style>
</style>
