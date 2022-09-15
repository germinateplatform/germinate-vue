<template>
  <b-modal :ref="`institutionModal-${id}`" size="xl" :title="$t('modalTitleInstitutions')" ok-only :ok-title="$t('buttonClose')">
    <!-- Modal showing collaborator information -->
    <InstitutionTable :showLinks="false" :getData="getData" ref="institutionsTable" />
  </b-modal>
</template>

<script>
import InstitutionTable from '@/components/tables/InstitutionTable'
import { apiPostGermplasmInstitutionTable } from '@/mixins/api/misc.js'
import { uuidv4 } from '@/mixins/util'

export default {
  props: {
    germplasmId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      id: uuidv4()
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
  methods: {
    show: function () {
      this.$refs['institutionModal-' + this.id].show()
    },
    getData: function (data, callback) {
      return apiPostGermplasmInstitutionTable(this.germplasmId, data, callback)
    }
  }
}
</script>

<style>

</style>
