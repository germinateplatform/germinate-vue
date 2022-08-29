<template>
  <b-modal :ref="`institutionModal-${id}`" size="xl" :title="$t('modalTitleInstitutions')" ok-only :ok-title="$t('buttonClose')">
    <!-- Modal showing collaborator information -->
    <InstitutionTable :showLinks="false" :getData="getData" ref="institutionsTable" />
  </b-modal>
</template>

<script>
import InstitutionTable from '@/components/tables/InstitutionTable'
import miscApi from '@/mixins/api/misc.js'

export default {
  props: {
    germplasmId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      id: this.uuidv4()
    }
  },
  watch: {
    germplasmId: function () {
      if (this.$refs.institutionsTable) {
        this.$refs.institutionsTable.refresh()
      }
    }
  },
  components: {
    InstitutionTable
  },
  mixins: [miscApi],
  methods: {
    show: function () {
      this.$refs['institutionModal-' + this.id].show()
    },
    getData: function (data, callback) {
      return this.apiPostGermplasmInstitutionTable(this.germplasmId, data, callback)
    }
  }
}
</script>

<style>

</style>
