<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="collaboratorTable"
               v-on="$listeners">
      <!-- Collaborator email link -->
      <template v-slot:cell(collaboratorEmail)="data">
        <a :href="`mailto:${data.item.collaboratorEmail}`" v-if="data.item.collaboratorEmail">{{ data.item.collaboratorEmail }}</a>
      </template>
      <!-- Collaborator country represented by a flag icon -->
      <template v-slot:cell(countryName)="data">
        <span class="table-country" v-b-tooltip.hover :title="data.item.countryName"><i :class="'flag-icon flag-icon-' + data.item.countryCode2.toLowerCase()" v-if="data.item.countryCode2"/> <span> {{ data.item.countryCode2 }}</span></span>
      </template>
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
    return {
      options: {
        idColumn: 'collaboratorId',
        tableName: 'collaborators'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'collaboratorId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'collaboratorId')}`,
          label: this.$t('tableColumnCollaboratorId')
        }, {
          key: 'collaboratorFirstName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'collaboratorFirstName')}`,
          label: this.$t('tableColumnCollaboratorFirstName')
        }, {
          key: 'collaboratorLastName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'collaboratorLastName')}`,
          label: this.$t('tableColumnCollaboratorLastName')
        }, {
          key: 'collaboratorEmail',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'collaboratorEmail')}`,
          label: this.$t('tableColumnCollaboratorEmail')
        }, {
          key: 'institutionName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'institutionName')}`,
          label: this.$t('tableColumnInstitutionName')
        }, {
          key: 'institutionAddress',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'institutionAddress')}`,
          label: this.$t('tableColumnInstitutionAddress')
        }, {
          key: 'countryName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'countryName')}`,
          label: this.$t('tableColumnCountryName')
        }
      ]
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
