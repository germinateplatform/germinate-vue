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
        <span class="table-country" v-b-tooltip.hover :title="data.item.countryName"><i :class="'fi fi-' + data.item.countryCode2.toLowerCase()" v-if="data.item.countryCode2"/> <span> {{ data.item.countryCode2 }}</span></span>
      </template>
      <!-- External ID link if URL or ORCID -->
      <template v-slot:cell(collaboratorExternalId)="data">
        <template v-if="data.item.collaboratorExternalId">
          <a rel="noopener noreferrer" :href="`https://orcid.org/${data.item.collaboratorExternalId}`" v-if="isOrcid(data.item.collaboratorExternalId)">{{ `https://orcid.org/${data.item.collaboratorExternalId}` }}</a>
          <a rel="noopener noreferrer" :href="data.item.collaboratorExternalId" v-else-if="data.item.collaboratorExternalId.startsWith('https')">{{ data.item.collaboratorExternalId }}</a>
          <span v-else>{{ data.item.collaboratorExternalId }}</span>
        </template>
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
          class: 'text-right',
          label: this.$t('tableColumnCollaboratorId')
        }, {
          key: 'collaboratorFirstName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnCollaboratorFirstName')
        }, {
          key: 'collaboratorLastName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnCollaboratorLastName')
        }, {
          key: 'collaboratorEmail',
          type: String,
          sortable: true,
          label: this.$t('tableColumnCollaboratorEmail')
        }, {
          key: 'collaboratorExternalId',
          type: String,
          sortable: true,
          label: this.$t('tableColumnCollaboratorExternalId')
        }, {
          key: 'collaboratorRoles',
          type: String,
          sortable: true,
          label: this.$t('tableColumnCollaboratorRoles')
        }, {
          key: 'institutionName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnInstitutionName')
        }, {
          key: 'institutionAddress',
          type: String,
          sortable: true,
          label: this.$t('tableColumnInstitutionAddress')
        }, {
          key: 'countryName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnCountryName')
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  methods: {
    isOrcid: function (input) {
      return input && input.length > 0 && /^(\d{4}-){3}\d{3}(\d|X)$/.test(input)
    },
    refresh: function () {
      this.$refs.collaboratorTable.refresh()
    }
  }
}
</script>

<style>
</style>
