<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="collaboratorTable"
               v-on="$listeners">
      <a slot="collaboratorEmail" slot-scope="props" :href="`mailto:${props.row.collaboratorEmail}`" v-if="props.row.collaboratorEmail">{{ props.row.collaboratorEmail }}</a>
      <span slot="countryName" slot-scope="props" class="table-country" v-b-tooltip.hover :title="props.row.countryName"><i :class="'flag-icon flag-icon-' + props.row.countryCode2.toLowerCase()" v-if="props.row.countryCode2"/> <span> {{ props.row.countryCode2 }}</span></span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'CollaboratorTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    var columns = [{
      name: 'collaboratorId',
      type: Number
    }, {
      name: 'collaboratorFirstName',
      type: String
    }, {
      name: 'collaboratorLastName',
      type: String
    }, {
      name: 'collaboratorEmail',
      type: String
    }, {
      name: 'institutionName',
      type: String
    }, {
      name: 'institutionAddress',
      type: String
    }, {
      name: 'countryName',
      type: String
    }]

    return {
      options: {
        idColumn: 'collaboratorId',
        tableName: 'collaborators',
        sortable: ['collaboratorId', 'collaboratorFirstName', 'collaboratorLastName', 'collaboratorEmail', 'institutionName', 'institutionAddress', 'countryName'],
        filterable: [],
        headings: {
          selected: '',
          collaboratorId: () => this.$t('tableColumnCollaboratorId'),
          collaboratorFirstName: () => this.$t('tableColumnCollaboratorFirstName'),
          collaboratorLastName: () => this.$t('tableColumnCollaboratorLastName'),
          collaboratorEmail: () => this.$t('tableColumnCollaboratorEmail'),
          institutionName: () => this.$t('tableColumnInstitutionName'),
          institutionAddress: () => this.$t('tableColumnInstitutionAddress'),
          countryName: () => this.$t('tableColumnCountryName')
        },
        columnsClasses: {
          collaboratorId: 'text-right'
        }
      },
      columns: columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    refresh: function () {
      this.$refs.collaboratorTable.refresh()
    }
  }
}
</script>

<style>
</style>
