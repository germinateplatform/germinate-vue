<template>
  <b-modal :title="$t('modalTitlePublications')"
           ref="publicationsModal"
           :ok-title="$t('buttonClose')"
           size="xl"
           ok-only>
    <Publications :referenceType="referenceType" :referencingId="referencingId" />
  </b-modal>
</template>

<script>
import Publications from '@/components/util/Publications'

export default {
  components: {
    Publications
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
