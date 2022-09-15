<template>
  <b-modal :ref="`collaboratorModal-${id}`" size="xl" :title="$t('modalTitleCollaborators')" ok-only :ok-title="$t('buttonClose')">
    <!-- Modal showing collaborator information -->
    <CollaboratorTable :getData="getData" />
  </b-modal>
</template>

<script>
import CollaboratorTable from '@/components/tables/CollaboratorTable'
import { apiPostCollaboratorsTable } from '@/mixins/api/dataset.js'
import { uuidv4 } from '@/mixins/util'

export default {
  props: {
    dataset: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      id: uuidv4()
    }
  },
  components: {
    CollaboratorTable
  },
  methods: {
    show: function () {
      this.$refs['collaboratorModal-' + this.id].show()
    },
    getData: function (data, callback) {
      return apiPostCollaboratorsTable(this.dataset.datasetId, data, callback)
    }
  }
}
</script>

<style>

</style>
