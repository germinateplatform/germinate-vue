<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               primary-key="institutionId"
               v-bind="$props"
               ref="institutionTable"
               v-on="$listeners">
      <template v-slot:cell(institutionName)="data">
        <div v-if="data.item.institutionName">
          <a v-if="showLinks" href="#" @click.prevent="redirectToGermplasmPage(data.item)">{{ data.item.institutionName }}</a>
          <span v-else>{{ data.item.institutionName }}</span>
        </div>
      </template>
      <template v-slot:cell(institutionCode)="data">
        <div v-if="data.item.institutionCode">
          <a v-if="showLinks" href="#" @click.prevent="redirectToGermplasmPage(data.item)">{{ data.item.institutionCode }}</a>
          <span v-else>{{ data.item.institutionCode }}</span>
        </div>
      </template>
      <template v-slot:cell(institutionAddress)="data">
        <div v-if="data.item.institutionAddress">
          <a v-if="showLinks" href="#" @click.prevent="redirectToGermplasmPage(data.item)">{{ data.item.institutionAddress }}</a>
          <span v-else>{{ data.item.institutionAddress }}</span>
        </div>
      </template>
      <template v-slot:cell(institutionType)="data">
        <b-badge v-if="data.item.institutionType" class="w-100" :style="`color: ${getHighContrastTextColor(germplasmInstitutionTypes[data.item.institutionType].color())}; background-color: ${germplasmInstitutionTypes[data.item.institutionType].color()};`"><MdiIcon :path="germplasmInstitutionTypes[data.item.institutionType].path" /> {{ germplasmInstitutionTypes[data.item.institutionType].text() }}</b-badge>
      </template>
      <!-- Country flag -->
      <template v-slot:cell(countryCode)="data">
        <span class="table-country text-nowrap" v-b-tooltip.hover :title="data.item.countryName" v-if="data.item.countryCode">
          <i :class="'fi fi-' + data.item.countryCode.toLowerCase()"/> <span> {{ data.item.countryCode }}</span>
        </span>
        <span v-else>
          {{ data.item.countryName }}
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import utilMixin from '@/mixins/util'
import typeMixin from '@/mixins/types'
import colorMixin from '@/mixins/colors'

export default {
  name: 'InstitutionTable',
  props: {
    ...defaultProps.BASE,
    showLinks: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      options: {
        idColumn: 'institutionId',
        tableName: 'institutions'
      }
    }
  },
  computed: {
    columns: function () {
      return [{
        key: 'institutionId',
        type: Number,
        class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'institutionId')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionId')
      }, {
        key: 'institutionName',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'institutionName')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionName'),
        preferedSortingColumn: true
      }, {
        key: 'institutionAcronym',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'institutionAcronym')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionAcronym')
      }, {
        key: 'institutionCode',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'institutionCode')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionCode')
      }, {
        key: 'institutionType',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'institutionType')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionType')
      }, {
        key: 'institutionAddress',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'institutionAddress')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionAddress')
      }, {
        key: 'institutionEmail',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'institutionEmail')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionEmail')
      }, {
        key: 'institutionPhone',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'institutionPhone')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionPhone')
      }, {
        key: 'institutionContact',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'institutionContact')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionContact')
      }, {
        key: 'countryCode',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'countryCode')}`,
        sortable: true,
        label: this.$t('tableColumnInstitutionCountry')
      }]
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  mixins: [utilMixin, typeMixin, colorMixin],
  methods: {
    refresh: function () {
      this.$refs.institutionTable.refresh()
    },
    redirectToGermplasmPage: function (institution) {
      const filter = []

      if (institution.institutionName) {
        filter.push({
          column: 'institutions',
          comparator: 'jsonSearch',
          operator: 'or',
          values: [institution.institutionName]
        })
      }
      if (institution.institutionCode) {
        filter.push({
          column: 'institutions',
          comparator: 'jsonSearch',
          operator: 'or',
          values: [institution.institutionCode]
        })
      }
      if (institution.institutionAddress) {
        filter.push({
          column: 'institutions',
          comparator: 'jsonSearch',
          operator: 'or',
          values: [institution.institutionAddress]
        })
      }

      if (filter.length > 0) {
        this.$router.push({
          name: 'germplasm',
          query: {
            'germplasm-filter': JSON.stringify(filter)
          }
        })
      }
    }
  }
}
</script>

<style>
</style>
