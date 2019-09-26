<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="collaboratorTable"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
      <a slot="collaboratorEmail" slot-scope="props" :href="`mailto:${props.row.collaboratorEmail}`" v-if="props.row.collaboratorEmail">{{ props.row.collaboratorEmail }}</a>
      <span slot="countryName" slot-scope="props" class="table-country" v-b-tooltip.hover :title="props.row.countryName"><i :class="'flag-icon flag-icon-' + props.row.countryCode2.toLowerCase()" v-if="props.row.countryCode2"/> <span> {{ props.row.countryCode2 }}</span></span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'CollaboratorTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    },
    getData: {
      type: Function,
      default: () => {}
    }
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
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
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
